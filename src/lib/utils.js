// Utility functions for the chatbot

export function generateSessionId() {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Remove potential XSS attempts and limit length
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 2000); // Max 2000 characters
}

export function validateCustomerId(customerId) {
  if (!customerId || typeof customerId !== 'string') {
    return false;
  }
  
  // Allow alphanumeric, hyphens, underscores, max 50 chars
  return /^[a-zA-Z0-9_-]{1,50}$/.test(customerId);
}

export function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function formatPrompt(template, variables) {
  if (!template) return '';
  
  let formatted = template;
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    formatted = formatted.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  return formatted;
}

export function buildChatContext(currentUrl) {
  let context = '';
  
  // Add URL info
  if (currentUrl) {
    context += `Bruker er på siden: ${currentUrl}\n\n`;
  }
  
  return context.trim();
}

export function createChatMessages(systemPrompt, userPrompt, userMessage, context) {
  const messages = [];
  
  // System message
  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt
    });
  }
  
  // User message with context
  let userContent = userMessage;
  
  if (userPrompt) {
    userContent = formatPrompt(userPrompt, {
      user_message: userMessage,
      current_url: context.currentUrl || ''
    });
  }
  
  messages.push({
    role: 'user',
    content: userContent
  });
  
  return messages;
}

export function getClientIP(request) {
  // Try various headers that might contain the real IP
  const xForwardedFor = request.headers['x-forwarded-for'];
  const xRealIP = request.headers['x-real-ip'];
  const xClientIP = request.headers['x-client-ip'];
  const cfConnectingIP = request.headers['cf-connecting-ip']; // Cloudflare
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  return xRealIP || xClientIP || cfConnectingIP || request.connection?.remoteAddress || 'unknown';
}

export function measureResponseTime(startTime) {
  return Date.now() - startTime;
}

export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function logError(error, context = {}) {
  console.error('Chatbot Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
}

export function createErrorResponse(message = 'Det oppstod en feil', statusCode = 500) {
  return {
    success: false,
    error: message,
    statusCode,
    timestamp: new Date().toISOString()
  };
}

export function createSuccessResponse(data, message = 'Success') {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

// Rate limiting helper (simple in-memory store)
const rateLimitStore = new Map();

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }
  
  const requests = rateLimitStore.get(identifier);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(time => time > windowStart);
  
  if (validRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
  
  return true; // Within rate limit
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 300000; // 5 minutes
  
  for (const [key, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(time => time > now - maxAge);
    if (validRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validRequests);
    }
  }
}, 60000); // Clean every minute

// Contact information parsing
export function parseContactInfo(message) {
  const result = {
    name: null,
    email: null,
    hasContact: false
  };

  // Email regex - more permissive to catch various formats
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = message.match(emailRegex);
  
  if (emailMatch) {
    result.email = emailMatch[0].toLowerCase();
    result.hasContact = true;
  }

  // Name extraction - look for patterns like "Ola Nordmann" or "Mitt navn er Ola"
  let nameCandidate = null;
  
  // Pattern 1: "Mitt navn er [Name]" or "Jeg heter [Name]"
  const namePatterns = [
    /(?:mitt navn er|jeg heter|heter|navn:?)\s+([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)*)/i,
    /^([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)*)[,\s]*$/,
    // Pattern for "Ola Nordmann, ola@example.com" format
    /^([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)*)[,\s]*[A-Za-z0-9._%+-]+@/
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      nameCandidate = match[1].trim();
      // Validate it's actually a name (not just random words)
      if (nameCandidate.length >= 2 && nameCandidate.length <= 50) {
        result.name = nameCandidate;
        result.hasContact = true;
        break;
      }
    }
  }

  return result;
}

// Check if message seems to contain contact information
export function looksLikeContactInfo(message) {
  const contactInfo = parseContactInfo(message);
  return contactInfo.hasContact;
}
