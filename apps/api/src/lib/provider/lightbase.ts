// Lightbase DataProvider — uses the core /api/v1 documents CRUD + querying API.
// BismiLLAH Ar-Rahman Ar-Roheem. Stores camelCase native values; no snake_case conversion.

import type { DataProvider } from './types';
import {
  listCollections,
  createCollection,
  insertDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
  countDocuments,
} from '../lightbase-client';
import { SCHEMA } from '../schema';

const RESERVED = new Set(['id', '_created_at', '_updated_at', '_revision', '_deleted', '_checksum']);
const MANAGED = new Set(['id', 'createdAt', 'updatedAt', ...RESERVED]);

function sanitizeInput(data: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (MANAGED.has(k)) continue;
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

function mapDoc(doc: any): any {
  if (!doc) return doc;
  const { _created_at, _updated_at, _revision, _deleted, _checksum, ...rest } = doc;
  return {
    ...rest,
    id: doc.id,
    createdAt: _created_at || doc.createdAt,
    updatedAt: _updated_at || doc.updatedAt,
  };
}

function buildFilter(where?: Record<string, any>): any {
  const entries = Object.entries(where || {}).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return undefined;
  if (entries.length === 1) {
    const [field, value] = entries[0];
    return { field, op: 'eq', value };
  }
  return { and: entries.map(([field, value]) => ({ field, op: 'eq', value })) };
}

export class LightbaseProvider implements DataProvider {
  readonly name = 'lightbase';
  private ensured = false;

  async initializeSchema(): Promise<void> {
    if (this.ensured) return;
    const existing = new Set(await listCollections());
    for (const [name, fields] of Object.entries(SCHEMA)) {
      if (existing.has(name)) continue;
      try {
        await createCollection(name, fields as any[]);
      } catch (err: any) {
        // 409 = already exists; ignore. Other errors propagate.
        if (err?.status !== 409 && !/already exist/i.test(err?.message || '')) {
          console.error(`[lightbase] createCollection(${name}) failed:`, err?.message || err);
        }
      }
    }
    this.ensured = true;
  }

  async getAll<T = any>(table: string, where?: Record<string, any>): Promise<T[]> {
    await this.initializeSchema();
    const filter = buildFilter(where);
    const res = await queryDocuments<T>(table, { filter, limit: 1000 });
    return res.data.map((d: any) => mapDoc(d)) as T[];
  }

  async getOne<T = any>(table: string, where: Record<string, any>): Promise<T | undefined> {
    const items = await this.getAll<T>(table, where);
    return items[0];
  }

  async getById<T = any>(table: string, id: string): Promise<T | undefined> {
    await this.initializeSchema();
    const doc = await getDocument<T>(table, id);
    return doc ? (mapDoc(doc) as T) : undefined;
  }

  async insert<T = any>(table: string, data: Record<string, any>): Promise<T> {
    await this.initializeSchema();
    const clean = sanitizeInput(data);
    const doc = await insertDocument<T>(table, clean);
    return mapDoc(doc) as T;
  }

  async update<T = any>(table: string, id: string, data: Record<string, any>): Promise<T | undefined> {
    await this.initializeSchema();
    const clean = sanitizeInput(data);
    const doc = await updateDocument<T>(table, id, clean);
    return doc ? (mapDoc(doc) as T) : undefined;
  }

  async remove(table: string, id: string): Promise<boolean> {
    await this.initializeSchema();
    return deleteDocument(table, id);
  }

  async removeWhere(table: string, where: Record<string, any>): Promise<number> {
    await this.initializeSchema();
    const items = await this.getAll<{ id: string }>(table, where);
    let n = 0;
    for (const it of items) {
      if (await deleteDocument(table, it.id)) n++;
    }
    return n;
  }

  async count(table: string, where?: Record<string, any>): Promise<number> {
    await this.initializeSchema();
    const filter = buildFilter(where);
    return countDocuments(table, filter);
  }

  async searchProducts(searchQuery: string, filters: Record<string, any> = {}): Promise<any[]> {
    await this.initializeSchema();
    const and: any[] = [{ field: 'isActive', op: 'eq', value: true }];
    if (searchQuery) {
      and.push({
        or: [
          { field: 'name', op: 'ilike', value: `%${searchQuery}%` },
          { field: 'description', op: 'ilike', value: `%${searchQuery}%` },
          { field: 'category', op: 'ilike', value: `%${searchQuery}%` },
          { field: 'tags', op: 'contains', value: searchQuery },
        ],
      });
    }
    if (filters.category) and.push({ field: 'category', op: 'eq', value: filters.category });
    if (filters.sellerId) and.push({ field: 'sellerId', op: 'eq', value: filters.sellerId });
    if (filters.storeId) and.push({ field: 'storeId', op: 'eq', value: filters.storeId });
    if (filters.featured) and.push({ field: 'isFeatured', op: 'eq', value: true });
    if (filters.minPrice != null && filters.minPrice !== '')
      and.push({ field: 'price', op: 'gte', value: Number(filters.minPrice) });
    if (filters.maxPrice != null && filters.maxPrice !== '')
      and.push({ field: 'price', op: 'lte', value: Number(filters.maxPrice) });

    const limit = filters.limit ? Number(filters.limit) : 1000;
    const offset = filters.offset ? Number(filters.offset) : 0;
    const opts: any = { filter: { and }, sort: '_created_at:desc', limit };
    if (offset > 0) opts.cursor = { limit, offset };
    const res = await queryDocuments('products', opts);
    return res.data.map((d: any) => mapDoc(d));
  }
}
