
export interface User {
  id?: string;
  uid?: string;
  email: string;
  password?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role?: 'customer' | 'seller' | 'admin' | 'affiliate';
  roles?: string[];
  businessName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  inventory: number;
  sellerId: string;
  sellerName: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  featured?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  sku?: string;
  weight?: number;
  dimensions?: string;
  shippingClass?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  products: OrderProduct[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: any;
  paymentMethod?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface OrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: string;
}

export interface CartItem {
  id?: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Store {
  id?: string;
  name: string;
  description: string;
  ownerId: string;
  logo?: string;
  banner?: string;
  rating: number;
  reviewCount: number;
  products: Product[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface Message {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  read: boolean;
  createdAt: string;
}

export interface WishlistItem {
  id?: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface CommunityPost {
  id?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  images?: string[];
  likes: number;
  comments: CommunityComment[];
  type: 'product_showcase' | 'review' | 'discussion';
  productId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityComment {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  createdAt: string;
}

export interface Post extends CommunityPost {}
export interface Comment extends CommunityComment {}

class CommerceSDK {
  private baseUrl: string;
  private token: string | null = null;
  private owner: string;
  private repo: string;

  constructor() {
    this.baseUrl = 'https://api.github.com';
    this.owner = import.meta.env.VITE_GITHUB_OWNER || 'ridwanullahh';
    this.repo = import.meta.env.VITE_GITHUB_REPO || 'goshopdb';
    this.token = import.meta.env.VITE_GITHUB_TOKEN;
  }

  private async fetchData(path: string): Promise<any> {
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/db/${path}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          await this.createDataFile(path, []);
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const content = atob(data.content);
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error fetching data for ${path}:`, error);
      return [];
    }
  }

  private async saveData(path: string, data: any, message: string = 'Update data'): Promise<void> {
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/db/${path}`;
    
    try {
      let sha: string | undefined;
      try {
        const currentResponse = await fetch(url, {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          sha = currentData.sha;
        }
      } catch (error) {
        // File doesn't exist, SHA will be undefined
      }

      const content = btoa(JSON.stringify(data, null, 2));
      
      const payload: any = {
        message,
        content,
        branch: 'main'
      };

      if (sha) {
        payload.sha = sha;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error saving data for ${path}:`, error);
      throw error;
    }
  }

  private async createDataFile(path: string, initialData: any): Promise<void> {
    await this.saveData(path, initialData, `Initialize ${path}`);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // User methods
  async register(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const users = await this.fetchData('users.json');
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      uid: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await this.saveData('users.json', users, 'Add new user');
    
    return newUser;
  }

  async login(credentials: { email: string; password: string }): Promise<User | null> {
    const users = await this.fetchData('users.json');
    return users.find((user: User) => user.email === credentials.email && user.password === credentials.password) || null;
  }

  async getCurrentUser(): Promise<User | null> {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('currentUser');
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.fetchData('users.json');
    return users.find((user: User) => user.id === id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.fetchData('users.json');
    const index = users.findIndex((u: User) => u.id === id);
    
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveData('users.json', users, 'Update user');
    
    return users[index];
  }

  // Product methods
  async getProducts(filters?: any): Promise<Product[]> {
    const products = await this.fetchData('products.json');
    
    if (!filters) return products;
    
    let filtered = products;
    
    if (filters.category) {
      filtered = filtered.filter((p: Product) => p.category === filters.category);
    }
    
    if (filters.featured) {
      filtered = filtered.filter((p: Product) => p.featured || p.isFeatured);
    }
    
    if (filters.sellerId) {
      filtered = filtered.filter((p: Product) => p.sellerId === filters.sellerId);
    }
    
    return filtered;
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.fetchData('products.json');
    return products.find((product: Product) => product.id === id) || null;
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const products = await this.fetchData('products.json');
    const newProduct: Product = {
      ...productData,
      id: this.generateId(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    await this.saveData('products.json', products, 'Add new product');
    
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const products = await this.fetchData('products.json');
    const index = products.findIndex((p: Product) => p.id === id);
    
    if (index === -1) return null;
    
    products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveData('products.json', products, 'Update product');
    
    return products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.fetchData('products.json');
    const filteredProducts = products.filter((p: Product) => p.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    await this.saveData('products.json', filteredProducts, 'Delete product');
    return true;
  }

  async searchProducts(query: string, filters?: any): Promise<Product[]> {
    const products = await this.fetchData('products.json');
    const lowercaseQuery = query.toLowerCase();
    
    return products.filter((product: Product) => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getSellerProducts(sellerId: string): Promise<Product[]> {
    return this.getProducts({ sellerId });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.fetchData('categories.json');
  }

  // Order methods
  async getOrders(userId?: string): Promise<Order[]> {
    const orders = await this.fetchData('orders.json');
    
    if (userId) {
      return orders.filter((order: Order) => order.userId === userId);
    }
    
    return orders;
  }

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.fetchData('orders.json');
    return orders.find((order: Order) => order.id === id) || null;
  }

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const orders = await this.fetchData('orders.json');
    const newOrder: Order = {
      ...orderData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    await this.saveData('orders.json', orders, 'Add new order');
    
    return newOrder;
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    const orders = await this.fetchData('orders.json');
    const index = orders.findIndex((o: Order) => o.id === id);
    
    if (index === -1) return null;
    
    orders[index] = { ...orders[index], status, updatedAt: new Date().toISOString() };
    await this.saveData('orders.json', orders, 'Update order status');
    
    return orders[index];
  }

  // Cart methods
  async getCart(userId: string): Promise<CartItem[]> {
    const carts = await this.fetchData('carts.json');
    const userCart = carts.find((c: any) => c.userId === userId);
    
    if (!userCart) return [];
    
    const products = await this.fetchData('products.json');
    return userCart.items.map((item: CartItem) => ({
      ...item,
      id: item.id || this.generateId(),
      product: products.find((p: Product) => p.id === item.productId) || null
    })).filter((item: CartItem) => item.product);
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    const carts = await this.fetchData('carts.json');
    const products = await this.fetchData('products.json');
    
    const product = products.find((p: Product) => p.id === productId);
    if (!product) throw new Error('Product not found');
    
    let userCartIndex = carts.findIndex((c: any) => c.userId === userId);
    
    if (userCartIndex === -1) {
      carts.push({
        userId,
        items: [],
        total: 0,
        updatedAt: new Date().toISOString()
      });
      userCartIndex = carts.length - 1;
    }
    
    const existingItemIndex = carts[userCartIndex].items.findIndex((item: CartItem) => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      carts[userCartIndex].items[existingItemIndex].quantity += quantity;
    } else {
      carts[userCartIndex].items.push({
        id: this.generateId(),
        productId,
        quantity,
        product
      });
    }
    
    carts[userCartIndex].total = carts[userCartIndex].items.reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0);
    carts[userCartIndex].updatedAt = new Date().toISOString();
    
    await this.saveData('carts.json', carts, 'Update cart');
    
    return carts[userCartIndex].items[existingItemIndex >= 0 ? existingItemIndex : carts[userCartIndex].items.length - 1];
  }

  // Wishlist methods
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const wishlist = await this.fetchData('wishlist.json');
    const products = await this.fetchData('products.json');
    
    return wishlist
      .filter((item: WishlistItem) => item.userId === userId)
      .map((item: WishlistItem) => ({
        ...item,
        product: products.find((p: Product) => p.id === item.productId)
      }))
      .filter((item: WishlistItem) => item.product);
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    const wishlist = await this.fetchData('wishlist.json');
    const products = await this.fetchData('products.json');
    
    const product = products.find((p: Product) => p.id === productId);
    if (!product) throw new Error('Product not found');
    
    const existingItem = wishlist.find((item: WishlistItem) => 
      item.userId === userId && item.productId === productId
    );
    
    if (existingItem) return existingItem;
    
    const newItem: WishlistItem = {
      id: this.generateId(),
      userId,
      productId,
      product,
      createdAt: new Date().toISOString()
    };
    
    wishlist.push(newItem);
    await this.saveData('wishlist.json', wishlist, 'Add to wishlist');
    
    return newItem;
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = await this.fetchData('notifications.json');
    return notifications
      .filter((notification: Notification) => notification.userId === userId)
      .sort((a: Notification, b: Notification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const notifications = await this.fetchData('notifications.json');
    const newNotification: Notification = {
      ...notificationData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    await this.saveData('notifications.json', notifications, 'Add notification');
    
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notifications = await this.fetchData('notifications.json');
    const notification = notifications.find((n: Notification) => n.id === id);
    
    if (!notification) return false;
    
    notification.read = true;
    await this.saveData('notifications.json', notifications, 'Mark notification as read');
    
    return true;
  }

  // Message methods
  async getMessages(userId: string, otherUserId?: string): Promise<Message[]> {
    const messages = await this.fetchData('messages.json');
    
    if (otherUserId) {
      return messages.filter((message: Message) => 
        (message.senderId === userId && message.receiverId === otherUserId) ||
        (message.senderId === otherUserId && message.receiverId === userId)
      ).sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    
    return messages
      .filter((message: Message) => message.senderId === userId || message.receiverId === userId)
      .sort((a: Message, b: Message) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async sendMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const messages = await this.fetchData('messages.json');
    const newMessage: Message = {
      ...messageData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    messages.push(newMessage);
    await this.saveData('messages.json', messages, 'Send message');
    
    return newMessage;
  }

  // Store methods
  async getStores(): Promise<Store[]> {
    const stores = await this.fetchData('stores.json');
    return stores;
  }

  async getStoreById(id: string): Promise<Store | null> {
    const stores = await this.fetchData('stores.json');
    const store = stores.find((store: Store) => store.id === id);
    
    if (store) {
      const products = await this.getProducts({ sellerId: store.ownerId });
      store.products = products;
    }
    
    return store || null;
  }

  // Community methods
  async getCommunityPosts(): Promise<CommunityPost[]> {
    const posts = await this.fetchData('community_posts.json');
    return posts.sort((a: CommunityPost, b: CommunityPost) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createCommunityPost(postData: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommunityPost> {
    const posts = await this.fetchData('community_posts.json');
    const newPost: CommunityPost = {
      ...postData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    posts.push(newPost);
    await this.saveData('community_posts.json', posts, 'Add community post');
    
    return newPost;
  }

  async addCommentToPost(postId: string, commentData: Omit<CommunityComment, 'id' | 'postId' | 'createdAt'>): Promise<CommunityComment> {
    const posts = await this.fetchData('community_posts.json');
    const post = posts.find((p: CommunityPost) => p.id === postId);
    
    if (!post) throw new Error('Post not found');
    
    const newComment: CommunityComment = {
      ...commentData,
      id: this.generateId(),
      postId,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    
    if (!post.comments) post.comments = [];
    post.comments.push(newComment);
    
    await this.saveData('community_posts.json', posts, 'Add comment to post');
    
    return newComment;
  }

  // Generic CRUD operations
  async create(collection: string, data: any): Promise<any> {
    const items = await this.fetchData(`${collection}.json`);
    const newItem = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    items.push(newItem);
    await this.saveData(`${collection}.json`, items, `Add ${collection} item`);
    
    return newItem;
  }

  async update(collection: string, id: string, updates: any): Promise<any> {
    const items = await this.fetchData(`${collection}.json`);
    const index = items.findIndex((item: any) => item.id === id);
    
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveData(`${collection}.json`, items, `Update ${collection} item`);
    
    return items[index];
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const items = await this.fetchData(`${collection}.json`);
    const filteredItems = items.filter((item: any) => item.id !== id);
    
    if (filteredItems.length === items.length) return false;
    
    await this.saveData(`${collection}.json`, filteredItems, `Delete ${collection} item`);
    return true;
  }

  // Analytics methods
  async getSellerAnalytics(sellerId: string): Promise<any> {
    const orders = await this.getOrders();
    const products = await this.getSellerProducts(sellerId);
    
    const sellerOrders = orders.filter(order => 
      order.products?.some(product => 
        products.some(p => p.id === product.productId)
      ) || order.items?.some(item => 
        products.some(p => p.id === item.productId)
      )
    );
    
    const totalRevenue = sellerOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = sellerOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalRevenue,
      totalOrders,
      totalProducts: products.length,
      activeProducts: products.filter(p => p.inventory > 0 && (p.isActive !== false)).length,
      averageOrderValue,
      completedOrders: sellerOrders.filter(o => o.status === 'delivered').length,
      pendingOrders: sellerOrders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length
    };
  }
}

const sdk = new CommerceSDK();
export { sdk };
export default CommerceSDK;
