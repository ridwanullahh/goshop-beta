// BismiLLAH Ar-Rahman Ar-Roheem. Astro middleware: lazy schema init + idempotent seed + permissive CORS for the SPA.
import { db } from './lib/provider/index.js';
import { seedDatabase } from './lib/seed.js';

let initialized = false;
let initPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await db.initializeSchema();
        await seedDatabase();
        initialized = true;
      } catch (err) {
        console.error('[middleware] Init/seed error:', err);
        initialized = true; // do not retry forever; surface errors in logs
      }
    })();
  }
  await initPromise;
}

export const onRequest = async (context: any, next: () => Promise<Response>): Promise<Response> => {
  // Run init/seed without blocking the response pipeline for unrelated failures.
  await ensureInitialized();

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': context.request.headers.get('origin') || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = await next();

  const origin = context.request.headers.get('origin');
  // Permissive in dev/preview; tighten via CORS_ORIGINS in production if needed.
  const allowed = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (origin && (allowed.length === 0 || allowed.includes(origin))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (allowed.length === 0) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
};
