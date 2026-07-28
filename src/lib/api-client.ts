// Relative by default so requests route through the gateway / Vite proxy to the Astro API.
const API_URL = (import.meta as any).env?.VITE_API_URL || '';

class APIClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ user: any; token: string }>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    });
    this.setToken(data.token);
    return data.user;
  }

  async register(userData: any) {
    const data = await this.request<{ user: any; token: string }>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'register', ...userData }),
    });
    this.setToken(data.token);
    return data.user;
  }

  async logout() {
    this.setToken(null);
    localStorage.removeItem('currentUser');
  }

  async getCurrentUser() {
    if (!this.token) return null;
    try {
      return await this.request<any>('/api/auth');
    } catch {
      this.setToken(null);
      return null;
    }
  }

  // Products
  async getProducts(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') params.set(k, String(v)); });
    }
    const qs = params.toString();
    return this.request<any[]>(`/api/products${qs ? `?${qs}` : ''}`);
  }

  async getProduct(id: string) {
    return this.request<any>(`/api/products?id=${id}`);
  }

  async searchProducts(query: string, filters: any = {}) {
    const params = new URLSearchParams({ search: query, ...filters });
    return this.request<any[]>(`/api/products?${params.toString()}`);
  }

  async createProduct(data: any) {
    return this.request<any>('/api/products', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProduct(id: string, data: any) {
    return this.request<any>('/api/products', { method: 'PATCH', body: JSON.stringify({ id, ...data }) });
  }

  async deleteProduct(id: string) {
    return this.request<any>(`/api/products?id=${id}`, { method: 'DELETE' });
  }

  async getSellerProducts(sellerId: string) {
    return this.request<any[]>(`/api/products?sellerId=${sellerId}`);
  }

  // Orders
  async getOrders(filters?: any) {
    const params = new URLSearchParams();
    if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
    const qs = params.toString();
    return this.request<any[]>(`/api/orders${qs ? `?${qs}` : ''}`);
  }

  async getOrder(id: string) {
    return this.request<any>(`/api/orders?id=${id}`);
  }

  async createOrder(data: any) {
    return this.request<any>('/api/orders', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateOrderStatus(id: string, status: string, extra?: any) {
    return this.request<any>('/api/orders', { method: 'PATCH', body: JSON.stringify({ id, status, ...extra }) });
  }

  // Cart
  async getCart() {
    return this.request<any[]>('/api/data/cart');
  }

  async addToCart(productId: string, quantity = 1) {
    return this.request<any>('/api/data/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
  }

  async updateCartItem(id: string, quantity: number) {
    return this.request<any>('/api/data/cart', { method: 'PATCH', body: JSON.stringify({ id, quantity }) });
  }

  async removeFromCart(id: string) {
    return this.request<any>(`/api/data/cart?id=${id}`, { method: 'DELETE' });
  }

  async clearCart() {
    const items = await this.getCart();
    await Promise.all(items.map(item => this.removeFromCart(item.id)));
  }

  // Wishlist
  async getWishlist() {
    return this.request<any[]>('/api/data/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.request<any>('/api/data/wishlist', { method: 'POST', body: JSON.stringify({ productId }) });
  }

  async removeFromWishlist(id: string) {
    return this.request<any>(`/api/data/wishlist?id=${id}`, { method: 'DELETE' });
  }

  // Generic data operations
  async getAll<T = any>(entity: string, params?: Record<string, any>): Promise<T[]> {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([,v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : '';
    return this.request<T[]>(`/api/data/${entity}${qs}`);
  }

  async getOne<T = any>(entity: string, id: string): Promise<T> {
    return this.request<T>(`/api/data/${entity}?id=${id}`);
  }

  async create<T = any>(entity: string, data: any): Promise<T> {
    return this.request<T>(`/api/data/${entity}`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateOne<T = any>(entity: string, id: string, data: any): Promise<T> {
    return this.request<T>(`/api/data/${entity}`, { method: 'PATCH', body: JSON.stringify({ id, ...data }) });
  }

  async deleteOne(entity: string, id: string): Promise<any> {
    return this.request<any>(`/api/data/${entity}?id=${id}`, { method: 'DELETE' });
  }

  // Categories
  async getCategories() {
    return this.getAll<any>('categories');
  }

  async getCategory(slug: string) {
    const categories = await this.getCategories();
    return categories.find(c => c.slug === slug);
  }

  // Stores
  async getStores() {
    return this.getAll<any>('stores');
  }

  async getStore(id: string) {
    return this.getOne<any>('stores', id);
  }

  async getStoreBySlug(slug: string) {
    const stores = await this.getStores();
    return stores.find(s => s.slug === slug);
  }

  // Payments
  async initiatePayment(orderId: string, paymentMethod: string) {
    return this.request<any>('/api/payments', { method: 'POST', body: JSON.stringify({ orderId, paymentMethod }) });
  }

  // Translate
  async translate(text: string, targetLang: string, sourceLang = 'en') {
    return this.request<{ translatedText: string }>('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLang, sourceLang }),
    });
  }

  // Wallet
  async getWallet(userId: string) {
    const wallets = await this.getAll<any>('wallets', { userId });
    return wallets[0];
  }

  async getWalletTransactions(walletId: string) {
    return this.getAll<any>('transactions', { walletId });
  }

  // Notifications
  async getNotifications(userId: string) {
    return this.getAll<any>('notifications', { userId });
  }

  // Reviews
  async getProductReviews(productId: string) {
    return this.getAll<any>('reviews', { productId });
  }

  // Users
  async getUsers() {
    return this.getAll<any>('users');
  }

  async getUser(id: string) {
    return this.getOne<any>('users', id);
  }

  // Blogs
  async getBlogs() {
    return this.getAll<any>('blogs');
  }

  // Languages & Currencies
  async getLanguages() {
    return this.getAll<any>('languages');
  }

  async getCurrencies() {
    return this.getAll<any>('currencies');
  }

  // ---- Storefront ----
  async getStoreProducts(storeId: string) {
    return this.request<any[]>(`/api/products?storeId=${storeId}`);
  }

  // Seller analytics — the dashboard computes most metrics from orders/products;
  // this returns the seller's order/product aggregates so the dashboard has real numbers.
  async getSellerAnalytics(sellerId: string) {
    const [products, orders] = await Promise.all([
      this.request<any[]>(`/api/products?sellerId=${sellerId}`).catch(() => []),
      this.request<any[]>(`/api/orders`).catch(() => []),
    ]);
    const sellerOrders = orders.filter((o: any) => o.sellerId === sellerId);
    const totalRevenue = sellerOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    return {
      totalRevenue,
      totalOrders: sellerOrders.length,
      totalProducts: products.length,
      averageOrderValue: sellerOrders.length > 0 ? totalRevenue / sellerOrders.length : 0,
    };
  }

  async getStoreBlogPosts(storeId: string) {
    return this.getAll<any>('blogs', { storeId });
  }

  async getStoreReviews(storeId: string) {
    // Reviews are product-scoped; derive store reviews via products.
    const products = await this.getStoreProducts(storeId);
    const ids = products.map((p: any) => p.id);
    if (ids.length === 0) return [];
    const all = await this.getAll<any>('reviews');
    return all.filter((r: any) => ids.includes(r.productId));
  }

  // ---- Affiliate / Referral (inherent per user) ----
  async getAffiliateLinks(affiliateId: string) {
    return this.getAll<any>('affiliate_links', { affiliateId });
  }

  async getAffiliateCollections(affiliateId: string) {
    return this.getAll<any>('affiliate_collections', { affiliateId });
  }

  async getAffiliateProducts() {
    const products = await this.getProducts();
    return products.filter((p: any) => p.affiliateEnabled);
  }

  async createAffiliateLink(data: any) {
    return this.create<any>('affiliate_links', data);
  }

  async createAffiliateCollection(data: any) {
    return this.create<any>('affiliate_collections', data);
  }

  async getAffiliate(id: string) {
    return this.getUser(id);
  }

  async createAffiliate(data: any) {
    // Inherent referral: no standalone account. Register as an affiliate-role user.
    return this.register({ ...data, role: 'affiliate', roles: ['affiliate'] });
  }

  async getUserWallet(userId: string) {
    return this.getWallet(userId);
  }

  async getRolePosts(role: string) {
    return this.getAll<any>('posts', { role });
  }

  async getPlatformCommissions() {
    return this.getAll<any>('platform_commissions');
  }

  async getActiveSellerAgreement() {
    const all = await this.getAll<any>('seller_agreements');
    return all.find((a: any) => a.isActive) || all[0];
  }

  // ---- Referral (inherent, per user) ----
  async getReferral() {
    return this.request<any>('/api/referral');
  }

  async trackReferralClick(code: string) {
    return this.request<any>('/api/referral', { method: 'POST', body: JSON.stringify({ code }) });
  }

  // ---- Community posts ----
  async getPosts() {
    return this.getAll<any>('posts');
  }

  async createPost(data: any) {
    return this.create<any>('posts', data);
  }

  async getHelpArticles() {
    return this.getAll<any>('help_articles');
  }

  async createHelpArticle(data: any) {
    return this.create<any>('help_articles', data);
  }

  async createBlog(data: any) {
    return this.create<any>('blogs', data);
  }

  async getLivestreams() {
    return this.getAll<any>('livestreams');
  }

  // ---- Withdrawals / Store (seller) ----
  async getWithdrawalRequests(userId?: string) {
    return this.getAll<any>('withdrawal_requests', userId ? { userId } : undefined);
  }

  async createWithdrawalRequest(data: any) {
    return this.create<any>('withdrawal_requests', data);
  }

  async getSellerStore(sellerId: string) {
    const stores = await this.getAll<any>('stores', { sellerId });
    return stores[0];
  }

  // Compatibility shims for CommerceSDK interface
  async getData(collection: string) {
    const map: Record<string, string> = {
      cart_items: 'cart', wishlist: 'wishlist', products: 'products',
      categories: 'categories', orders: 'orders', users: 'users',
      stores: 'stores', notifications: 'notifications', posts: 'posts',
      comments: 'comments', wallets: 'wallets', transactions: 'transactions',
      blogs: 'blogs', help_articles: 'help_articles', reviews: 'reviews',
      affiliateLinks: 'affiliate_links', affiliateCollections: 'affiliate_collections',
      refundRequests: 'refund_requests', disputes: 'disputes',
      withdrawalRequests: 'withdrawal_requests', platformCommissions: 'platform_commissions',
      sellerAgreements: 'seller_agreements', livestreams: 'livestreams',
      languages: 'languages', currencies: 'currencies'
    };
    return this.getAll(map[collection] || collection);
  }

  async saveData(collection: string, data: any[]) {
    console.warn('saveData is deprecated - use specific API methods instead');
    return data;
  }

  get<T>(collection: string): Promise<T[]> {
    return this.getData(collection) as Promise<T[]>;
  }

  async delete(collection: string, id: string) {
    const map: Record<string, string> = { cart_items: 'cart', wishlist: 'wishlist', products: 'products' };
    return this.deleteOne(map[collection] || collection, id);
  }

  async update(collection: string, id: string, updates: any) {
    const map: Record<string, string> = { cart_items: 'cart', wishlist: 'wishlist', products: 'products' };
    return this.updateOne(map[collection] || collection, id, updates);
  }

  aiHelper = {
    generateProductRecommendations: async () => [],
    generateSearchSuggestions: async () => [],
    buyerAssistant: async (q: string) => `AI assistance for: ${q}`,
    sellerAssistant: async (q: string) => `Seller AI for: ${q}`,
    chat: async (msg: string) => `AI response to: ${msg}`,
    enhancedSearch: async () => ({ results: [], suggestions: [] })
  };

  uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary not configured');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url;
  };
}

export const apiClient = new APIClient();
export default apiClient;
