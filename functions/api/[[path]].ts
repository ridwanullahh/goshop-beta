// BismiLLAH Ar-Rahman Ar-Roheem.
// Cloudflare Pages Function — catch-all API entry point.
//
// Lives at functions/api/[[path]].ts so Cloudflare Pages routes every
// /api/* request here. The function delegates to the shared router at
// apps/api/src/router.ts, which is the SAME router the Astro endpoints use.
// This keeps business logic in exactly one place and guarantees Astro and
// Workers behave identically.
//
// Env handling: on Workers, env vars come from the `env` binding (not
// process.env). We pass `env` straight to handleApiRequest, which calls
// setEnv(env) so the lib code reads it via getEnv(), and injects the Lightbase
// config explicitly so the client doesn't fall back to an empty process.env.
//
// Build: Cloudflare Pages serves the static SPA from dist/ (built by Vite)
// + this functions/ directory (compiled by wrangler's esbuild). The
// compatibility_flags = ["nodejs_compat"] in wrangler.toml enables Node.js
// builtins (Buffer, crypto, etc.) used by bcryptjs + jsonwebtoken.
//
// No emojis. No indigo/blue. Production-grade.

import { handleApiRequest } from '../../apps/api/src/router';

// Minimal env shape — Cloudflare exposes additional bindings (KV, D1, R2, etc.)
// but the GoShop API only needs the string env vars below. The string index
// signature covers all known keys (LIGHTBASE_*, JWT_SECRET, payment gateway
// keys, APP_URL, etc.) without listing each one explicitly.
export type Env = Record<string, string | undefined>;

export interface PagesFunctionContext {
  request: Request;
  env: Env;
  params: Record<string, string | string[] | undefined>;
  waitUntil(promise: Promise<unknown>): void;
  next(): Promise<Response>;
}

// Export onRequest so Pages invokes this for ALL HTTP methods.
export const onRequest = async (ctx: PagesFunctionContext): Promise<Response> => {
  // Pass the env binding through to the shared router. The router calls
  // setEnv(env) so lib code reads Workers env vars via getEnv(). Strip
  // undefined values so the env cache only contains defined strings.
  const envRecord: Record<string, string> = {};
  for (const [k, v] of Object.entries(ctx.env || {})) {
    if (typeof v === 'string') envRecord[k] = v;
  }
  return handleApiRequest(ctx.request, envRecord);
};
