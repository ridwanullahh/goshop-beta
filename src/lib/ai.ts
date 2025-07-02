// Chutes AI Integration for CommerceOS
interface ChutesAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChutesAIRequest {
  model: string;
  messages: ChutesAIMessage[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

interface ChutesAIResponse {
  choices: Array<{
    message: ChutesAIMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class ChutesAI {
  private apiKey: string;
  private baseUrl = 'https://llm.chutes.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: ChutesAIMessage[], options: Partial<ChutesAIRequest> = {}): Promise<string> {
    const request: ChutesAIRequest = {
      model: 'deepseek-ai/DeepSeek-V3-0324',
      messages,
      stream: false,
      max_tokens: 1024,
      temperature: 0.7,
      ...options
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Chutes AI request failed: ${response.statusText}`);
    }

    const data: ChutesAIResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // Commerce-specific AI helpers
  async generateProductDescription(productName: string, features: string[]): Promise<string> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a commerce copywriter. Generate compelling product descriptions that convert browsers into buyers. Focus on benefits, not just features.'
      },
      {
        role: 'user',
        content: `Product: ${productName}\nFeatures: ${features.join(', ')}\n\nWrite a compelling product description in 2-3 sentences.`
      }
    ];

    return this.chat(messages, { temperature: 0.8 });
  }

  async suggestCategories(productName: string, description: string): Promise<string[]> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'Suggest 3-5 relevant product categories for e-commerce. Return only a comma-separated list.'
      },
      {
        role: 'user',
        content: `Product: ${productName}\nDescription: ${description}`
      }
    ];

    const result = await this.chat(messages, { temperature: 0.3 });
    return result.split(',').map(cat => cat.trim()).filter(Boolean);
  }

  async generateSearchSuggestions(query: string): Promise<string[]> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'Generate 5 related search suggestions for an e-commerce platform. Return only a comma-separated list.'
      },
      {
        role: 'user',
        content: `User searched for: ${query}`
      }
    ];

    const result = await this.chat(messages, { temperature: 0.5 });
    return result.split(',').map(suggestion => suggestion.trim()).filter(Boolean);
  }

  async generateRecommendations(userPreferences: string[], recentPurchases: string[]): Promise<string> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are an AI shopping assistant. Generate personalized product recommendations based on user behavior.'
      },
      {
        role: 'user',
        content: `User preferences: ${userPreferences.join(', ')}\nRecent purchases: ${recentPurchases.join(', ')}\n\nSuggest 3 product types they might like and explain why.`
      }
    ];

    return this.chat(messages, { temperature: 0.6 });
  }

  async moderateContent(content: string): Promise<{ safe: boolean; reason?: string }> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a content moderator. Check if content is appropriate for an e-commerce platform. Return "SAFE" or "UNSAFE: reason".'
      },
      {
        role: 'user',
        content: content
      }
    ];

    const result = await this.chat(messages, { temperature: 0.1 });
    
    if (result.toUpperCase().includes('UNSAFE')) {
      return { 
        safe: false, 
        reason: result.replace(/UNSAFE:\s*/i, '') 
      };
    }
    
    return { safe: true };
  }

  async generateChatbotResponse(userMessage: string, context: string): Promise<string> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful e-commerce assistant. Help users with product questions, orders, and shopping guidance. Be friendly and concise.'
      },
      {
        role: 'user',
        content: `Context: ${context}\n\nUser: ${userMessage}`
      }
    ];

    return this.chat(messages, { temperature: 0.7 });
  }
}

export default ChutesAI;