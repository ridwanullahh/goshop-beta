// DataProvider factory — selects Lightbase or SQLite via DB_PROVIDER env (default: lightbase).
// BismiLLAH Ar-Rahman Ar-Roheem. SQLite is lazy-loaded so the Lightbase path never requires the native module.

import type { DataProvider } from './types';
import { LightbaseProvider } from './lightbase';

export type { DataProvider } from './types';

let providerPromise: Promise<DataProvider> | null = null;

export async function getProvider(): Promise<DataProvider> {
  if (!providerPromise) {
    providerPromise = (async () => {
      const provider = (process.env.DB_PROVIDER || 'lightbase').toLowerCase();
      if (provider === 'sqlite') {
        const mod = await import('./sqlite');
        const inst = new mod.SqliteProvider();
        console.log(`[db] Using provider: ${inst.name}`);
        return inst;
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
