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
  googleId?: string;
  verified?: boolean;
  roles?: string[];
  permissions?: string[];
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
          'crowdCheckouts', 'posts', 'comments', 'liveStreams'
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

  // Authentication methods
  async register(email: string, password: string, profile: any = {}): Promise<User & { id: string; uid: string }> {
    const users = await this.get<User>('users');
    const existingUser = users.find(u => u.email === email);
    if (existingUser) throw new Error('User already exists');
    
    return this.insert<User>('users', {
      email,
      password, // In production, hash this password
      verified: false,
      roles: ['customer'],
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
          sellerId: 'seller1', 
          name: 'Tech Hub Store', 
          slug: 'tech-hub-store',
          description: 'Your one-stop shop for all tech needs',
          logo: '/placeholder.svg',
          banner: '/placeholder.svg'
        },
        { 
          sellerId: 'seller2', 
          name: 'Fashion Forward', 
          slug: 'fashion-forward',
          description: 'Latest fashion trends and styles',
          logo: '/placeholder.svg',
          banner: '/placeholder.svg'
        }
      ];

      for (const store of stores) {
        await this.insert('stores', store);
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
    const schema = this.schemas[collection];
    const base = Math.max(0, ...arr.map((x: any) => +x.id || 0));
    const newItems = items.map((item, i) => {
      if (schema?.defaults) item = { ...schema.defaults, ...item };
      this.validateSchema(collection, item);
      return { uid: crypto.randomUUID(), id: (base + i + 1).toString(), ...item } as T & { id: string; uid: string };
    });
    const result = [...arr, ...newItems];
    await this.save(collection, result);
    newItems.forEach(n => this._audit(collection, n, "insert"));
    return newItems;
  }

  async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
    const arr = await this.get<T>(collection);
    const i = arr.findIndex((x: any) => x.id === key || x.uid === key);
    if (i < 0) throw new Error("Not found");
    const upd = { ...arr[i], ...updates };
    this.validateSchema(collection, upd);
    arr[i] = upd;
    await this.save(collection, arr);
    this._audit(collection, upd, "update");
    return upd;
  }

  async bulkUpdate<T = any>(collection: string, updates: (Partial<T> & { id?: string; uid?: string })[]): Promise<T[]> {
    const arr = await this.get<T>(collection);
    const updatedItems = updates.map(u => {
      const i = arr.findIndex((x: any) => x.id === u.id || x.uid === u.uid);
      if (i < 0) throw new Error(`Item not found: ${u.id || u.uid}`);
      const upd = { ...arr[i], ...u };
      this.validateSchema(collection, upd);
      arr[i] = upd;
      return upd;
    });
    await this.save(collection, arr);
    updatedItems.forEach(u => this._audit(collection, u, "update"));
    return updatedItems;
  }

  async delete<T = any>(collection: string, key: string): Promise<void> {
    const arr = await this.get<T>(collection);
    const filtered = arr.filter((x: any) => x.id !== key && x.uid !== key);
    const deleted = arr.filter((x: any) => x.id === key || x.uid === key);
    await this.save(collection, filtered);
    deleted.forEach(d => this._audit(collection, d, "delete"));
  }

  async bulkDelete<T = any>(collection: string, keys: string[]): Promise<T[]> {
    const arr = await this.get<T>(collection);
    const filtered = arr.filter((x: any) => !keys.includes(x.id) && !keys.includes(x.uid));
    const deleted = arr.filter((x: any) => keys.includes(x.id) || keys.includes(x.uid));
    await this.save(collection, filtered);
    deleted.forEach(d => this._audit(collection, d, "delete"));
    return deleted;
  }

  async cloneItem<T = any>(collection: string, key: string): Promise<T & { id: string; uid: string }> {
    const arr = await this.get<T>(collection);
    const orig = arr.find((x: any) => x.id === key || x.uid === key);
    if (!orig) throw new Error("Not found");
    const { id, uid, ...core } = orig as any;
    return this.insert(collection, core);
  }

  private validateSchema(collection: string, item: any): void {
    const schema = this.schemas[collection];
    if (!schema) throw new Error(`Schema not defined for ${collection}`);
    (schema.required || []).forEach(r => {
      if (!(r in item)) throw new Error(`Missing required: ${r}`);
    });
    Object.entries(item).forEach(([k, v]) => {
      const t = schema.types?.[k];
      if (t) {
        const ok =
          (t === "string" && typeof v === "string") ||
          (t === "number" && typeof v === "number") ||
          (t === "boolean" && typeof v === "boolean") ||
          (t === "object" && typeof v === "object") ||
          (t === "array" && Array.isArray(v)) ||
          (t === "date" && !isNaN(Date.parse(v as string))) ||
          (t === "uuid" && typeof v === "string");
        if (!ok) throw new Error(`Field ${k} should be ${t}`);
      }
    });
  }

  validateAll<T = any>(collection: string, items: T[]): void {
    items.forEach(item => this.validateSchema(collection, item));
  }

  sanitize<T = any>(item: T, allowedFields: string[]): Partial<T> {
    const out: any = {};
    allowedFields.forEach(f => {
      if (f in (item as any)) out[f] = (item as any)[f];
    });
    return out;
  }

  setSchema(collection: string, schema: SchemaDefinition): void {
    this.schemas[collection] = schema;
  }

  getSchema(collection: string): SchemaDefinition | null {
    return this.schemas[collection] || null;
  }

  async collectionExists(collection: string): Promise<boolean> {
    const arr = await this.get(collection);
    return Array.isArray(arr);
  }

  async listCollections(): Promise<string[]> {
    const path = this.basePath;
    const res = await this.request(path);
    return res.map((f: any) => f.name.replace(".json", ""));
  }

  async exportCollection(collection: string): Promise<string> {
    return JSON.stringify(await this.get(collection), null, 2);
  }

  async importCollection<T = any>(collection: string, json: string, overwrite: boolean = false): Promise<T[]> {
    const arr = JSON.parse(json);
    this.validateAll(collection, arr);
    const base = overwrite ? [] : await this.get(collection);
    const processed = arr.map((it: any, i: number) => ({ uid: crypto.randomUUID(), id: (i + 1).toString(), ...it }));
    await this.save(collection, [...base, ...processed]);
    processed.forEach((p: any) => this._audit(collection, p, "insert"));
    return processed;
  }

  async mergeCollections<T = any>(collection: string, json: string, overwrite: boolean = false): Promise<T[]> {
    const imported = await this.importCollection<T>(collection, json, overwrite);
    const existing = await this.get<T>(collection);
    const merged = overwrite ? imported : [...existing, ...imported];
    await this.save(collection, merged);
    return merged;
  }

  async backupCollection(collection: string): Promise<string> {
    const data = await this.exportCollection(collection);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${collection}-backup-${ts}.json`;
    await this.request(`${this.basePath}/backups/${filename}`, "PUT", {
      message: `Backup ${collection}`,
      content: btoa(data),
      branch: this.branch,
    });
    return filename;
  }

  async syncWithRemote<T = any>(collection: string): Promise<T[]> {
    return this.get<T>(collection);
  }

  queryBuilder<T = any>(collection: string): QueryBuilder<T> {
    let chain = Promise.resolve().then(() => this.get<T>(collection));
    const qb: QueryBuilder<T> = {
      where(fn: (item: T) => boolean) { 
        chain = chain.then(arr => arr.filter(fn)); 
        return qb; 
      },
      sort(field: string, dir: 'asc' | 'desc' = "asc") { 
        chain = chain.then(arr => arr.sort((a: any, b: any) => 
          dir === 'asc' ? (a[field] > b[field] ? 1 : -1) : (a[field] < b[field] ? 1 : -1)
        )); 
        return qb; 
      },
      project(fields: string[]) { 
        chain = chain.then(arr => arr.map((item: any) => { 
          const o: any = {}; 
          fields.forEach(f => { 
            if (f in item) o[f] = item[f]
          }); 
          return o 
        })); 
        return qb as QueryBuilder<any>; 
      },
      exec() { return chain; },
    };
    return qb;
  }

  private _audit(collection: string, data: any, action: string): void {
    const logs = this.auditLog[collection] || [];
    logs.push({ action, data, timestamp: Date.now() });
    this.auditLog[collection] = logs.slice(-100); // keep last 100
  }

  status(): Record<string, any> {
    return {
      owner: this.owner,
      repo: this.repo,
      connected: !!this.token,
      collections: Object.keys(this.schemas),
      templates: Object.keys(this.templates),
      time: new Date().toISOString(),
    };
  }

  version(): string {
    return "1.0.0";
  }

  async diagnose(): Promise<Record<string, boolean>> {
    const checks = {
      githubAccess: !!(await this.listCollections().catch(() => false)),
      sessionStore: typeof this.sessionStore === "object",
      schemas: Object.keys(this.schemas).length > 0,
    };
    return checks;
  }

  throttle<T extends (...args: any[]) => any>(fn: T, wait: number = 1000): (...args: Parameters<T>) => ReturnType<T> | undefined {
    let last = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        return fn(...args);
      }
    };
  }

  setConfig(key: keyof this, value: any): void {
    (this as any)[key] = value;
  }

  getConfig(key: keyof this): any {
    return (this as any)[key];
  }

  getSystemInfo(): Record<string, string> {
    return {
      platform: (globalThis as any).navigator?.platform || "server",
      userAgent: (globalThis as any).navigator?.userAgent || "node",
      sdkVersion: this.version(),
    };
  }

  async uploadToCloudinary(file: File, folder: string = ""): Promise<CloudinaryUploadResult> {
    if (!this.cloudinary.uploadPreset || !this.cloudinary.cloudName) {
      throw new Error("Cloudinary configuration is incomplete.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", this.cloudinary.uploadPreset);
    if (folder) formData.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/upload`,
      { method: "POST", body: formData }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Upload failed.");
    return json;
  }

  async uploadMediaFile(file: File, folder: string = this.mediaPath): Promise<CloudinaryUploadResult> {
    return this.uploadToCloudinary(file, folder);
  }

  getMediaFile(publicId: string, options: string = ""): string {
    if (!this.cloudinary.cloudName) {
      throw new Error("Cloudinary cloudName not set.");
    }
    return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${options}/${publicId}`;
  }

  async deleteMediaFile(publicId: string, apiKey: string = this.cloudinary.apiKey!, apiSecret: string = this.cloudinary.apiSecret!): Promise<any> {
    if (!apiKey || !apiSecret || !this.cloudinary.cloudName) {
      throw new Error("Delete requires apiKey, apiSecret and cloudName (use from secure backend).");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = await this._sha1(stringToSign);

    const body = new URLSearchParams({
      public_id: publicId,
      api_key: apiKey,
      timestamp: timestamp.toString(),
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/image/destroy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Delete failed.");
    return json;
  }

  async listMediaFiles(tag: string = "", max: number = 30): Promise<any[]> {
    if (!this.cloudinary.apiKey || !this.cloudinary.apiSecret || !this.cloudinary.cloudName) {
      throw new Error("List requires apiKey, apiSecret, and cloudName.");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = tag ? `max_results=${max}&prefix=${tag}&timestamp=${timestamp}${this.cloudinary.apiSecret}`
                             : `max_results=${max}&timestamp=${timestamp}${this.cloudinary.apiSecret}`;
    const signature = await this._sha1(stringToSign);

    const body = new URLSearchParams({
      max_results: max.toString(),
      ...(tag && { prefix: tag }),
      api_key: this.cloudinary.apiKey!,
      timestamp: timestamp.toString(),
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/resources/image`,
      {
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "List failed.");
    return json.resources;
  }

  async renameMediaFile(fromPublicId: string, toPublicId: string): Promise<any> {
    if (!this.cloudinary.apiKey || !this.cloudinary.apiSecret || !this.cloudinary.cloudName) {
      throw new Error("Rename requires apiKey, apiSecret, and cloudName.");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `from_public_id=${fromPublicId}&to_public_id=${toPublicId}&timestamp=${timestamp}${this.cloudinary.apiSecret}`;
    const signature = await this._sha1(stringToSign);

    const body = new URLSearchParams({
      from_public_id: fromPublicId,
      to_public_id: toPublicId,
      api_key: this.cloudinary.apiKey!,
      timestamp: timestamp.toString(),
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/image/rename`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Rename failed.");
    return json;
  }

  async getMediaMetadata(publicId: string): Promise<any> {
    if (!this.cloudinary.apiKey || !this.cloudinary.apiSecret || !this.cloudinary.cloudName) {
      throw new Error("Metadata fetch requires apiKey, apiSecret, and cloudName.");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${this.cloudinary.apiSecret}`;
    const signature = await this._sha1(stringToSign);

    const query = new URLSearchParams({
      public_id: publicId,
      api_key: this.cloudinary.apiKey!,
      timestamp: timestamp.toString(),
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/resources/image/upload/${publicId}?${query}`
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Metadata fetch failed.");
    return json;
  }

  transformMedia(publicId: string, options: string = "w_600,c_fill"): string {
    if (!this.cloudinary.cloudName) {
      throw new Error("Cloudinary cloudName is missing.");
    }
    return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${options}/${publicId}`;
  }


  destroyInstance(): void {
    Object.keys(this).forEach(k => delete (this as any)[k]);
  }

  reset(): void {
    this.sessionStore = {};
    this.otpMemory = {};
    this.auditLog = {};
  }

  isReady(): boolean {
    return !!(this.owner && this.repo && this.token);
  }

  async waitForReady(maxWait: number = 5000): Promise<boolean> {
    const start = Date.now();
    while (!this.isReady()) {
      if (Date.now() - start > maxWait) throw new Error("SDK not ready");
      await new Promise(res => setTimeout(res, 100));
    }
    return true;
  }
}

export default UniversalSDK;
export type { 
  UniversalSDKConfig, 
  CloudinaryConfig, 
  SMTPConfig, 
  AuthConfig, 
  SchemaDefinition, 
  User, 
  Session, 
  QueryBuilder,
  CloudinaryUploadResult,
  MediaAttachment
};
