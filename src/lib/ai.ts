
// Chutes AI Integration for CommerceOS
class ChutesAI {
  private apiKey: string;
  private baseUrl = 'https://llm.chutes.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Chutes AI API Error:', error);
      throw error;
    }
  }

  async generateProductDescription(productName: string, features: string[]): Promise<string> {
    const prompt = `Create a compelling product description for "${productName}" with these features: ${features.join(', ')}. Make it engaging and sales-focused in 2-3 sentences.`;
    
    const response = await this.makeRequest('/chat/completions', {
      model: 'deepseek-ai/DeepSeek-V3-0324',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Premium quality product with exceptional features.';
  }

  async suggestCategories(productName: string, description: string): Promise<string[]> {
    const prompt = `Based on this product: "${productName}" - ${description}. Suggest 3 relevant product categories, return only the category names separated by commas.`;
    
    const response = await this.makeRequest('/chat/completions', {
      model: 'deepseek-ai/DeepSeek-V3-0324',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
      temperature: 0.5,
    });

    const categories = response.choices[0]?.message?.content?.split(',').map((cat: string) => cat.trim()) || ['General'];
    return categories.slice(0, 3);
  }

  async generateRecommendations(userPreferences: string[], recentPurchases: string[]): Promise<string[]> {
    const prompt = `User preferences: ${userPreferences.join(', ')}. Recent purchases: ${recentPurchases.join(', ')}. Suggest 5 product recommendations based on their interests.`;
    
    const response = await this.makeRequest('/chat/completions', {
      model: 'deepseek-ai/DeepSeek-V3-0324',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.6,
    });

    const recommendations = response.choices[0]?.message?.content?.split('\n').filter(Boolean) || [];
    return recommendations.slice(0, 5);
  }

  async generateChatbotResponse(userMessage: string, context: string = ''): Promise<string> {
    const systemPrompt = `You are a helpful CommerceOS shopping assistant. Help users find products, answer questions about orders, and provide shopping advice. ${context}`;
    
    const response = await this.makeRequest('/chat/completions', {
      model: 'deepseek-ai/DeepSeek-V3-0324',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I\'m having trouble processing your request right now. Please try again.';
  }

  async generateSearchSuggestions(query: string): Promise<string[]> {
    const prompt = `Generate 5 relevant search suggestions for the query: "${query}". Return only the suggestions, one per line.`;
    
    const response = await this.makeRequest('/chat/completions', {
      model: 'deepseek-ai/DeepSeek-V3-0324',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.5,
    });

    const suggestions = response.choices[0]?.message?.content?.split('\n').filter(Boolean) || [];
    return suggestions.slice(0, 5);
  }

  async moderateContent(content: string): Promise<{ safe: boolean; reason?: string }> {
    const prompt = `Analyze this content for inappropriate material, spam, or policy violations: "${content}". Respond with only "SAFE" or "UNSAFE: [reason]"`;
    
    const response = await this.makeRequest('/chat/completions', {
      model: 'deepseek-ai/DeepSeek-V3-0324',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
      temperature: 0.1,
    });

    const result = response.choices[0]?.message?.content || 'SAFE';
    if (result.startsWith('UNSAFE:')) {
      return { safe: false, reason: result.replace('UNSAFE:', '').trim() };
    }
    return { safe: true };
  }

  async optimizePricing(productData: any, marketData: any): Promise<number> {
    const prompt = `Optimize pricing for product: ${JSON.stringify(productData)}. Market data: ${JSON.stringify(marketData)}. Return only the recommended price as a number.`;
    
    const response = await this.makeRequest('/chat/completions', {
      model: 'deepseek-ai/DeepSeek-V3-0324',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 20,
      temperature: 0.3,
    });

    const price = parseFloat(response.choices[0]?.message?.content?.match(/[\d.]+/)?.[0] || '0');
    return price > 0 ? price : productData.currentPrice || 0;
  }
}

export default ChutesAI;
