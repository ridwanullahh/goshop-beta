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
  products?: OrderItem[];
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
  product?: Product;
  productName?: string;
  name?: string;
  images?: string[];
  subtotal?: number;
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
  product?: Product;
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

export interface Post {
  id: string;
  userId: string;
  userName?: string;
  title: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName?: string;
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
  slug: string;
  author: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateLink {
  id: string;
  affiliateId: string;
  productId: string;
  link: string;
  commissionRate: number;
  createdAt: string;
}

export interface Commission {
  id: string;
  affiliateId: string;
  orderId: string;
  amount: number;
  status: string;
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
    [key: string]: any;
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

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return await this.update('orders', orderId, { status });
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const posts = await this.getData('posts');
      posts.push(newPost);
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

  async getAffiliateLinks(affiliateId: string): Promise<AffiliateLink[]> {
    const links = await this.getData('affiliate_links') as AffiliateLink[];
    return links.filter(link => link.affiliateId === affiliateId);
  }

  async getCommissions(affiliateId: string): Promise<Commission[]> {
    const commissions = await this.getData('commissions') as Commission[];
    return commissions.filter(commission => commission.affiliateId === affiliateId);
  }

  async createAffiliateLink(linkData: any): Promise<AffiliateLink> {
    try {
      const newLink: AffiliateLink = {
        ...linkData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      const links = await this.getData('affiliate_links');
      links.push(newLink);
      await this.saveData('affiliate_links', links);
      
      return newLink;
    } catch (error) {
      console.error('Error creating affiliate link:', error);
      throw error;
    }
  }

  // Store methods
  async getStoreProducts(storeId: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(product => product.storeId === storeId);
  }

  // Product reviews
  async getProductReviews(productId: string): Promise<any[]> {
    const reviews = await this.getData('reviews');
    return reviews.filter((review: any) => review.productId === productId);
  }

  // Wallet methods
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
