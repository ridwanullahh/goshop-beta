interface CloudinaryConfig {
  uploadPreset?: string;
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
}

interface SMTPConfig {
  endpoint?: string;
  from?: string;
  test?: () => Promise<boolean>;
}

interface AuthConfig {
  requireEmailVerification?: boolean;
  otpTriggers?: string[];
}

interface SchemaDefinition {
  required?: string[];
  types?: Record<string, string>;
  defaults?: Record<string, any>;
}

interface UniversalSDKConfig {
  owner: string;
  repo: string;
  token: string;
  branch?: string;
  basePath?: string;
  mediaPath?: string;
  cloudinary?: CloudinaryConfig;
  smtp?: SMTPConfig;
  templates?: Record<string, string>;
  schemas?: Record<string, SchemaDefinition>;
  auth?: AuthConfig;
}

interface User {
  id?: string;
  uid?: string;
  email: string;
  password?: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'seller' | 'customer' | 'affiliate';
  roles?: string[];
  permissions?: string[];
  verified?: boolean;
  onboardingCompleted?: boolean;
  businessName?: string;
  phone?: string;
  address?: any;
  [key: string]: any;
}

interface Session {
  token: string;
  user: User;
  created: number;
}

interface OTPRecord {
  otp: string;
  created: number;
  reason: string;
}

interface AuditLogEntry {
  action: string;
  data: any;
  timestamp: number;
}

interface QueryBuilder<T = any> {
  where(fn: (item: T) => boolean): QueryBuilder<T>;
  sort(field: string, dir?: 'asc' | 'desc'): QueryBuilder<T>;
  project(fields: string[]): QueryBuilder<Partial<T>>;
  exec(): Promise<T[]>;
}

interface MediaAttachment {
  attachmentId: string;
  mimeType: string;
  isInline: boolean;
  url: string;
  name: string;
}

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  [key: string]: any;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from: string;
  headers: Record<string, string>;
}

class UniversalSDK {
  private owner: string;
  private repo: string;
  private token: string;
  private branch: string;
  private basePath: string;
  private mediaPath: string;
  private cloudinary: CloudinaryConfig;
  private smtp: SMTPConfig;
  private templates: Record<string, string>;
  private schemas: Record<string, SchemaDefinition>;
  private authConfig: AuthConfig;
  private sessionStore: Record<string, Session>;
  private otpMemory: Record<string, OTPRecord>;
  private auditLog: Record<string, AuditLogEntry[]>;

