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
  walletBalance?: number;
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
    this.cloudinary = config.cloudinary || {
      cloudName: 'demo',
      uploadPreset: 'demo'
    };
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

  async uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.cloudinary.uploadPreset || 'demo');
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  }

  async get<T = any>(collection: string): Promise<T[]> {
    try {
      const res = await this.request(`${this.basePath}/${collection}.json`);
      const content = JSON.parse(atob(res.content));
      return Array.isArray(content) ? content : [];
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
          'product_bundles', 'product_addons', 'messages'
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

  async register(userData: any): Promise<User & { id: string; uid: string }> {
    const users = await this.get<User>('users');
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) throw new Error('User already exists');
    
    return this.insert<User>('users', {
      email: userData.email,
      password: userData.password,
      verified: false,
      role: userData.role || 'customer',
      roles: [userData.role || 'customer'],
      onboardingCompleted: false,
      walletBalance: 0,
      businessName: userData.businessName || '',
      ...userData
    });
  }

  async login(credentials: { email: string; password: string }): Promise<Session> {
    const users = await this.get<User>('users');
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
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

  async getCurrentUser(): Promise<User | null> {
    const users = await this.get<User>('users');
    return users.length > 0 ? users[0] : null;
  }

  async destroySession(token: string): Promise<void> {
    delete this.sessionStore[token];
  }

  async getProducts(filters?: any): Promise<any[]> {
    const products = await this.get('products');
    if (!filters) return products;
    
    let filtered = products;
    if (filters.featured) {
      filtered = filtered.filter(p => p.featured === true);
    }
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    return filtered;
  }

  async getOrders(userId?: string): Promise<any[]> {
    const orders = await this.get('orders');
    if (userId) {
      return orders.filter(order => order.userId === userId);
    }
    return orders;
  }

  async getStores(): Promise<any[]> {
    return await this.get('stores');
  }

  async getCategories(): Promise<any[]> {
    return await this.get('categories');
  }

  async getNotifications(userId: string): Promise<any[]> {
    const notifications = await this.get('notifications');
    return notifications.filter(n => n.userId === userId);
  }

  async getWishlist(userId: string): Promise<any[]> {
    const wishlists = await this.get('wishlists');
    return wishlists.filter(w => w.userId === userId);
  }

  async getMessages(userId: string): Promise<any[]> {
    const messages = await this.get('messages');
    return messages.filter(m => m.userId === userId || m.recipientId === userId);
  }

  async searchProducts(query: string): Promise<any[]> {
    const products = await this.get('products');
    const searchTerm = query.toLowerCase();
    
    return products.filter(product => 
      product.name?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm)
    );
  }

  private async initializeSampleData(): Promise<void> {
    try {
      const adminUser = {
        email: 'admin@platform.com',
        password: 'admin123',
        name: 'Platform Admin',
        role: 'admin',
        roles: ['admin'],
        verified: true,
        onboardingCompleted: true,
        walletBalance: 0
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

      const stores = [
        {
          name: 'Tech Hub Store',
          slug: 'tech-hub-store',
          description: 'Your one-stop shop for the latest technology and gadgets',
          rating: 4.8,
          reviewCount: 1234,
          location: 'New York, NY',
          verified: true,
          ownerId: '1',
          products: [],
          followers: 5420,
          following: 12,
          totalSales: 15680,
          joinedDate: '2023-01-15',
          categories: ['Electronics', 'Gadgets'],
          policies: {
            shipping: 'Free shipping on orders over $50',
            returns: '30-day return policy',
            warranty: '1-year manufacturer warranty'
          }
        }
      ];

      for (const store of stores) {
        await this.insert('stores', store);
      }

      const helpArticles = [
        {
          title: 'Getting Started Guide',
          content: 'Welcome to our platform! This guide will help you get started.',
          category: 'getting-started',
          slug: 'getting-started-guide',
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

  async insert<T = any>(collection: string, data: Partial<T>): Promise<T & { id: string; uid: string }> {
    const items = await this.get<T>(collection);
    const newItem = {
      uid: crypto.randomUUID(),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data
    };
    
    const updatedItems = [...items, newItem];
    await this.save(collection, updatedItems);
    
    return newItem as unknown as T & { id: string; uid: string };
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
      const newItem = { uid: crypto.randomUUID(), id: nextId.toString(), createdAt: new Date().toISOString(), ...processedItem } as T & { id: string; uid: string };
      arr.push(newItem);
      results.push(newItem);
      nextId++;
    }

    await this.save(collection, arr);
    return results;
  }

  async update<T = any>(collection: string, id: string, data: Partial<T>): Promise<T & { id: string; uid: string }> {
    const items = await this.get<T>(collection);
    const index = items.findIndex((item: any) => item.id === id || item.uid === id);
    if (index === -1) throw new Error('Item not found');
    
    const updatedItem = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    items[index] = updatedItem;
    await this.save(collection, items);
    
    return updatedItem as unknown as T & { id: string; uid: string };
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
        
        for (const filter of filters) {
          results = results.filter(filter);
        }
        
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

  async getItem<T = any>(collection: string, id: string): Promise<T | null> {
    const items = await this.get<T>(collection);
    const item = items.find((item: any) => item.id === id || item.uid === id);
    return item || null;
  }
}

export { UniversalSDK };
export default UniversalSDK;
