
// AI Labben Chatbot Widget v2.0.1
// Auto-generated file - do not edit directly
// Generated: 2025-11-12T11:13:45.901Z
// AI Labben Chatbot Widget

// Expose build version for debugging
(function(){ try { window.KLCHAT_WIDGET_VERSION = 'v2.0.1-2025-11-12T11:13:45.901Z'; } catch(e){} })();

// Inject CSS
(function() {
  'use strict';
  
  // Check if styles are already injected
  if (document.getElementById('klchat-widget-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'klchat-widget-styles';
  style.textContent = `/* AI Chatbot Widget Styles - SIMPLE APPROACH */
.klchat-widget {
  --klchat-primary: #429D0A;
  --klchat-primary-hover: #357A08;
  --klchat-secondary: #64748b;
  --klchat-background: #ffffff;
  --klchat-surface: #f8fafc;
  --klchat-border: #e2e8f0;
  --klchat-text: #1e293b;
  --klchat-text-muted: #64748b;
  --klchat-success: #10b981;
  --klchat-error: #ef4444;
  --klchat-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --klchat-shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--klchat-text);
  box-sizing: border-box;
  
  /* SIMPLE: No container styling - only children matter */
  position: static;
  width: auto;
  height: auto;
  z-index: auto;
  pointer-events: none;
}

/* ISOLATION: All child elements inherit isolation */
.klchat-widget *, 
.klchat-widget *::before, 
.klchat-widget *::after {
  box-sizing: border-box;
  pointer-events: inherit; /* Inherit isolation from parent */
}

/* Chat Button - SIMPLE AND CLEAN */
.klchat-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  background: var(--klchat-primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--klchat-shadow);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  /* SIMPLE: Just enable interactions */
  pointer-events: auto;
}

.klchat-button:hover {
  background: var(--klchat-primary-hover);
  transform: scale(1.05);
  box-shadow: var(--klchat-shadow-lg);
}

.klchat-button svg {
  width: 24px;
  height: 24px;
  fill: white;
  transition: transform 0.3s ease;
  pointer-events: none !important; /* SVG should not block clicks */
}

.klchat-button.klchat-open svg {
  transform: rotate(45deg);
}

/* Chat Container - SIMPLE SHOW/HIDE */
.klchat-container {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 380px;
  height: 600px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 150px);
  background: var(--klchat-background);
  border-radius: 16px;
  box-shadow: var(--klchat-shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transition: all 0.3s ease;
  z-index: 1001;
  
  /* SIMPLE: No interactions when closed */
  pointer-events: none;
  visibility: hidden;
}

.klchat-container.klchat-open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
  visibility: visible;
}

/* Header */
.klchat-header {
  background: var(--klchat-primary);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px 16px 0 0;
}

.klchat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.klchat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.klchat-title {
  font-weight: 600;
  font-size: 16px;
  margin: 0;
}

.klchat-subtitle {
  font-size: 12px;
  opacity: 0.8;
  margin: 2px 0 0 0;
}

.klchat-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  pointer-events: auto !important;
  z-index: 2147483647 !important;
  position: relative;
}

.klchat-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.klchat-close svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
  pointer-events: none !important; /* SVG should not block clicks */
}

/* Messages Container */
.klchat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
  max-height: 400px;
  min-height: 200px;
  /* Optimize scrolling performance */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  will-change: scroll-position;
  /* Ensure proper layering */
  position: relative;
  z-index: 1;
  pointer-events: auto;
  user-select: text;
}

.klchat-messages::-webkit-scrollbar {
  width: 6px;
}

.klchat-messages::-webkit-scrollbar-track {
  background: var(--klchat-surface);
  border-radius: 3px;
}

.klchat-messages::-webkit-scrollbar-thumb {
  background: var(--klchat-border);
  border-radius: 3px;
}

.klchat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--klchat-secondary);
}

/* Message Bubbles */
.klchat-message {
  display: flex;
  gap: 12px;
  animation: klchat-message-in 0.3s ease;
  position: relative;
  z-index: 2;
  pointer-events: auto;
  user-select: text;
}

.klchat-message.klchat-user {
  flex-direction: row-reverse;
}

.klchat-message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.klchat-message.klchat-bot .klchat-message-avatar {
  background: var(--klchat-primary);
  color: white;
}

.klchat-message.klchat-user .klchat-message-avatar {
  background: var(--klchat-secondary);
  color: white;
}

.klchat-message-content {
  max-width: 75%;
  background: var(--klchat-surface);
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
  word-wrap: break-word;
  pointer-events: auto;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.klchat-message.klchat-user .klchat-message-content {
  background: var(--klchat-primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.klchat-message.klchat-bot .klchat-message-content {
  border-bottom-left-radius: 4px;
}

.klchat-message-time {
  font-size: 11px;
  color: var(--klchat-text-muted);
  margin-top: 4px;
  text-align: right;
}

.klchat-message.klchat-user .klchat-message-time {
  color: rgba(255, 255, 255, 0.7);
  text-align: left;
}

/* Typing Indicator */
.klchat-typing {
  display: flex;
  gap: 12px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.klchat-typing.klchat-show {
  opacity: 1;
  transform: translateY(0);
}

.klchat-typing-content {
  background: var(--klchat-surface);
  padding: 12px 16px;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.klchat-typing-dot {
  width: 6px;
  height: 6px;
  background: var(--klchat-secondary);
  border-radius: 50%;
  animation: klchat-typing-bounce 1.4s infinite ease-in-out;
}

.klchat-typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.klchat-typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* Input Area */
.klchat-input-area {
  padding: 20px;
  border-top: 1px solid var(--klchat-border);
  background: var(--klchat-background);
  flex-shrink: 0;
}

.klchat-input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.klchat-input {
  flex: 1;
  border: 2px solid var(--klchat-border);
  border-radius: 12px;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  max-height: 100px;
  min-height: 44px;
  background: var(--klchat-background);
  color: var(--klchat-text);
  cursor: text !important;
  user-select: text !important;
  pointer-events: auto !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

.klchat-input:focus {
  border-color: var(--klchat-primary) !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
}

.klchat-input:hover {
  border-color: var(--klchat-primary);
}

.klchat-input::placeholder {
  color: var(--klchat-text-muted);
}

.klchat-input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  cursor: text !important;
  pointer-events: auto !important;
}

.klchat-send {
  background: var(--klchat-primary);
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.klchat-send:hover:not(:disabled) {
  background: var(--klchat-primary-hover);
  transform: scale(1.05);
}

.klchat-send:disabled {
  background: var(--klchat-secondary);
  cursor: not-allowed;
  transform: none;
}

.klchat-send svg {
  width: 20px;
  height: 20px;
  fill: white;
}

/* Error State */
.klchat-error {
  background: var(--klchat-error);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 16px 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.klchat-error svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}

/* Welcome Message */
.klchat-welcome {
  background: var(--klchat-surface);
  border: 1px solid var(--klchat-border);
  border-radius: 12px;
  padding: 20px;
  margin: 0 0 16px 0;
  text-align: center;
}

.klchat-welcome h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--klchat-text);
}

.klchat-welcome p {
  margin: 0;
  color: var(--klchat-text-muted);
  font-size: 13px;
}

/* Contact Form Styles */
.klchat-contact-form {
  margin-top: 12px;
  padding: 16px;
  background: var(--klchat-background);
  border: 1px solid var(--klchat-border);
  border-radius: 8px;
  position: relative;
  z-index: 10 !important;
  pointer-events: auto !important;
}

.klchat-contact-form * {
  pointer-events: auto !important;
  z-index: 15 !important;
}

.klchat-form-message {
  margin-bottom: 16px;
  color: var(--klchat-text);
  line-height: 1.5;
}

.klchat-form-field {
  margin-bottom: 16px;
  position: relative;
  z-index: 10;
  pointer-events: auto !important;
}

.klchat-form-field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--klchat-text);
  font-size: 13px;
  pointer-events: auto !important;
}

.klchat-form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--klchat-border);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  color: var(--klchat-text);
  background: var(--klchat-background);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  z-index: 20 !important;
  pointer-events: auto !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
}

.klchat-form-input:focus {
  outline: none;
  border-color: var(--klchat-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.klchat-form-input.klchat-form-error {
  border-color: var(--klchat-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.klchat-form-submit {
  width: 100%;
  padding: 12px 16px;
  background: var(--klchat-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
  z-index: 20 !important;
  pointer-events: auto !important;
}

.klchat-form-submit:hover:not(:disabled) {
  background: var(--klchat-primary-hover);
}

.klchat-form-submit:disabled {
  background: var(--klchat-secondary);
  cursor: not-allowed;
}

/* Animations */
@keyframes klchat-message-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes klchat-typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .klchat-container {
    bottom: 90px;
    right: 12px;
    left: 12px;
    width: auto;
    height: calc(100vh - 120px);
    max-width: none;
    border-radius: 16px 16px 0 0;
  }
  
  .klchat-button {
    bottom: 16px;
    right: 16px;
  }
  
  .klchat-message-content {
    max-width: 85%;
  }
  
  .klchat-header {
    padding: 16px 20px;
  }
  
  .klchat-messages {
    padding: 16px;
  }
  
  .klchat-input-area {
    padding: 16px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .klchat-widget {
    --klchat-border: #000000;
    --klchat-text-muted: #333333;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .klchat-widget * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;
  document.head.appendChild(style);
})();

// Widget JavaScript
// AI Chatbot Widget - Main JavaScript
(function() {
  'use strict';

  // Detect best API base URL based on environment and script origin
  function detectApiBaseUrl() {
    try {
      // 1) Explicit override from host page
      if (window.KLCHAT_API_URL) return window.KLCHAT_API_URL;

      // 2) Use the origin that served this widget script (works when embedded from chat domain)
      const scripts = document.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        const src = scripts[i].getAttribute('src') || '';
        if (src.includes('widget.js')) {
          const url = new URL(src, window.location.href);
          return url.origin;
        }
      }

      // 3) Fallback: current page origin (works for local testing with served widget)
      return window.location.origin;
    } catch (e) {
      // Final fallback - keep previous default in case of any error
      return window.location.origin;
    }
  }

  // Configuration
  const CONFIG = {
    API_BASE_URL: detectApiBaseUrl(),
    MAX_MESSAGE_LENGTH: 2000,
    TYPING_DELAY: 1000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  };

  // Debug which API base is used
  try {
    console.log('KLChatbot API base:', CONFIG.API_BASE_URL);
    if (window.KLCHAT_WIDGET_VERSION) {
      console.log('KLChatbot widget version:', window.KLCHAT_WIDGET_VERSION);
    }
  } catch {}

  // Widget state
  let state = {
    isOpen: false,
    isLoading: false,
    customerId: null,
    sessionId: null,
    chatHistory: [],
    customerConfig: null
  };

  // Utility functions
  function generateSessionId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // API functions
  async function apiRequest(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };

    for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, defaultOptions);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        return data;
      } catch (error) {
        console.error(`API request failed (attempt ${attempt}):`, error);
        
        if (attempt === CONFIG.RETRY_ATTEMPTS) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
      }
    }
  }

  async function loadCustomerConfig() {
    try {
      // Add cache-buster to prevent browser caching
      const cacheBuster = Date.now();
      const response = await apiRequest(`/api/config?v=${cacheBuster}`);
      console.log('Config API response:', response);
      return response.data;
    } catch (error) {
      console.error('Failed to load customer config:', error);
      // Return default config if API fails
      return {
        customer_id: 'ailabben',
        name: 'AI Labben',
        widget: {
          name: 'AI Labben',
          subtitle: 'Vi hjelper deg gjerne!',
          avatar: 'AI',
          primaryColor: '#429D0A',
          welcomeMessage: {
            title: 'Velkommen til AI Labben!',
            text: 'Jeg er her for å hjelpe deg med dine spørsmål.'
          }
        }
      };
    }
  }

  async function sendMessage(message) {
    const payload = {
      message: message.trim(),
      current_url: window.location.pathname,
      session_id: state.sessionId,
      chat_history: state.chatHistory.slice(-6) // Last 6 messages for context
    };

    const response = await apiRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return response.data;
  }

  // UI Creation functions
  function createWidget() {
    // Create widget container
    const widget = document.createElement('div');
    widget.className = 'klchat-widget';
    
    // Create chat button OUTSIDE the main widget container
    const chatButton = document.createElement('button');
    chatButton.className = 'klchat-button';
    chatButton.setAttribute('aria-label', 'Open chat');
    chatButton.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    `;
    
    // Create chat container
    const chatContainer = document.createElement('div');
    chatContainer.className = 'klchat-container';
    chatContainer.innerHTML = `
      <div class="klchat-header">
        <div class="klchat-header-info">
          <div class="klchat-avatar">AI</div>
          <div>
            <h3 class="klchat-title">AI Labben</h3>
            <p class="klchat-subtitle">Vi hjelper deg gjerne!</p>
          </div>
        </div>
        <button class="klchat-close" aria-label="Close chat">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div class="klchat-messages" id="klchat-messages">
        <div class="klchat-welcome">
          <h3>Velkommen til AI Labben!</h3>
          <p>Jeg er her for å hjelpe deg med dine spørsmål.</p>
        </div>
      </div>
      
      <div class="klchat-typing" id="klchat-typing">
        <div class="klchat-message-avatar">
          <div class="klchat-avatar">AI</div>
        </div>
        <div class="klchat-typing-content">
          <div class="klchat-typing-dot"></div>
          <div class="klchat-typing-dot"></div>
          <div class="klchat-typing-dot"></div>
        </div>
      </div>
      
      <div class="klchat-input-area">
        <div class="klchat-input-container">
          <textarea 
            class="klchat-input" 
            id="klchat-input"
            placeholder="Skriv din melding..."
            rows="1"
            maxlength="${CONFIG.MAX_MESSAGE_LENGTH}"
          ></textarea>
          <button class="klchat-send" id="klchat-send" aria-label="Send message">
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Append both elements to widget
    widget.appendChild(chatButton);
    widget.appendChild(chatContainer);

    return widget;
  }

  function createMessage(content, isUser = false, timestamp = new Date()) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `klchat-message ${isUser ? 'klchat-user' : 'klchat-bot'}`;
    
    const avatar = isUser ? 'U' : 'KL';
    const timeStr = formatTime(timestamp);
    
    let messageContent;
    
    // Handle different message types
    if (typeof content === 'object' && content.type === 'contact_form') {
      messageContent = createContactForm(content);
    } else if (typeof content === 'object') {
      messageContent = sanitizeHtml(JSON.stringify(content));
    } else {
      messageContent = sanitizeHtml(content);
    }
    
    messageDiv.innerHTML = `
      <div class="klchat-message-avatar">${avatar}</div>
      <div class="klchat-message-content">
        ${messageContent}
        <div class="klchat-message-time">${timeStr}</div>
      </div>
    `;

    return messageDiv;
  }

  function createContactForm(formData) {
    const formId = 'klchat-contact-form-' + Date.now();
    
    let fieldsHtml = '';
    formData.form.fields.forEach(field => {
      fieldsHtml += `
        <div class="klchat-form-field">
          <label for="${formId}-${field.name}">${field.label}${field.required ? ' *' : ''}</label>
          <input 
            type="${field.type}" 
            id="${formId}-${field.name}" 
            name="${field.name}"
            placeholder="${field.placeholder || ''}"
            ${field.required ? 'required' : ''}
            class="klchat-form-input"
          />
        </div>
      `;
    });
    
    return `
      <div class="klchat-form-message">${formData.message}</div>
      <form class="klchat-contact-form" data-form-id="${formId}">
        ${fieldsHtml}
        <button type="submit" class="klchat-form-submit">${formData.form.submitText}</button>
      </form>
    `;
  }

  function attachFormEventListeners(messageElement) {
    const form = messageElement.querySelector('.klchat-contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {};
      
      // Convert FormData to object
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      // Validate required fields
      const requiredInputs = form.querySelectorAll('input[required]');
      let isValid = true;
      
      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          input.classList.add('klchat-form-error');
          isValid = false;
        } else {
          input.classList.remove('klchat-form-error');
        }
      });
      
      if (!isValid) {
        return;
      }
      
      // Disable form
      const submitButton = form.querySelector('.klchat-form-submit');
      submitButton.disabled = true;
      submitButton.textContent = 'Sender...';
      
      try {
        // Send form data as JSON message
        const messagesContainer = document.getElementById('klchat-messages');
        const userMessage = createMessage(`Navn: ${data.user_name}, E-post: ${data.user_email}`, true);
        messagesContainer.appendChild(userMessage);
        
        // Add to chat history
        state.chatHistory.push({ role: 'user', content: JSON.stringify(data) });
        
        // Show typing indicator
        setTimeout(() => showTyping(true), 500);
        
        // Send to API
        const response = await sendMessage(JSON.stringify(data));
        
        // Hide typing indicator
        showTyping(false);
        
        // Add bot response
        const botMessage = createMessage(response.message);
        messagesContainer.appendChild(botMessage);
        
        // Add to chat history
        state.chatHistory.push({ role: 'assistant', content: response.message });
        
        // Update session ID
        if (response.session_id) {
          state.sessionId = response.session_id;
        }
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
      } catch (error) {
        console.error('Form submission error:', error);
        showError('Kunne ikke sende skjemaet. Prøv igjen.');
        
        // Re-enable form
        submitButton.disabled = false;
        submitButton.textContent = 'Send inn';
      }
    });
  }

  function showError(message) {
    const messagesContainer = document.getElementById('klchat-messages');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'klchat-error';
    errorDiv.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      ${message}
    `;
    
    messagesContainer.appendChild(errorDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Remove error after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  function showTyping(show = true) {
    const typingIndicator = document.getElementById('klchat-typing');
    const messagesContainer = document.getElementById('klchat-messages');
    
    if (show) {
      typingIndicator.classList.add('klchat-show');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
      typingIndicator.classList.remove('klchat-show');
    }
  }

  // Auto-resize textarea
  function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  }

  // Event handlers
  function toggleWidget() {
    console.log('toggleWidget called, current state:', state.isOpen);
    
    const container = document.querySelector('.klchat-container');
    const button = document.querySelector('.klchat-button');
    
    console.log('Container found:', container);
    console.log('Button found:', button);
    
    if (!container) {
      console.error('Chat container not found!');
      return;
    }
    
    state.isOpen = !state.isOpen;
    console.log('New state:', state.isOpen);
    
    if (state.isOpen) {
      container.classList.add('klchat-open');
      button?.classList.add('klchat-open');
      console.log('Opening chat...');
      
      // MINIMAL: Let CSS handle pointer-events
      
      // Focus input after a delay to ensure it's visible
      setTimeout(() => {
        const input = document.getElementById('klchat-input');
        if (input) {
          console.log('Focusing input after opening...');
          input.focus();
          input.click(); // Force click to ensure it's active
        }
      }, 500); // Longer delay to ensure animation is complete
    } else {
      container.classList.remove('klchat-open');
      button?.classList.remove('klchat-open');
      console.log('Closing chat...');
      
      // MINIMAL: Let CSS handle pointer-events
    }
  }

  async function handleSendMessage() {
    const input = document.getElementById('klchat-input');
    const sendButton = document.getElementById('klchat-send');
    const message = input.value.trim();
    
    if (!message || state.isLoading) return;

    // Disable input
    state.isLoading = true;
    input.disabled = true;
    sendButton.disabled = true;
    
    // Add user message to UI
    const messagesContainer = document.getElementById('klchat-messages');
    const userMessage = createMessage(message, true);
    messagesContainer.appendChild(userMessage);
    
    // Add to chat history
    state.chatHistory.push({ role: 'user', content: message });
    
    // Clear input
    input.value = '';
    autoResizeTextarea(input);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Show typing indicator
    setTimeout(() => showTyping(true), 500);

    try {
      // Send message to API
      const response = await sendMessage(message);
      
      // Hide typing indicator
      showTyping(false);
      
      // Add bot response to UI
      const botMessage = createMessage(response.message);
      messagesContainer.appendChild(botMessage);
      
      // Add form event listeners if this is a form message
      if (typeof response.message === 'object' && response.message.type === 'contact_form') {
        attachFormEventListeners(botMessage);
      }
      
      // Add to chat history
      state.chatHistory.push({ role: 'assistant', content: typeof response.message === 'object' ? JSON.stringify(response.message) : response.message });
      
      // Update session ID if provided
      if (response.session_id) {
        state.sessionId = response.session_id;
      }
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (error) {
      console.error('Failed to send message:', error);
      showTyping(false);
      showError('Beklager, jeg kunne ikke sende meldingen din. Prøv igjen.');
    } finally {
      // Re-enable input
      state.isLoading = false;
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  // Initialize widget
  async function initWidget(config = {}) {
    // Prevent double initialization - more robust check
    if (window.KLCHAT_INITIALIZED) {
      console.log('KLChatbot: Already initialized, skipping...');
      return;
    }
    window.KLCHAT_INITIALIZED = true;
    
    // Customer ID hentes fra API (hardkodet i backend)
    state.sessionId = generateSessionId();
    
    // Load customer configuration (inkluderer customer_id fra backend)
    state.customerConfig = await loadCustomerConfig();
    
    if (!state.customerConfig) {
      console.error('KLChatbot: Failed to load customer configuration');
      return;
    }
    
    console.log('Customer config loaded:', state.customerConfig);
    console.log('Proactive chat config:', state.customerConfig.proactive_chat);

    // SIMPLE APPROACH: Create widget normally
    const widget = createWidget();
    
    // SIMPLE: Append to body normally
    document.body.appendChild(widget);

    // Set customer ID for later use
    state.customerId = state.customerConfig.customer_id;

    // Update widget with customer-specific styling and text
    if (state.customerConfig.widget) {
      const widget = state.customerConfig.widget;
      
      // Update title and subtitle
      const title = document.querySelector('.klchat-title');
      const subtitle = document.querySelector('.klchat-subtitle');
      const avatar = document.querySelector('.klchat-avatar');
      
      if (widget.name) title.textContent = widget.name;
      if (widget.subtitle) subtitle.textContent = widget.subtitle;
      if (widget.avatar) avatar.textContent = widget.avatar;
      
      // Debug logging
      console.log('Widget config loaded:', widget);
      
      // Update welcome message
      if (widget.welcomeMessage) {
        const welcomeTitle = document.querySelector('.klchat-welcome h3');
        const welcomeText = document.querySelector('.klchat-welcome p');
        if (welcomeTitle && widget.welcomeMessage.title) {
          welcomeTitle.textContent = widget.welcomeMessage.title;
        }
        if (welcomeText && widget.welcomeMessage.text) {
          welcomeText.textContent = widget.welcomeMessage.text;
        }
      }
      
      // Apply custom primary color if set
      if (widget.primaryColor) {
        document.documentElement.style.setProperty('--klchat-primary', widget.primaryColor);
      }
    }

    // Event listeners
    const button = document.querySelector('.klchat-button');
    const closeButton = document.querySelector('.klchat-close');
    const input = document.getElementById('klchat-input');
    const sendButton = document.getElementById('klchat-send');

    // Debug logging
    console.log('Button found:', button);
    console.log('Close button found:', closeButton);

    if (button) {
      // MINIMAL: Let CSS handle styling, just attach click handler
      button.onclick = function(e) {
        console.log('Button clicked!');
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        toggleWidget();
        return false;
      };
      
      console.log('Click handler attached to button');
    }
    
    if (closeButton) {
      // Use onclick directly to avoid event listener conflicts
      closeButton.onclick = function(e) {
        console.log('Close button clicked via onclick!');
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        toggleWidget();
        return false;
      };
    }
    sendButton.addEventListener('click', handleSendMessage);

    // Simple input setup without aggressive focus management
    if (input) {
      input.removeAttribute('disabled');
      input.removeAttribute('readonly');
      input.tabIndex = 0;
      
      // Handle input events
      input.addEventListener('input', function(e) {
        autoResizeTextarea(input);
      });
      
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      });
    }

    // Enable natural scrolling in messages area (remove custom wheel handling)
    const messagesContainer = document.getElementById('klchat-messages');
    if (messagesContainer) {
      console.log('Enabling natural scrolling...');
      
      // Ensure the container is properly scrollable
      messagesContainer.style.pointerEvents = 'auto';
      messagesContainer.style.userSelect = 'text';
      messagesContainer.style.webkitUserSelect = 'text';
      
      // Let browser handle wheel events naturally - no custom handling needed
      console.log('Natural scrolling enabled');
    }

    // Removed click-outside-to-close functionality
    // Only close with X button or chat icon

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) {
        toggleWidget();
      }
    });

    // Debug overlay issues - add visual debugging
    setTimeout(() => {
      console.log('=== DEBUGGING WIDGET LAYERS ===');
      
      const widget = document.querySelector('.klchat-widget');
      const container = document.querySelector('.klchat-container');
      const messages = document.querySelector('.klchat-messages');
      const closeBtn = document.querySelector('.klchat-close');
      
      console.log('Widget z-index:', window.getComputedStyle(widget).zIndex);
      console.log('Container z-index:', window.getComputedStyle(container).zIndex);
      console.log('Messages z-index:', window.getComputedStyle(messages).zIndex);
      console.log('Close button z-index:', window.getComputedStyle(closeBtn).zIndex);
      
      // Test what element is actually on top at close button position
      const closeRect = closeBtn.getBoundingClientRect();
      const topElement = document.elementFromPoint(closeRect.left + 10, closeRect.top + 10);
      console.log('Element at close button position:', topElement);
      
      // Test what element is on top in messages area
      const messagesRect = messages.getBoundingClientRect();
      const topElementMessages = document.elementFromPoint(messagesRect.left + 50, messagesRect.top + 50);
      console.log('Element at messages position:', topElementMessages);
      
      // Add temporary visual debugging
      if (window.KLCHAT_DEBUG) {
        widget.style.border = '3px solid red';
        container.style.border = '2px solid blue';
        messages.style.border = '2px solid green';
        closeBtn.style.border = '2px solid yellow';
      }
      
      console.log('=== END DEBUG ===');
    }, 1000);

    console.log('KLChatbot initialized successfully for customer:', state.customerId);
    
    // 🚀 Proaktiv chat - åpne automatisk med introduksjonsmelding
    initProactiveChat();
  }

  // Proaktiv chat-funksjonalitet
  function initProactiveChat() {
    console.log('🚀 initProactiveChat() kalles');
    console.log('State.customerConfig:', state.customerConfig);
    
    // Sjekk om proaktiv chat er aktivert
    const proactiveConfig = state.customerConfig?.proactive_chat;
    
    console.log('Proactive config:', proactiveConfig);
    
    if (!proactiveConfig) {
      console.log('❌ Proaktiv chat config ikke funnet');
      return;
    }
    
    if (!proactiveConfig.enabled) {
      console.log('❌ Proaktiv chat er deaktivert');
      return;
    }
    
    // Sjekk om den allerede har vist seg i denne session
    const storageKey = 'klchat_proactive_shown';
    
    if (proactiveConfig.show_once) {
      const alreadyShown = sessionStorage.getItem(storageKey);
      if (alreadyShown) {
        console.log('⚠️ Proaktiv chat allerede vist i denne session');
        return;
      }
    }
    
    // Start timer
    const delay = proactiveConfig.delay || 5000;
    console.log(`⏱️ Proaktiv chat starter om ${delay}ms...`);
    
    setTimeout(() => {
      console.log('⏰ Timer utløpt! Sjekker om chat skal åpnes...');
      console.log('state.isOpen:', state.isOpen);
      console.log('state.chatHistory.length:', state.chatHistory.length);
      
      // Ikke åpne hvis brukeren allerede har interagert med chatten
      if (state.isOpen) {
        console.log('⚠️ Chat er allerede åpen');
        return;
      }
      
      if (state.chatHistory.length > 0) {
        console.log('⚠️ Bruker har allerede sendt meldinger');
        return;
      }
      
      console.log('✅ Åpner proaktiv chat nå!');
      
      // Marker som vist
      if (proactiveConfig.show_once) {
        sessionStorage.setItem(storageKey, 'true');
        console.log('💾 Lagret i sessionStorage');
      }
      
      // Åpne chat-vinduet først
      if (!state.isOpen) {
        console.log('🔓 Åpner chat-vindu...');
        toggleWidget();
      }
      
      // Vent litt slik at animasjonen blir ferdig
      setTimeout(() => {
        // Legg til bot-melding i UI
        const messagesContainer = document.getElementById('klchat-messages');
        console.log('📦 Messages container:', messagesContainer);
        
        if (messagesContainer && proactiveConfig.message) {
          // Fjern welcome-meldingen hvis den finnes
          const welcomeMsg = messagesContainer.querySelector('.klchat-welcome');
          if (welcomeMsg) {
            console.log('🗑️ Fjerner welcome-melding');
            welcomeMsg.remove();
          }
          
          // Legg til proaktiv melding
          console.log('💬 Legger til proaktiv melding:', proactiveConfig.message);
          const proactiveMessage = createMessage(proactiveConfig.message, false, new Date());
          messagesContainer.appendChild(proactiveMessage);
          
          // Legg til i chat-historikk
          state.chatHistory.push({ 
            role: 'assistant', 
            content: proactiveConfig.message 
          });
          
          // Scroll til bunn
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
          
          console.log('🎉 Proaktiv melding vist!');
        } else {
          console.log('❌ Kunne ikke vise proaktiv melding');
        }
      }, 500); // Vent 500ms for at chat-vinduet skal åpne
      
    }, delay);
  }

  // Public API
  window.KLChatbot = {
    init: initWidget,
    open: () => {
      if (!state.isOpen) toggleWidget();
    },
    close: () => {
      if (state.isOpen) toggleWidget();
    },
    toggle: toggleWidget,
    isOpen: () => state.isOpen,
    getSessionId: () => state.sessionId,
    getChatHistory: () => [...state.chatHistory],
    // Debug function to force button click
    forceClick: () => {
      console.log('Force clicking button...');
      const btn = document.querySelector('.klchat-button');
      if (btn) {
        console.log('Button found, triggering toggle');
        toggleWidget();
      } else {
        console.log('Button not found!');
      }
    }
  };

  // Auto-initialize (no config needed since customer_id is hardcoded in backend)
  if (window.KLCHAT_AUTO_INIT !== false) {
    window.KLChatbot.init();
  }

})();

