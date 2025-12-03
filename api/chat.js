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

    // Get session BEFORE adding message to check count correctly
    const sessionBefore = sessionManager.getSession(sessionIdToUse);
    
    // Contact collection logic - sjekk om kontakt allerede er samlet (må sjekkes tidlig)
    const hasContact = sessionManager.hasContactInfo(sessionIdToUse);
    
    // HARDKODET: Tell kun ekte brukermeldinger (ekskluder kontaktskjema-innsendinger)
    const userMessageCountBefore = sessionBefore.chatHistory.filter(msg => {
      if (msg.role !== 'user') return false;
      // Ekskluder kontaktskjema-innsendinger
      if (msg.content.includes('user_name') || msg.content.includes('user_email')) return false;
      if (msg.content.includes('Navn:') && msg.content.includes('E-post:')) return false;
      return true;
    }).length;
    
    // Sjekk om nåværende melding er kontaktskjema-innsending
    const isCurrentMessageFormSubmission = sanitizedMessage.includes('user_name') || sanitizedMessage.includes('user_email') ||
      (sanitizedMessage.includes('Navn:') && sanitizedMessage.includes('E-post:'));
    
    // HARDKODET: userMessageCount er antall ekte brukermeldinger ETTER denne meldingen
    const userMessageCount = isCurrentMessageFormSubmission ? userMessageCountBefore : userMessageCountBefore + 1;
    
    // Hvis dette er første ekte brukermelding og kontakt ikke er samlet, lagre den
    if (userMessageCount === 1 && !isCurrentMessageFormSubmission && !hasContact) {
      sessionManager.setFirstUserMessage(sessionIdToUse, sanitizedMessage);
    }
    
    // Add user message to session
    sessionManager.addMessage(sessionIdToUse, 'user', sanitizedMessage);

    // Get session data after adding message
    const session = sessionManager.getSession(sessionIdToUse);

    // Determine message count for contact collection logic
    const messageCount = session.chatHistory.length;
    
    let botResponse;
    let contactInfo = { userName: null, userEmail: null, contactCollected: false };
    
    // Debug logging
    console.log(`[DEBUG] userMessageCountBefore: ${userMessageCountBefore}, userMessageCount: ${userMessageCount}, isFormSubmission: ${isCurrentMessageFormSubmission}`);
    
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
    
    // VIKTIG: Sjekk om nåværende melding er kontaktskjema-innsending FØRST
    // Hvis det er det, håndter den umiddelbart uavhengig av userMessageCount
    if (isCurrentMessageFormSubmission && !contactCollected) {
      console.log(`[DEBUG] 🔵 Håndterer kontaktskjema-innsending`);
      
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
        // Sett kontakt som samlet UMIDDELBART
        sessionManager.setContactCollected(sessionIdToUse, {
          userName: formData.user_name,
          userEmail: formData.user_email
        });
        
        contactInfo.userName = formData.user_name;
        contactInfo.userEmail = formData.user_email;
        contactInfo.contactCollected = true;
        
        // Hent første brukermelding (som ble lagret før kontaktskjema)
        const firstUserMessage = sessionManager.getFirstUserMessage(sessionIdToUse);
        let triggerMessage = firstUserMessage || 'Ukjent';
        
        // Hvis første melding ikke finnes i metadata, prøv å finne den i historikk
        if (!firstUserMessage) {
          for (let i = 0; i < session.chatHistory.length; i++) {
            const msg = session.chatHistory[i];
            if (msg.role === 'user' && 
                !msg.content.includes('user_name') && 
                !msg.content.includes('user_email') &&
                !looksLikeContactInfo(msg.content)) {
              triggerMessage = msg.content;
              break;
            }
          }
        }
        
        // Build conversation context - inkluder proaktiv melding og første brukermelding
        const conversationMessages = [];
        
        // Legg til proaktiv melding hvis den finnes i historikk
        for (const msg of session.chatHistory) {
          if (msg.role === 'assistant') {
            // Skip contact form messages
            try {
              const parsed = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
              if (parsed && parsed.type === 'contact_form') {
                continue; // Skip contact form
              }
            } catch {
              if (typeof msg.content === 'string' && msg.content.includes('"type":"contact_form"')) {
                continue; // Skip contact form
              }
            }
            // Legg til proaktiv melding (første assistant melding)
            conversationMessages.push({
              role: msg.role,
              content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
            });
            break; // Kun første assistant melding (proaktiv melding)
          }
        }
        
        // Legg til første brukermelding (med kontekst)
        if (firstUserMessage) {
          conversationMessages.push({
            role: 'user',
            content: firstUserMessage
          });
        }
        
        // Create AI response - start samtalen basert på første melding
        let prompt = `${SYSTEM_PROMPT}

Du snakker med ${formData.user_name} (${formData.user_email}) som nettopp har gitt deg kontaktinformasjon. Dette er starten på samtalen - brukeren har sendt deg en melding som du nå skal svare på. Svar naturlig og hjelpsomt på deres første melding.`;
        
        const messages = [
          { role: 'system', content: prompt },
          ...conversationMessages
        ];
        
        try {
          const aiResult = await OpenAIService.generateResponse(messages, AI_CONFIG);
          
          if (!aiResult.success) {
            console.error('[ERROR] AI response failed:', aiResult.response);
            return res.status(500).json(createErrorResponse(aiResult.response || 'AI service error', 500));
          }
          
          botResponse = aiResult.response;
          
          // Lagre samtale umiddelbart
          try {
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
          }
        } catch (aiError) {
          console.error('[ERROR] AI service exception:', aiError);
          return res.status(500).json(createErrorResponse('AI service error: ' + aiError.message, 500));
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
    } else if (userMessageCount === 1 && !contactCollected) {
      console.log(`[DEBUG] ✅✅✅ VISER KONTAKTSKJEMA PÅ 1. MELDING ✅✅✅`);
      // Første brukermelding - vis kontaktskjema FØR samtalen starter
      // Meldingen er allerede lagret i session, men vi viser ikke AI-respons ennå
      botResponse = {
        type: 'contact_form',
        message: 'Takk for meldingen! Før vi starter samtalen, trenger jeg litt informasjon fra deg 😊',
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
          submitText: 'Start samtale'
        }
      };
    } else {
      // Normal AI response (kun hvis kontakt allerede er samlet)
      // Hvis kontakt ikke er samlet, skal ikke første melding sendes til AI
      if (!contactCollected && userMessageCount === 1) {
        // Dette skal ikke skje, men hvis det gjør det, vis kontaktskjema
        console.log(`[DEBUG] ⚠️ Kontakt ikke samlet på første melding - viser kontaktskjema`);
        botResponse = {
          type: 'contact_form',
          message: 'Takk for meldingen! Før vi starter samtalen, trenger jeg litt informasjon fra deg 😊',
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
            submitText: 'Start samtale'
          }
        };
      } else {
        // Normal AI response (kun hvis kontakt er samlet)
        console.log(`[DEBUG] Normal AI response for melding ${userMessageCount}`);
        let prompt = SYSTEM_PROMPT;
        
        // If contact is already collected, include customer name in prompt
        const finalContactInfo = sessionManager.getContactInfo(sessionIdToUse);
        if (finalContactInfo) {
          prompt = `${SYSTEM_PROMPT}

Du snakker med ${finalContactInfo.userName} som allerede har gitt deg kontaktinformasjon. Fortsett samtalen naturlig.`;
        }
        
        // Build messages array with system prompt and full conversation history
        const messages = [
          { role: 'system', content: prompt }
        ];
        
        // Add conversation history (excluding contact form messages)
        for (const msg of session.chatHistory) {
          // Skip contact form messages
          if (msg.role === 'assistant') {
            try {
              const parsed = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
              if (parsed && parsed.type === 'contact_form') {
                continue; // Skip contact form messages
              }
            } catch {
              // Not JSON, check if it contains contact form text
              if (typeof msg.content === 'string' && msg.content.includes('"type":"contact_form"')) {
                continue; // Skip contact form messages
              }
            }
          }
          
          // Skip user messages that are form submissions
          if (msg.role === 'user' && (msg.content.includes('user_name') || msg.content.includes('user_email'))) {
            try {
              const parsed = JSON.parse(msg.content);
              if (parsed.user_name || parsed.user_email) {
                continue; // Skip form submissions
              }
            } catch {
              // Not JSON, might be text format - skip if it looks like contact info submission
              if (looksLikeContactInfo(msg.content) && msg.content.includes('Navn:') && msg.content.includes('E-post:')) {
                continue; // Skip form submissions
              }
            }
          }
          
          messages.push({
            role: msg.role,
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
          });
        }
        
        try {
          const aiResult = await OpenAIService.generateResponse(messages, AI_CONFIG);
          
          if (!aiResult.success) {
            console.error('[ERROR] AI response failed:', aiResult.response);
            return res.status(500).json(createErrorResponse(aiResult.response || 'AI service error', 500));
          }
          
          botResponse = aiResult.response;
        } catch (aiError) {
          console.error('[ERROR] AI service exception:', aiError);
          return res.status(500).json(createErrorResponse('AI service error: ' + aiError.message, 500));
        }
      }
    }

    // Ensure botResponse is set
    if (!botResponse) {
      console.error('[ERROR] botResponse er ikke satt! userMessageCount:', userMessageCount, 'contactCollected:', contactCollected);
      botResponse = 'Beklager, jeg opplevde en teknisk feil. Kan du prøve igjen?';
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
