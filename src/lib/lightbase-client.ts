// BismiLLAH Ar-Rahman Ar-Raheem.
// GoShop browser-direct Lightbase client — Path A blueprint §B3 (Phase 2).
//
// Browser-direct storefront reads (products / collections / cart candidates)
// that coalesce every read issued within a 50 ms window into ONE
// POST /api/v1/projects/:id/batch call, cache responses in IndexedDB keyed by
// an aggregate ETag (304 revalidation = zero data transfer), and expose
// adaptive polling that pauses while the tab is hidden.
//
// SECURITY CONTRACT (blueprint §B3, hard rule):
//   - NO keys are hardcoded in this module or anywhere in the bundle. The
//     client is DISABLED unless a READ-ONLY public key + project id are
//     injected at runtime, either via the constructor or via:
//         window.__GOSHOP_LIGHTBASE__ = { baseUrl, projectId, apiKey };
//     (ops inject this from the Pages project environment — never commit it).
//   - The key is held in memory only; it is never logged, never placed in a
//     URL, and never persisted.
//   - Writes are NOT exposed here. Checkout (initiate-payment,
//     flutterwave-callback, create-order) stays server-side forever.
//   - When the module is not configured, or any call fails, callers degrade
//     gracefully to the existing server-side reads (see wiring in Products.tsx).

const COALESCE_WINDOW_MS = 50;
const MAX_OPS_PER_BATCH = 25;
const CACHE_NAME = 'goshop-lightbase';
const CACHE_STORE = 'responses';
const CACHE_ENTRY_LIMIT = 500;
const DEFAULT_POLL_MS = 15000; // blueprint §B3: 15 s default
const RELAXED_POLL_MS = 30000; // blueprint §B3: 30 s relaxed
const RELAX_AFTER_UNCHANGED = 3;

export interface LightbaseBrowserConfig {
  /** Lightbase engine origin, e.g. https://lightbase.pages.dev */
  baseUrl: string;
  /** Lightbase project id (identifier, not a secret). */
  projectId: string;
  /** READ-ONLY public API key minted for this app origin. */
  apiKey: string;
}

declare global {
  interface Window {
    __GOSHOP_LIGHTBASE__?: Partial<LightbaseBrowserConfig>;
  }
}

export type BatchReadOp =
  | { kind: 'get'; collection: string; id: string; tag: string }
  | {
      kind: 'query';
      collection: string;
      filter?: unknown;
      sort?: unknown;
      limit?: number;
      cursor?: unknown;
      tag: string;
    };

interface PendingRead {
  op: BatchReadOp;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

interface CacheEntry {
  key: string;
  etag: string | null; // aggregate batch ETag this entry was cached under
  opSet: string | null; // signature of the exact op-set that produced `etag`
  body: any;
  cachedAt: number;
}

function stableKey(op: BatchReadOp): string {
  // Deterministic, tag-independent key for the cache + op-set signature.
  const { tag: _tag, ...rest } = op;
  return JSON.stringify(rest);
}

function resolveConfig(explicit?: Partial<LightbaseBrowserConfig>): LightbaseBrowserConfig | null {
  const raw = explicit || (typeof window !== 'undefined' ? window.__GOSHOP_LIGHTBASE__ : undefined);
  if (!raw) return null;
  const baseUrl = (raw.baseUrl || '').replace(/\/+$/, '');
  const projectId = raw.projectId || '';
  const apiKey = raw.apiKey || '';
  if (!baseUrl || !projectId || !apiKey) return null;
  // Never leak keys over plaintext — EXCEPT loopback origins, so the local
  // dev battle test (Vite/static server -> http://localhost:4400) behaves
  // exactly like production (https Pages origin -> https lightbase host).
  const isLoopback = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(baseUrl);
  if (!/^https:\/\//i.test(baseUrl) && !isLoopback) return null;
  return { baseUrl, projectId, apiKey };
}

// ---- Minimal IndexedDB wrapper (no dependencies) ----
function openCache(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null);
    try {
      const req = indexedDB.open(CACHE_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          const store = db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
          store.createIndex('cachedAt', 'cachedAt');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function cacheGetAll(keys: string[]): Promise<Map<string, CacheEntry>> {
  const out = new Map<string, CacheEntry>();
  const db = await openCache();
  if (!db) return out;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(CACHE_STORE, 'readonly');
      const store = tx.objectStore(CACHE_STORE);
      for (const k of keys) {
        const req = store.get(k);
        req.onsuccess = () => {
          if (req.result) out.set(k, req.result as CacheEntry);
        };
      }
      tx.oncomplete = () => resolve(out);
      tx.onerror = () => resolve(out);
      tx.onabort = () => resolve(out);
    } catch {
      resolve(out);
    }
  });
}

async function cachePut(entries: CacheEntry[]): Promise<void> {
  const db = await openCache();
  if (!db || entries.length === 0) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(CACHE_STORE, 'readwrite');
      const store = tx.objectStore(CACHE_STORE);
      for (const e of entries) store.put(e);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
  // Size-bounded eviction (blueprint §B5): drop the oldest entries past the cap.
  try {
    const tx = db.transaction(CACHE_STORE, 'readwrite');
    const store = tx.objectStore(CACHE_STORE);
    const countReq = store.count();
    countReq.onsuccess = () => {
      const excess = countReq.result - CACHE_ENTRY_LIMIT;
      if (excess <= 0) return;
      const cursorReq = store.index('cachedAt').openCursor();
      let removed = 0;
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor || removed >= excess) return;
        cursor.delete();
        removed++;
        cursor.continue();
      };
    };
  } catch {
    /* eviction is best-effort */
  }
}

