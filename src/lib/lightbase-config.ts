// BismiLLAH Ar-Rahman Ar-Raheem.
// GoShop static-architecture config — the single wiring point between the SPA
// and lightbase. The CF Pages deployment is 100% static: every dynamic need
// goes to lightbase Edge Functions (invoke) or lightbase REST (browser-direct
// catalog reads via the read-only key).
//
// Build-time env (see .env.example):
//   VITE_LIGHTBASE_URL         engine origin. Default is the live lightbase
//                              host; set to http://localhost:4400 for local dev.
//   VITE_LIGHTBASE_PROJECT     project id (identifier, not a secret).
//   VITE_LIGHTBASE_BROWSER_KEY optional READ-ONLY key for browser-direct
//                              catalog reads. Secrets are NEVER committed —
//                              bake this at build time from the deploy env.
// A runtime override stays possible: a script in index.html may set
// window.__GOSHOP_LIGHTBASE__ BEFORE the bundle loads (it wins over the
// build-time key; see lightbase-client.ts).

import { configureLightbaseClient } from './lightbase-client';

const env = ((import.meta as any).env || {}) as Record<string, string | undefined>;

export const LIGHTBASE_URL = String(
  env.VITE_LIGHTBASE_URL || 'https://lightbase-10133292663.development.catalystappsail.com'
).replace(/\/+$/, '');

export const LIGHTBASE_PROJECT_ID = String(env.VITE_LIGHTBASE_PROJECT || 'goshop-beta');

export const LIGHTBASE_BROWSER_KEY = String(env.VITE_LIGHTBASE_BROWSER_KEY || '');

export const LIGHTBASE_FUNCTION_BASE = `${LIGHTBASE_URL}/api/v1/projects/${LIGHTBASE_PROJECT_ID}/functions`;

export type InvokeEnvelope = { body?: unknown; headers?: Record<string, string> };

/**
 * Invoke a GoShop Edge Function. All functions are auth:public and enforce
 * their own session checks — authenticated calls pass the app JWT through
 * `headers.authorization` (the engine only forwards the explicit envelope).
 *
 * Response shapes (engine `invoke` route):
 *   - GoShop handlers use the `{ __response }` raw takeover, so the HTTP body
 *     IS the handler's payload ({ user, token } / { error } / arrays) with the
 *     handler's real status code (200/201/401/403/404/409/500).
 *   - A handler returning a plain value (none today) surfaces as the engine
 *     envelope { ok, result, durationMs } — unwrapped transparently below.
 * Throws Error with the handler's error message on any non-2xx response.
 */
export async function invokeFunction<T = any>(
  name: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<T> {
  const envelope: InvokeEnvelope = { body: body ?? {} };
  if (headers && Object.keys(headers).length > 0) envelope.headers = headers;

  const res = await fetch(`${LIGHTBASE_FUNCTION_BASE}/${name}/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Function ${name} failed (HTTP ${res.status})`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  if (data && typeof data === 'object' && data.ok === true && 'result' in data) {
    return data.result as T;
  }
  if (data && typeof data === 'object' && data.ok === false) {
    throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error || 'Function failed'));
  }
  return data as T;
}

// ---- browser-direct catalog reads (read-only key) -----------------------
// When a read-only browser key is baked at build time, inject it for the
// coalescing browser client (50 ms batch window + IndexedDB ETag cache +
// adaptive polling). A runtime injection in index.html takes precedence.
if (LIGHTBASE_BROWSER_KEY && typeof window !== 'undefined') {
  if (!window.__GOSHOP_LIGHTBASE__) {
    window.__GOSHOP_LIGHTBASE__ = {
      baseUrl: LIGHTBASE_URL,
      projectId: LIGHTBASE_PROJECT_ID,
      apiKey: LIGHTBASE_BROWSER_KEY,
    };
  }
  configureLightbaseClient(window.__GOSHOP_LIGHTBASE__);
}
