import UniversalSDK from './sdk';
import ChutesAI from './ai';

// Commerce-specific types
export interface Product {
  id?: string;
  uid?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];
  images: string[];
  videos?: string[];
  sellerId: string;
  sellerName: string;
  inventory: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id?: string;
  uid?: string;
  buyerId: string;
  sellerId: string;
  products: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

export interface Review {
  id?: string;
  uid?: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface Seller {
  id?: string;
  uid?: string;
  userId: string;
  businessName: string;
  description: string;
  logo?: string;
  cover?: string;
  rating: number;
  reviewCount: number;
  totalSales: number;
  isVerified: boolean;
  createdAt: string;
}

// Initialize CommerceOS SDK
class CommerceSDK {
  private sdk: UniversalSDK;
  private ai: ChutesAI;

  constructor(config: {
    owner: string;
    repo: string;
    token: string;
    chutesApiKey: string;
    branch?: string;
  }) {
    // Initialize GitHub SDK with commerce schemas
    this.sdk = new UniversalSDK({
      ...config,
      schemas: {
        products: {
          required: ['name', 'price', 'category', 'sellerId'],
          types: {
            name: 'string',
            description: 'string',
            price: 'number',
            category: 'string',
            tags: 'array',
            images: 'array',
            sellerId: 'string',
            inventory: 'number',
            rating: 'number',
            isActive: 'boolean'
          },
          defaults: {
            rating: 0,
            reviewCount: 0,
            isActive: true,
            isFeatured: false,
            tags: [],
            images: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        orders: {
          required: ['buyerId', 'products', 'total', 'shippingAddress'],
          types: {
            buyerId: 'string',
            products: 'array',
            total: 'number',
            status: 'string',
            paymentStatus: 'string'
          },
          defaults: {
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        reviews: {
          required: ['productId', 'buyerId', 'rating'],
          types: {
            productId: 'string',
            buyerId: 'string',
            rating: 'number',
            comment: 'string'
          },
          defaults: {
            isVerified: false,
            createdAt: new Date().toISOString()
          }
        },
        sellers: {
          required: ['userId', 'businessName'],
          types: {
            userId: 'string',
            businessName: 'string',
            description: 'string'
          },
          defaults: {
            rating: 0,
            reviewCount: 0,
            totalSales: 0,
            isVerified: false,
            createdAt: new Date().toISOString()
          }
        },
        carts: {
          required: ['userId', 'items'],
          types: {
            userId: 'string',
            items: 'array'
          },
          defaults: {
            items: [],
            updatedAt: new Date().toISOString()
          }
        }
      }
    });

    this.ai = new ChutesAI(config.chutesApiKey);
  }

  // Authentication methods (inherited from SDK)
  async register(email: string, password: string, profile = {}) {
    return this.sdk.register(email, password, profile);
  }

  async login(email: string, password: string) {
    return this.sdk.login(email, password);
  }

  getCurrentUser(token: string) {
    return this.sdk.getCurrentUser(token);
  }

  async logout(token: string) {
    return this.sdk.destroySession(token);
  }

  // Product methods
  async getProducts(filters?: { category?: string; minPrice?: number; maxPrice?: number; featured?: boolean }) {
    const query = this.sdk.queryBuilder<Product>('products');
    
    if (filters) {
      if (filters.category) {
        query.where(p => p.category === filters.category);
      }
      if (filters.minPrice !== undefined) {
        query.where(p => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        query.where(p => p.price <= filters.maxPrice!);
      }
      if (filters.featured) {
        query.where(p => p.isFeatured === true);
      }
    }

    return query.where(p => p.isActive === true).sort('createdAt', 'desc').exec();
  }

  async getProduct(productId: string) {
    return this.sdk.getItem<Product>('products', productId);
  }

  async createProduct(product: Partial<Product>) {
    // AI enhancement: generate description if not provided
    if (product.name && !product.description) {
      const features = product.tags || [];
      product.description = await this.ai.generateProductDescription(product.name, features);
    }

    // AI enhancement: suggest categories
    if (product.name && product.description && !product.category) {
      const categories = await this.ai.suggestCategories(product.name, product.description);
      product.category = categories[0] || 'General';
    }

    return this.sdk.insert<Product>('products', product);
  }

  async updateProduct(productId: string, updates: Partial<Product>) {
    return this.sdk.update<Product>('products', productId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteProduct(productId: string) {
    return this.sdk.delete('products', productId);
  }

  async searchProducts(query: string) {
    const products = await this.getProducts();
    const searchTerm = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  async getSearchSuggestions(query: string) {
    return this.ai.generateSearchSuggestions(query);
  }

  // Cart methods
  async getCart(userId: string) {
    const carts = await this.sdk.get('carts');
    return carts.find(cart => cart.userId === userId) || null;
  }

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    let cart = await this.getCart(userId);
    
    if (!cart) {
      cart = await this.sdk.insert('carts', {
        userId,
        items: [{ productId, quantity, addedAt: new Date().toISOString() }]
      });
    } else {
      const existingItem = cart.items.find((item: CartItem) => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, addedAt: new Date().toISOString() });
      }
      
      cart = await this.sdk.update('carts', cart.id, { 
        items: cart.items,
        updatedAt: new Date().toISOString()
      });
    }
    
    return cart;
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.getCart(userId);
    if (!cart) return null;

    cart.items = cart.items.filter((item: CartItem) => item.productId !== productId);
    
    return this.sdk.update('carts', cart.id, { 
      items: cart.items,
      updatedAt: new Date().toISOString()
    });
  }

  async updateCartQuantity(userId: string, productId: string, quantity: number) {
    const cart = await this.getCart(userId);
    if (!cart) return null;

    const item = cart.items.find((item: CartItem) => item.productId === productId);
    if (item) {
      item.quantity = quantity;
    }

    return this.sdk.update('carts', cart.id, { 
      items: cart.items,
      updatedAt: new Date().toISOString()
    });
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);
    if (!cart) return null;

    return this.sdk.update('carts', cart.id, { 
      items: [],
      updatedAt: new Date().toISOString()
    });
  }

  // Order methods
  async createOrder(order: Partial<Order>) {
    return this.sdk.insert<Order>('orders', order);
  }

  async getOrders(userId: string, userType: 'buyer' | 'seller' = 'buyer') {
    const field = userType === 'buyer' ? 'buyerId' : 'sellerId';
    return this.sdk.queryBuilder<Order>('orders')
      .where(order => order[field] === userId)
      .sort('createdAt', 'desc')
      .exec();
  }

  async getOrder(orderId: string) {
    return this.sdk.getItem<Order>('orders', orderId);
  }

  async updateOrderStatus(orderId: string, status: Order['status']) {
    return this.sdk.update<Order>('orders', orderId, { 
      status,
      updatedAt: new Date().toISOString()
    });
  }

  // Review methods
  async getProductReviews(productId: string) {
    return this.sdk.queryBuilder<Review>('reviews')
      .where(review => review.productId === productId)
      .sort('createdAt', 'desc')
      .exec();
  }

  async createReview(review: Partial<Review>) {
    // AI content moderation
    if (review.comment) {
      const moderation = await this.ai.moderateContent(review.comment);
      if (!moderation.safe) {
        throw new Error(`Review content inappropriate: ${moderation.reason}`);
      }
    }

    const newReview = await this.sdk.insert<Review>('reviews', review);
    
    // Update product rating
    await this.updateProductRating(review.productId!);
    
    return newReview;
  }

  private async updateProductRating(productId: string) {
    const reviews = await this.getProductReviews(productId);
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await this.updateProduct(productId, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    });
  }

  // Seller methods
  async createSeller(seller: Partial<Seller>) {
    return this.sdk.insert<Seller>('sellers', seller);
  }

  async getSeller(sellerId: string) {
    return this.sdk.getItem<Seller>('sellers', sellerId);
  }

  async getSellerByUserId(userId: string) {
    const sellers = await this.sdk.get<Seller>('sellers');
    return sellers.find(seller => seller.userId === userId) || null;
  }

  async updateSeller(sellerId: string, updates: Partial<Seller>) {
    return this.sdk.update<Seller>('sellers', sellerId, updates);
  }

  async getSellerProducts(sellerId: string) {
    return this.sdk.queryBuilder<Product>('products')
      .where(product => product.sellerId === sellerId)
      .sort('createdAt', 'desc')
      .exec();
  }

  // AI-powered features
  async getPersonalizedRecommendations(userId: string) {
    // Get user's order history
    const orders = await this.getOrders(userId, 'buyer');
    const recentPurchases = orders.slice(0, 10).flatMap(order => 
      order.products.map(item => item.productName)
    );

    // Simple preference extraction (could be enhanced)
    const userPreferences = ['electronics', 'books', 'clothing']; // Placeholder

    return this.ai.generateRecommendations(userPreferences, recentPurchases);
  }

  async getChatbotResponse(userMessage: string, context: string = '') {
    return this.ai.generateChatbotResponse(userMessage, context);
  }

  // Analytics methods
  async getSellerAnalytics(sellerId: string) {
    const products = await this.getSellerProducts(sellerId);
    const orders = await this.getOrders(sellerId, 'seller');
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalProducts: products.length,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      activeProducts: products.filter(p => p.isActive).length
    };
  }

  async getPlatformAnalytics() {
    const [products, orders, users, sellers] = await Promise.all([
      this.sdk.get<Product>('products'),
      this.sdk.get<Order>('orders'),
      this.sdk.get('users'),
      this.sdk.get<Seller>('sellers')
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalSellers: sellers.length,
      totalRevenue,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
    };
  }

  // Initialize the SDK
  async init() {
    return this.sdk.init();
  }

  // Export the underlying SDK for advanced usage
  get rawSDK() {
    return this.sdk;
  }

  get aiHelper() {
    return this.ai;
  }
}

export default CommerceSDK;