// Vercel serverless function for chat API
import { MistralService } from '../src/lib/mistral.js';
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
    const rateLimitKey = `klvarme:${clientIP}`;
    
    if (!checkRateLimit(rateLimitKey, 20, 60000)) { // 20 requests per minute
      return res.status(429).json(createErrorResponse('Rate limit exceeded. Please wait before sending another message.', 429));
    }

    // Generate session ID
    const sessionIdToUse = session_id || generateSessionId();
    
    // Get session data
    const session = sessionManager.getSession(sessionIdToUse);
    
    // Set session metadata
    sessionManager.setMetadata(sessionIdToUse, {
      currentUrl: sanitizedUrl,
      userIp: clientIP,
      userAgent: req.headers['user-agent']
    });

    // Add user message to session
    sessionManager.addMessage(sessionIdToUse, 'user', sanitizedMessage);

    // Determine message count for contact collection logic
    const messageCount = session.chatHistory.length;
    
    let botResponse;
    let contactInfo = { userName: null, userEmail: null, contactCollected: false };
    
    // Contact collection logic - kun én gang per session
    const hasContact = sessionManager.hasContactInfo(sessionIdToUse);
    const userMessageCount = session.chatHistory.filter(msg => msg.role === 'user').length;
    
    // Vis kontaktskjema på 1. brukermelding
    if (userMessageCount === 1 && !hasContact) {
      // Første brukermelding - vis kontaktskjema direkte
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
    } else if (userMessageCount === 2 && !hasContact && looksLikeContactInfo(sanitizedMessage)) {
      // Andre brukermelding - håndter innsending av skjema
      // Contact form submission handling
      
      let formData;
      try {
        // Try to parse as JSON form data first
        formData = JSON.parse(sanitizedMessage);
      } catch {
        // Fallback to text parsing if not JSON
        const parsedContact = parseContactInfo(sanitizedMessage);
        if (parsedContact.hasContact) {
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
        let lastUserMessage = sanitizedMessage;
        
        // Look through session history for the trigger message
        for (let i = session.chatHistory.length - 2; i >= 0; i--) {
          const msg = session.chatHistory[i];
          if (msg.role === 'user' && 
              !msg.content.includes('user_name') && 
              !msg.content.includes('user_email')) {
            lastUserMessage = msg.content;
            break;
          }
        }
        
        // Create AI response with full context
        const contextInfo = { currentUrl: sanitizedUrl };
        const contextualPrompt = `${SYSTEM_PROMPT}

Kunden ${formData.user_name} har nettopp gitt deg kontaktinformasjon og spurte tidligere: "${lastUserMessage}"

Svar på dette spørsmålet på en hjelpsom måte, og takk kunden for kontaktinformasjonen.`;
        
        const messages = createChatMessages(
          contextualPrompt,
          null,
          lastUserMessage,
          { currentUrl: sanitizedUrl }
        );
        
        const aiResult = await MistralService.generateResponse(messages, AI_CONFIG);
        
        if (!aiResult.success) {
          return res.status(500).json(createErrorResponse(aiResult.response, 500));
        }
        
        botResponse = aiResult.response;

        // Lagre samtale umiddelbart når kontakt er samlet
        try {
          // Finn trigger-meldingen (siste brukermelding før kontaktskjema)
          let triggerMessage = lastUserMessage;
          
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
      // Normal AI response (1st message or after contact is collected)
      let prompt = SYSTEM_PROMPT;
      
      // If contact is already collected, include customer name in prompt
      if (hasContact) {
        const contactInfo = sessionManager.getContactInfo(sessionIdToUse);
        prompt = `${SYSTEM_PROMPT}

Du snakker med ${contactInfo.userName} som allerede har gitt deg kontaktinformasjon. Fortsett samtalen naturlig.`;
      }
      
      const contextInfo = { currentUrl: sanitizedUrl };
      const messages = createChatMessages(
        prompt,
        null,
        sanitizedMessage,
        contextInfo
      );
      
      const aiResult = await MistralService.generateResponse(messages, AI_CONFIG);
      
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
    console.log(`[${new Date().toISOString()}] KL Varme Chat:`, {
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
    logError(error, { customer: 'klvarme', endpoint: '/api/chat' });
    
    // Simple error logging
    console.error(`[${new Date().toISOString()}] KL Varme Chat Error:`, {
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