export class LightbaseBrowserClient {
  private cfg: LightbaseBrowserConfig;
  private queue: PendingRead[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;

  constructor(config: Partial<LightbaseBrowserConfig>) {
    const cfg = resolveConfig(config);
    if (!cfg) throw new Error('Lightbase browser client requires baseUrl, projectId and apiKey.');
    this.cfg = cfg;
  }

  isEnabled(): boolean {
    return true;
  }

  get config(): LightbaseBrowserConfig {
    return this.cfg;
  }

  /** Queue a get; coalesces with sibling reads inside the 50 ms window. */
  get<T = any>(collection: string, id: string, tag?: string): Promise<T> {
    return this.enqueue<T>({ kind: 'get', collection, id, tag: tag || `get:${collection}:${id}` });
  }

  /** Queue a query; coalesces with sibling reads inside the 50 ms window. */
  query<T = any>(
    collection: string,
    filter?: unknown,
    limit?: number,
    tag?: string,
    sort?: unknown
  ): Promise<T[]> {
    const op: BatchReadOp = { kind: 'query', collection, tag: tag || `query:${collection}` };
    if (filter !== undefined) (op as any).filter = filter;
    if (limit !== undefined) (op as any).limit = limit;
    if (sort !== undefined) (op as any).sort = sort;
    return this.enqueue<T[]>(op);
  }

  private enqueue<T = any>(op: BatchReadOp): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ op, resolve: resolve as (v: any) => void, reject });
      // Window full => flush now; otherwise start/keep the 50 ms window.
      if (this.queue.length >= MAX_OPS_PER_BATCH) {
        this.flush();
        return;
      }
      if (this.flushTimer === null) {
        this.flushTimer = setTimeout(() => {
          this.flushTimer = null;
          this.flush();
        }, COALESCE_WINDOW_MS);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.flushing) return; // re-run after the in-flight flush drains
    this.flushing = true;
    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, MAX_OPS_PER_BATCH);
        await this.executeBatch(batch);
      }
    } finally {
      this.flushing = false;
      if (this.queue.length > 0 && this.flushTimer === null) {
        this.flushTimer = setTimeout(() => {
          this.flushTimer = null;
          this.flush();
        }, 0);
      }
    }
  }

  private async executeBatch(batch: PendingRead[]): Promise<void> {
    const keys = batch.map((p) => stableKey(p.op));
    const opSetSignature = JSON.stringify(keys);
    const cached = await cacheGetAll(keys);
    const allCached = batch.every((p) => cached.has(stableKey(p.op)));
    // Revalidate with the aggregate ETag ONLY when the cached entries came
    // from the exact same op-set (the aggregate hash covers the whole batch).
    const first = cached.get(keys[0]!);
    const storedBatchEtag =
      allCached && first?.opSet === opSetSignature ? first.etag ?? null : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: this.cfg.apiKey,
      'x-lightbase-project': this.cfg.projectId,
    };
    if (storedBatchEtag) headers['If-None-Match'] = storedBatchEtag;

    const url = `${this.cfg.baseUrl}/api/v1/projects/${this.cfg.projectId}/batch`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ops: batch.map((p) => p.op) }),
      });
    } catch (err) {
      // Network failure: degrade gracefully to cache when possible.
      for (let i = 0; i < batch.length; i++) {
        const entry = cached.get(keys[i]!);
        if (entry) batch[i]!.resolve(entry.body);
        else batch[i]!.reject(err);
      }
      return;
    }

    // Aggregate 304: every op unchanged — resolve everything from IndexedDB
    // with zero data transfer (blueprint §A2/§B3).
    if (response.status === 304 && allCached) {
      const now = Date.now();
      for (let i = 0; i < batch.length; i++) {
        batch[i]!.resolve(cached.get(keys[i]!)!.body);
      }
      void cachePut(
        batch.map((p, i) => ({ ...cached.get(keys[i]!)!, cachedAt: now }))
      );
      return;
    }

    if (!response.ok) {
      const err = new Error(`Lightbase batch failed (${response.status})`);
      for (let i = 0; i < batch.length; i++) {
        const entry = cached.get(keys[i]!);
        if (entry) batch[i]!.resolve(entry.body);
        else batch[i]!.reject(err);
      }
      return;
    }

    let payload: { results?: Array<Record<string, any>> } = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }
    const results = payload.results || [];
    const etag = response.headers.get('etag');
    const now = Date.now();
    const entries: CacheEntry[] = [];

    for (let i = 0; i < batch.length; i++) {
      const r = results[i];
      if (!r || r.error) {
        const entry = cached.get(keys[i]!);
        if (entry) batch[i]!.resolve(entry.body);
        else batch[i]!.reject(new Error(r?.error || `batch op ${i} failed`));
        continue;
      }
      const body = r.kind === 'get' ? (r.data ?? null) : (r.data ?? []);
      batch[i]!.resolve(body);
      entries.push({
        key: keys[i]!,
        etag: etag ?? null,
        opSet: opSetSignature,
        body,
        cachedAt: now,
      });
    }
    void cachePut(entries);
  }

  /**
   * Adaptive ETag polling (blueprint §B3/§A9): 15 s default, relaxed to 30 s
   * after consecutive unchanged polls, fully paused while document.hidden,
   * with an immediate revalidate on return to visibility.
   *
   * opFactory supplies the read to re-check; onChange receives the fresh
   * result only when it differs from the previous poll (JSON compare).
   * Returns a stop() function.
   */
  watch<T = any>(
    opFactory: () => BatchReadOp,
    onChange: (value: T) => void,
    opts?: { intervalMs?: number; relaxedIntervalMs?: number }
  ): () => void {
    const intervalMs = opts?.intervalMs ?? DEFAULT_POLL_MS;
    const relaxedMs = opts?.relaxedIntervalMs ?? RELAXED_POLL_MS;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    let unchangedStreak = 0;
    let lastJson: string | null = null;
    let inFlight = false;

    const tick = async () => {
      timer = null;
      if (stopped || inFlight) return;
      inFlight = true;
      try {
        const value = await this.enqueue<T>(opFactory());
        const json = JSON.stringify(value);
        if (lastJson !== null && json !== lastJson) {
          onChange(value);
          unchangedStreak = 0;
        } else {
          // Successful poll with no observed change -> relax the cadence.
          unchangedStreak++;
        }
        lastJson = json;
      } catch {
        /* transient failure: keep polling at the current cadence */
      } finally {
        inFlight = false;
        if (!stopped) schedule();
      }
    };

    const schedule = () => {
      if (stopped || timer) return;
      // Pause entirely while the tab is hidden (blueprint §B3).
      if (typeof document !== 'undefined' && document.hidden) return;
      const delay = unchangedStreak >= RELAX_AFTER_UNCHANGED ? relaxedMs : intervalMs;
      timer = setTimeout(tick, delay);
    };

    const onVisibility = () => {
      if (stopped) return;
      if (!document.hidden) {
        // Immediate revalidate on return to visibility, then resume cadence.
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        unchangedStreak = 0;
        void tick();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility);
    }
    schedule();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
  }
}

// ---- Singleton accessor ----
let singleton: LightbaseBrowserClient | null = null;

/**
 * Returns the configured browser-direct client, or null when no runtime
 * config has been injected (window.__GOSHOP_LIGHTBASE__) — callers MUST
 * treat null as "use the normal server-side reads" (graceful fallback).
 */
export function getLightbaseClient(): LightbaseBrowserClient | null {
  if (singleton) return singleton;
  const cfg = resolveConfig();
  if (!cfg) return null;
  try {
    singleton = new LightbaseBrowserClient(cfg);
    return singleton;
  } catch {
    return null;
  }
}

/** Programmatic configuration (constructor-param path). Idempotent. */
export function configureLightbaseClient(config: Partial<LightbaseBrowserConfig>): LightbaseBrowserClient | null {
  const cfg = resolveConfig(config);
  if (!cfg) return null;
  if (!singleton) singleton = new LightbaseBrowserClient(cfg);
  return singleton;
}
