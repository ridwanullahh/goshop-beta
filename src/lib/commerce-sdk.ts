export interface User {
  id: string;
  uid?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
  onboardingCompleted?: boolean;
  businessName?: string;
  phone?: string;
  address?: any;
  verified?: boolean;
  permissions?: string[];
  walletBalance?: number;
  language?: string;
  currency?: string;
}

export interface ProductVariation {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  inventory: number;
  attributes: { [key: string]: string };
  images?: string[];
  isActive: boolean;
}

export interface ProductBundle {
  id: string;
  productId: string;
  quantity: number;
  discount?: number;
}

export interface Product {
  id: string;
  uid?: string;
  name: string;
  description?: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  category: string;
  storeId?: string;
  sellerId?: string;
  sellerName?: string;
  createdAt?: string;
  updatedAt?: string;
  inventory: number;
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  sku?: string;
  weight?: number;
  dimensions?: string;
  shippingClass?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  soldCount?: number;
  cloudinaryId?: string;
  variations?: ProductVariation[];

  // Enhanced product features
  type: 'simple' | 'variable' | 'bundle';
  variants?: ProductVariant[];
  bundles?: ProductBundle[];

  // Shipping settings
  shippingEnabled: boolean;
  shippingCost?: number;

  // Affiliate settings
  affiliateEnabled: boolean;
  affiliateCommission?: number; // percentage
  currency?: string; // e.g., 'USD', 'NGN'
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  createdAt: string;
  orderId?: string;
  productId?: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
}

