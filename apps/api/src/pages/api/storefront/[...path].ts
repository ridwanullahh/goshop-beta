// BismiLLAH Ar-Rahman Ar-Raheem.
// Astro endpoint — thin wrapper around the platform-agnostic storefront
// bootstrap handler at src/handlers/storefront.ts. Mirrors the CF Pages
// Function route (GET /api/storefront or /api/storefront/bootstrap) so both
// runtimes serve the coalesced-read endpoint identically.

import type { APIContext } from 'astro';
import { storefrontHandler } from '../../../handlers/storefront';

export async function GET(context: APIContext): Promise<Response> {
  return storefrontHandler(context.request);
}