  constructor(config: UniversalSDKConfig) {
    this.owner = config.owner;
    this.repo = config.repo;
    this.token = config.token;
    this.branch = config.branch || "main";
    this.basePath = config.basePath || "db";
    this.mediaPath = config.mediaPath || "media";
    this.cloudinary = config.cloudinary || {};
    this.smtp = config.smtp || {};
    this.templates = config.templates || {};
    this.schemas = config.schemas || {};
    this.authConfig = config.auth || { requireEmailVerification: true, otpTriggers: ["register"] };
    this.sessionStore = {};
    this.otpMemory = {};
    this.auditLog = {};
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `token ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  private async request(path: string, method: string = "GET", body: any = null): Promise<any> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}` +
                (method === "GET" ? `?ref=${this.branch}` : "");
    const res = await fetch(url, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : null,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async get<T = any>(collection: string): Promise<T[]> {
    try {
      const res = await this.request(`${this.basePath}/${collection}.json`);
      return JSON.parse(atob(res.content));
    } catch (error: any) {
      if (error.message.includes('404') || error.message.includes('empty')) {
        console.log(`Collection ${collection} doesn't exist, creating it...`);
        await this.initializeCollection(collection);
        return [];
      }
      throw error;
    }
  }

  private async initializeCollection(collection: string): Promise<void> {
    try {
      await this.save(collection, []);
      console.log(`Collection ${collection} created successfully`);
    } catch (error) {
      console.warn(`Failed to create collection ${collection}:`, error);
    }
  }

  async init(): Promise<UniversalSDK> {
    try {
      await this.listCollections();
    } catch (error: any) {
      if (error.message.includes('empty') || error.message.includes('404')) {
        console.log('Repository is empty, initializing basic collections...');
        const basicCollections = [
          'users', 'products', 'orders', 'reviews', 'sellers', 
          'carts', 'wishlists', 'notifications', 'categories', 
          'stores', 'affiliates', 'wallets', 'transactions', 
          'crowdCheckouts', 'posts', 'comments', 'liveStreams',
          'blogs', 'pages', 'help_articles', 'returns_refunds',
          'shipping_info', 'contact_submissions', 'marketing_campaigns',
          'affiliate_links', 'commissions', 'product_variants',
          'product_bundles', 'product_addons'
        ];
        
        for (const collection of basicCollections) {
          await this.initializeCollection(collection);
        }
        
        await this.initializeSampleData();
      } else {
        throw error;
      }
    }
    return this;
  }

  private async listCollections(): Promise<string[]> {
    try {
      const res = await this.request(this.basePath);
      if (Array.isArray(res)) {
        return res.filter(item => item.name.endsWith('.json')).map(item => item.name.replace('.json', ''));
      }
      return [];
    } catch (error: any) {
      if (error.message.includes('empty') || error.message.includes('404')) {
        throw new Error('Repository is empty');
      }
      throw error;
    }
  }

  // Authentication methods
  async register(email: string, password: string, profile: any = {}): Promise<User & { id: string; uid: string }> {
    const users = await this.get<User>('users');
    const existingUser = users.find(u => u.email === email);
    if (existingUser) throw new Error('User already exists');
    
    return this.insert<User>('users', {
      email,
      password, // In production, hash this password
      verified: false,
      role: profile.role || 'customer',
      roles: [profile.role || 'customer'],
      onboardingCompleted: false,
      ...profile
    });
  }

  async login(email: string, password: string): Promise<Session> {
    const users = await this.get<User>('users');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    
    const token = crypto.randomUUID();
    const session: Session = {
      token,
      user,
      created: Date.now()
    };
    
    this.sessionStore[token] = session;
    return session;
  }

  getCurrentUser(token: string): User | null {
    const session = this.sessionStore[token];
    return session ? session.user : null;
  }

  async destroySession(token: string): Promise<void> {
    delete this.sessionStore[token];
  }

  // Helper method for SHA1 hashing (for Cloudinary)
  private async _sha1(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async initializeSampleData(): Promise<void> {
    try {
      // Initialize admin user
      const adminUser = {
        email: 'admin@platform.com',
        password: 'admin123',
        name: 'Platform Admin',
        role: 'admin',
        roles: ['admin'],
        verified: true,
        onboardingCompleted: true
      };
      await this.insert('users', adminUser);

      const categories = [
        { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and electronics' },
        { name: 'Fashion', slug: 'fashion', description: 'Trending fashion items' },
        { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden supplies' },
        { name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories' },
        { name: 'Books', slug: 'books', description: 'Books and educational materials' }
      ];

      for (const category of categories) {
        await this.insert('categories', category);
      }

      // Initialize help articles
      const helpArticles = [
        {
          title: 'Getting Started Guide',
          content: 'Welcome to our platform! This guide will help you get started.',
          category: 'getting-started',
          slug: 'getting-started-guide',
          isPublished: true
        },
        {
          title: 'How to Create Your First Product',
          content: 'Learn how to list your first product on our marketplace.',
          category: 'seller-guide',
          slug: 'create-first-product',
          isPublished: true
        }
      ];

      for (const article of helpArticles) {
        await this.insert('help_articles', article);
      }

      console.log('Sample data initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize sample data:', error);
    }
  }

  async getItem<T = any>(collection: string, key: string): Promise<T | null> {
    const arr = await this.get<T>(collection);
    return arr.find((x: any) => x.id === key || x.uid === key) || null;
  }

  private async save<T = any>(collection: string, data: T[]): Promise<void> {
    let sha: string | undefined;
    try {
      const head = await this.request(`${this.basePath}/${collection}.json`);
      sha = head.sha;
    } catch {}
    await this.request(`${this.basePath}/${collection}.json`, "PUT", {
      message: `Update ${collection}`,
      content: btoa(JSON.stringify(data, null, 2)),
      branch: this.branch,
      ...(sha ? { sha } : {}),
    });
  }

  async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
    const arr = await this.get<T>(collection);
    const schema = this.schemas[collection];
    if (schema?.defaults) item = { ...schema.defaults, ...item };
    this.validateSchema(collection, item);
    const id = (Math.max(0, ...arr.map((x: any) => +x.id || 0)) + 1).toString();
    const newItem = { uid: crypto.randomUUID(), id, ...item } as T & { id: string; uid: string };
    arr.push(newItem);
    await this.save(collection, arr);
    this._audit(collection, newItem, "insert");
    return newItem;
  }

  async bulkInsert<T = any>(collection: string, items: Partial<T>[]): Promise<(T & { id: string; uid: string })[]> {
    const arr = await this.get<T>(collection);
    const results: (T & { id: string; uid: string })[] = [];
    let nextId = Math.max(0, ...arr.map((x: any) => +x.id || 0)) + 1;

    for (const item of items) {
      const schema = this.schemas[collection];
      let processedItem = item;
      if (schema?.defaults) processedItem = { ...schema.defaults, ...item };
      this.validateSchema(collection, processedItem);
      const newItem = { uid: crypto.randomUUID(), id: nextId.toString(), ...processedItem } as T & { id: string; uid: string };
      arr.push(newItem);
      results.push(newItem);
      nextId++;
    }

    await this.save(collection, arr);
    return results;
  }

  async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T | null> {
    const arr = await this.get<T>(collection);
    const index = arr.findIndex((x: any) => x.id === key || x.uid === key);
    if (index === -1) return null;
    arr[index] = { ...arr[index], ...updates };
    await this.save(collection, arr);
    this._audit(collection, arr[index], "update");
    return arr[index];
  }

  async delete(collection: string, key: string): Promise<boolean> {
    const arr = await this.get(collection);
    const index = arr.findIndex((x: any) => x.id === key || x.uid === key);
    if (index === -1) return false;
    const deleted = arr.splice(index, 1)[0];
    await this.save(collection, arr);
    this._audit(collection, deleted, "delete");
    return true;
  }

  queryBuilder<T = any>(collection: string): QueryBuilder<T> {
    let query = this.get<T>(collection);
    const filters: ((item: T) => boolean)[] = [];
    let sortField: string | null = null;
    let sortDir: 'asc' | 'desc' = 'asc';
    let projectionFields: string[] | null = null;

    return {
      where: (fn: (item: T) => boolean) => {
        filters.push(fn);
        return this.queryBuilder(collection);
      },
      sort: (field: string, dir: 'asc' | 'desc' = 'asc') => {
        sortField = field;
        sortDir = dir;
        return this.queryBuilder(collection);
      },
      project: (fields: string[]) => {
        projectionFields = fields;
        return this.queryBuilder(collection);
      },
      exec: async (): Promise<T[]> => {
        let results = await query;
        
        // Apply filters
        for (const filter of filters) {
          results = results.filter(filter);
        }
        
        // Apply sorting
        if (sortField) {
          results.sort((a: any, b: any) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (sortDir === 'asc') {
              return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
              return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
          });
        }
        
        // Apply projection
        if (projectionFields) {
          results = results.map(item => {
            const projected: any = {};
            for (const field of projectionFields) {
              projected[field] = (item as any)[field];
            }
            return projected;
          });
        }
        
        return results;
      }
    };
  }

  private validateSchema(collection: string, item: any): void {
    const schema = this.schemas[collection];
    if (!schema) return;

    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in item) || item[field] === undefined || item[field] === null) {
          throw new Error(`Required field '${field}' is missing in ${collection}`);
        }
      }
    }
  }

  private _audit(collection: string, data: any, action: string): void {
    if (!this.auditLog[collection]) {
      this.auditLog[collection] = [];
    }
    this.auditLog[collection].push({
      action,
      data,
      timestamp: Date.now()
    });
  }
}

interface Product {
  id: string;
  uid: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];
  images: string[];
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

interface Order {
  id: string;
  uid: string;
  userId: string;
  items: OrderItem[];
  total: number;
  shippingAddress: any;
  billingAddress: any;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Seller {
  id: string;
  uid: string;
  userId: string;
  businessName: string;
  description: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default class CommerceSDK {
  public sdk: UniversalSDK;

  constructor() {
    this.sdk = new UniversalSDK({
      owner: 'your-github-username',
      repo: 'your-repo-name', 
      token: 'your-github-token',
      branch: 'main',
      basePath: 'db',
      schemas: {
        users: {
          required: ['email', 'password', 'role'],
          types: {
            email: 'string',
            password: 'string',
            role: 'string',
            name: 'string',
            avatar: 'string',
            roles: 'array',
            permissions: 'array',
            verified: 'boolean',
            onboardingCompleted: 'boolean'
          },
          defaults: {
            role: 'customer',
            roles: ['customer'],
            verified: false,
            onboardingCompleted: false
          }
        },
        products: {
          required: ['name', 'description', 'price', 'category', 'tags', 'images', 'sellerId', 'sellerName', 'inventory', 'rating', 'reviewCount', 'isActive', 'isFeatured'],
          types: {
            name: 'string',
            description: 'string',
            price: 'number',
            category: 'string',
            tags: 'array',
            images: 'array',
            sellerId: 'string',
            sellerName: 'string',
            inventory: 'number',
            rating: 'number',
            reviewCount: 'number',
            isActive: 'boolean',
            isFeatured: 'boolean'
          }
        },
        orders: {
          required: ['userId', 'items', 'total', 'shippingAddress', 'billingAddress', 'status'],
          types: {
            userId: 'string',
            items: 'array',
            total: 'number',
            shippingAddress: 'object',
            billingAddress: 'object',
            status: 'string'
          }
        },
        reviews: {
          required: ['productId', 'userId', 'rating', 'comment'],
          types: {
            productId: 'string',
            userId: 'string',
            rating: 'number',
            comment: 'string'
          }
        },
        sellers: {
          required: ['userId', 'businessName', 'description', 'isVerified'],
          types: {
            userId: 'string',
            businessName: 'string',
            description: 'string',
            isVerified: 'boolean'
          }
        },
        carts: {
          required: ['userId', 'items'],
          types: {
            userId: 'string',
            items: 'array'
          }
        },
        wishlists: {
          required: ['userId', 'items'],
          types: {
            userId: 'string',
            items: 'array'
          }
        },
        notifications: {
          required: ['userId', 'title', 'message', 'isRead'],
          types: {
            userId: 'string',
            title: 'string',
            message: 'string',
            isRead: 'boolean'
          }
        },
        categories: {
          required: ['name', 'slug', 'description'],
          types: {
            name: 'string',
            slug: 'string',
            description: 'string'
          }
        },
        stores: {
          required: ['name', 'slug', 'description', 'sellerId'],
          types: {
            name: 'string',
            slug: 'string',
            description: 'string',
            sellerId: 'string'
          }
        },
        affiliates: {
          required: ['userId', 'commissionRate', 'businessName', 'isActive'],
          types: {
            userId: 'string',
            commissionRate: 'number',
            businessName: 'string',
            isActive: 'boolean'
          }
        },
        wallets: {
          required: ['userId', 'balance'],
          types: {
            userId: 'string',
            balance: 'number'
          }
        },
        transactions: {
          required: ['userId', 'amount', 'type', 'description'],
          types: {
            userId: 'string',
            amount: 'number',
            type: 'string',
            description: 'string'
          }
        },
        crowdCheckouts: {
          required: ['productId', 'targetQuantity', 'currentQuantity', 'discountPercentage', 'endDate'],
          types: {
            productId: 'string',
            targetQuantity: 'number',
            currentQuantity: 'number',
            discountPercentage: 'number',
            endDate: 'string'
          }
        },
        posts: {
          required: ['title', 'content', 'authorId', 'authorName'],
          types: {
            title: 'string',
            content: 'string',
            authorId: 'string',
            authorName: 'string'
          }
        },
        comments: {
          required: ['postId', 'userId', 'userName', 'content'],
          types: {
            postId: 'string',
            userId: 'string',
            userName: 'string',
            content: 'string'
          }
        },
        liveStreams: {
          required: ['title', 'description', 'startTime', 'endTime', 'hostId', 'hostName'],
          types: {
            title: 'string',
            description: 'string',
            startTime: 'string',
            endTime: 'string',
            hostId: 'string',
            hostName: 'string'
          }
        },
        blogs: {
          required: ['title', 'content', 'authorId', 'authorName', 'category', 'slug'],
          types: {
            title: 'string',
            content: 'string',
            authorId: 'string',
            authorName: 'string',
            category: 'string',
            slug: 'string'
          }
        },
        pages: {
          required: ['title', 'content', 'slug'],
          types: {
            title: 'string',
            content: 'string',
            slug: 'string'
          }
        },
        help_articles: {
          required: ['title', 'content', 'category', 'slug', 'isPublished'],
          types: {
            title: 'string',
            content: 'string',
            category: 'string',
            slug: 'string',
            isPublished: 'boolean'
          }
        },
        returns_refunds: {
          required: ['orderId', 'reason', 'status', 'requestDate'],
          types: {
            orderId: 'string',
            reason: 'string',
            status: 'string',
            requestDate: 'string'
          }
        },
        shipping_info: {
          required: ['orderId', 'shippingAddress', 'shippingDate', 'deliveryDate', 'status'],
          types: {
            orderId: 'string',
            shippingAddress: 'object',
            shippingDate: 'string',
            deliveryDate: 'string',
            status: 'string'
          }
        },
        contact_submissions: {
          required: ['name', 'email', 'message', 'submissionDate'],
          types: {
            name: 'string',
            email: 'string',
            message: 'string',
            submissionDate: 'string'
          }
        },
        marketing_campaigns: {
          required: ['name', 'startDate', 'endDate', 'targetAudience', 'budget'],
          types: {
            name: 'string',
            startDate: 'string',
            endDate: 'string',
            targetAudience: 'string',
            budget: 'number'
          }
        },
        affiliate_links: {
          required: ['affiliateId', 'productId', 'link', 'clicks', 'conversions'],
          types: {
            affiliateId: 'string',
            productId: 'string',
            link: 'string',
            clicks: 'number',
            conversions: 'number'
          }
        },
        commissions: {
          required: ['affiliateId', 'orderId', 'amount', 'date'],
          types: {
            affiliateId: 'string',
            orderId: 'string',
            amount: 'number',
            date: 'string'
          }
        },
        product_variants: {
          required: ['productId', 'name', 'sku', 'price', 'inventory'],
          types: {
            productId: 'string',
            name: 'string',
            sku: 'string',
            price: 'number',
            inventory: 'number'
          }
        },
        product_bundles: {
          required: ['name', 'description', 'products', 'discountPercentage'],
          types: {
            name: 'string',
            description: 'string',
            products: 'array',
            discountPercentage: 'number'
          }
        },
        product_addons: {
          required: ['name', 'description', 'price', 'type'],
          types: {
            name: 'string',
            description: 'string',
            price: 'number',
            type: 'string'
          }
        }
      }
    });
  }

  async init(): Promise<CommerceSDK> {
    await this.sdk.init();
    return this;
  }

  // Authentication methods
  async register(email: string, password: string, profile: any = {}): Promise<User & { id: string; uid: string }> {
    return await this.sdk.register(email, password, profile);
  }

  async login(email: string, password: string): Promise<Session> {
    return await this.sdk.login(email, password);
  }

  getCurrentUser(token: string): User | null {
    return this.sdk.getCurrentUser(token);
  }

  async logout(token: string): Promise<void> {
    await this.sdk.destroySession(token);
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await this.sdk.get<Product>('products');
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.sdk.get<Product>('products');
    const searchTerm = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Cart methods
  async getCart(userId: string): Promise<any> {
    const carts = await this.sdk.get('carts');
    return carts.find((cart: any) => cart.userId === userId) || { items: [] };
  }

  // Wishlist methods
  async getWishlist(userId: string): Promise<any> {
    const wishlists = await this.sdk.get('wishlists');
    return wishlists.find((wishlist: any) => wishlist.userId === userId) || { items: [] };
  }

  // Notification methods
  async getNotifications(userId: string): Promise<any[]> {
    const notifications = await this.sdk.get('notifications');
    return notifications.filter((notification: any) => notification.userId === userId);
  }

  // Order methods
  async getOrders(userId: string): Promise<any[]> {
    const orders = await this.sdk.get('orders');
    return orders.filter((order: any) => order.userId === userId);
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<any> {
    const carts = await this.sdk.get('carts');
    let cart = carts.find((cart: any) => cart.userId === userId);
    
    if (!cart) {
      cart = { userId: userId, items: [] };
      carts.push(cart);
    }
    
    const existingItemIndex = cart.items.findIndex((item: any) => item.productId === productId);
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      const product = await this.sdk.getItem('products', productId);
      if (!product) throw new Error('Product not found');
      cart.items.push({ productId, name: product.name, quantity });
    }
    
    await this.sdk.save('carts', carts);
    return cart;
  }

  async removeFromCart(userId: string, productId: string): Promise<any> {
    const carts = await this.sdk.get('carts');
    const cart = carts.find((cart: any) => cart.userId === userId);
    
    if (!cart) return null;
    
    cart.items = cart.items.filter((item: any) => item.productId !== productId);
    await this.sdk.save('carts', carts);
    return cart;
  }

  // Community methods
  async getPosts(): Promise<any[]> {
    return await this.sdk.get('posts');
  }

  async createPost(post: any): Promise<any> {
    return await this.sdk.insert('posts', post);
  }

  async updatePost(id: string, updates: any): Promise<any> {
    return await this.sdk.update('posts', id, updates);
  }

  async getComments(postId: string): Promise<any[]> {
    const comments = await this.sdk.get('comments');
    return comments.filter((comment: any) => comment.postId === postId);
  }

  async createComment(comment: any): Promise<any> {
    return await this.sdk.insert('comments', comment);
  }

  async updateComment(id: string, updates: any): Promise<any> {
    return await this.sdk.update('comments', id, updates);
  }
}
