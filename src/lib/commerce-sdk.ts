import { UniversalSDK } from './sdk';

// Type definitions
export interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'affiliate' | 'admin';
  roles?: string[];
  avatar?: string;
  verified?: boolean;
  onboardingCompleted?: boolean;
  businessName?: string;
  walletBalance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  productName?: string;
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
  quantity?: number;
  subtotal?: number;
  isFeatured: boolean;
  isActive?: boolean;
  tags?: string[];
  sku?: string;
  weight?: number;
  dimensions?: string;
  shippingClass?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  soldCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  sellerId: string;
  products: Product[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed';
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

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export class CommerceSDK {
  public sdk: UniversalSDK;

  constructor() {
    this.sdk = new UniversalSDK({
      owner: import.meta.env.VITE_GITHUB_OWNER,
      repo: import.meta.env.VITE_GITHUB_REPO,
      token: import.meta.env.VITE_GITHUB_TOKEN,
      branch: 'main'
    });
  }

  // Authentication methods
  async register(userData: any): Promise<User> {
    const result = await this.sdk.register(userData);
    return {
      id: result.id,
      uid: result.uid,
      email: result.email,
      name: result.name || '',
      role: result.role,
      roles: result.roles,
      avatar: result.avatar,
      verified: result.verified || false,
      onboardingCompleted: result.onboardingCompleted || false,
      businessName: result.businessName || '',
      walletBalance: result.walletBalance || 0,
      createdAt: result.createdAt || new Date().toISOString(),
      updatedAt: result.updatedAt || new Date().toISOString()
    };
  }

  async login(credentials: { email: string; password: string }): Promise<User> {
    const result = await this.sdk.login(credentials);
    return {
      id: result.user.id || result.user.uid || '1',
      uid: result.user.uid || result.user.id || '1',
      email: result.user.email,
      name: result.user.name || '',
      role: result.user.role,
      roles: result.user.roles,
      avatar: result.user.avatar,
      verified: result.user.verified || false,
      onboardingCompleted: result.user.onboardingCompleted || false,
      businessName: result.user.businessName || '',
      walletBalance: result.user.walletBalance || 0,
      createdAt: result.user.createdAt || new Date().toISOString(),
      updatedAt: result.user.updatedAt || new Date().toISOString()
    };
  }

  async getCurrentUser(): Promise<User | null> {
    const user = await this.sdk.getCurrentUser();
    if (!user) return null;
    
    return {
      id: user.id || user.uid || '1',
      uid: user.uid || user.id || '1',
      email: user.email,
      name: user.name || '',
      role: user.role,
      roles: user.roles,
      avatar: user.avatar,
      verified: user.verified || false,
      onboardingCompleted: user.onboardingCompleted || false,
      businessName: user.businessName || '',
      walletBalance: user.walletBalance || 0,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString()
    };
  }

  async logout(): Promise<void> {
    return await this.sdk.destroySession('');
  }

  // AI Helper method - returns the helper object directly
  get aiHelper() {
    return {
      buyerAssistant: async (query: string, context?: any) => {
        return `AI Buyer Assistant: ${query}`;
      },
      sellerAssistant: async (query: string, context?: any) => {
        return `AI Seller Assistant: ${query}`;
      },
      chat: async (messages: any[]) => {
        return `AI Chat response for ${messages.length} messages`;
      },
      enhancedSearch: async (searchQuery: string, products: any[]) => {
        return {
          results: products.filter(p => 
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
          ),
          suggestions: [`${searchQuery} alternatives`, `${searchQuery} reviews`, `${searchQuery} deals`]
        };
      }
    };
  }

  // Product methods
  async getProducts(filters?: any): Promise<Product[]> {
    try {
      const products = await this.sdk.get('products');
      return products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const product = await this.sdk.getItem('products', id);
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async createProduct(productData: any): Promise<Product> {
    try {
      const product = await this.sdk.insert('products', {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: any): Promise<Product> {
    try {
      const product = await this.sdk.update('products', id, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
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
      const products = await this.sdk.get('products');
      return products.filter(p => 
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      ) || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async getProductReviews(productId: string) {
    try {
      const reviews = await this.sdk.get('reviews');
      return reviews.filter(r => r.productId === productId) || [];
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
      const categories = await this.sdk.get('categories');
      return categories.find(c => c.slug === slug) || null;
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
      const store = await this.sdk.getItem('stores', id);
      return store;
    } catch (error) {
      console.error('Error fetching store:', error);
      return null;
    }
  }

  async getStoreProducts(storeId: string): Promise<Product[]> {
    try {
      const products = await this.sdk.get('products');
      return products.filter(p => p.storeId === storeId) || [];
    } catch (error) {
      console.error('Error fetching store products:', error);
      return [];
    }
  }

  // Seller methods
  async createSeller(sellerData: any): Promise<Seller> {
    try {
      const seller = await this.sdk.insert('sellers', {
        ...sellerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return seller;
    } catch (error) {
      console.error('Error creating seller:', error);
      throw error;
    }
  }

  async getSellerProducts(sellerId: string): Promise<Product[]> {
    try {
      const products = await this.sdk.get('products');
      return products.filter(p => p.sellerId === sellerId) || [];
    } catch (error) {
      console.error('Error fetching seller products:', error);
      return [];
    }
  }

  async getSellerAnalytics(sellerId: string) {
    try {
      const analytics = await this.sdk.get('seller_analytics');
      return analytics.find(a => a.sellerId === sellerId) || null;
    } catch (error) {
      console.error('Error fetching seller analytics:', error);
      return null;
    }
  }

  // Order methods
  async getOrders(userId?: string): Promise<Order[]> {
    try {
      const orders = await this.sdk.get('orders');
      return userId ? orders.filter(o => o.userId === userId) : orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async createOrder(orderData: any): Promise<Order> {
    try {
      const order = await this.sdk.insert('orders', {
        ...orderData,
        id: 'order_' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const updatedOrder = await this.sdk.update('orders', orderId, { 
        status,
        updatedAt: new Date().toISOString()
      });
      
      // Return the full updated order object
      return updatedOrder as Order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Cart methods
  async getCart(userId: string): Promise<CartItem[]> {
    try {
      const cartItems = await this.sdk.get('cart_items');
      const products = await this.sdk.get('products');
      
      return cartItems
        .filter(item => item.userId === userId)
        .map(item => ({
          ...item,
          product: products.find(p => p.id === item.productId) || {
            id: item.productId,
            name: 'Unknown Product',
            description: '',
            price: 0,
            images: [],
            category: '',
            sellerName: '',
            sellerId: '',
            rating: 0,
            reviewCount: 0,
            inventory: 0,
            isFeatured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })) || [];
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    try {
      const products = await this.sdk.get('products');
      const product = products.find(p => p.id === productId);
      
      const cartItem = await this.sdk.insert('cart_items', {
        userId,
        productId,
        quantity
      });
      
      return {
        ...cartItem,
        product: product || {
          id: productId,
          name: 'Unknown Product',
          description: '',
          price: 0,
          images: [],
          category: '',
          sellerName: '',
          sellerId: '',
          rating: 0,
          reviewCount: 0,
          inventory: 0,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Wishlist methods
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const wishlistItems = await this.sdk.get('wishlist_items');
      return wishlistItems.filter(item => item.userId === userId) || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const notifications = await this.sdk.get('notifications');
      return notifications.filter(n => n.userId === userId) || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Affiliate methods
  async createAffiliate(affiliateData: any): Promise<Affiliate> {
    try {
      const affiliate = await this.sdk.insert('affiliates', {
        ...affiliateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return affiliate;
    } catch (error) {
      console.error('Error creating affiliate:', error);
      throw error;
    }
  }

  async getAffiliate(userId: string): Promise<Affiliate | null> {
    try {
      const affiliates = await this.sdk.get('affiliates');
      return affiliates.find(a => a.userId === userId) || null;
    } catch (error) {
      console.error('Error fetching affiliate:', error);
      return null;
    }
  }

  async getAffiliateLinks(affiliateId: string): Promise<AffiliateLink[]> {
    try {
      const links = await this.sdk.get('affiliate_links');
      return links.filter(l => l.affiliateId === affiliateId) || [];
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
      return [];
    }
  }

  async createAffiliateLink(linkData: any): Promise<AffiliateLink> {
    try {
      const link = await this.sdk.insert('affiliate_links', {
        ...linkData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return link;
    } catch (error) {
      console.error('Error creating affiliate link:', error);
      throw error;
    }
  }

  async getCommissions(affiliateId: string): Promise<Commission[]> {
    try {
      const commissions = await this.sdk.get('commissions');
      return commissions.filter(c => c.affiliateId === affiliateId) || [];
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
      const article = await this.sdk.insert('help_articles', {
        ...articleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
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
      const blog = await this.sdk.insert('blogs', {
        ...blogData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return blog;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  // Community methods
  async getPosts(filters?: any) {
    try {
      const posts = await this.sdk.get('posts');
      return posts || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  async createPost(postData: any): Promise<Post> {
    try {
      const post = await this.sdk.insert('posts', {
        ...postData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id: string, updates: any): Promise<Post> {
    try {
      const post = await this.sdk.update('posts', id, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return post;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async getComments(postId: string) {
    try {
      const comments = await this.sdk.get('comments');
      return comments.filter(c => c.postId === postId) || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  async createComment(commentData: any): Promise<Comment> {
    try {
      const comment = await this.sdk.insert('comments', {
        ...commentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return comment;
    } catch (error) {
      console.error('Error creating comment:', error);
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
      const wallet = await this.sdk.insert('wallets', {
        ...walletData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return wallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }
}

export default CommerceSDK;
