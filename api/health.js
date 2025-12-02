// Health check endpoint for monitoring
import { OpenAIService } from '../src/lib/openai.js';
import { AI_CONFIG } from '../src/config/prompt.js';
import { createSuccessResponse, createErrorResponse } from '../src/lib/utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json(createErrorResponse('Method not allowed', 405));
  }

  try {
    const startTime = Date.now();
    
    // Check AI services configuration
    const openaiConfigured = OpenAIService.isConfigured();
    
    const responseTime = Date.now() - startTime;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      response_time_ms: responseTime,
      services: {
        openai: openaiConfigured ? 'configured' : 'not_configured'
      },
      ai_provider: AI_CONFIG.provider,
      model: AI_CONFIG.model,
      gdpr_compliant: false,
      version: '2.0.0-simplified',
      customer: 'AI Labben'
    };

    // Return 503 if critical services are down
    if (!openaiConfigured) {
      return res.status(503).json(createErrorResponse('Service unhealthy', 503, healthData));
    }

    return res.status(200).json(createSuccessResponse(healthData, 'Service healthy'));

  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(503).json(createErrorResponse('Health check failed', 503, {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }));
  }
}
