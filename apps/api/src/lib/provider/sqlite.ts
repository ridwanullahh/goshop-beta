// SQLite DataProvider — wraps better-sqlite3 directly (clean implementation).
// BismiLLAH Ar-Rahman Ar-Roheem. Keeps the original database.ts intact for reference / manual switch-back,
// but this provider implements correct, async helpers without the legacy uid bug.

import type { DataProvider } from './types';
import { initializeSchema as sqliteInitSchema, getDb } from '../database.js';

const JSON_FIELDS = new Set([
  'images', 'tags', 'variations', 'variants', 'bundles', 'items', 'address',
  'shippingAddress', 'billingAddress', 'socialMedia', 'policies', 'categories',
  'productIds', 'evidence', 'messages', 'bankDetails', 'variables', 'roles',
  'permissions', 'specifications', 'bannerImages',
]);

const BOOLEAN_FIELDS = new Set([
  'isFeatured', 'isActive', 'isVerified', 'isApproved', 'isPublished', 'verified',
  'onboardingCompleted', 'read', 'isGlobal', 'affiliateEnabled', 'shippingEnabled', 'rtl',
]);

function snakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
}
function camelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
}

function serializeRow(data: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    const k = snakeCase(key);
    if (value === null) {
      out[k] = null;
    } else if (typeof value === 'boolean') {
      out[k] = value ? 1 : 0;
    } else if (typeof value === 'object') {
      out[k] = JSON.stringify(value);
    } else {
      out[k] = value;
    }
  }
  return out;
}

function deserializeRow(row: Record<string, any> | null): Record<string, any> | null {
  if (!row) return row;
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    const cKey = camelCase(key);
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
      try {
        out[cKey] = JSON.parse(value);
      } catch {
        out[cKey] = value;
      }
    } else if (BOOLEAN_FIELDS.has(cKey) && typeof value === 'number') {
      out[cKey] = value === 1;
    } else {
      out[cKey] = value;
    }
  }
  return out;
}

export class SqliteProvider implements DataProvider {
  readonly name = 'sqlite';

  async initializeSchema(): Promise<void> {
    sqliteInitSchema();
  }

  async getAll<T = any>(table: string, where?: Record<string, any>): Promise<T[]> {
    const db = getDb();
    let sql = `SELECT * FROM ${table}`;
    const params: any[] = [];
    if (where && Object.keys(where).length > 0) {
      const conds = Object.entries(where).map(([k, v]) => {
        params.push(v);
        return `${snakeCase(k)} = ?`;
      });
      sql += ` WHERE ${conds.join(' AND ')}`;
    }
    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map((r) => deserializeRow(r)) as T[];
  }

  async getOne<T = any>(table: string, where: Record<string, any>): Promise<T | undefined> {
    const items = await this.getAll<T>(table, where);
    return items[0];
  }

  async getById<T = any>(table: string, id: string): Promise<T | undefined> {
    const db = getDb();
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) as any;
    return (deserializeRow(row) as T) || undefined;
  }

  async insert<T = any>(table: string, data: Record<string, any>): Promise<T> {
    const db = getDb();
    const now = new Date().toISOString();
    const id = data.id || Date.now().toString();
    const rowData = { ...data, id, createdAt: data.createdAt || now, updatedAt: data.updatedAt || now };
    const serialized = serializeRow(rowData);
    const cols = Object.keys(serialized);
    const placeholders = cols.map(() => '?').join(', ');
    const values = cols.map((c) => serialized[c]);
    db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`).run(...values);
    return (await this.getById<T>(table, id)) as T;
  }

  async update<T = any>(table: string, id: string, data: Record<string, any>): Promise<T | undefined> {
    const db = getDb();
    const existing = await this.getById(table, id);
    if (!existing) return undefined;
    const merged = { ...data, updatedAt: new Date().toISOString() };
    const serialized = serializeRow(merged);
    const cols = Object.keys(serialized);
    const setClauses = cols.map((c) => `${c} = ?`).join(', ');
    const values = cols.map((c) => serialized[c]);
    db.prepare(`UPDATE ${table} SET ${setClauses} WHERE id = ?`).run(...values, id);
    return this.getById<T>(table, id);
  }

  async remove(table: string, id: string): Promise<boolean> {
    const db = getDb();
    const res = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    return res.changes > 0;
  }

  async removeWhere(table: string, where: Record<string, any>): Promise<number> {
    const db = getDb();
    const conds = Object.keys(where).map((k) => `${snakeCase(k)} = ?`).join(' AND ');
    const values = Object.values(where);
    const res = db.prepare(`DELETE FROM ${table} WHERE ${conds}`).run(...values);
    return res.changes;
  }

  async count(table: string, where?: Record<string, any>): Promise<number> {
    const db = getDb();
    let sql = `SELECT COUNT(*) as count FROM ${table}`;
    const params: any[] = [];
    if (where && Object.keys(where).length > 0) {
      const conds = Object.entries(where).map(([k, v]) => {
        params.push(v);
        return `${snakeCase(k)} = ?`;
      });
      sql += ` WHERE ${conds.join(' AND ')}`;
    }
    const res = db.prepare(sql).get(...params) as any;
    return res.count;
  }

  async searchProducts(searchQuery: string, filters: Record<string, any> = {}): Promise<any[]> {
    const db = getDb();
    let sql = `SELECT * FROM products WHERE is_active = 1`;
    const params: any[] = [];
    if (searchQuery) {
      sql += ` AND (name LIKE ? OR description LIKE ? OR category LIKE ?)`;
      const q = `%${searchQuery}%`;
      params.push(q, q, q);
    }
    if (filters.category) { sql += ` AND category = ?`; params.push(filters.category); }
    if (filters.sellerId) { sql += ` AND seller_id = ?`; params.push(filters.sellerId); }
    if (filters.storeId) { sql += ` AND store_id = ?`; params.push(filters.storeId); }
    if (filters.featured) { sql += ` AND is_featured = 1`; }
    if (filters.minPrice != null && filters.minPrice !== '') { sql += ` AND price >= ?`; params.push(Number(filters.minPrice)); }
    if (filters.maxPrice != null && filters.maxPrice !== '') { sql += ` AND price <= ?`; params.push(Number(filters.maxPrice)); }
    sql += ` ORDER BY created_at DESC`;
    if (filters.limit) { sql += ` LIMIT ?`; params.push(Number(filters.limit)); }
    if (filters.offset) { sql += ` OFFSET ?`; params.push(Number(filters.offset)); }
    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map((r) => deserializeRow(r)) as any[];
  }
}
