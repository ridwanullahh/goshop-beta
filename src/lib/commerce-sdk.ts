
export interface User {
  id: string;
  uid?: string;
  email: string;
  name?: string;
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
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  category?: string;
  storeId?: string;
  sellerId?: string;
  sellerName?: string;
  createdAt?: string;
  updatedAt?: string;
  inventory?: number;
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
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
  sellerId?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
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
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
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

export default class CommerceSDK {
  private baseURL: string;
  private githubToken: string;
  private owner: string;
  private repo: string;
  public sdk: CommerceSDK;

  constructor() {
    this.baseURL = 'https://api.github.com';
    this.githubToken = import.meta.env.VITE_GITHUB_TOKEN || '';
    this.owner = import.meta.env.VITE_GITHUB_OWNER || 'lovable-dev';
    this.repo = import.meta.env.VITE_GITHUB_REPO || 'gpt-engineer-vawz6h';
    this.sdk = this;
  }

  // AI Helper methods
  aiHelper = {
    generateProductRecommendations: async (query: string) => {
      // Mock AI recommendations
      return [];
    },
    generateSearchSuggestions: async (query: string) => {
      // Mock AI suggestions
      return [];
    }
  };

  private async fetchData(path: string, method: string = 'GET', body: any = null) {
    const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/data/${path}.json`;
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

    if (body) {
      options.body = JSON.stringify({
        message: `Update ${path}.json`,
        content: btoa(JSON.stringify(body, null, 2)),
        sha: await this.getSHA(path)
      });
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async getSHA(path: string): Promise<string> {
    const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/data/${path}.json`;
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
      console.warn(`Could not retrieve SHA for ${path}.json, assuming file does not exist or is inaccessible.`);
      return '';
    }

    const data = await response.json();
    return data.sha || '';
  }

  async getData(path: string): Promise<any[]> {
    try {
      const response = await this.fetchData(path);
      if (response.content) {
        const content = atob(response.content);
        return JSON.parse(content);
      } else {
        console.warn(`Content is empty for ${path}`);
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

  async getProducts(): Promise<Product[]> {
    return await this.getData('products') as Product[];
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

  async getOrder(id: string): Promise<Order | undefined> {
    const orders = await this.getOrders();
    return orders.find(order => order.id === id);
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
        // Update quantity if item already exists
        existingItem.quantity += quantity;
        existingItem.updatedAt = new Date().toISOString();
        await this.update('cart_items', existingItem.id, { quantity: existingItem.quantity });
        return existingItem;
      } else {
        // Create new cart item
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

  async createOrder(orderData: any): Promise<Order> {
    try {
      const newOrder: Order = {
        id: Date.now().toString(),
        userId: orderData.userId,
        items: orderData.items,
        total: orderData.total,
        status: 'pending',
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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

  async register(userData: { email: string; password: string; name: string }): Promise<User> {
    try {
      const users = await this.getData('users');
      
      // Check if user already exists
      const existingUser = users.find((user: User) => user.email === userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users.push(newUser);
      await this.saveData('users', users);
      
      // Store current user
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
      
      // Check if item already exists
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
    // Mock analytics data
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topSellingProduct: null
    };
  }

  async createProduct(productData: any): Promise<Product> {
    try {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
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

  async updateProduct(id: string, productData: any): Promise<Product> {
    return await this.update('products', id, productData);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.delete('products', id);
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = await this.getData('notifications') as Notification[];
    return notifications.filter(notification => notification.userId === userId);
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

  async createAffiliate(affiliateData: any): Promise<User> {
    const newAffiliate: User = {
      ...affiliateData,
      id: Date.now().toString(),
      role: 'affiliate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const users = await this.getData('users');
    users.push(newAffiliate);
    await this.saveData('users', users);
    
    return newAffiliate;
  }
}
