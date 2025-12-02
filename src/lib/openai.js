import OpenAI from 'openai';

// Lazy initialization - only create client when needed
let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export class OpenAIService {
  
  static async generateResponse(messages, config = {}) {
    try {
      const {
        model = 'gpt-4o',
        max_tokens = 1000,
        temperature = 0.7,
        stream = false
      } = config;

      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens,
        temperature,
        stream
      });

      if (stream) {
        return completion; // Return stream directly
      }

      const response = completion.choices[0]?.message?.content || 'Beklager, jeg kunne ikke generere et svar.';
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        response,
        tokensUsed,
        model,
        success: true
      };

    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      let errorMessage = 'Det oppstod en teknisk feil. Prøv igjen senere.';
      
      if (error.code === 'insufficient_quota') {
        errorMessage = 'API-kvoten er oppbrukt. Kontakt administrator.';
      } else if (error.code === 'rate_limit_exceeded') {
        errorMessage = 'For mange forespørsler. Prøv igjen om litt.';
      } else if (error.code === 'invalid_api_key') {
        errorMessage = 'API-nøkkel er ugyldig. Kontakt administrator.';
      }

      return {
        response: errorMessage,
        tokensUsed: 0,
        model,
        success: false,
        error: error.message
      };
    }
  }

  static async generateEmbedding(text, model = 'text-embedding-3-small') {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const openai = getOpenAIClient();
      const response = await openai.embeddings.create({
        model,
        input: text,
      });

      return {
        embedding: response.data[0].embedding,
        tokensUsed: response.usage.total_tokens,
        success: true
      };

    } catch (error) {
      console.error('OpenAI Embedding Error:', error);
      return {
        embedding: null,
        tokensUsed: 0,
        success: false,
        error: error.message
      };
    }
  }

  static async generateStreamResponse(messages, config = {}, onChunk) {
    try {
      const {
        model = 'gpt-4o',
        max_tokens = 1000,
        temperature = 0.7
      } = config;

      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const openai = getOpenAIClient();
      const stream = await openai.chat.completions.create({
        model,
        messages,
        max_tokens,
        temperature,
        stream: true
      });

      let fullResponse = '';
      let tokensUsed = 0;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          if (onChunk) {
            onChunk(content);
          }
        }
        
        // Estimate tokens (rough approximation)
        tokensUsed += content.length / 4;
      }

      return {
        response: fullResponse,
        tokensUsed: Math.round(tokensUsed),
        model,
        success: true
      };

    } catch (error) {
      console.error('OpenAI Stream Error:', error);
      return {
        response: 'Det oppstod en feil under streaming.',
        tokensUsed: 0,
        model: config.model || 'gpt-4o',
        success: false,
        error: error.message
      };
    }
  }

  static isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  }

  static getSupportedModels() {
    return [
      'gpt-4o',
      'gpt-4o-mini', 
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ];
  }
}
