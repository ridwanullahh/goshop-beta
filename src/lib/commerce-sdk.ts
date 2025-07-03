
import { UniversalSDK } from './sdk';

// Type definitions
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'affiliate' | 'admin';
  avatar?: string;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  sellerName: string;
  sellerId: string;
  rating: number;
  reviewCount: number;
  inventory: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  sellerId: string;
  products: Product[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: any;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  logo?: string;
  verified: boolean;
  rating: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
}

export interface Affiliate {
  id: string;
  userId: string;
  businessName: string;
  website?: string;
  commissionRate: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  rating: number;
  totalProducts: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  product: Product;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  slug: string;
  isPublished: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  isPublished: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateLink {
  id: string;
  affiliateId: string;
  productId: string;
  url: string;
  shortUrl: string;
  campaignName: string;
  clicks: number;
  conversions: number;
  earnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  id: string;
  affiliateId: string;
  orderId: string;
  amount: number;
  rate: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export class CommerceSDK {
  public sdk: UniversalSDK;

  constructor() {
    this.sdk = new UniversalSDK();
  }

  // Authentication methods
  async register(userData: any) {
    return await this.sdk.register(userData);
  }

  async login(credentials: any) {
    const result = await this.sdk.login(credentials);
    return result;
  }

  async getCurrentUser() {
    return await this.sdk.getCurrentUser();
  }

  async logout() {
    return await this.sdk.destroySession();
  }

  // AI Helper methods
  async aiHelper(query: string) {
    try {
      const response = await this.sdk.ai.chat(query);
      return response;
    } catch (error) {
      console.error('AI Helper error:', error);
      return { response: 'Sorry, I could not process your request at the moment.' };
    }
  }

  // Product methods
  async getProducts(filters?: any): Promise<Product[]> {
    try {
      const products = await this.sdk.get('products', filters);
      return products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const product = await this.sdk.get('products', { id });
      return product?.[0] || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async createProduct(productData: any): Promise<Product> {
    try {
      const product = await this.sdk.create('products', productData);
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: any): Promise<Product> {
    try {
      const product = await this.sdk.update('products', id, updates);
      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.sdk.delete('products', id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async searchProducts(query: string, filters?: any): Promise<Product[]> {
    try {
      const products = await this.sdk.get('products', { ...filters, search: query });
      return products || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async getProductReviews(productId: string) {
    try {
      const reviews = await this.sdk.get('reviews', { productId });
      return reviews || [];
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    try {
      const categories = await this.sdk.get('categories');
      return categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategory(slug: string): Promise<Category | null> {
    try {
      const category = await this.sdk.get('categories', { slug });
      return category?.[0] || null;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  // Store methods
  async getStores(): Promise<Store[]> {
    try {
      const stores = await this.sdk.get('stores');
      return stores || [];
    } catch (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
  }

  async getStore(id: string): Promise<Store | null> {
    try {
      const store = await this.sdk.get('stores', { id });
      return store?.[0] || null;
    } catch (error) {
      console.error('Error fetching store:', error);
      return null;
    }
  }

  async getStoreProducts(storeId: string): Promise<Product[]> {
    try {
      const products = await this.sdk.get('products', { storeId });
      return products || [];
    } catch (error) {
      console.error('Error fetching store products:', error);
      return [];
    }
  }

  // Seller methods
  async createSeller(sellerData: any): Promise<Seller> {
    try {
      const seller = await this.sdk.create('sellers', sellerData);
      return seller;
    } catch (error) {
      console.error('Error creating seller:', error);
      throw error;
    }
  }

  async getSellerProducts(sellerId: string): Promise<Product[]> {
    try {
      const products = await this.sdk.get('products', { sellerId });
      return products || [];
    } catch (error) {
      console.error('Error fetching seller products:', error);
      return [];
    }
  }

  async getSellerAnalytics(sellerId: string) {
    try {
      const analytics = await this.sdk.get('seller_analytics', { sellerId });
      return analytics?.[0] || null;
    } catch (error) {
      console.error('Error fetching seller analytics:', error);
      return null;
    }
  }

  // Order methods
  async getOrders(userId?: string): Promise<Order[]> {
    try {
      const orders = await this.sdk.get('orders', userId ? { userId } : {});
      return orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const order = await this.sdk.update('orders', orderId, { status });
      return order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Cart methods
  async getCart(userId: string): Promise<CartItem[]> {
    try {
      const cartItems = await this.sdk.get('cart_items', { userId });
      return cartItems || [];
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    try {
      const cartItem = await this.sdk.create('cart_items', {
        userId,
        productId,
        quantity
      });
      return cartItem;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Wishlist methods
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const wishlistItems = await this.sdk.get('wishlist_items', { userId });
      return wishlistItems || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const notifications = await this.sdk.get('notifications', { userId });
      return notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Affiliate methods
  async createAffiliate(affiliateData: any): Promise<Affiliate> {
    try {
      const affiliate = await this.sdk.create('affiliates', affiliateData);
      return affiliate;
    } catch (error) {
      console.error('Error creating affiliate:', error);
      throw error;
    }
  }

  async getAffiliate(userId: string): Promise<Affiliate | null> {
    try {
      const affiliate = await this.sdk.get('affiliates', { userId });
      return affiliate?.[0] || null;
    } catch (error) {
      console.error('Error fetching affiliate:', error);
      return null;
    }
  }

  async getAffiliateLinks(affiliateId: string): Promise<AffiliateLink[]> {
    try {
      const links = await this.sdk.get('affiliate_links', { affiliateId });
      return links || [];
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
      return [];
    }
  }

  async createAffiliateLink(linkData: any): Promise<AffiliateLink> {
    try {
      const link = await this.sdk.create('affiliate_links', linkData);
      return link;
    } catch (error) {
      console.error('Error creating affiliate link:', error);
      throw error;
    }
  }

  async getCommissions(affiliateId: string): Promise<Commission[]> {
    try {
      const commissions = await this.sdk.get('commissions', { affiliateId });
      return commissions || [];
    } catch (error) {
      console.error('Error fetching commissions:', error);
      return [];
    }
  }

  // Help & Blog methods
  async getHelpArticles(): Promise<HelpArticle[]> {
    try {
      const articles = await this.sdk.get('help_articles');
      return articles || [];
    } catch (error) {
      console.error('Error fetching help articles:', error);
      return [];
    }
  }

  async createHelpArticle(articleData: any): Promise<HelpArticle> {
    try {
      const article = await this.sdk.create('help_articles', articleData);
      return article;
    } catch (error) {
      console.error('Error creating help article:', error);
      throw error;
    }
  }

  async getBlogs(): Promise<Blog[]> {
    try {
      const blogs = await this.sdk.get('blogs');
      return blogs || [];
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return [];
    }
  }

  async createBlog(blogData: any): Promise<Blog> {
    try {
      const blog = await this.sdk.create('blogs', blogData);
      return blog;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  // Admin methods
  async getPlatformAnalytics() {
    try {
      const analytics = await this.sdk.get('platform_analytics');
      return analytics?.[0] || null;
    } catch (error) {
      console.error('Error fetching platform analytics:', error);
      return null;
    }
  }

  // Wallet methods
  async createWallet(walletData: any) {
    try {
      const wallet = await this.sdk.create('wallets', walletData);
      return wallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }
}

export default CommerceSDK;
