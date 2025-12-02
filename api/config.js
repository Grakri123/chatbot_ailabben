// API endpoint to get customer configuration for widget initialization
import { CUSTOMER_CONFIG } from '../src/config/customer.js';
import { createErrorResponse, createSuccessResponse } from '../src/lib/utils.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  // Explicitly disable caching for config endpoint
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json(createErrorResponse('Method not allowed', 405));
  }

  try {
    // Return hardcoded configuration (no database needed)
    const publicConfig = {
      customer_id: CUSTOMER_CONFIG.CUSTOMER_ID,
      name: CUSTOMER_CONFIG.CUSTOMER_NAME,
      active: true,
      // Widget konfigurasjon fra customer.js
      widget: {
        ...CUSTOMER_CONFIG.WIDGET,
        name: CUSTOMER_CONFIG.CUSTOMER_NAME || CUSTOMER_CONFIG.WIDGET.name,
        welcomeMessage: {
          ...CUSTOMER_CONFIG.WIDGET.welcomeMessage,
          title: CUSTOMER_CONFIG.CUSTOMER_NAME ? `Velkommen til ${CUSTOMER_CONFIG.CUSTOMER_NAME}!` : CUSTOMER_CONFIG.WIDGET.welcomeMessage.title
        }
      },
      // Proaktiv chat konfigurasjon
      proactive_chat: {
        enabled: CUSTOMER_CONFIG.PROACTIVE_CHAT?.enabled || false,
        delay: CUSTOMER_CONFIG.PROACTIVE_CHAT?.delay || 5000,
        message: CUSTOMER_CONFIG.PROACTIVE_CHAT?.message || '',
        show_once: CUSTOMER_CONFIG.PROACTIVE_CHAT?.showOnce !== false
      },
      // Widget features
      features: {
        supports_history: true,
        supports_typing_indicator: true,
        max_message_length: CUSTOMER_CONFIG.API.maxMessageLength
      }
    };

    return res.status(200).json(createSuccessResponse(publicConfig, 'Configuration retrieved successfully'));

  } catch (error) {
    console.error('Config API error:', error);
    return res.status(500).json(createErrorResponse('Internal server error', 500));
  }
}
