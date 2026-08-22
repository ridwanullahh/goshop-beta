// DataProvider factory — selects Lightbase or SQLite via DB_PROVIDER env (default: lightbase).
// BismiLLAH Ar-Rahman Ar-Roheem. SQLite is lazy-loaded so the Lightbase path never
// requires the native module. On Cloudflare Workers, the SQLite provider is
// unreachable (better-sqlite3 has native bindings unavailable on Workers) —
// the dynamic import is wrapped in try-catch so a build-time or runtime
// failure to load it never breaks the Lightbase path.

import type { DataProvider } from './types';
import { LightbaseProvider } from './lightbase';
import { getEnv } from '../env';

export type { DataProvider } from './types';

let providerPromise: Promise<DataProvider> | null = null;

export async function getProvider(): Promise<DataProvider> {
  if (!providerPromise) {
    providerPromise = (async () => {
      const provider = (getEnv('DB_PROVIDER') || 'lightbase').toLowerCase();
      if (provider === 'sqlite') {
        try {
          const mod = await import('./sqlite');
          const inst = new mod.SqliteProvider();
          console.log(`[db] Using provider: ${inst.name}`);
          return inst;
        } catch (err: any) {
          // better-sqlite3 is unavailable (e.g. Cloudflare Workers). Fall back
          // to Lightbase rather than crash the request.
          console.error('[db] SQLite provider unavailable, falling back to Lightbase:', err?.message || err);
          const inst = new LightbaseProvider();
          console.log(`[db] Using provider: ${inst.name} (fallback)`);
          return inst;
        }
      }
      const inst = new LightbaseProvider();
      console.log(`[db] Using provider: ${inst.name}`);
      return inst;
    })();
  }
  return providerPromise;
}

// `db` is a proxy that forwards every method call to the resolved provider (async).
export const db = new Proxy({} as DataProvider, {
  get(_t, prop: string) {
    return (...args: any[]) => {
      return getProvider().then((p: any) => {
        const fn = p[prop];
        if (typeof fn !== 'function') return fn;
        return fn.apply(p, args);
      });
    };
  },
});
