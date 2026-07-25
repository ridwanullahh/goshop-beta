import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(process.cwd(), '../../data/goshop.db');
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

export function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      uid TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT,
      first_name TEXT,
      last_name TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'customer',
      roles TEXT DEFAULT '["customer"]',
      onboarding_completed INTEGER DEFAULT 0,
      business_name TEXT,
      phone TEXT,
      address TEXT,
      verified INTEGER DEFAULT 0,
      permissions TEXT,
      wallet_balance REAL DEFAULT 0,
      language TEXT DEFAULT 'en',
      currency TEXT DEFAULT 'USD',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      uid TEXT UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      images TEXT DEFAULT '[]',
      price REAL NOT NULL DEFAULT 0,
      original_price REAL,
      discount REAL DEFAULT 0,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      category TEXT,
      store_id TEXT,
      seller_id TEXT,
      seller_name TEXT,
      inventory INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      is_featured INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      sku TEXT,
      weight REAL,
      dimensions TEXT,
      shipping_class TEXT,
      seo_title TEXT,
      seo_description TEXT,
      meta_keywords TEXT,
      sold_count INTEGER DEFAULT 0,
      cloudinary_id TEXT,
      type TEXT DEFAULT 'simple',
      variations TEXT DEFAULT '[]',
      variants TEXT DEFAULT '[]',
      bundles TEXT DEFAULT '[]',
      shipping_enabled INTEGER DEFAULT 1,
      shipping_cost REAL DEFAULT 0,
      affiliate_enabled INTEGER DEFAULT 0,
      affiliate_commission REAL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      total REAL NOT NULL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      platform_commission REAL DEFAULT 0,
      affiliate_commission REAL DEFAULT 0,
      shipping_total REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      remaining_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      payment_method TEXT,
      shipping_address TEXT,
      billing_address TEXT,
      seller_id TEXT,
      transaction_ref TEXT,
      delivery_method TEXT DEFAULT 'shipping',
      tracking_number TEXT,
      delivered_at TEXT,
      affiliate_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      logo TEXT,
      banner TEXT,
      address TEXT,
      owner_id TEXT,
      seller_id TEXT,
      slug TEXT UNIQUE NOT NULL,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      product_count INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 0,
      location TEXT,
      established TEXT,
      total_sales REAL DEFAULT 0,
      business_type TEXT,
      website TEXT,
      phone TEXT,
      email TEXT,
      social_media TEXT DEFAULT '{}',
      policies TEXT DEFAULT '{}',
      categories TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT,
      user_avatar TEXT,
      role TEXT DEFAULT 'seller',
      content TEXT,
      images TEXT DEFAULT '[]',
      product_ids TEXT DEFAULT '[]',
      store_id TEXT,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT,
      user_avatar TEXT,
      content TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      wallet_id TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      order_id TEXT,
      product_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (wallet_id) REFERENCES wallets(id)
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      excerpt TEXT,
      slug TEXT UNIQUE NOT NULL,
      author TEXT,
      author_id TEXT,
      store_id TEXT,
      store_name TEXT,
      category TEXT,
      tags TEXT DEFAULT '[]',
      featured_image TEXT,
      is_published INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS help_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT,
      slug TEXT UNIQUE NOT NULL,
      is_published INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      title TEXT,
      content TEXT,
      images TEXT DEFAULT '[]',
      is_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS affiliate_links (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      collection_id TEXT,
      code TEXT UNIQUE NOT NULL,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      earnings REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS affiliate_collections (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      product_ids TEXT DEFAULT '[]',
      link_code TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refund_requests (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      amount REAL NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      evidence TEXT DEFAULT '[]',
      resolved_at TEXT,
      resolved_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      refund_request_id TEXT,
      customer_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      admin_id TEXT,
      status TEXT DEFAULT 'open',
      messages TEXT DEFAULT '[]',
      resolution TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_type TEXT DEFAULT 'customer',
      amount REAL NOT NULL,
      bank_details TEXT,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      processed_at TEXT,
      processed_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS platform_commissions (
      id TEXT PRIMARY KEY,
      percentage REAL NOT NULL DEFAULT 5,
      category TEXT,
      is_global INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS seller_agreements (
      id TEXT PRIMARY KEY,
      version TEXT,
      content TEXT,
      variables TEXT DEFAULT '{}',
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS livestreams (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      product_ids TEXT DEFAULT '[]',
      status TEXT DEFAULT 'scheduled',
      start_time TEXT,
      end_time TEXT,
      agora_token TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS languages (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS currencies (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      exchange_rate REAL NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
  `);
}

export function getDb() {
  return db;
}

export function getAll<T = any>(table: string, where?: Record<string, any>): T[] {
  let sql = `SELECT * FROM ${table}`;
  const params: any[] = [];

  if (where && Object.keys(where).length > 0) {
    const conditions = Object.entries(where).map(([key, value]) => {
      params.push(value);
      return `${snakeCase(key)} = ?`;
    });
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  const rows = db.prepare(sql).all(...params) as any[];
  return rows.map(row => deserializeRow(row));
}

export function getOne<T = any>(table: string, where: Record<string, any>): T | undefined {
  const results = getAll<T>(table, where);
  return results[0];
}

export function getById<T = any>(table: string, id: string): T | undefined {
  return getOne<T>(table, { id });
}

export function insert<T = any>(table: string, data: Record<string, any>): T {
  const now = new Date().toISOString();
  const id = data.id || Date.now().toString();
  const uid = data.uid || crypto.randomUUID();
  const rowData = { ...data, id, uid, createdAt: data.createdAt || now, updatedAt: data.updatedAt || now };

  const serialized = serializeRow(rowData);
  const columns = Object.keys(serialized);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map(col => serialized[col]);

  const sql = `INSERT INTO ${table} (${columns.map(snakeCase).join(', ')}) VALUES (${placeholders})`;
  db.prepare(sql).run(...values);

  return getById<T>(table, id)!;
}

export function update<T = any>(table: string, id: string, data: Record<string, any>): T | undefined {
  const existing = getById(table, id);
  if (!existing) return undefined;

  const now = new Date().toISOString();
  const updatedData = { ...data, updatedAt: now };
  const serialized = serializeRow(updatedData);

  const setClauses = Object.keys(serialized).map(col => `${snakeCase(col)} = ?`).join(', ');
  const values = [...Object.values(serialized), id];

  const sql = `UPDATE ${table} SET ${setClauses} WHERE id = ?`;
  db.prepare(sql).run(...values);

  return getById<T>(table, id);
}

export function remove(table: string, id: string): boolean {
  const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function removeWhere(table: string, where: Record<string, any>): number {
  const conditions = Object.entries(where).map(([key]) => `${snakeCase(key)} = ?`).join(' AND ');
  const values = Object.values(where);
  const result = db.prepare(`DELETE FROM ${table} WHERE ${conditions}`).run(...values);
  return result.changes;
}

export function query<T = any>(table: string, sql: string, params: any[] = []): T[] {
  const rows = db.prepare(sql).all(...params) as any[];
  return rows.map(row => deserializeRow(row));
}

export function execute(sql: string, params: any[] = []) {
  return db.prepare(sql).run(...params);
}

export function count(table: string, where?: Record<string, any>): number {
  let sql = `SELECT COUNT(*) as count FROM ${table}`;
  const params: any[] = [];

  if (where && Object.keys(where).length > 0) {
    const conditions = Object.entries(where).map(([key, value]) => {
      params.push(value);
      return `${snakeCase(key)} = ?`;
    });
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  const result = db.prepare(sql).get(...params) as any;
  return result.count;
}

export function searchProducts(searchQuery: string, filters: Record<string, any> = {}): any[] {
  let sql = `SELECT * FROM products WHERE is_active = 1`;
  const params: any[] = [];

  if (searchQuery) {
    sql += ` AND (name LIKE ? OR description LIKE ? OR category LIKE ?)`;
    const q = `%${searchQuery}%`;
    params.push(q, q, q);
  }

  if (filters.category) {
    sql += ` AND category = ?`;
    params.push(filters.category);
  }
  if (filters.sellerId) {
    sql += ` AND seller_id = ?`;
    params.push(filters.sellerId);
  }
  if (filters.featured) {
    sql += ` AND is_featured = 1`;
  }
  if (filters.minPrice) {
    sql += ` AND price >= ?`;
    params.push(filters.minPrice);
  }
  if (filters.maxPrice) {
    sql += ` AND price <= ?`;
    params.push(filters.maxPrice);
  }

  sql += ` ORDER BY created_at DESC`;

  if (filters.limit) {
    sql += ` LIMIT ?`;
    params.push(Number(filters.limit));
  }
  if (filters.offset) {
    sql += ` OFFSET ?`;
    params.push(Number(filters.offset));
  }

  return query('products', sql, params);
}

function snakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function camelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

const JSON_FIELDS = new Set([
  'images', 'tags', 'variations', 'variants', 'bundles', 'items', 'address',
  'shippingAddress', 'billingAddress', 'socialMedia', 'policies', 'categories',
  'tags', 'productIds', 'evidence', 'messages', 'bankDetails', 'variables',
  'roles', 'permissions'
]);

function serializeRow(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    const snakeKey = snakeCase(key);
    if (typeof value === 'object' && value !== null && !Array.isArray(value) === false) {
      result[snakeKey] = JSON.stringify(value);
    } else if (typeof value === 'boolean') {
      result[snakeKey] = value ? 1 : 0;
    } else if (JSON_FIELDS.has(key) && typeof value === 'string') {
      result[snakeKey] = value;
    } else if (JSON_FIELDS.has(key) && typeof value !== 'string') {
      result[snakeKey] = JSON.stringify(value);
    } else {
      result[snakeKey] = value;
    }
  }
  return result;
}

function deserializeRow(row: Record<string, any>): Record<string, any> {
  if (!row) return row;
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = camelCase(key);
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
      try {
        result[camelKey] = JSON.parse(value);
      } catch {
        result[camelKey] = value;
      }
    } else if (key.endsWith('_at') && value) {
      result[camelKey] = value;
    } else if (typeof value === 'number' && (key === 'is_featured' || key === 'is_active' || key === 'is_verified' || key === 'is_approved' || key === 'is_published' || key === 'verified' || key === 'onboarding_completed' || key === 'read' || key === 'is_global' || key === 'affiliate_enabled' || key === 'shipping_enabled')) {
      result[camelKey] = value === 1;
    } else {
      result[camelKey] = value;
    }
  }
  return result;
}

export function backupDatabase(backupPath: string): void {
  const backupDb = new Database(backupPath);
  db.backup(backupDb).then(() => {
    backupDb.close();
  });
}

export default db;
