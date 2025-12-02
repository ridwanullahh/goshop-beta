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
  public sdk: CommerceSDK;

  constructor() {
    this.baseURL = '/api';
    this.sdk = this;
  }

  private async fetchData(path: string, method: string = 'GET', body: any = null) {
    const url = `${this.baseURL}/${path}`;
    const headers = {
      'Content-Type': 'application/json'
    };

    const options: any = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T = any>(collection: string): Promise<T[]> {
    return await this.fetchData(collection) as T[];
  }

  async getById<T = any>(collection: string, id: string): Promise<T> {
    return await this.fetchData(`${collection}/${id}`) as T;
  }

  async create<T = any>(collection: string, data: any): Promise<T> {
    return await this.fetchData(collection, 'POST', data) as T;
  }

  async update<T = any>(collection: string, id: string, data: any): Promise<T> {
    return await this.fetchData(`${collection}/${id}`, 'PUT', data) as T;
  }

  async delete(collection: string, id: string): Promise<void> {
    await this.fetchData(`${collection}/${id}`, 'DELETE');
  }

  async getProducts(filters?: any): Promise<Product[]> {
    const products = await this.get<Product>('products');
    if (filters?.featured) {
      return products.filter(product => product.isFeatured);
    }
    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return await this.getById<Product>('products', id);
  }

  async getCategories(): Promise<Category[]> {
    return await this.get<Category>('categories');
  }

  async getCategory(slug: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find(category => category.slug === slug);
  }

  async getOrders(userId?: string): Promise<Order[]> {
    const orders = await this.get<Order>('orders');
    return userId ? orders.filter(order => order.userId === userId || order.sellerId === userId) : orders;
  }

  async getOrder(id: string, authenticatedUserId?: string): Promise<Order | undefined> {
    const order = await this.getById<Order>('orders', id);

    if (authenticatedUserId && order && order.userId !== authenticatedUserId) {
      throw new Error("Unauthorized: You do not have access to this order.");
    }

    return order;
  }

  async getCart(userId: string): Promise<CartItem[]> {
    const cartItems = await this.get<CartItem>('cart_items');
    return cartItems.filter(item => item.userId === userId);
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    const cartItems = await this.getCart(userId);
    const existingItem = cartItems.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.updatedAt = new Date().toISOString();
      return await this.update<CartItem>('cart_items', existingItem.id, { quantity: existingItem.quantity });
    } else {
      const newCartItem: CartItem = {
        id: Date.now().toString(),
        userId,
        productId,
        quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return await this.create<CartItem>('cart_items', newCartItem);
    }
  }

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const wishlistItems = await this.get<WishlistItem>('wishlist');
    return wishlistItems.filter(item => item.userId === userId);
  }

  async getStores(): Promise<Store[]> {
    return await this.get<Store>('stores');
  }

  async getStore(id: string): Promise<Store | undefined> {
    return await this.getById<Store>('stores', id);
  }

  async getUsers(): Promise<User[]> {
    return await this.get<User>('users');
  }

  async getUser(id: string): Promise<User | undefined> {
    return await this.getById<User>('users', id);
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

  async createOrder(orderData: Partial<Order>): Promise<Order> {
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

    return await this.create<Order>('orders', newOrder);
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
    const users = await this.getUsers();

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

    const createdUser = await this.create<User>('users', newUser);
    localStorage.setItem('currentUser', JSON.stringify(createdUser));

    return createdUser;
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    const wishlistItem: WishlistItem = {
      id: Date.now().toString(),
      userId,
      productId,
      createdAt: new Date().toISOString()
    };

    const wishlist = await this.getWishlist(userId);

    const existingItem = wishlist.find((item: WishlistItem) =>
      item.userId === userId && item.productId === productId
    );

    if (existingItem) {
      return existingItem;
    }

    return await this.create<WishlistItem>('wishlist', wishlistItem);
  }

  // Seller-specific methods
  async getSellerProducts(sellerId: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(product => product.sellerId === sellerId);
  }

  async getSellerAnalytics(sellerId: string): Promise<any> {
    // This should be an API call
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topSellingProduct: null
    };
  }

  async createProduct(productData: any, images: File[]): Promise<Product> {
    // Image upload should be handled by the backend
    const newProduct: Product = {
      inventory: 0,
      category: 'General',
      ...productData,
      id: Date.now().toString(),
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.create<Product>('products', newProduct);
  }

  async updateProduct(id: string, productData: any, images: File[]): Promise<Product> {
    // Image upload should be handled by the backend
    const updatedProductData = { ...productData, images: [] };
    return await this.update<Product>('products', id, updatedProductData);
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
    return await this.update<Order>('orders', orderId, payload);
  }
}