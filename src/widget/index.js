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
    
    if (!container) {
      console.error('Chat container not found!');
      return;
    }
    
    const wasOpen = state.isOpen;
    state.isOpen = !state.isOpen;
    
    if (state.isOpen) {
      container.classList.add('klchat-open');
      button?.classList.add('klchat-open');
      console.log('Opening chat...');
      
      setTimeout(() => {
        const input = document.getElementById('klchat-input');
        if (input) {
          input.focus();
        }
      }, 500);
    } else {
      container.classList.remove('klchat-open');
      button?.classList.remove('klchat-open');
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
    
    // Sjekk om den allerede har åpnet seg i denne session (på tvers av sider)
    const alreadyOpened = sessionStorage.getItem(storageKeyShown);
    if (alreadyOpened === 'true') {
      console.log('⚠️ Proaktiv chat allerede åpnet i denne session');
      return;
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
      
      // Marker som åpnet i sessionStorage (fungerer på tvers av sider)
      sessionStorage.setItem(storageKeyShown, 'true');
      console.log('💾 Lagret i sessionStorage: auto-opened');
      
      // Åpne chat-vinduet
      if (!state.isOpen) {
        console.log('🔓 Åpner chat-vindu...');
        toggleWidget();
      }
      
      // Vent litt slik at animasjonen blir ferdig
      setTimeout(() => {
        const messagesContainer = document.getElementById('klchat-messages');
        
        if (messagesContainer && proactiveConfig.message) {
          // Fjern welcome-meldingen hvis den finnes
          const welcomeMsg = messagesContainer.querySelector('.klchat-welcome');
          if (welcomeMsg) {
            welcomeMsg.remove();
          }
          
          // Legg til proaktiv melding
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
        }
      }, 500);
      
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
