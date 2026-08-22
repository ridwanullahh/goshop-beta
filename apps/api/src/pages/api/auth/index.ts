// BismiLLAH Ar-Rahman Ar-Roheem.
// Astro endpoint — thin wrapper that delegates to the platform-agnostic
// auth handler at src/handlers/auth.ts. The same handler is also called by
// the Cloudflare Pages Function (functions/api/[[path]].ts) via src/router.ts.

import type { APIContext } from 'astro';
import { authHandler } from '../../../handlers/auth';

export async function POST(context: APIContext): Promise<Response> {
  return authHandler(context.request);
}

export async function GET(context: APIContext): Promise<Response> {
  return authHandler(context.request);
}
