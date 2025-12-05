
// AI Labben Chatbot Widget v2.0.1
// Auto-generated file - do not edit directly
// Generated: 2025-12-05T14:24:34.310Z

// Expose build version for debugging
(function(){ try { window.AICHAT_WIDGET_VERSION = 'v2.0.1-2025-12-05T14:24:34.311Z'; } catch(e){} })();

// Inject CSS
(function() {
  'use strict';
  
  // Check if styles are already injected
  if (document.getElementById('aichat-widget-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'aichat-widget-styles';
  style.textContent = `/* AI Chatbot Widget Styles - Matches glocal.css design system */
.aichat-widget {
  /* Primary colors from glocal.css */
  --aichat-primary: hsl(24, 100%, 50%); /* #ff6b00 / orange-500 */
  --aichat-primary-hover: hsl(24, 100%, 45%); /* Darker orange for hover */
  --aichat-primary-foreground: hsl(0, 0%, 98%); /* Almost white */
  
  /* Background and surface colors */
  --aichat-background: hsl(0, 0%, 100%); /* White */
  --aichat-surface: hsl(0, 0%, 96.1%); /* Secondary color */
  
  /* Text colors */
  --aichat-text: hsl(0, 0%, 3.9%); /* Foreground - almost black */
  --aichat-text-muted: hsl(0, 0%, 45.1%); /* Muted foreground */
  
  /* Secondary and accent */
  --aichat-secondary: hsl(0, 0%, 96.1%); /* Secondary color */
  --aichat-secondary-foreground: hsl(0, 0%, 9%); /* Dark gray */
  
  /* Border and input */
  --aichat-border: hsl(0, 0%, 89.8%); /* Border color */
  --aichat-input-border: hsl(0, 0%, 89.8%); /* Input border */
  
  /* Ring color (focus) */
  --aichat-ring: hsl(24, 100%, 50%); /* Primary color for focus rings */
  
  /* Status colors */
  --aichat-success: hsl(142, 76%, 36%); /* Green */
  --aichat-error: hsl(0, 84.2%, 60.2%); /* Destructive color from glocal.css */
  
  /* Border radius */
  --aichat-radius: 0.5rem; /* 8px - matches glocal.css */
  
  /* Shadows */
  --aichat-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --aichat-shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--aichat-text);
  box-sizing: border-box;
  
  /* SIMPLE: No container styling - only children matter */
  position: static;
  width: auto;
  height: auto;
  z-index: auto;
  pointer-events: none;
}

/* ISOLATION: All child elements inherit isolation */
.aichat-widget *, 
.aichat-widget *::before, 
.aichat-widget *::after {
  box-sizing: border-box;
  pointer-events: inherit; /* Inherit isolation from parent */
}

/* Chat Button - SIMPLE AND CLEAN */
.aichat-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  background: var(--aichat-primary);
  color: var(--aichat-primary-foreground);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--aichat-shadow);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  /* SIMPLE: Just enable interactions */
  pointer-events: auto;
}

.aichat-button:hover {
  background: var(--aichat-primary-hover);
  transform: scale(1.05);
  box-shadow: var(--aichat-shadow-lg);
}

.aichat-button:focus-visible {
  outline: 2px solid var(--aichat-ring);
  outline-offset: 4px;
}

.aichat-button svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
  transition: transform 0.3s ease;
  pointer-events: none !important; /* SVG should not block clicks */
}

.aichat-button.aichat-open svg {
  transform: rotate(45deg);
}

/* Chat Container - SIMPLE SHOW/HIDE */
.aichat-container {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 380px;
  height: 600px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 150px);
  background: var(--aichat-background);
  border-radius: var(--aichat-radius);
  box-shadow: var(--aichat-shadow-lg);
  border: 1px solid var(--aichat-border);
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

.aichat-container.aichat-open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
  visibility: visible;
}

/* Header */
.aichat-header {
  background: var(--aichat-primary);
  color: var(--aichat-primary-foreground);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--aichat-radius) var(--aichat-radius) 0 0;
}

.aichat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.aichat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: hsl(0, 0%, 98%, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  color: var(--aichat-primary-foreground);
  overflow: hidden;
}

.aichat-avatar-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px;
  display: block;
}

.aichat-title {
  font-family: Arial, sans-serif;
  font-weight: bold;
  font-size: 16px;
  margin: 0;
  font-style: normal;
}

.aichat-subtitle {
  font-size: 12px;
  opacity: 0.8;
  margin: 2px 0 0 0;
}

.aichat-close {
  background: none;
  border: none;
  color: var(--aichat-primary-foreground);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--aichat-radius);
  transition: background-color 0.2s ease;
  pointer-events: auto !important;
  z-index: 1002;
  position: relative;
}

.aichat-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.aichat-close:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

.aichat-close svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
  pointer-events: none !important; /* SVG should not block clicks */
}

/* Messages Container */
.aichat-messages {
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

.aichat-messages::-webkit-scrollbar {
  width: 6px;
}

.aichat-messages::-webkit-scrollbar-track {
  background: var(--aichat-surface);
  border-radius: 3px;
}

.aichat-messages::-webkit-scrollbar-thumb {
  background: var(--aichat-border);
  border-radius: 3px;
}

.aichat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--aichat-secondary);
}

/* Message Bubbles */
.aichat-message {
  display: flex;
  gap: 12px;
  animation: aichat-message-in 0.3s ease;
  position: relative;
  z-index: 2;
  pointer-events: auto;
  user-select: text;
}

.aichat-message.aichat-user {
  flex-direction: row-reverse;
}

.aichat-message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
  overflow: hidden;
}

.aichat-message-avatar .aichat-avatar-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
  display: block;
}

.aichat-message.aichat-bot .aichat-message-avatar {
  background: var(--aichat-primary);
  color: var(--aichat-primary-foreground);
}

.aichat-message.aichat-user .aichat-message-avatar {
  background: var(--aichat-secondary);
  color: var(--aichat-secondary-foreground);
}

.aichat-message-content {
  max-width: 75%;
  background: var(--aichat-surface);
  padding: 12px 16px;
  border-radius: var(--aichat-radius);
  position: relative;
  word-wrap: break-word;
  pointer-events: auto;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.aichat-message.aichat-user .aichat-message-content {
  background: var(--aichat-primary);
  color: var(--aichat-primary-foreground);
  border-bottom-right-radius: 4px;
}

.aichat-message.aichat-bot .aichat-message-content {
  border-bottom-left-radius: 4px;
}

.aichat-message-time {
  font-size: 11px;
  color: var(--aichat-text-muted);
  margin-top: 4px;
  text-align: right;
  opacity: 0.8;
}

.aichat-message.aichat-user .aichat-message-time {
  color: hsl(0, 0%, 98%, 0.7);
  text-align: left;
}

/* Typing Indicator */
.aichat-typing {
  display: flex;
  gap: 12px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.aichat-typing.aichat-show {
  opacity: 1;
  transform: translateY(0);
}

.aichat-typing-content {
  background: var(--aichat-surface);
  padding: 12px 16px;
  border-radius: var(--aichat-radius);
  border-bottom-left-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.aichat-typing-dot {
  width: 6px;
  height: 6px;
  background: var(--aichat-secondary);
  border-radius: 50%;
  animation: aichat-typing-bounce 1.4s infinite ease-in-out;
}

.aichat-typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.aichat-typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* Input Area */
.aichat-input-area {
  padding: 20px;
  border-top: 1px solid var(--aichat-border);
  background: var(--aichat-background);
  flex-shrink: 0;
}

.aichat-input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  cursor: text !important;
  pointer-events: auto !important;
}

.aichat-input {
  flex: 1;
  border: 2px solid var(--aichat-input-border);
  border-radius: var(--aichat-radius);
  padding: 12px 16px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  max-height: 100px;
  min-height: 44px;
  background: var(--aichat-background);
  color: var(--aichat-text);
  cursor: text !important;
  user-select: text !important;
  pointer-events: auto !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

.aichat-input:focus {
  border-color: var(--aichat-ring) !important;
  box-shadow: 0 0 0 3px hsl(24, 100%, 50%, 0.1) !important;
}

.aichat-input:focus-visible {
  outline: 2px solid var(--aichat-ring);
  outline-offset: 2px;
}

.aichat-input:hover {
  border-color: var(--aichat-primary);
}

.aichat-input::placeholder {
  color: var(--aichat-text-muted);
}

.aichat-send {
  background: var(--aichat-primary);
  color: var(--aichat-primary-foreground);
  border: none;
  border-radius: var(--aichat-radius);
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.aichat-send:hover:not(:disabled) {
  background: var(--aichat-primary-hover);
  transform: scale(1.05);
}

.aichat-send:focus-visible {
  outline: 2px solid var(--aichat-ring);
  outline-offset: 2px;
}

.aichat-send:disabled {
  background: var(--aichat-secondary);
  cursor: not-allowed;
  transform: none;
}

.aichat-send svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

/* Error State */
.aichat-error {
  background: var(--aichat-error);
  color: hsl(0, 0%, 98%);
  padding: 12px 16px;
  border-radius: var(--aichat-radius);
  margin: 16px 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.aichat-error svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}

/* Welcome Message */
.aichat-welcome {
  background: var(--aichat-surface);
  border: 1px solid var(--aichat-border);
  border-radius: var(--aichat-radius);
  padding: 20px;
  margin: 0 0 16px 0;
  text-align: center;
}

.aichat-welcome h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: bold;
  color: var(--aichat-text);
}

.aichat-welcome p {
  margin: 0;
  color: var(--aichat-text-muted);
  font-size: 13px;
}

/* Contact Form Styles */
.aichat-contact-form {
  margin-top: 12px;
  padding: 16px;
  background: var(--aichat-background);
  border: 1px solid var(--aichat-border);
  border-radius: var(--aichat-radius);
  position: relative;
  z-index: 10 !important;
  pointer-events: auto !important;
}

.aichat-contact-form * {
  pointer-events: auto !important;
  z-index: 15 !important;
}

.aichat-form-message {
  margin-bottom: 16px;
  color: var(--aichat-text);
  line-height: 1.5;
}

.aichat-form-field {
  margin-bottom: 16px;
  position: relative;
  z-index: 10;
  pointer-events: auto !important;
}

.aichat-form-field label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  color: var(--aichat-text);
  font-size: 13px;
  pointer-events: auto !important;
}

.aichat-form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--aichat-input-border);
  border-radius: var(--aichat-radius);
  font-size: 14px;
  font-family: inherit;
  color: var(--aichat-text);
  background: var(--aichat-background);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  z-index: 20 !important;
  pointer-events: auto !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
}

.aichat-form-input:focus {
  outline: none;
  border-color: var(--aichat-ring);
  box-shadow: 0 0 0 3px hsl(24, 100%, 50%, 0.1);
}

.aichat-form-input:focus-visible {
  outline: 2px solid var(--aichat-ring);
  outline-offset: 2px;
}

.aichat-form-input.aichat-form-error {
  border-color: var(--aichat-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.aichat-form-submit {
  width: 100%;
  padding: 12px 16px;
  background: var(--aichat-primary);
  color: var(--aichat-primary-foreground);
  border: none;
  border-radius: var(--aichat-radius);
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
  z-index: 20 !important;
  pointer-events: auto !important;
}

.aichat-form-submit:hover:not(:disabled) {
  background: var(--aichat-primary-hover);
}

.aichat-form-submit:focus-visible {
  outline: 2px solid var(--aichat-ring);
  outline-offset: 2px;
}

.aichat-form-submit:disabled {
  background: var(--aichat-secondary);
  cursor: not-allowed;
}

/* Animations */
@keyframes aichat-message-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes aichat-typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .aichat-container {
    bottom: 90px;
    right: 12px;
    left: 12px;
    width: auto;
    height: calc(100vh - 120px);
    max-width: none;
    border-radius: var(--aichat-radius) var(--aichat-radius) 0 0;
  }
  
  .aichat-button {
    bottom: 16px;
    right: 16px;
  }
  
  .aichat-message-content {
    max-width: 85%;
  }
  
  .aichat-header {
    padding: 16px 20px;
  }
  
  .aichat-messages {
    padding: 16px;
  }
  
  .aichat-input-area {
    padding: 16px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .aichat-widget {
    --aichat-border: #000000;
    --aichat-text-muted: #333333;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .aichat-widget * {
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
      if (window.AICHAT_API_URL) return window.AICHAT_API_URL;

      // 2) Use the origin that served this widget script (works when embedded from chat domain)
      const scripts = document.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        const src = scripts[i].getAttribute('src') || '';
        if (src.includes('widget.js')) {
          const url = new URL(src, window.location.href);
          return url.origin;
        }
      }

      // 3) Default production API URL
      const defaultApiUrl = 'https://chatailabben.ailabben.no';
      
      // 4) Fallback: current page origin (only for localhost development)
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return window.location.origin;
      }

      // 5) Production fallback: use default API URL
      return defaultApiUrl;
    } catch (e) {
      // Final fallback - use production API URL
      return 'https://chatailabben.ailabben.no';
    }
  }

  // Configuration
  const CONFIG = {
    API_BASE_URL: detectApiBaseUrl(),
    MAX_MESSAGE_LENGTH: 2000,
    TYPING_DELAY: 1000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    INACTIVITY_TIMEOUT_MS: 5 * 60 * 1000 // 5 minutter
  };

  // Debug which API base is used
  try {
    console.log('AIChatbot API base:', CONFIG.API_BASE_URL);
    if (window.AICHAT_WIDGET_VERSION) {
      console.log('AIChatbot widget version:', window.AICHAT_WIDGET_VERSION);
    }
  } catch {}

  // Widget state
  let state = {
    isOpen: false,
    isLoading: false,
    customerId: null,
    sessionId: null,
    chatHistory: [],
    customerConfig: null,
    lastActivity: null,
    inactivityTimerId: null,
    conversationEnded: false
  };

  // SessionStorage keys for per-fane chat-tilstand
  const STORAGE_KEYS = {
    sessionId: 'ailabben_chat_session_id',
    chatHistory: 'ailabben_chat_history'
  };

  function setSessionId(id) {
    state.sessionId = id;
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.sessionId, id);
      }
    } catch (e) {
      console.warn('Kunne ikke lagre sessionId i sessionStorage:', e);
    }
  }

  function addToChatHistory(entry) {
    state.chatHistory.push(entry);
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(state.chatHistory));
      }
    } catch (e) {
      console.warn('Kunne ikke lagre chat-historikk i sessionStorage:', e);
    }
  }

  function loadStoredChatState() {
    try {
      if (typeof sessionStorage === 'undefined') return;

      const storedSessionId = sessionStorage.getItem(STORAGE_KEYS.sessionId);
      const storedHistoryRaw = sessionStorage.getItem(STORAGE_KEYS.chatHistory);

      if (storedSessionId) {
        state.sessionId = storedSessionId;
      }

      if (storedHistoryRaw) {
        const parsed = JSON.parse(storedHistoryRaw);
        if (Array.isArray(parsed)) {
          state.chatHistory = parsed;
        }
      }
    } catch (e) {
      console.warn('Kunne ikke lese lagret chat-tilstand fra sessionStorage:', e);
    }
  }

  function registerActivity() {
    state.lastActivity = Date.now();
    state.conversationEnded = false;

    if (state.inactivityTimerId) {
      clearTimeout(state.inactivityTimerId);
    }

    try {
      state.inactivityTimerId = setTimeout(() => {
        // Sjekk om det faktisk har vært 5 minutter uten aktivitet
        const now = Date.now();
        if (state.lastActivity && now - state.lastActivity < CONFIG.INACTIVITY_TIMEOUT_MS - 500) {
          return;
        }

        const messagesContainer = document.getElementById('aichat-messages');
        if (!messagesContainer) return;

        const endText = 'Samtalen er avsluttet.';
        const endMessage = createMessage(endText, false, new Date());
        messagesContainer.appendChild(endMessage);
        addToChatHistory({ role: 'assistant', content: endText });
        state.conversationEnded = true;
      }, CONFIG.INACTIVITY_TIMEOUT_MS);
    } catch (e) {
      console.warn('Kunne ikke starte inaktivitets-timer:', e);
    }
  }

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

  // Get avatar icon HTML (SVG)
  function getAvatarIcon() {
    // Try to load from API base URL first, then fallback to relative path
    const iconPath = `${CONFIG.API_BASE_URL}/images/AI Labben ikon 64x64.svg`;
    return `<img src="${iconPath}" alt="AI Labben" class="aichat-avatar-icon" />`;
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
    widget.className = 'aichat-widget';
    
    // Create chat button OUTSIDE the main widget container
    const chatButton = document.createElement('button');
    chatButton.className = 'aichat-button';
    chatButton.setAttribute('aria-label', 'Open chat');
    chatButton.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    `;
    
    // Create chat container
    const chatContainer = document.createElement('div');
    chatContainer.className = 'aichat-container';
    chatContainer.innerHTML = `
      <div class="aichat-header">
          <div class="aichat-header-info">
          <div class="aichat-avatar">${getAvatarIcon()}</div>
          <div>
            <h3 class="aichat-title">AI Labben</h3>
            <p class="aichat-subtitle">Vi hjelper deg gjerne!</p>
          </div>
        </div>
        <button class="aichat-close" aria-label="Close chat">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div class="aichat-messages" id="aichat-messages">
      </div>
      
      <div class="aichat-typing" id="aichat-typing">
        <div class="aichat-message-avatar">
          ${getAvatarIcon()}
        </div>
        <div class="aichat-typing-content">
          <div class="aichat-typing-dot"></div>
          <div class="aichat-typing-dot"></div>
          <div class="aichat-typing-dot"></div>
        </div>
      </div>
      
      <div class="aichat-input-area">
        <div class="aichat-input-container">
          <textarea 
            class="aichat-input" 
            id="aichat-input"
            placeholder="Skriv din melding..."
            rows="1"
            maxlength="${CONFIG.MAX_MESSAGE_LENGTH}"
          ></textarea>
          <button class="aichat-send" id="aichat-send" aria-label="Send message">
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
    messageDiv.className = `aichat-message ${isUser ? 'aichat-user' : 'aichat-bot'}`;
    
    // Use SVG icon for bot messages, 'U' for user messages
    const avatar = isUser ? 'U' : getAvatarIcon();
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
      <div class="aichat-message-avatar">${avatar}</div>
      <div class="aichat-message-content">
        ${messageContent}
        <div class="aichat-message-time">${timeStr}</div>
      </div>
    `;

    return messageDiv;
  }

  function createContactForm(formData) {
    const formId = 'aichat-contact-form-' + Date.now();
    
    let fieldsHtml = '';
    formData.form.fields.forEach(field => {
      fieldsHtml += `
        <div class="aichat-form-field">
          <label for="${formId}-${field.name}">${field.label}${field.required ? ' *' : ''}</label>
          <input 
            type="${field.type}" 
            id="${formId}-${field.name}" 
            name="${field.name}"
            placeholder="${field.placeholder || ''}"
            ${field.required ? 'required' : ''}
            class="aichat-form-input"
          />
        </div>
      `;
    });
    
    return `
      <div class="aichat-form-message">${formData.message}</div>
      <form class="aichat-contact-form" data-form-id="${formId}">
        ${fieldsHtml}
        <button type="submit" class="aichat-form-submit">${formData.form.submitText}</button>
      </form>
    `;
  }

  function attachFormEventListeners(messageElement) {
    const form = messageElement.querySelector('.aichat-contact-form');
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
          input.classList.add('aichat-form-error');
          isValid = false;
        } else {
          input.classList.remove('aichat-form-error');
        }
      });
      
      if (!isValid) {
        return;
      }
      
      // Disable form
      const submitButton = form.querySelector('.aichat-form-submit');
      submitButton.disabled = true;
      submitButton.textContent = 'Sender...';
      
      try {
        // Send form data as JSON message
        const messagesContainer = document.getElementById('aichat-messages');
        const userMessage = createMessage(`Navn: ${data.user_name}, E-post: ${data.user_email}`, true);
        messagesContainer.appendChild(userMessage);

        // Add to chat history
        addToChatHistory({ role: 'user', content: JSON.stringify(data) });
        registerActivity();
        
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
        addToChatHistory({ role: 'assistant', content: response.message });
        registerActivity();
        
        // Update session ID
        if (response.session_id) {
          setSessionId(response.session_id);
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
    const messagesContainer = document.getElementById('aichat-messages');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'aichat-error';
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
    const typingIndicator = document.getElementById('aichat-typing');
    const messagesContainer = document.getElementById('aichat-messages');
    
    if (show) {
      typingIndicator.classList.add('aichat-show');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
      typingIndicator.classList.remove('aichat-show');
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
    
    const container = document.querySelector('.aichat-container');
    const button = document.querySelector('.aichat-button');
    
    if (!container) {
      console.error('Chat container not found!');
      return;
    }
    
    const wasOpen = state.isOpen;
    state.isOpen = !state.isOpen;
    
    if (state.isOpen) {
      container.classList.add('aichat-open');
      button?.classList.add('aichat-open');
      console.log('Opening chat...');
      
      // Sørg for at proaktiv melding vises hver gang chatten åpnes
      ensureProactiveMessage();
      
      setTimeout(() => {
        const input = document.getElementById('aichat-input');
        if (input) {
          input.focus();
        }
      }, 500);
    } else {
      container.classList.remove('aichat-open');
      button?.classList.remove('aichat-open');
      console.log('Closing chat...');
      
      // Hvis chatten ble lukket (fra åpen til lukket), marker som manuelt lukket
      // Dette forhindrer automatisk åpning på nye sider i samme session
      if (wasOpen) {
        sessionStorage.setItem('ailabben_chat_manually_closed', 'true');
        console.log('💾 Chat lukket manuelt - lagret i sessionStorage');
      }
    }
  }

  async function handleSendMessage() {
    const input = document.getElementById('aichat-input');
    const sendButton = document.getElementById('aichat-send');
    const message = input.value.trim();
    
    if (!message || state.isLoading) return;

    // Disable input
    state.isLoading = true;
    input.disabled = true;
    sendButton.disabled = true;
    
    // Add user message to UI
    const messagesContainer = document.getElementById('aichat-messages');
    const userMessage = createMessage(message, true);
    messagesContainer.appendChild(userMessage);
    
    // Add to chat history
    addToChatHistory({ role: 'user', content: message });
    registerActivity();
    
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
      
      // Håndter bot-respons
      let botMessage;

      // Hvis vi får et kontaktskjema tilbake, sørg for at det IKKE dukker opp to ganger
      if (typeof response.message === 'object' && response.message.type === 'contact_form') {
        const alreadyHasContactForm = state.chatHistory.some(msg => {
          if (msg.role !== 'assistant') return false;
          if (typeof msg.content !== 'string') return false;
          return msg.content.includes('"type":"contact_form"');
        });

        if (alreadyHasContactForm) {
          // Vi har allerede vist et kontaktskjema tidligere i denne sesjonen.
          // Ikke vis et nytt skjema eller ekstra melding – ignorer bare duplikatet
          console.log('Kontakt-skjema er allerede vist i denne sesjonen – ignorerer nytt skjema fra backend.');
        } else {
          // Første gang vi viser kontaktskjema – normal oppførsel
          botMessage = createMessage(response.message);
          messagesContainer.appendChild(botMessage);
          attachFormEventListeners(botMessage);
          addToChatHistory({ role: 'assistant', content: JSON.stringify(response.message) });
          registerActivity();
        }
      } else {
        // Vanlig tekst-/AI-respons
        botMessage = createMessage(response.message);
        messagesContainer.appendChild(botMessage);
        addToChatHistory({
          role: 'assistant',
          content: typeof response.message === 'object' ? JSON.stringify(response.message) : response.message
        });
        registerActivity();
      }
      
      // Update session ID if provided
      if (response.session_id) {
        setSessionId(response.session_id);
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
    if (window.AICHAT_INITIALIZED) {
      console.log('AIChatbot: Already initialized, skipping...');
      return;
    }
    window.AICHAT_INITIALIZED = true;

    // Hent eventuelt eksisterende sesjon og historikk for denne fanen
    loadStoredChatState();
    
    // Customer ID hentes fra API (hardkodet i backend)
    if (!state.sessionId) {
      setSessionId(generateSessionId());
    }
    
    // Load customer configuration (inkluderer customer_id fra backend)
    state.customerConfig = await loadCustomerConfig();
    
    if (!state.customerConfig) {
      console.error('AIChatbot: Failed to load customer configuration');
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
      const title = document.querySelector('.aichat-title');
      const subtitle = document.querySelector('.aichat-subtitle');
      
      if (widget.name) title.textContent = widget.name;
      if (widget.subtitle) subtitle.textContent = widget.subtitle;
      // Avatar is now SVG icon, don't override it with text
      
      // Debug logging
      console.log('Widget config loaded:', widget);
      
      // Welcome message er fjernet - kun proaktiv melding brukes
      
      // Apply custom primary color if set
      if (widget.primaryColor) {
        document.documentElement.style.setProperty('--aichat-primary', widget.primaryColor);
      }
    }

    // Event listeners
    const button = document.querySelector('.aichat-button');
    const closeButton = document.querySelector('.aichat-close');
    const input = document.getElementById('aichat-input');
    const sendButton = document.getElementById('aichat-send');

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
    const messagesContainer = document.getElementById('aichat-messages');
    if (messagesContainer) {
      // Gjenopprett tidligere meldinger i UI dersom vi har historikk
      if (state.chatHistory && state.chatHistory.length > 0) {
        state.chatHistory.forEach((msg) => {
          const isUser = msg.role === 'user';
          let content = msg.content;
          let parsedContent = null;
          let isContactForm = false;

          if (typeof content === 'string') {
            try {
              parsedContent = JSON.parse(content);
              if (parsedContent && typeof parsedContent === 'object' && parsedContent.type === 'contact_form') {
                isContactForm = true;
              }
            } catch (e) {
              // Ikke gyldig JSON – behandle som vanlig tekst
            }
          }

          const messageNode = createMessage(isContactForm ? parsedContent : content, isUser, new Date());
          messagesContainer.appendChild(messageNode);

          if (!isUser && isContactForm) {
            attachFormEventListeners(messageNode);
          }
        });

        // Scroll til bunn etter restore
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

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
      
      const widget = document.querySelector('.aichat-widget');
      const container = document.querySelector('.aichat-container');
      const messages = document.querySelector('.aichat-messages');
      const closeBtn = document.querySelector('.aichat-close');
      
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
      if (window.AICHAT_DEBUG) {
        widget.style.border = '3px solid red';
        container.style.border = '2px solid blue';
        messages.style.border = '2px solid green';
        closeBtn.style.border = '2px solid yellow';
      }
      
      console.log('=== END DEBUG ===');
    }, 1000);

    console.log('AIChatbot initialized successfully for customer:', state.customerId);
    
    // 🚀 Proaktiv chat - åpne automatisk med introduksjonsmelding
    initProactiveChat();
  }

  // Hjelpefunksjon for å sikre at proaktiv melding vises
  function ensureProactiveMessage() {
    const proactiveConfig = state.customerConfig?.proactive_chat;
    
    if (!proactiveConfig || !proactiveConfig.enabled || !proactiveConfig.message) {
      return;
    }
    
    const messagesContainer = document.getElementById('aichat-messages');
    if (!messagesContainer) {
      return;
    }
    
    // Sjekk om meldingen allerede finnes i DOM (sjekk alle meldinger)
    const existingMessages = messagesContainer.querySelectorAll('.aichat-message.aichat-bot');
    let messageExistsInDOM = false;
    
    existingMessages.forEach(msg => {
      const content = msg.querySelector('.aichat-message-content');
      if (content) {
        // Fjern HTML tags og sammenlign tekst
        const textContent = content.textContent.trim();
        const proactiveText = proactiveConfig.message.trim();
        if (textContent === proactiveText || textContent.includes(proactiveText)) {
          messageExistsInDOM = true;
        }
      }
    });
    
    // Hvis meldingen allerede finnes i DOM, ikke legg den til igjen
    if (messageExistsInDOM) {
      console.log('✅ Proaktiv melding finnes allerede i DOM - hopper over');
      return;
    }
    
    // Sjekk også i chat-historikk
    const messageExistsInHistory = state.chatHistory.some(
      msg => msg.role === 'assistant' && msg.content === proactiveConfig.message
    );
    
    if (messageExistsInHistory) {
      console.log('✅ Proaktiv melding finnes allerede i historikk - hopper over');
      return;
    }
    
    // Vent litt slik at animasjonen blir ferdig
    setTimeout(() => {
      // Dobbeltsjekk igjen etter timeout (i tilfelle flere kall)
      const existingMessagesAfterWait = messagesContainer.querySelectorAll('.aichat-message.aichat-bot');
      let stillExists = false;
      
      existingMessagesAfterWait.forEach(msg => {
        const content = msg.querySelector('.aichat-message-content');
        if (content) {
          const textContent = content.textContent.trim();
          const proactiveText = proactiveConfig.message.trim();
          if (textContent === proactiveText || textContent.includes(proactiveText)) {
            stillExists = true;
          }
        }
      });
      
      if (stillExists) {
        console.log('✅ Proaktiv melding finnes allerede i DOM (etter timeout) - hopper over');
        return;
      }
      
      // Fjern welcome-meldingen hvis den finnes
      const welcomeMsg = messagesContainer.querySelector('.aichat-welcome');
      if (welcomeMsg) {
        welcomeMsg.remove();
      }
      
      // Legg til proaktiv melding
      const proactiveMessage = createMessage(proactiveConfig.message, false, new Date());
      messagesContainer.appendChild(proactiveMessage);
      
      // Legg til i chat-historikk
      addToChatHistory({ 
        role: 'assistant', 
        content: proactiveConfig.message 
      });
      
      // Scroll til bunn
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      console.log('🎉 Proaktiv melding lagt til!');
    }, 500);
  }

  // Proaktiv chat-funksjonalitet
  function initProactiveChat() {
    console.log('🚀 initProactiveChat() kalles');

    // 🚫 Ikke auto-åpne chat på mobil/små skjermer
    try {
      const isSmallScreen = window.matchMedia
        ? window.matchMedia('(max-width: 768px)').matches
        : window.innerWidth <= 768;

      if (isSmallScreen) {
        console.log('📱 Liten skjerm detektert – hopper over proaktiv auto-åpning');
        return;
      }
    } catch (e) {
      console.warn('Kunne ikke evaluere skjermstørrelse for proaktiv chat:', e);
    }

    // Sjekk om proaktiv chat er aktivert
    const proactiveConfig = state.customerConfig?.proactive_chat;
    
    if (!proactiveConfig) {
      console.log('❌ Proaktiv chat config ikke funnet');
      return;
    }
    
    if (!proactiveConfig.enabled) {
      console.log('❌ Proaktiv chat er deaktivert');
      return;
    }
    
    // Session storage keys
    const storageKeyShown = 'ailabben_chat_auto_opened';
    const storageKeyManuallyClosed = 'ailabben_chat_manually_closed';
    const storageKeyPageLoadTime = 'ailabben_chat_page_load_time';
    
    // Sjekk om dette er en ny page load (inkludert hard refresh)
    const currentPageLoadTime = Date.now();
    const lastPageLoadTime = sessionStorage.getItem(storageKeyPageLoadTime);
    
    // Hvis dette er en ny page load (inkludert refresh), tillat åpning igjen
    const isNewPageLoad = !lastPageLoadTime || (currentPageLoadTime - parseInt(lastPageLoadTime) > 1000);
    
    if (isNewPageLoad) {
      // Lagre ny page load time
      sessionStorage.setItem(storageKeyPageLoadTime, currentPageLoadTime.toString());
      // Reset auto-opened flag ved ny page load
      sessionStorage.removeItem(storageKeyShown);
      // Reset manually closed flag ved ny page load (brukeren kan ha lukket i forrige page load)
      sessionStorage.removeItem(storageKeyManuallyClosed);
      console.log('🔄 Ny page load detektert - tillater åpning');
    } else {
      // Sjekk om den allerede har åpnet seg i denne page load
      const alreadyOpened = sessionStorage.getItem(storageKeyShown);
      if (alreadyOpened === 'true') {
        console.log('⚠️ Proaktiv chat allerede åpnet i denne page load');
        return;
      }
    }
    
    // Sjekk om brukeren har lukket chatten manuelt
    const manuallyClosed = sessionStorage.getItem(storageKeyManuallyClosed);
    if (manuallyClosed === 'true') {
      console.log('⚠️ Chat ble lukket manuelt - ikke åpne automatisk');
      return;
    }
    
    // Start timer
    const delay = proactiveConfig.delay || 5000;
    console.log(`⏱️ Proaktiv chat starter om ${delay}ms...`);
    
    setTimeout(() => {
      // Dobbeltsjekk før åpning
      const stillClosed = sessionStorage.getItem(storageKeyManuallyClosed);
      if (stillClosed === 'true') {
        console.log('⚠️ Chat ble lukket manuelt før timer utløp - ikke åpne');
        return;
      }
      
      // Sjekk om chatten allerede er åpen eller om brukeren har interagert
      if (state.isOpen) {
        console.log('⚠️ Chat er allerede åpen');
        return;
      }
      
      if (state.chatHistory.length > 0) {
        console.log('⚠️ Bruker har allerede sendt meldinger');
        return;
      }
      
      console.log('✅ Åpner proaktiv chat nå!');
      
      // Marker som åpnet i sessionStorage for denne page load
      sessionStorage.setItem(storageKeyShown, 'true');
      console.log('💾 Lagret i sessionStorage: auto-opened');
      
      // Åpne chat-vinduet
      if (!state.isOpen) {
        console.log('🔓 Åpner chat-vindu...');
        toggleWidget();
      }
      
      // Bruk ensureProactiveMessage() for å sikre at meldingen vises
      // Denne funksjonen sjekker om meldingen allerede finnes før den legger den til
      ensureProactiveMessage();
      
    }, delay);
  }

  // Public API
  window.AIChatbot = {
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
      const btn = document.querySelector('.aichat-button');
      if (btn) {
        console.log('Button found, triggering toggle');
        toggleWidget();
      } else {
        console.log('Button not found!');
      }
    }
  };

  // Auto-initialize (no config needed since customer_id is hardcoded in backend)
  if (window.AICHAT_AUTO_INIT !== false) {
    window.AIChatbot.init();
  }

})();

