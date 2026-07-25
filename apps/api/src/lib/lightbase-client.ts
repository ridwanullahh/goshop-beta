// Lightbase core /api/v1 HTTP client.
// BismiLLAH Ar-Rahman Ar-Roheem. Production-grade, no secrets in code.

export interface LightbaseConfig {
  baseUrl: string;
  apiKey: string;
  projectId: string;
}

function readConfig(): LightbaseConfig {
  const baseUrl = (process.env.LIGHTBASE_BASE_URL || '').replace(/\/$/, '');
  const apiKey = process.env.LIGHTBASE_API_KEY || '';
  const projectId = process.env.LIGHTBASE_PROJECT_ID || '';
  if (!baseUrl || !apiKey || !projectId) {
    throw new Error(
      'Lightbase is not configured. Set LIGHTBASE_BASE_URL, LIGHTBASE_API_KEY and LIGHTBASE_PROJECT_ID.'
    );
  }
  return { baseUrl, apiKey, projectId };
}

let cachedConfig: LightbaseConfig | null = null;
function config(): LightbaseConfig {
  if (!cachedConfig) cachedConfig = readConfig();
  return cachedConfig;
}

export function getLightbaseConfig(): LightbaseConfig {
  return config();
}

function headers(): Record<string, string> {
  const c = config();
  return {
    apikey: c.apiKey,
    'x-lightbase-project': c.projectId,
    'Content-Type': 'application/json',
  };
}

function collectionUrl(collection: string, id?: string): string {
  const c = config();
  const base = `${c.baseUrl}/api/v1/projects/${c.projectId}/collections/${collection}`;
  return id ? `${base}/${id}` : base;
}

function docsUrl(collection: string): string {
  const c = config();
  return `${c.baseUrl}/api/v1/projects/${c.projectId}/collections/${collection}/docs`;
}

function collectionsUrl(): string {
  const c = config();
  return `${c.baseUrl}/api/v1/projects/${c.projectId}/collections`;
}

function seedUrl(): string {
  const c = config();
  return `${c.baseUrl}/api/v1/projects/${c.projectId}/seed`;
}

async function parseJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export class LightbaseError extends Error {
  status: number;
  body: any;
  constructor(message: string, status: number, body: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T = any>(
  method: string,
  url: string,
  body?: any,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { ...headers(), ...(extraHeaders || {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await parseJson(res);
  if (!res.ok) {
    const msg =
      (data && (data.error?.message || data.message || data.error)) ||
      `Lightbase request failed (${res.status})`;
    throw new LightbaseError(typeof msg === 'string' ? msg : JSON.stringify(msg), res.status, data);
  }
  return data as T;
}

// ---- Collections ----
export async function listCollections(): Promise<string[]> {
  const data = await request<any>('GET', collectionsUrl());
  return (data.collections || []).map((c: any) => c.name || c.id || c);
}

export async function createCollection(name: string, fields: any[], indexes?: any[]): Promise<any> {
  return request<any>('POST', collectionsUrl(), { name, fields, indexes: indexes || [] });
}

export async function deleteCollection(name: string): Promise<any> {
  return request<any>('DELETE', collectionUrl(name));
}

// ---- Documents ----
export async function insertDocument<T = any>(collection: string, doc: Record<string, any>): Promise<T> {
  const data = await request<any>('POST', collectionUrl(collection), doc);
  // Response shape: { document: {...} }
  return (data?.document ?? data) as T;
}

export async function getDocument<T = any>(collection: string, id: string): Promise<T | null> {
  try {
    const data = await request<any>('GET', collectionUrl(collection, id));
    return (data?.document ?? data) as T;
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function updateDocument<T = any>(
  collection: string,
  id: string,
  patch: Record<string, any>,
  revision?: number
): Promise<T | null> {
  const extra = revision ? { 'If-Match': String(revision) } : undefined;
  try {
    const data = await request<any>('PATCH', collectionUrl(collection, id), patch, extra);
    return (data?.document ?? data) as T;
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function deleteDocument(collection: string, id: string): Promise<boolean> {
  try {
    await request<any>('DELETE', collectionUrl(collection, id));
    return true;
  } catch (err: any) {
    if (err?.status === 404) return false;
    throw err;
  }
}

// ---- Querying ----
export interface QueryOptions {
  filter?: any;
  sort?: string;
  limit?: number;
  cursor?: any;
  count?: boolean;
  select?: string;
}

export interface QueryResult<T> {
  data: T[];
  nextCursor?: any;
  total?: number;
  hasMore?: boolean;
  count?: number;
}

export async function queryDocuments<T = any>(collection: string, opts: QueryOptions = {}): Promise<QueryResult<T>> {
  const params = new URLSearchParams();
  if (opts.filter) params.set('filter', JSON.stringify(opts.filter));
  if (opts.sort) params.set('sort', opts.sort);
  if (opts.limit != null) params.set('limit', String(opts.limit));
  if (opts.cursor) params.set('cursor', JSON.stringify(opts.cursor));
  if (opts.count) params.set('count', 'true');
  if (opts.select) params.set('select', opts.select);
  const url = `${docsUrl(collection)}?${params.toString()}`;
  const data = await request<any>('GET', url);
  return {
    data: (data?.data ?? []) as T[],
    nextCursor: data?.nextCursor,
    total: data?.total,
    hasMore: data?.hasMore,
    count: data?.count,
  };
}

export async function countDocuments(collection: string, filter?: any): Promise<number> {
  const res = await queryDocuments(collection, { filter, count: true, limit: 0 });
  if (res.count != null) return res.count;
  if (res.total != null) return res.total;
  return res.data.length;
}

// ---- Seed ----
export async function seedDocuments(
  collection: string,
  documents: Record<string, any>[],
  dedupOn?: string[]
): Promise<{ inserted: number; skipped: number; errors: any[] }> {
  const data = await request<any>('POST', seedUrl(), {
    collection,
    documents,
    dedupOn: dedupOn || [],
  });
  return {
    inserted: data?.inserted ?? 0,
    skipped: data?.skipped ?? 0,
    errors: data?.errors ?? [],
  };
}

// ---- Health ----
export async function ping(): Promise<boolean> {
  try {
    const c = config();
    await request<any>('GET', `${c.baseUrl}/api/v1/projects/${c.projectId}`);
    return true;
  } catch {
    return false;
  }
}
