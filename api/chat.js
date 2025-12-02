// Vercel serverless function for chat API
import { OpenAIService } from '../src/lib/openai.js';
import { CUSTOMER_CONFIG } from '../src/config/customer.js';
import { SYSTEM_PROMPT, AI_CONFIG } from '../src/config/prompt.js';
import { ContactLogger } from '../src/lib/contact-logger.js';
import { sessionManager } from '../src/lib/session-manager.js';
import {
  sanitizeInput,
  generateSessionId,
  buildChatContext,
  createChatMessages,
  getClientIP,
  measureResponseTime,
  checkRateLimit,
  createErrorResponse,
  createSuccessResponse,
  logError,
  parseContactInfo,
  looksLikeContactInfo
} from '../src/lib/utils.js';

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default async function handler(req, res) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json(createErrorResponse('Method not allowed', 405));
  }

  const startTime = Date.now();

  try {
    // Parse and validate request body
    const { message, current_url, session_id, chat_history } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json(createErrorResponse('Missing required field: message', 400));
    }

    // Sanitize inputs
    const sanitizedMessage = sanitizeInput(message);
    const sanitizedUrl = current_url ? sanitizeInput(current_url) : null;

    if (!sanitizedMessage) {
      return res.status(400).json(createErrorResponse('Message cannot be empty', 400));
    }

    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitKey = `ailabben:${clientIP}`;
    
    if (!checkRateLimit(rateLimitKey, 20, 60000)) { // 20 requests per minute
      return res.status(429).json(createErrorResponse('Rate limit exceeded. Please wait before sending another message.', 429));
    }

    // Generate session ID
    const sessionIdToUse = session_id || generateSessionId();
    
    // Set session metadata
    sessionManager.setMetadata(sessionIdToUse, {
      currentUrl: sanitizedUrl,
      userIp: clientIP,
      userAgent: req.headers['user-agent']
    });

    // Get session BEFORE adding message to count correctly
    const sessionBefore = sessionManager.getSession(sessionIdToUse);
    
    // Count user messages BEFORE adding the current one
    const userMessageCountBefore = sessionBefore.chatHistory.filter(msg => msg.role === 'user').length;
    
    // Add user message to session
    sessionManager.addMessage(sessionIdToUse, 'user', sanitizedMessage);
    
    // Get updated session after adding message
    const session = sessionManager.getSession(sessionIdToUse);

    // Determine message count for contact collection logic
    const messageCount = session.chatHistory.length;
    
    let botResponse;
    let contactInfo = { userName: null, userEmail: null, contactCollected: false };
    
    // Contact collection logic - kun én gang per session
    const hasContact = sessionManager.hasContactInfo(sessionIdToUse);
    // Use count AFTER adding message (this is the current message number)
    const userMessageCount = userMessageCountBefore + 1;
    
    // Sjekk om kontakt allerede er samlet i meldinger (inkludert nåværende)
    let contactAlreadyInMessages = false;
    if (!hasContact) {
      // Sjekk nåværende melding først
      if (looksLikeContactInfo(sanitizedMessage)) {
        const parsedContact = parseContactInfo(sanitizedMessage);
        if (parsedContact.hasContact && parsedContact.name && parsedContact.email) {
          // Kontaktinfo funnet i nåværende melding - lagre det
          sessionManager.setContactCollected(sessionIdToUse, {
            userName: parsedContact.name,
            userEmail: parsedContact.email
          });
          contactAlreadyInMessages = true;
        }
      }
      
      // Hvis ikke funnet i nåværende, sjekk alle tidligere brukermeldinger
      if (!contactAlreadyInMessages) {
        for (const msg of session.chatHistory) {
          if (msg.role === 'user' && looksLikeContactInfo(msg.content)) {
            const parsedContact = parseContactInfo(msg.content);
            if (parsedContact.hasContact && parsedContact.name && parsedContact.email) {
              // Kontaktinfo funnet i tidligere melding - lagre det
              sessionManager.setContactCollected(sessionIdToUse, {
                userName: parsedContact.name,
                userEmail: parsedContact.email
              });
              contactAlreadyInMessages = true;
              break;
            }
          }
        }
      }
      
      // Hvis kontakt ble funnet, lagre samtale umiddelbart
      if (contactAlreadyInMessages) {
        try {
          const savedContact = sessionManager.getContactInfo(sessionIdToUse);
          let triggerMessage = 'Ukjent';
          // Finn første brukermelding som ikke er kontaktinfo
          for (let i = 0; i < session.chatHistory.length; i++) {
            const histMsg = session.chatHistory[i];
            if (histMsg.role === 'user' && 
                !histMsg.content.includes('user_name') && 
                !histMsg.content.includes('user_email') &&
                !looksLikeContactInfo(histMsg.content)) {
              triggerMessage = histMsg.content;
              break;
            }
          }
          
          await ContactLogger.logContact({
            sessionId: sessionIdToUse,
            customerName: savedContact.userName,
            customerEmail: savedContact.userEmail,
            conversationHistory: session.chatHistory,
            triggerMessage: triggerMessage,
            currentUrl: sanitizedUrl,
            userIp: clientIP,
            userAgent: req.headers['user-agent'],
            sessionDuration: Date.now() - session.startTime,
            endReason: 'contact_collected'
          });
          
          console.log(`✅ Kontakt funnet i melding og lagret umiddelbart for ${savedContact.userName}`);
        } catch (logError) {
          console.error('❌ Feil ved umiddelbar lagring av kontakt fra melding:', logError);
        }
      }
    }
    
    // Oppdater hasContact etter sjekk av meldinger
    const contactCollected = hasContact || contactAlreadyInMessages;
    
    // Vis kontaktskjema på 2. brukermelding (hvis kontakt ikke allerede er samlet)
    if (userMessageCount === 2 && !contactCollected) {
      // Andre brukermelding - vis kontaktskjema
      botResponse = {
        type: 'contact_form',
        message: 'Jeg gleder meg til å fortsette denne samtalen, men først trenger jeg at du fyller ut infoen under 😊',
        form: {
          fields: [
            {
              name: 'user_name',
              label: 'Navn',
              type: 'text',
              required: true,
              placeholder: 'Ola Nordmann'
            },
            {
              name: 'user_email',
              label: 'E-post',
              type: 'email',
              required: true,
              placeholder: 'ola@example.com'
            }
          ],
          submitText: 'Send inn'
        }
      };
    } else if (userMessageCount === 3 && !contactCollected) {
      // Tredje brukermelding - håndter innsending av skjema (hvis skjema ble vist på 2. melding)
      // Contact form submission handling
      
      let formData;
      try {
        // Try to parse as JSON form data first (widget sender som JSON)
        formData = JSON.parse(sanitizedMessage);
      } catch {
        // Fallback to text parsing if not JSON
        const parsedContact = parseContactInfo(sanitizedMessage);
        if (parsedContact.hasContact && parsedContact.name && parsedContact.email) {
          formData = {
            user_name: parsedContact.name,
            user_email: parsedContact.email
          };
        }
      }
      
      if (formData && formData.user_name && formData.user_email) {
        contactInfo.userName = formData.user_name;
        contactInfo.userEmail = formData.user_email;
        contactInfo.contactCollected = true;
        
        // Lagre kontaktinfo i session
        sessionManager.setContactCollected(sessionIdToUse, {
          userName: formData.user_name,
          userEmail: formData.user_email
        });
        
        // Find the user's question that triggered the contact form
        // Trigger-meldingen er den siste brukermeldingen før kontaktskjemaet (2. melding)
        let triggerMessage = 'Ukjent';
        
        // Look through session history backwards to find the last user message before contact form
        // (This should be the 2nd user message, which triggered the contact form)
        for (let i = session.chatHistory.length - 1; i >= 0; i--) {
          const msg = session.chatHistory[i];
          if (msg.role === 'user' && 
              !msg.content.includes('user_name') && 
              !msg.content.includes('user_email') &&
              !looksLikeContactInfo(msg.content)) {
            triggerMessage = msg.content;
            break;
          }
        }
        
        // Build full conversation context (excluding contact form messages)
        const conversationMessages = [];
        for (const msg of session.chatHistory) {
          // Skip contact form messages and JSON form submissions
          let shouldSkip = false;
          
          // Skip assistant messages that are contact forms
          if (msg.role === 'assistant') {
            try {
              const parsed = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
              if (parsed && parsed.type === 'contact_form') {
                shouldSkip = true;
              }
            } catch {
              // Not JSON, check if it contains contact form text
              if (typeof msg.content === 'string' && msg.content.includes('"type":"contact_form"')) {
                shouldSkip = true;
              }
            }
          }
          
          // Skip user messages that are form submissions
          if (msg.role === 'user' && (msg.content.includes('user_name') || msg.content.includes('user_email'))) {
            // Check if it's a JSON form submission
            try {
              const parsed = JSON.parse(msg.content);
              if (parsed.user_name || parsed.user_email) {
                shouldSkip = true;
              }
            } catch {
              // Not JSON, might be text format - check if it looks like contact info submission
              if (looksLikeContactInfo(msg.content) && msg.content.includes('Navn:') && msg.content.includes('E-post:')) {
                shouldSkip = true;
              }
            }
          }
          
          if (!shouldSkip) {
            conversationMessages.push({
              role: msg.role,
              content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
            });
          }
        }
        
        // Create AI response with full conversation context
        const contextInfo = { currentUrl: sanitizedUrl };
        let prompt = SYSTEM_PROMPT;
        
        // Add customer name to prompt if available
        prompt = `${SYSTEM_PROMPT}

Du snakker med ${formData.user_name} (${formData.user_email}) som nettopp har gitt deg kontaktinformasjon. Fortsett samtalen naturlig basert på det de har spurt om tidligere - ikke introduser deg på nytt eller start samtalen på nytt.`;
        
        // Build messages array with system prompt and full conversation history
        const messages = [
          { role: 'system', content: prompt },
          ...conversationMessages
        ];
        
        const aiResult = await OpenAIService.generateResponse(messages, AI_CONFIG);
        
        if (!aiResult.success) {
          return res.status(500).json(createErrorResponse(aiResult.response, 500));
        }
        
        botResponse = aiResult.response;

        // Lagre samtale umiddelbart når kontakt er samlet
        try {
          // triggerMessage er allerede satt til riktig verdi (siste brukermelding før kontaktskjema)
          
          await ContactLogger.logContact({
            sessionId: sessionIdToUse,
            customerName: formData.user_name,
            customerEmail: formData.user_email,
            conversationHistory: session.chatHistory,
            triggerMessage: triggerMessage,
            currentUrl: sanitizedUrl,
            userIp: clientIP,
            userAgent: req.headers['user-agent'],
            sessionDuration: Date.now() - session.startTime,
            endReason: 'contact_collected'
          });

          console.log(`✅ Samtale lagret umiddelbart for ${formData.user_name}`);
        } catch (logError) {
          console.error('❌ Feil ved umiddelbar lagring:', logError);
          // Continue anyway - don't let logging errors break the chat
        }

      } else {
        // Form data not valid, show form again
        botResponse = {
          type: 'contact_form',
          message: 'Jeg gleder meg til å fortsette denne samtalen, men først trenger jeg at du fyller ut infoen under 😊',
          form: {
            fields: [
              {
                name: 'user_name',
                label: 'Navn',
                type: 'text',
                required: true,
                placeholder: 'Ola Nordmann'
              },
              {
                name: 'user_email',
                label: 'E-post',
                type: 'email',
                required: true,
                placeholder: 'ola@example.com'
              }
            ],
            submitText: 'Send inn'
          }
        };
      }
    } else {
      // Normal AI response (1st message, or 2nd message if contact already collected, or after contact is collected)
      let prompt = SYSTEM_PROMPT;
      
      // If contact is already collected, include customer name in prompt
      const finalContactInfo = sessionManager.getContactInfo(sessionIdToUse);
      if (finalContactInfo) {
        prompt = `${SYSTEM_PROMPT}

Du snakker med ${finalContactInfo.userName} som allerede har gitt deg kontaktinformasjon. Fortsett samtalen naturlig.`;
      }
      
      const contextInfo = { currentUrl: sanitizedUrl };
      const messages = createChatMessages(
        prompt,
        null,
        sanitizedMessage,
        contextInfo
      );
      
      const aiResult = await OpenAIService.generateResponse(messages, AI_CONFIG);
      
      if (!aiResult.success) {
        return res.status(500).json(createErrorResponse(aiResult.response, 500));
      }
      
      botResponse = aiResult.response;
    }

    // Add bot response to session
    sessionManager.addMessage(sessionIdToUse, 'assistant', 
      typeof botResponse === 'object' ? JSON.stringify(botResponse) : botResponse
    );

    // Calculate response time
    const responseTime = measureResponseTime(startTime);

    // Simple console logging
    console.log(`[${new Date().toISOString()}] AI Labben Chat:`, {
      sessionId: sessionIdToUse,
      messageCount,
      userMessage: sanitizedMessage.substring(0, 30) + '...',
      responseTime: `${responseTime}ms`,
      userAgent: req.headers['user-agent'],
      ip: clientIP,
      contactCollected: sessionManager.hasContactInfo(sessionIdToUse),
      activeSessions: sessionManager.getActiveSessions().length
    });

    // Return successful response
    const responseData = {
      message: botResponse,
      session_id: sessionIdToUse,
      model: AI_CONFIG.model,
      tokens_used: 0, // Would be updated if tracking tokens
      response_time_ms: responseTime,
      contact_info: contactInfo,
      context_used: {
        current_url: sanitizedUrl,
        message_count: messageCount
      }
    };

    return res.status(200).json(createSuccessResponse(responseData, 'Message processed successfully'));

  } catch (error) {
    logError(error, { customer: 'ailabben', endpoint: '/api/chat' });
    
    // Simple error logging
    console.error(`[${new Date().toISOString()}] AI Labben Chat Error:`, {
      error: error.message,
      userMessage: req.body?.message || 'unknown',
      currentUrl: req.body?.current_url,
      userAgent: req.headers['user-agent'],
      ip: getClientIP(req)
    });

    return res.status(500).json(createErrorResponse('Internal server error', 500));
  }
}

// Set CORS headers for all responses
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