export interface PlatformCommission {
  id: string;
  percentage: number;
  category?: string;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateLink {
  id: string;
  affiliateId: string;
  productId: string;
  collectionId?: string;
  code: string;
  clicks: number;
  conversions: number;
  earnings: number;
  createdAt: string;
  isActive: boolean;
}

export interface AffiliateCollection {
  id: string;
  affiliateId: string;
  name: string;
  description?: string;
  productIds: string[];
  linkCode: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  productId: string;
  customerId: string;
  sellerId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  evidence?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface Dispute {
  id: string;
  refundRequestId: string;
  customerId: string;
  sellerId: string;
  adminId?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: DisputeMessage[];
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeMessage {
  id: string;
  senderId: string;
  senderType: 'customer' | 'seller' | 'admin';
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userType: 'customer' | 'affiliate';
  amount: number;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface SellerAgreement {
  id: string;
  version: string;
  content: string;
  variables: { [key: string]: any };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  platformCommission?: number;
  affiliateCommission: number;
  shippingTotal: number;
  paidAmount: number; // Amount paid at checkout (commissions + shipping)
  remainingAmount: number; // Amount to be paid on delivery
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'pending_payment';
  paymentStatus: 'partial' | 'completed' | 'refunded';
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
  sellerId?: string;
  transactionRef?: string;
  deliveryMethod?: 'pickup' | 'shipping';
  trackingNumber?: string;
  deliveredAt?: string;
  affiliateId?: string; // If order came through affiliate link
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  images?: string[];
  product?: Product;
  sellerId: string;
  storeId?: string;
  variantId?: string;
  bundleItems?: string[];
  shippingCost: number;
  deliveryMethod: 'pickup' | 'shipping';
  platformCommission: number;
  affiliateCommission: number;
  affiliateId?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
}

export interface Address {
  street: string;
  city: string;
  state: string;

  zip: string;
  zipCode?: string;
  country: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt?: string;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  address?: Address;
  ownerId?: string;
  sellerId?: string;
  createdAt?: string;
  updatedAt?: string;
  slug: string;
  rating?: number;
  reviewCount?: number;
  productCount?: number;
  isVerified?: boolean;
  isApproved?: boolean;
  isActive?: boolean;
  location?: string;
  established?: string;
  totalSales?: number;
  businessType?: string;
  website?: string;
  phone?: string;
  email?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  policies?: {
    shipping?: string;
    returns?: string;
    privacy?: string;
  };
  categories?: string[];
  tags?: string[];
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

export interface Post {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  role: 'seller' | 'affiliate' | 'admin';
  content: string;
  images?: string[];
  productIds?: string[]; // attached products
  storeId?: string;
  likes: number;
  comments: number;
  tags?: string[];
  status: 'pending' | 'approved' | 'rejected';
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  author: string;
  authorId?: string;
  storeId?: string;
  storeName?: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface Commission {
  id: string;
  affiliateId: string;
  orderId: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface Affiliate {
  id: string;
  userId: string;
  commissionRate: number;
  businessName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LiveStream {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  productIds: string[];
  status: 'scheduled' | 'live' | 'ended';
  startTime: string;
  endTime?: string;
  agoraToken?: string;
}

export interface Language {
  id: string;
  code: string;
  name: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number; // Rate against a base currency (e.g., USD)
}

export class CommerceSDK {
  private baseURL: string;
  private githubToken: string;
  private owner: string;
  private repo: string;
  public sdk: CommerceSDK;

  constructor() {
    this.baseURL = 'https://api.github.com';
    this.githubToken = import.meta.env.VITE_GITHUB_TOKEN || '';
    this.owner = import.meta.env.VITE_GITHUB_OWNER || 'ridwanullahh';
    this.repo = import.meta.env.VITE_GITHUB_REPO || 'goshopdb';
    this.sdk = this;
  }

  async init(): Promise<void> {
    const collections = [
      'platformCommissions',
      'affiliateLinks',
      'affiliateCollections',
      'refundRequests',
      'disputes',
      'withdrawalRequests',
      'sellerAgreements',
      'wallets',
      'transactions',
      'languages',
      'currencies'
    ];

    for (const collection of collections) {
      try {
        await this.getData(collection);
      } catch (error) {
        console.log(`Initializing collection: ${collection}`);
        await this.saveData(collection, []);
      }
    }

    // Initialize default platform commission if not exists
    const commissions = await this.getData('platformCommissions');
    if (commissions.length === 0) {
      await this.createPlatformCommission({
        percentage: 5,
        isGlobal: true
      });
    }

    // Initialize default seller agreement if not exists
    const agreements = await this.getData('sellerAgreements');
    if (agreements.length === 0) {
      await this.createSellerAgreement({
        content: `# Seller Agreement

By registering as a seller on {{platform_name}}, you agree to the following terms:

## Commission Structure
- Platform commission: {{commission_percentage}}% per sale
- Commission is collected at checkout from customers
- You receive the remaining payment upon successful delivery

## Responsibilities
- Deliver products as described
- Maintain accurate inventory
- Respond to customer inquiries promptly
- Honor refund requests when valid

## Affiliate Program
- You may enable affiliate marketing for your products
- Set your own affiliate commission rates
- Affiliate commissions are deducted from your earnings

This agreement is effective immediately and may be updated from time to time.`,
        variables: {
          platform_name: 'GoShop',
          commission_percentage: '5'
        }
      });
    }

    // Initialize default languages if not exist
    const languages = await this.getData('languages');
    if (languages.length === 0) {
      await this.saveData('languages', [
        { id: '1', code: 'en', name: 'English' },
        { id: '2', code: 'fr', name: 'French' },
      ]);
    }

    // Initialize default currencies if not exist
    const currencies = await this.getData('currencies');
    if (currencies.length === 0) {
      await this.saveData('currencies', [
        { id: '1', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1 },
        { id: '2', code: 'NGN', name: 'Nigerian Naira', symbol: '₦', exchangeRate: 1500 },
      ]);
    }
  }

  // AI Helper methods
  aiHelper = {
    generateProductRecommendations: async (query: string) => {
      return [];
    },
    generateSearchSuggestions: async (query: string) => {
      return [];
    },
    buyerAssistant: async (query: string, context?: any) => {
      return `AI assistance for: ${query}`;
    },
    sellerAssistant: async (query: string, context?: any) => {
      return `Seller AI assistance for: ${query}`;
    },
    chat: async (message: string) => {
      return `AI chat response to: ${message}`;
    },
    enhancedSearch: async (query: string, products: any[]) => {
      return { results: [], suggestions: [] };
    }
  };
async uploadToCloudinary(file: File): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  }

  private async fetchData(path: string, method: string = 'GET', body: any = null) {
    const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/db/${path}.json`;
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${this.githubToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    };

    const options: any = {
      method,
      headers
    };

    if (body && method === 'PUT') {
      options.body = JSON.stringify({
        message: `Update ${path}.json`,
        content: btoa(JSON.stringify(body, null, 2)),
        sha: await this.getSHA(`db/${path}.json`)
      });
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 404) {
        // File doesn't exist, initialize it
        if (method === 'GET') {
          await this.initializeFile(path);
          return { content: btoa(JSON.stringify([], null, 2)) };
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async deleteFile(path: string): Promise<void> {
    const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`;
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${this.githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
    };

    const sha = await this.getSHA(path);
    if (!sha) {
        console.warn(`Attempted to delete non-existent file: ${path}`);
        return;
    }

    await fetch(url, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
            message: `Delete ${path}`,
            sha: sha
        })
    });
}


  private async initializeFile(path: string): Promise<void> {
    try {
      const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/db/${path}.json`;
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${this.githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      };

      await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `Initialize ${path}.json`,
          content: btoa(JSON.stringify([], null, 2))
        })
      });
    } catch (error) {
      console.warn(`Failed to initialize ${path}.json:`, error);
    }
  }


  private async getSHA(path: string): Promise<string> {
    try {
      const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`;
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${this.githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28'
      };

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          return ''; // File doesn't exist, which is a valid state for locking
        }
        throw new Error(`Failed to get SHA for ${path}. Status: ${response.status}`);
      }

      const data = await response.json();
      return data.sha || '';
    } catch (error) {
      console.error(`Error in getSHA for ${path}:`, error);
      throw error;
    }
  }

  async getData(path: string): Promise<any[]> {
    try {
      const response = await this.fetchData(path);
      if (response.content) {
        const content = atob(response.content);
        return JSON.parse(content);
      } else {
        return [];
      }
    } catch (error: any) {
      console.error(`Error fetching data for ${path}:`, error);
      return [];
    }
  }

  async saveData(path: string, data: any): Promise<void> {
    try {
      await this.fetchData(path, 'PUT', data);
    } catch (error) {
      console.error(`Error saving data for ${path}:`, error);
      throw error;
    }
  }

  async get<T = any>(collection: string): Promise<T[]> {
    return await this.getData(collection) as T[];
  }

  async getProducts(filters?: any): Promise<Product[]> {
    const products = await this.getData('products') as Product[];
    if (filters?.featured) {
      return products.filter(product => product.isFeatured);
    }
    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find(product => product.id === id);
  }

  async getCategories(): Promise<Category[]> {
    return await this.getData('categories') as Category[];
  }

  async getCategory(slug: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find(category => category.slug === slug);
  }

  async getOrders(userId?: string): Promise<Order[]> {
    const orders = await this.getData('orders') as Order[];
    return userId ? orders.filter(order => order.userId === userId || order.sellerId === userId) : orders;
  }

  async getOrder(id: string, authenticatedUserId?: string): Promise<Order | undefined> {
    const orders = await this.getOrders();
    const order = orders.find(order => order.id === id);

    if (authenticatedUserId && order && order.userId !== authenticatedUserId) {
      throw new Error("Unauthorized: You do not have access to this order.");
    }

    return order;
  }

  async getCart(userId: string): Promise<CartItem[]> {
    const cartItems = await this.getData('cart_items') as CartItem[];
    return cartItems.filter(item => item.userId === userId);
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    try {
      const cartItems = await this.getCart(userId);
      const existingItem = cartItems.find(item => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.updatedAt = new Date().toISOString();
        await this.update('cart_items', existingItem.id, { quantity: existingItem.quantity });
        return existingItem;
      } else {
        const newCartItem: CartItem = {
          id: Date.now().toString(),
          userId,
          productId,
          quantity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const allCartItems = await this.getData('cart_items');
        allCartItems.push(newCartItem);
        await this.saveData('cart_items', allCartItems);
        return newCartItem;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const wishlistItems = await this.getData('wishlist') as WishlistItem[];
    return wishlistItems.filter(item => item.userId === userId);
  }

  async getStores(): Promise<Store[]> {
    return await this.getData('stores') as Store[];
  }

  async getStore(id: string): Promise<Store | undefined> {
    const stores = await this.getStores();
    return stores.find(store => store.id === id);
  }

  async getUsers(): Promise<User[]> {
    return await this.getData('users') as User[];
  }

  async getUser(id: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(user => user.id === id);
  }

  async getCurrentUser(): Promise<User | null> {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  async login(credentials: { email: string; password?: string }): Promise<User> {
    const users = await this.getUsers();
    const user = users.find(user => user.email === credentials.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('currentUser');
  }

  async searchProducts(query: string, filters: any = {}): Promise<Product[]> {
    const products = await this.getProducts();
    let filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
    );

    if (filters.category) {
      filteredProducts = filteredProducts.filter(product => product.category === filters.category);
    }

    return filteredProducts;
  }

  async delete(collection: string, id: string): Promise<void> {
    try {
      const data = await this.getData(collection);
      const filteredData = data.filter((item: any) => item.id !== id);
      await this.saveData(collection, filteredData);
    } catch (error) {
      console.error(`Error deleting from ${collection}:`, error);
      throw error;
    }
  }

  async update(collection: string, id: string, updates: any): Promise<any> {
    try {
      const data = await this.getData(collection);
      const itemIndex = data.findIndex((item: any) => item.id === id);

      if (itemIndex === -1) {
        throw new Error(`Item with id ${id} not found in ${collection}`);
      }

      const updatedItem = { ...data[itemIndex], ...updates, updatedAt: new Date().toISOString() };
      data[itemIndex] = updatedItem;

      await this.saveData(collection, data);
      return updatedItem;
    } catch (error) {
      console.error(`Error updating ${collection}:`, error);
      throw error;
    }
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    // SECURITY: This function should only be called from a trusted server-side environment.
    // The `orderData` should be built on the server after verifying product prices
    // and calculating the total, as done in the `/api/create-order.ts` endpoint.
    // Never trust pricing data sent from the client.
    try {
      const newOrder: Order = {
        id: Date.now().toString(),
        userId: orderData.userId!,
        items: orderData.items!,
        total: orderData.total!,
        status: 'pending',
        paymentMethod: orderData.paymentMethod!,
        shippingAddress: orderData.shippingAddress!,
        billingAddress: orderData.billingAddress!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...orderData,
      };

      const orders = await this.getData('orders');
      orders.push(newOrder);
      await this.saveData('orders', orders);

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    roles?: string[];
    businessName?: string;
    phone?: string;
    onboardingCompleted?: boolean;
  }): Promise<User> {
    try {
      const users = await this.getData('users');

      const existingUser = users.find((user: User) => user.email === userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'customer',
        roles: userData.roles || ['customer'],
        businessName: userData.businessName,
        phone: userData.phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: userData.onboardingCompleted || false
      };

      users.push(newUser);
      await this.saveData('users', users);

      localStorage.setItem('currentUser', JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    try {
      const wishlistItem: WishlistItem = {
        id: Date.now().toString(),
        userId,
        productId,
        createdAt: new Date().toISOString()
      };

      const wishlist = await this.getData('wishlist');

      const existingItem = wishlist.find((item: WishlistItem) =>
        item.userId === userId && item.productId === productId
      );

      if (existingItem) {
        return existingItem;
      }

      wishlist.push(wishlistItem);
      await this.saveData('wishlist', wishlist);

      return wishlistItem;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  // Seller-specific methods
  async getSellerProducts(sellerId: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(product => product.sellerId === sellerId);
  }

  async getSellerAnalytics(sellerId: string): Promise<any> {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topSellingProduct: null
    };
  }

  async createProduct(productData: any, images: File[]): Promise<Product> {
    try {
      const imageUrls = await Promise.all(images.map(image => this.uploadToCloudinary(image)));
      const newProduct: Product = {
        inventory: 0,
        category: 'General',
        currency: 'USD',
        ...productData,
        id: Date.now().toString(),
        images: imageUrls,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const products = await this.getData('products');
      products.push(newProduct);
      await this.saveData('products', products);

      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, productData: any, images: File[]): Promise<Product> {
    try {
      const imageUrls = await Promise.all(images.map(image => this.uploadToCloudinary(image)));
      const updatedProductData = { ...productData, images: imageUrls };
      return await this.update('products', id, updatedProductData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    await this.delete('products', id);
  }

  async updateOrderStatus(orderId: string, status: string, authenticatedUserId?: string, updates?: object): Promise<Order> {
    const order = await this.getOrder(orderId);
    if (authenticatedUserId && order && order.userId !== authenticatedUserId) {
        throw new Error("Unauthorized: You cannot update the status of this order.");
    }
    const payload = { status, ...updates };
    return await this.update('orders', orderId, payload);
  }

  // Notification methods
  async getNotifications(userId?: string): Promise<Notification[]> {
    const notifications = await this.getData('notifications') as Notification[];
    return userId ? notifications.filter(notification => notification.userId === userId) : notifications;
  }

  // Community methods
  async getPosts(): Promise<Post[]> {
    return await this.getData('posts') as Post[];
  }

  async createPost(postData: any): Promise<Post> {
    try {
      const newPost: Post = {
        ...postData,
        id: Date.now().toString(),
        likes: 0,
        comments: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const posts = await this.getData('posts');
      posts.unshift(newPost);
      await this.saveData('posts', posts);

      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id: string, updates: any): Promise<Post> {
    return await this.update('posts', id, updates);
  }

  async getComments(postId: string): Promise<Comment[]> {
    const comments = await this.getData('comments') as Comment[];
    return comments.filter(comment => comment.postId === postId);
  }

  async createComment(commentData: any): Promise<Comment> {
    try {
      const newComment: Comment = {
        ...commentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const comments = await this.getData('comments');
      comments.push(newComment);
      await this.saveData('comments', comments);

      return newComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async moderatePost(postId: string, action: 'approve' | 'reject', adminId: string, reason?: string): Promise<Post> {
    const updates: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      updatedAt: new Date().toISOString(),
      moderation: { adminId, action, reason, at: new Date().toISOString() }
    };
    return await this.update('posts', postId, updates);
  }

  async getApprovedPosts(): Promise<Post[]> {
    const posts = await this.getPosts();
    return posts.filter(p => p.status === 'approved');
  }

  async getRolePosts(role: 'seller' | 'affiliate' | 'admin'): Promise<Post[]> {
    const posts = await this.getPosts();
    return posts.filter(p => p.role === role);
  }

  // Admin methods
  async getHelpArticles(): Promise<HelpArticle[]> {
    return await this.getData('help_articles') as HelpArticle[];
  }

  async createHelpArticle(articleData: any): Promise<HelpArticle> {
    try {
      const newArticle: HelpArticle = {
        ...articleData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const articles = await this.getData('help_articles');
      articles.push(newArticle);
      await this.saveData('help_articles', articles);

      return newArticle;
    } catch (error) {
      console.error('Error creating help article:', error);
      throw error;
    }
  }

  async getBlogs(): Promise<Blog[]> {
    return await this.getData('blogs') as Blog[];
  }

  async createBlog(blogData: any): Promise<Blog> {
    try {
      const newBlog: Blog = {
        ...blogData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const blogs = await this.getData('blogs');
      blogs.push(newBlog);
      await this.saveData('blogs', blogs);

      return newBlog;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  async getPlatformAnalytics(): Promise<any> {
    return {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0
    };
  }

  // Affiliate methods
  async getAffiliate(id: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(user => user.id === id && user.role === 'affiliate');
  }







  // Store methods
  async getStoreProducts(sellerId: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(product => product.sellerId === sellerId);
  }

  async getStoreBySlug(slug: string): Promise<Store | undefined> {
    const stores = await this.getStores();
    return stores.find(store => store.slug === slug);
  }

  async createStore(storeData: any): Promise<Store> {
    try {
      const newStore: Store = {
        ...storeData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isApproved: false,
        isActive: false
      };

      const stores = await this.getData('stores');
      stores.push(newStore);
      await this.saveData('stores', stores);

      return newStore;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  }

  async updateStore(id: string, updates: any): Promise<Store> {
    return await this.update('stores', id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async checkStoreSlugAvailability(slug: string, excludeId?: string): Promise<boolean> {
    const stores = await this.getStores();
    return !stores.some(store => store.slug === slug && store.id !== excludeId);
  }

  async getSellerStore(sellerId: string): Promise<Store | undefined> {
    const stores = await this.getStores();
    return stores.find(store => store.sellerId === sellerId);
  }

  async getStoreBlogPosts(storeId: string): Promise<Blog[]> {
    const blogs = await this.getBlogs();
    return blogs.filter(blog => blog.storeId === storeId && blog.isPublished);
  }

  async createStoreBlogPost(blogData: any): Promise<Blog> {
    try {
      const newBlog: Blog = {
        ...blogData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const blogs = await this.getData('blogs');
      blogs.push(newBlog);
      await this.saveData('blogs', blogs);

      return newBlog;
    } catch (error) {
      console.error('Error creating store blog post:', error);
      throw error;
    }
  }

  async getStoreAnalytics(storeId: string): Promise<any> {
    const products = await this.getStoreProducts(storeId);
    const orders = await this.getOrders();
    const storeOrders = orders.filter(order =>
      order.items?.some(item => products.find(p => p.id === item.productId))
    );

    return {
      totalProducts: products.length,
      totalOrders: storeOrders.length,
      totalRevenue: storeOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      averageOrderValue: storeOrders.length > 0 ?
        storeOrders.reduce((sum, order) => sum + (order.total || 0), 0) / storeOrders.length : 0
    };
  }

  // Platform Commission Methods
  async getPlatformCommissions(): Promise<PlatformCommission[]> {
    return await this.getData('platformCommissions');
  }

  async createPlatformCommission(commissionData: any): Promise<PlatformCommission> {
    const newCommission: PlatformCommission = {
      ...commissionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const commissions = await this.getData('platformCommissions');
    commissions.push(newCommission);
    await this.saveData('platformCommissions', commissions);

    return newCommission;
  }

  async updatePlatformCommission(id: string, updates: any): Promise<PlatformCommission> {
    return await this.update('platformCommissions', id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async getGlobalCommission(): Promise<number> {
    const commissions = await this.getPlatformCommissions();
    const globalCommission = commissions.find(c => c.isGlobal);
    return globalCommission?.percentage || 5; // Default 5%
  }

  async getCategoryCommission(category: string): Promise<number> {
    const commissions = await this.getPlatformCommissions();
    const categoryCommission = commissions.find(c => c.category === category);
    return categoryCommission?.percentage || await this.getGlobalCommission();
  }

  // Affiliate Methods
  async getAffiliateLinks(affiliateId: string): Promise<AffiliateLink[]> {
    const links = await this.getData('affiliateLinks');
    return links.filter(link => link.affiliateId === affiliateId);
  }

  async createAffiliateLink(linkData: any): Promise<AffiliateLink> {
    const newLink: AffiliateLink = {
      ...linkData,
      id: Date.now().toString(),
      code: this.generateAffiliateCode(),
      clicks: 0,
      conversions: 0,
      earnings: 0,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const links = await this.getData('affiliateLinks');
    links.push(newLink);
    await this.saveData('affiliateLinks', links);

    return newLink;
  }

  async getAffiliateCollections(affiliateId: string): Promise<AffiliateCollection[]> {
    const collections = await this.getData('affiliateCollections');
    return collections.filter(collection => collection.affiliateId === affiliateId);
  }

  async createAffiliateCollection(collectionData: any): Promise<AffiliateCollection> {
    const newCollection: AffiliateCollection = {
      ...collectionData,
      id: Date.now().toString(),
      linkCode: this.generateAffiliateCode(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    const collections = await this.getData('affiliateCollections');
    collections.push(newCollection);
    await this.saveData('affiliateCollections', collections);

    return newCollection;
  }

  async getAffiliateProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(product => product.affiliateEnabled && product.isActive);
  }

  async trackAffiliateClick(code: string): Promise<void> {
    const links = await this.getData('affiliateLinks');
    const collections = await this.getData('affiliateCollections');

    const link = links.find(l => l.code === code);
    if (link) {
      link.clicks += 1;
      await this.saveData('affiliateLinks', links);
    }

    const collection = collections.find(c => c.linkCode === code);
    if (collection) {
      // Track collection click - could be implemented similarly
    }
  }

  private generateAffiliateCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  // Refund and Dispute Methods
  async createRefundRequest(refundData: any): Promise<RefundRequest> {
    const newRefund: RefundRequest = {
      ...refundData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const refunds = await this.getData('refundRequests');
    refunds.push(newRefund);
    await this.saveData('refundRequests', refunds);

    return newRefund;
  }

  async getRefundRequests(userId?: string, userType?: 'customer' | 'seller'): Promise<RefundRequest[]> {
    const refunds = await this.getData('refundRequests');
    if (!userId) return refunds;

    if (userType === 'customer') {
      return refunds.filter(refund => refund.customerId === userId);
    } else if (userType === 'seller') {
      return refunds.filter(refund => refund.sellerId === userId);
    }

    return refunds;
  }

  async updateRefundRequest(id: string, updates: any): Promise<RefundRequest> {
    return await this.update('refundRequests', id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async createDispute(disputeData: any): Promise<Dispute> {
    const newDispute: Dispute = {
      ...disputeData,
      id: Date.now().toString(),
      status: 'open',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const disputes = await this.getData('disputes');
    disputes.push(newDispute);
    await this.saveData('disputes', disputes);

    return newDispute;
  }

  async addDisputeMessage(disputeId: string, messageData: any): Promise<void> {
    const disputes = await this.getData('disputes');
    const dispute = disputes.find(d => d.id === disputeId);

    if (dispute) {
      const newMessage: DisputeMessage = {
        ...messageData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      dispute.messages.push(newMessage);
      dispute.updatedAt = new Date().toISOString();
      await this.saveData('disputes', disputes);
    }
  }

  // Wallet and Withdrawal Methods
  async getUserWallet(userId: string): Promise<Wallet> {
    const wallets = await this.getData('wallets');
    let wallet = wallets.find(w => w.userId === userId);

    if (!wallet) {
      wallet = {
        id: Date.now().toString(),
        userId,
        balance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      wallets.push(wallet);
      await this.saveData('wallets', wallets);
    }

    return wallet;
  }

  async updateWalletBalance(userId: string, amount: number, type: 'credit' | 'debit', description: string): Promise<void> {
    const wallet = await this.getUserWallet(userId);
    const newBalance = type === 'credit' ? wallet.balance + amount : wallet.balance - amount;

    if (newBalance < 0 && type === 'debit') {
      throw new Error('Insufficient wallet balance');
    }

    wallet.balance = newBalance;
    wallet.updatedAt = new Date().toISOString();

    const wallets = await this.getData('wallets');
    const index = wallets.findIndex(w => w.id === wallet.id);
    wallets[index] = wallet;
    await this.saveData('wallets', wallets);

    // Create transaction record
    const transaction: Transaction = {
      id: Date.now().toString(),
      walletId: wallet.id,
      amount,
      type,
      description,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    const transactions = await this.getData('transactions');
    transactions.push(transaction);
    await this.saveData('transactions', transactions);
  }

  async createWithdrawalRequest(requestData: any): Promise<WithdrawalRequest> {
    const newRequest: WithdrawalRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const requests = await this.getData('withdrawalRequests');
    requests.push(newRequest);
    await this.saveData('withdrawalRequests', requests);

    return newRequest;
  }

  async getWithdrawalRequests(userId?: string): Promise<WithdrawalRequest[]> {
    const requests = await this.getData('withdrawalRequests');
    return userId ? requests.filter(r => r.userId === userId) : requests;
  }

  // Seller Agreement Methods
  async getActiveSellerAgreement(): Promise<SellerAgreement | null> {
    const agreements = await this.getData('sellerAgreements');
    return agreements.find(a => a.isActive) || null;
  }

  async createSellerAgreement(agreementData: any): Promise<SellerAgreement> {
    // Deactivate current active agreement
    const agreements = await this.getData('sellerAgreements');
    agreements.forEach(a => a.isActive = false);

    const newAgreement: SellerAgreement = {
      ...agreementData,
      id: Date.now().toString(),
      version: `v${agreements.length + 1}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    agreements.push(newAgreement);
    await this.saveData('sellerAgreements', agreements);

    return newAgreement;
  }

  // Product reviews
  async getProductReviews(productId: string): Promise<any[]> {
    const reviews = await this.getData('reviews');
    return reviews.filter((review: any) => review.productId === productId);
  }

  // Wallet methods
  async getWallet(userId: string, authenticatedUserId?: string): Promise<Wallet | undefined> {
    if (authenticatedUserId && userId !== authenticatedUserId) {
        throw new Error("Unauthorized: You cannot access another user's wallet.");
    }
    const wallets = await this.getData('wallets') as Wallet[];
    return wallets.find(wallet => wallet.userId === userId);
  }

  async fundWallet(userId: string, amount: number, description: string, paymentGateway: string): Promise<Transaction> {
    // SECURITY: In a real application, this function should NOT directly credit the wallet.
    // 1. It should initialize a payment with the specified gateway.
    // 2. The actual crediting of the wallet should happen in a separate, secure webhook
    //    handler (like `/api/paystack-callback.ts`) after the payment gateway
    //    confirms the transaction was successful.
    // 3. This prevents a user from calling this function to get free money.

    // This mock implementation credits the wallet directly for demonstration purposes.
    let wallet = await this.getWallet(userId);
    if (!wallet) {
      wallet = await this.createWallet(userId);
    }

    const newBalance = wallet.balance + amount;
    await this.update('wallets', wallet.id, { balance: newBalance });

    const transaction: Transaction = {
      id: Date.now().toString(),
      walletId: wallet.id,
      amount,
      type: 'credit',
      description: `${description} via ${paymentGateway}`,
      createdAt: new Date().toISOString(),
      status: 'completed',
    };

    const transactions = await this.getData('transactions');
    transactions.push(transaction);
    await this.saveData('transactions', transactions);

    return transaction;
  }

  async payWithWallet(userId: string, amount: number, description:string): Promise<Transaction> {
    // SECURITY: This operation should be heavily protected on the server-side.
    // 1. Authenticate the user making the request.
    // 2. Authorize that the authenticated user owns this wallet (userId).
    // 3. Perform this check and the balance update in a single atomic transaction
    //    to prevent race conditions where a user might spend the same money twice.
    const wallet = await this.getWallet(userId);

    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const newBalance = wallet.balance - amount;
    await this.update('wallets', wallet.id, { balance: newBalance });

    const transaction: Transaction = {
      id: Date.now().toString(),
      walletId: wallet.id,
      amount,
      type: 'debit',
      description,
      createdAt: new Date().toISOString(),
      status: 'completed',
    };

    const transactions = await this.getData('transactions');
    transactions.push(transaction);
    await this.saveData('transactions', transactions);

    return transaction;
  }

  async getWalletTransactions(userId: string): Promise<Transaction[]> {
    const wallet = await this.getWallet(userId);
    if (!wallet) {
      return [];
    }
    const transactions = await this.getData('transactions') as Transaction[];
    return transactions.filter(transaction => transaction.walletId === wallet.id);
  }

  async createWallet(userId: string): Promise<any> {
    try {
      const newWallet = {
        id: Date.now().toString(),
        userId,
        balance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const wallets = await this.getData('wallets');
      wallets.push(newWallet);
      await this.saveData('wallets', wallets);

      return newWallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  // Onboarding methods
  async createSeller(sellerData: any): Promise<User> {
    const newSeller: User = {
      ...sellerData,
      id: Date.now().toString(),
      role: 'seller',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const users = await this.getData('users');
    users.push(newSeller);
    await this.saveData('users', users);

    return newSeller;
  }

  async getLiveStreams(): Promise<LiveStream[]> {
    return await this.getData('livestreams') as LiveStream[];
  }

  async createLiveStream(streamData: any): Promise<LiveStream> {
    try {
      const newStream: LiveStream = {
        ...streamData,
        id: Date.now().toString(),
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const streams = await this.getData('livestreams');
      streams.push(newStream);
      await this.saveData('livestreams', streams);

      return newStream;
    } catch (error) {
      console.error('Error creating live stream:', error);
      throw error;
    }
  }

  async updateLiveStream(id: string, updates: any): Promise<LiveStream> {
    return await this.update('livestreams', id, updates);
  }

  async createAffiliate(affiliateData: any): Promise<Affiliate> {
    try {
      const newAffiliate: Affiliate = {
        id: Date.now().toString(),
        ...affiliateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const affiliates = await this.getData('affiliates');
      affiliates.push(newAffiliate);
      await this.saveData('affiliates', affiliates);

      return newAffiliate;
    } catch (error) {
      console.error('Error creating affiliate:', error);
      throw error;
    }
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const currencies = await this.getData('currencies') as Currency[];
    const fromRate = currencies.find(c => c.code === fromCurrency)?.exchangeRate;
    const toRate = currencies.find(c => c.code === toCurrency)?.exchangeRate;

    if (!fromRate || !toRate) {
      console.warn(`Could not find exchange rate for ${fromCurrency} or ${toCurrency}`);
      return amount;
    }

    const amountInBase = amount / fromRate;
    return amountInBase * toRate;
  }
}
