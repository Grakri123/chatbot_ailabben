// Mistral AI integration
export class MistralService {
  
  static async generateResponse(messages, config = {}) {
    try {
      const {
        model = 'mistral-large-latest',
        max_tokens = 1000,
        temperature = 0.7
      } = config;

      if (!process.env.MISTRAL_API_KEY) {
        throw new Error('Mistral API key not configured');
      }

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens,
          temperature
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Mistral API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      const rawResponse = data.choices[0]?.message?.content || 'Beklager, jeg kunne ikke generere et svar.';
      const responseText = this.cleanResponse(rawResponse);
      const tokensUsed = data.usage?.total_tokens || 0;

      return {
        response: responseText,
        tokensUsed,
        model,
        success: true
      };

    } catch (error) {
      console.error('Mistral API Error:', error);
      
      let errorMessage = 'Det oppstod en teknisk feil. Prøv igjen senere.';
      
      if (error.message.includes('401')) {
        errorMessage = 'API-nøkkel er ugyldig. Kontakt administrator.';
      } else if (error.message.includes('429')) {
        errorMessage = 'For mange forespørsler. Prøv igjen om litt.';
      } else if (error.message.includes('402')) {
        errorMessage = 'API-kvoten er oppbrukt. Kontakt administrator.';
      }

      return {
        response: errorMessage,
        tokensUsed: 0,
        model: config.model || 'mistral-large-latest',
        success: false,
        error: error.message
      };
    }
  }

  static async generateStreamResponse(messages, config = {}, onChunk) {
    try {
      const {
        model = 'mistral-large-latest',
        max_tokens = 1000,
        temperature = 0.7
      } = config;

      if (!process.env.MISTRAL_API_KEY) {
        throw new Error('Mistral API key not configured');
      }

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens,
          temperature,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';
      let tokensUsed = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                if (content) {
                  fullResponse += content;
                  tokensUsed += content.length / 4; // Rough estimation
                  if (onChunk) {
                    onChunk(content);
                  }
                }
              } catch (parseError) {
                // Ignore parsing errors for individual chunks
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return {
        response: fullResponse,
        tokensUsed: Math.round(tokensUsed),
        model,
        success: true
      };

    } catch (error) {
      console.error('Mistral Stream Error:', error);
      return {
        response: 'Det oppstod en feil under streaming.',
        tokensUsed: 0,
        model: config.model || 'mistral-large-latest',
        success: false,
        error: error.message
      };
    }
  }

  static isConfigured() {
    return !!process.env.MISTRAL_API_KEY;
  }

  // Clean and format Mistral response for better readability
  static cleanResponse(response) {
    if (!response) return response;
    
    let cleaned = response;
    
    // First, remove all markdown formatting completely
    cleaned = cleaned
      // Remove ALL asterisks (bold/italic)
      .replace(/\*+([^*]+)\*+/g, '$1')
      // Remove ALL hashtags (headings)
      .replace(/^#+\s*/gm, '')
      // Remove ALL dashes/lines
      .replace(/---+/g, '')
      .replace(/_{3,}/g, '')
      // Remove numbered lists
      .replace(/^\d+\.\s*/gm, '')
      // Remove bullet points
      .replace(/^[•\-*]\s*/gm, '')
      .trim();
    
    // Now, intelligently add paragraph breaks
    // Split by sentences and group them into paragraphs
    const sentences = cleaned.split(/(?<=[.!?])\s+/);
    const paragraphs = [];
    let currentParagraph = [];
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;
      
      currentParagraph.push(sentence);
      
      // Create new paragraph after 2-4 sentences, or at natural breaks
      if (currentParagraph.length >= 3 || 
          sentence.includes(':') || 
          sentence.toLowerCase().includes('eksempel') ||
          sentence.toLowerCase().includes('for å') ||
          i === sentences.length - 1) {
        
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    }
    
    // Join paragraphs with double line breaks for proper spacing
    cleaned = paragraphs
      .filter(p => p.trim().length > 0)
      .join('\n\n');
    
    // Final cleanup - ensure no triple+ newlines
    cleaned = cleaned
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return cleaned;
  }

  static getSupportedModels() {
    return [
      'mistral-large-latest',
      'mistral-large-2407',
      'mistral-medium-latest',
      'mistral-small-latest',
      'open-mistral-7b',
      'open-mixtral-8x7b',
      'open-mixtral-8x22b'
    ];
  }
}
