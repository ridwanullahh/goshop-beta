
// Enhanced Chutes AI Integration for CommerceOS
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

  // AI Copilot for Buyers
  async buyerAssistant(query: string, context: any = {}): Promise<string> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are an intelligent shopping assistant for CommerceOS. Help users find products, compare options, and make informed purchasing decisions. Be conversational, helpful, and focus on user needs.'
      },
      {
        role: 'user',
        content: `User query: ${query}\nContext: ${JSON.stringify(context)}\n\nPlease provide helpful shopping assistance.`
      }
    ];

    return this.chat(messages, { temperature: 0.7 });
  }

  // AI Copilot for Sellers
  async sellerAssistant(query: string, sellerData: any = {}): Promise<string> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are an AI business consultant for CommerceOS sellers. Help optimize pricing, inventory, marketing strategies, and business growth. Provide actionable insights and recommendations.'
      },
      {
        role: 'user',
        content: `Seller query: ${query}\nSeller data: ${JSON.stringify(sellerData)}\n\nProvide business optimization advice.`
      }
    ];

    return this.chat(messages, { temperature: 0.6 });
  }

  // Dynamic Product Descriptions
  async generateProductDescription(productName: string, features: string[], category: string): Promise<string> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a professional copywriter for e-commerce. Create compelling, SEO-optimized product descriptions that convert browsers into buyers. Focus on benefits, use emotional triggers, and include relevant keywords.'
      },
      {
        role: 'user',
        content: `Product: ${productName}\nCategory: ${category}\nFeatures: ${features.join(', ')}\n\nWrite a compelling 2-3 paragraph product description that drives sales.`
      }
    ];

    return this.chat(messages, { temperature: 0.8 });
  }

  // Advanced Search with NLP
  async enhancedSearch(query: string, availableProducts: any[]): Promise<{
    results: any[];
    intent: string;
    suggestions: string[];
  }> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a search intelligence system. Analyze user queries to understand intent, extract key terms, and rank products by relevance. Return results in JSON format.'
      },
      {
        role: 'user',
        content: `Search query: "${query}"\nAvailable products: ${JSON.stringify(availableProducts.slice(0, 20))}\n\nAnalyze the query intent and rank the most relevant products. Also suggest related search terms.`
      }
    ];

    try {
      const response = await this.chat(messages, { temperature: 0.3 });
      return JSON.parse(response);
    } catch (error) {
      // Fallback to simple search
      const filteredProducts = availableProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
      );
      
      return {
        results: filteredProducts,
        intent: 'search',
        suggestions: [`${query} alternatives`, `${query} reviews`, `${query} deals`]
      };
    }
  }

  // Personalized Recommendations
  async getPersonalizedRecommendations(userProfile: any, recentActivity: any[]): Promise<string[]> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a personalization engine. Analyze user behavior, preferences, and purchase history to recommend relevant products. Focus on user intent and preferences.'
      },
      {
        role: 'user',
        content: `User profile: ${JSON.stringify(userProfile)}\nRecent activity: ${JSON.stringify(recentActivity)}\n\nRecommend 5 product categories or specific items this user would be interested in.`
      }
    ];

    const response = await this.chat(messages, { temperature: 0.6 });
    return response.split('\n').filter(line => line.trim()).slice(0, 5);
  }

  // Dynamic Pricing Suggestions
  async suggestOptimalPricing(productData: any, marketData: any): Promise<{
    suggestedPrice: number;
    reasoning: string;
    competitorAnalysis: string;
  }> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a pricing optimization expert. Analyze product data, market conditions, and competitor pricing to suggest optimal prices that maximize both sales and profit margins.'
      },
      {
        role: 'user',
        content: `Product data: ${JSON.stringify(productData)}\nMarket data: ${JSON.stringify(marketData)}\n\nSuggest optimal pricing strategy with reasoning.`
      }
    ];

    try {
      const response = await this.chat(messages, { temperature: 0.4 });
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      // Fallback pricing logic
      const basePrice = productData.currentPrice || 100;
      return {
        suggestedPrice: basePrice * 1.05,
        reasoning: 'Slight price increase based on market trends',
        competitorAnalysis: 'Limited competitor data available'
      };
    }
  }

  // Content Moderation with Advanced Context
  async moderateContent(content: string, contentType: 'review' | 'comment' | 'description' | 'message'): Promise<{
    safe: boolean;
    confidence: number;
    categories: string[];
    suggestion?: string;
  }> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: `You are an advanced content moderation system for CommerceOS. Analyze ${contentType} content for safety, appropriateness, and policy compliance. Consider context, intent, and cultural sensitivity.`
      },
      {
        role: 'user',
        content: `Content to moderate: "${content}"\nContent type: ${contentType}\n\nProvide moderation decision with confidence level, flagged categories, and improvement suggestions if needed.`
      }
    ];

    try {
      const response = await this.chat(messages, { temperature: 0.2 });
      return JSON.parse(response);
    } catch (error) {
      // Fallback moderation
      const flaggedWords = ['spam', 'scam', 'fake', 'illegal'];
      const hasFlaggedContent = flaggedWords.some(word => 
        content.toLowerCase().includes(word)
      );
      
      return {
        safe: !hasFlaggedContent,
        confidence: 0.7,
        categories: hasFlaggedContent ? ['suspicious'] : [],
        suggestion: hasFlaggedContent ? 'Please review content for policy compliance' : undefined
      };
    }
  }

  // Smart Bundling Recommendations
  async suggestProductBundles(productId: string, allProducts: any[], userBehavior: any): Promise<{
    bundles: Array<{
      products: any[];
      discount: number;
      reasoning: string;
    }>;
  }> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a cross-selling expert. Analyze product relationships, user behavior, and purchase patterns to suggest compelling product bundles that increase order value.'
      },
      {
        role: 'user',
        content: `Target product: ${productId}\nAvailable products: ${JSON.stringify(allProducts.slice(0, 10))}\nUser behavior: ${JSON.stringify(userBehavior)}\n\nSuggest 3 attractive product bundles with optimal pricing.`
      }
    ];

    try {
      const response = await this.chat(messages, { temperature: 0.6 });
      return JSON.parse(response);
    } catch (error) {
      // Fallback bundling logic
      const relatedProducts = allProducts.filter(p => p.id !== productId).slice(0, 2);
      return {
        bundles: [{
          products: relatedProducts,
          discount: 10,
          reasoning: 'Complementary products frequently bought together'
        }]
      };
    }
  }

  // Voice Command Processing
  async processVoiceCommand(transcript: string, context: any): Promise<{
    intent: string;
    action: string;
    parameters: any;
    response: string;
  }> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a voice commerce assistant. Parse voice commands, understand user intent, and provide appropriate actions for shopping, searching, or account management.'
      },
      {
        role: 'user',
        content: `Voice transcript: "${transcript}"\nContext: ${JSON.stringify(context)}\n\nParse the command and provide structured response with intent, action, and parameters.`
      }
    ];

    try {
      const response = await this.chat(messages, { temperature: 0.3 });
      return JSON.parse(response);
    } catch (error) {
      return {
        intent: 'unknown',
        action: 'clarify',
        parameters: {},
        response: "I didn't understand that command. Could you please repeat or try a different phrase?"
      };
    }
  }

  // Community Content Generation
  async generateCommunityContent(type: 'story' | 'post' | 'review_summary', data: any): Promise<string> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: `You are a community content creator for CommerceOS. Generate engaging ${type} content that builds community, showcases products, and encourages interaction.`
      },
      {
        role: 'user',
        content: `Content type: ${type}\nData: ${JSON.stringify(data)}\n\nCreate engaging community content that drives engagement.`
      }
    ];

    return this.chat(messages, { temperature: 0.8 });
  }
}

export default ChutesAI;
