// BismiLLAH Ar-Rahman Ar-Raheem.
// GoShop SPA API client — static architecture edition.
//
// The CF Pages deployment carries ZERO Workers/Functions: every dynamic call
// below targets lightbase directly —
//   - Edge Functions (auth, orders, payments, CRUD, referral, translate,
//     emails, webhooks) via invokeFunction();
//   - browser-direct REST catalog reads (products/categories/etc.) through
//     the coalescing LightbaseBrowserClient when a read-only key is baked
//     into the build (VITE_LIGHTBASE_BROWSER_KEY), with the public
//     `products-list` function as the always-available fallback.
// Response shapes match the pre-migration /api/* endpoints so page
// components needed no rewiring. See edge-functions/ for the server side.

import { invokeFunction } from './lightbase-config';
import { getLightbaseClient, type LightbaseBrowserClient } from './lightbase-client';

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

  private authHeaders(): Record<string, string> | undefined {
    return this.token ? { authorization: `Bearer ${this.token}` } : undefined;
  }

  // Catalog reads prefer the browser-direct client (ONE coalesced /batch call,
  // IndexedDB ETag cache) and fall back to the public products-list function.
  private async readCatalog(
    fnFallback: () => Promise<any[]>,
    browserRead?: (client: LightbaseBrowserClient) => Promise<any[]>
  ): Promise<any[]> {
    if (browserRead) {
      const client = getLightbaseClient();
      if (client) {
        try {
          const rows = await browserRead(client);
          if (Array.isArray(rows)) return rows;
        } catch {
          /* fall through to the function */
        }
      }
    }
    return fnFallback();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await invokeFunction<{ user: any; token: string }>('auth-login', { email, password });
    this.setToken(data.token);
    return data.user;
  }

  async register(userData: any) {
    const data = await invokeFunction<{ user: any; token: string }>('auth-register', userData);
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
      return await invokeFunction<any>('auth-me', {}, this.authHeaders());
    } catch {
      this.setToken(null);
      return null;
    }
  }

  // Products
  async getProducts(filters?: any) {
    const hasFilter = filters && Object.values(filters).some((v) => v !== undefined && v !== null && v !== '');
    return this.readCatalog(
      () => invokeFunction<any[]>('products-list', filters || {}),
      hasFilter
        ? undefined
        : (client) => client.query<any>('products', { field: 'isActive', op: 'eq', value: true }, 1000, 'products')
    );
  }

  async getProduct(id: string) {
    const client = getLightbaseClient();
    if (client) {
      try {
        const doc = await client.get<any>('products', id, `get:products:${id}`);
        if (doc) return doc;
      } catch {
        /* fall through to the function */
      }
    }
    return invokeFunction<any>('products-list', { id });
  }

  async searchProducts(query: string, filters: any = {}) {
    return invokeFunction<any[]>('products-list', { search: query, ...filters });
  }

  async createProduct(data: any) {
    return invokeFunction<any>('products-create', data, this.authHeaders());
  }

  async updateProduct(id: string, data: any) {
    return invokeFunction<any>('products-update', { id, ...data }, this.authHeaders());
  }

  async deleteProduct(id: string) {
    return invokeFunction<any>('products-delete', { id }, this.authHeaders());
  }

  async getSellerProducts(sellerId: string) {
    return invokeFunction<any[]>('products-list', { sellerId });
  }

  // Orders
  async getOrders(filters?: any) {
    return invokeFunction<any[]>('orders-list', filters || {}, this.authHeaders());
  }

  async getOrder(id: string) {
    return invokeFunction<any>('orders-list', { id }, this.authHeaders());
  }

  async createOrder(data: any) {
    return invokeFunction<any>('orders-create', data, this.authHeaders());
  }

  async updateOrderStatus(id: string, status: string, extra?: any) {
    return invokeFunction<any>('orders-update', { id, status, ...extra }, this.authHeaders());
  }

  // Cart
  async getCart() {
    return this.getAll<any>('cart');
  }

  async addToCart(productId: string, quantity = 1) {
    return invokeFunction<any>('data-crud', { entity: 'cart', op: 'create', data: { productId, quantity } }, this.authHeaders());
  }

  async updateCartItem(id: string, quantity: number) {
    return invokeFunction<any>('data-crud', { entity: 'cart', op: 'update', id, data: { quantity } }, this.authHeaders());
  }

  async removeFromCart(id: string) {
    return invokeFunction<any>('data-crud', { entity: 'cart', op: 'delete', id }, this.authHeaders());
  }

  async clearCart() {
    const items = await this.getCart();
    await Promise.all(items.map(item => this.removeFromCart(item.id)));
  }

  // Wishlist
  async getWishlist() {
    return this.getAll<any>('wishlist');
  }

  async addToWishlist(productId: string) {
    return invokeFunction<any>('data-crud', { entity: 'wishlist', op: 'create', data: { productId } }, this.authHeaders());
  }

  async removeFromWishlist(id: string) {
    return invokeFunction<any>('data-crud', { entity: 'wishlist', op: 'delete', id }, this.authHeaders());
  }

  // Generic data operations (data-crud function; public entities read without
  // a token, the rest are scoped server-side to the caller).
  async getAll<T = any>(entity: string, params?: Record<string, any>): Promise<T[]> {
    const where: Record<string, any> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== null && v !== undefined) where[k] = v;
      }
    }
    return invokeFunction<T[]>('data-crud', { entity, op: 'list', where }, this.authHeaders());
  }

  async getOne<T = any>(entity: string, id: string): Promise<T> {
    return invokeFunction<T>('data-crud', { entity, op: 'get', id }, this.authHeaders());
  }

  async create<T = any>(entity: string, data: any): Promise<T> {
    return invokeFunction<T>('data-crud', { entity, op: 'create', data }, this.authHeaders());
  }

  async updateOne<T = any>(entity: string, id: string, data: any): Promise<T> {
    return invokeFunction<T>('data-crud', { entity, op: 'update', id, data }, this.authHeaders());
  }

  async deleteOne(entity: string, id: string): Promise<any> {
    return invokeFunction<any>('data-crud', { entity, op: 'delete', id }, this.authHeaders());
  }

  // Categories
  async getCategories() {
    return this.readCatalog(
      () => this.getAll<any>('categories'),
      (client) => client.query<any>('categories', undefined, 1000, 'categories')
    );
  }

  async getCategory(slug: string) {
    const categories = await this.getCategories();
    return categories.find(c => c.slug === slug);
  }

  // Stores
  async getStores() {
    return this.readCatalog(
      () => this.getAll<any>('stores'),
      (client) => client.query<any>('stores', undefined, 1000, 'stores')
    );
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
    return invokeFunction<any>('payments-initiate', { orderId, paymentMethod }, this.authHeaders());
  }

  // Translate
  async translate(text: string, targetLang: string, sourceLang = 'en') {
    return invokeFunction<{ translatedText: string }>('translate', { text, targetLang, sourceLang });
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
    return this.readCatalog(
      () => this.getAll<any>('languages'),
      (client) => client.query<any>('languages', undefined, 100, 'languages')
    );
  }

  async getCurrencies() {
    return this.readCatalog(
      () => this.getAll<any>('currencies'),
      (client) => client.query<any>('currencies', undefined, 100, 'currencies')
    );
  }

  // ---- Storefront bootstrap (browser-direct first) ----
  // The storefront shell needs products/categories/languages/currencies (+
  // cart/wishlist for signed-in users). Browser-direct path: four reads fired
  // together coalesce into ONE lightbase /batch call through the coalescing
  // client. Authenticated extras ride the data-crud function (scoped
  // server-side to the caller). Returns null on failure so callers fall back
  // to the individual reads below.
  async getStorefrontBootstrap(): Promise<{
    products: any[];
    categories: any[];
    languages: any[];
    currencies: any[];
    cart?: any[];
    wishlist?: any[];
    user?: { id: string };
    batched?: boolean;
  } | null> {
    const client = getLightbaseClient();
    if (client) {
      try {
        const [products, categories, languages, currencies] = await Promise.all([
          client.query<any>('products', { field: 'isActive', op: 'eq', value: true }, 1000, 'bootstrap-products'),
          client.query<any>('categories', undefined, 1000, 'bootstrap-categories'),
          client.query<any>('languages', undefined, 100, 'bootstrap-languages'),
          client.query<any>('currencies', undefined, 100, 'bootstrap-currencies'),
        ]);
        const body: any = {
          products: Array.isArray(products) ? products : [],
          categories: Array.isArray(categories) ? categories : [],
          languages: Array.isArray(languages) ? languages : [],
          currencies: Array.isArray(currencies) ? currencies : [],
          batched: true,
        };
        if (this.token) {
          try {
            const headers = this.authHeaders();
            const [cart, wishlist] = await Promise.all([
              invokeFunction<any[]>('data-crud', { entity: 'cart', op: 'list' }, headers),
              invokeFunction<any[]>('data-crud', { entity: 'wishlist', op: 'list' }, headers),
            ]);
            body.cart = cart;
            body.wishlist = wishlist;
            try {
              body.user = { id: (JSON.parse(atob(this.token!.split('.')[1] || '')) as any).userId };
            } catch { /* user id is optional */ }
          } catch {
            /* cart/wishlist stay unset — context falls back to its loaders */
          }
        }
        return body;
      } catch {
        return null;
      }
    }
    return null;
  }

  // ---- Storefront ----
  async getStoreProducts(storeId: string) {
    return invokeFunction<any[]>('products-list', { storeId });
  }

  // Seller analytics — the dashboard computes most metrics from orders/products;
  // this returns the seller's order/product aggregates so the dashboard has real numbers.
  async getSellerAnalytics(sellerId: string) {
    const [products, orders] = await Promise.all([
      this.request(`products-list`, { sellerId }).catch(() => []),
      invokeFunction<any[]>('orders-list', {}, this.authHeaders()).catch(() => []),
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

  // Thin wrapper kept for the analytics path above (public function invoke).
  private async request(name: string, body?: any) {
    return invokeFunction<any>(name, body);
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
    return invokeFunction<any>('referral', {}, this.authHeaders());
  }

  async trackReferralClick(code: string) {
    return invokeFunction<any>('referral', { op: 'track', code });
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

  // ---- Platform commissions ----
  async getGlobalCommission() {
    const all = await this.getAll<any>('platform_commissions').catch(() => [] as any[]);
    const global = all.find((c: any) => c.isGlobal);
    return global?.percentage ?? all[0]?.percentage ?? 5;
  }

  async getCategoryCommission(category: string) {
    const all = await this.getAll<any>('platform_commissions').catch(() => [] as any[]);
    const cat = all.find((c: any) => c.category === category && !c.isGlobal);
    if (cat) return cat.percentage;
    const global = all.find((c: any) => c.isGlobal);
    return global?.percentage ?? 5;
  }

  // ---- Emails (recorded as queued email_events server-side) ----
  async sendContactEmail(payload: { name: string; email: string; message: string }) {
    return invokeFunction<any>('emails', { op: 'contact', ...payload });
  }

  async subscribeNewsletter(payload: { email: string; name?: string }) {
    return invokeFunction<any>('emails', { op: 'newsletter', ...payload });
  }

  async sendReferralInvite(payload: { toEmail: string; rewardDescription?: string }) {
    return invokeFunction<any>('emails', { op: 'referral-invite', ...payload }, this.authHeaders());
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
    const env = (import.meta as any).env || {};
    const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = env.VITE_CLOUDINARY_UPLOAD_PRESET;
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
