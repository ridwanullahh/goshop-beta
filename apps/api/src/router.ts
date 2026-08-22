// BismiLLAH Ar-Rahman Ar-Roheem.
// Shared API router. Both the Astro endpoints (src/pages/api/...) and the
// Cloudflare Pages Function (functions/api/[[path]].ts) delegate here so the
// business logic lives in exactly one place (the handlers in ./handlers).
//
// Public entry: handleApiRequest(request: Request, env?: Record<string,string>)
//   - On Astro: env is undefined; lib code reads process.env via getEnv().
//   - On Workers: the CF Pages Function passes the `env` binding; we call
//     setEnv(env) so lib code reads it via getEnv(), and inject the Lightbase
//     config explicitly so the client doesn't fall back to an empty process.env.
//
// CORS is applied uniformly: preflight (OPTIONS) returns 204 with permissive
// headers; all other responses get the same headers attached. Mirrors the
// behaviour of the Astro middleware (src/middleware.ts).

import { authHandler } from './handlers/auth';
import { productsHandler } from './handlers/products';
import { ordersHandler } from './handlers/orders';
import { paymentsHandler } from './handlers/payments';
import { dataHandler } from './handlers/data';
import { translateHandler } from './handlers/translate';
import { referralHandler } from './handlers/referral';
import { emailsHandler } from './handlers/emails';
import { setEnv, getEnv } from './lib/env';
import { setLightbaseConfig, type LightbaseConfig } from './lib/lightbase-client';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

function withCors(response: Response): Response {
  // Attach CORS headers without clobbering existing ones (Content-Type etc.).
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    response.headers.set(k, v);
  }
  return response;
}

function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function notFound(): Response {
  return withCors(
    new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

/**
 * Apply the env binding to the env cache + Lightbase client. Called by the CF
 * Pages Function before routing; safe to call repeatedly (idempotent).
 */
function applyEnv(env?: Record<string, string>): void {
  if (!env) return;
  setEnv(env);
  // Inject the Lightbase config explicitly so the client doesn't fall back to
  // process.env (empty on Workers).
  const baseUrl = (env.LIGHTBASE_BASE_URL || getEnv('LIGHTBASE_BASE_URL') || '').replace(/\/$/, '');
  const apiKey = env.LIGHTBASE_API_KEY || getEnv('LIGHTBASE_API_KEY') || '';
  const projectId = env.LIGHTBASE_PROJECT_ID || getEnv('LIGHTBASE_PROJECT_ID') || '';
  if (baseUrl && apiKey && projectId) {
    const cfg: LightbaseConfig = { baseUrl, apiKey, projectId };
    setLightbaseConfig(cfg);
  }
}

/**
 * Route a request to the appropriate handler. Path is parsed from request.url.
 * Returns a Response with CORS headers attached. Throws are caught and turned
 * into 500 responses (or re-thrown Response instances, used by requireAuth).
 */
export async function handleApiRequest(
  request: Request,
  env?: Record<string, string>
): Promise<Response> {
  // On Workers, populate the env cache + Lightbase config from the binding.
  applyEnv(env);

  // CORS preflight.
  if (request.method === 'OPTIONS') {
    return corsPreflight();
  }

  const url = new URL(request.url);
  // Strip leading slash + the "api/" prefix; supports both "/api/auth" and
  // "api/auth" depending on the runtime.
  const path = url.pathname.replace(/^\/+/, '').replace(/^api\//, '');
  const segments = path.split('/').filter(Boolean);
  const top = segments[0] || '';

  let response: Response;
  try {
    switch (top) {
      case 'auth':
        response = await authHandler(request);
        break;
      case 'products':
        response = await productsHandler(request);
        break;
      case 'orders':
        response = await ordersHandler(request);
        break;
      case 'payments':
        response = await paymentsHandler(request);
        break;
      case 'translate':
        response = await translateHandler(request);
        break;
      case 'referral':
        response = await referralHandler(request);
        break;
      case 'emails':
        response = await emailsHandler(request, segments[1] || '');
        break;
      case 'data':
        response = await dataHandler(request);
        break;
      case '':
        // /api with no path — health check.
        response = new Response(
          JSON.stringify({ ok: true, service: 'goshop-api', runtime: env ? 'workers' : 'node' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
        break;
      default:
        response = notFound();
        return response;
    }
  } catch (err: any) {
    if (err instanceof Response) {
      response = err;
    } else {
      console.error('[router] unhandled error:', err);
      response = new Response(
        JSON.stringify({ error: err?.message || 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return withCors(response);
}
