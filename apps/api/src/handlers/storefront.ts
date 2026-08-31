// BismiLLAH Ar-Rahman Ar-Roheem.
// Storefront bootstrap handler — Path A Phase 1 (PATH_A_INTEGRATION.md §3.2).
//
// The storefront's initial render previously issued 4-6 separate API calls
// (products, categories, languages, currencies, + cart/wishlist for logged-in
// users), each triggering its own Lightbase read server-side. This handler
// coalesces ALL of those reads into ONE Lightbase batch call
// (POST /api/v1/projects/:id/batch, max 25 ops) via the provider's
// getManyBatch(). One browser request => one Worker request => one batch.
//
// Checkout surfaces (initiate-payment, flutterwave-callback, create-order,
// webhooks) stay server-side forever — they are deliberately NOT touched by
// this coalescing path.
//
// Auth: optional. Public catalog reads (products/categories/languages/
// currencies) need no token; when a valid GoShop JWT Bearer token is present,
// the caller's cart + wishlist joins the same batch (filtered server-side by
// userId — the client never chooses the filter).

import { jsonResponse, errorResponse, getCurrentUser } from '../lib/auth';
import { getProvider } from '../lib/provider/index';
import type { BatchReadQuery } from '../lib/provider/types';

const PAGE_LIMIT = 1000;

export async function storefrontHandler(request: Request): Promise<Response> {
  try {
    // Null when no/invalid token — public reads must not 401.
    const user = await getCurrentUser(request).catch(() => null);

    const queries: BatchReadQuery[] = [
      {
        collection: 'products',
        filter: { field: 'isActive', op: 'eq', value: true },
        limit: PAGE_LIMIT,
        tag: 'products',
      },
      { collection: 'categories', limit: PAGE_LIMIT, tag: 'categories' },
      { collection: 'languages', limit: 100, tag: 'languages' },
      { collection: 'currencies', limit: 100, tag: 'currencies' },
    ];

    if (user) {
      queries.push({
        collection: 'cart_items',
        where: { userId: user.id },
        limit: 500,
        tag: 'cart',
      });
      queries.push({
        collection: 'wishlist',
        where: { userId: user.id },
        limit: 500,
        tag: 'wishlist',
      });
    }

    // ONE coalesced Lightbase batch call (provider chunks at 25 ops).
    const provider = await getProvider();
    if (typeof provider.getManyBatch !== 'function') {
      return errorResponse('Storage provider does not support coalesced reads', 501);
    }
    const results = await provider.getManyBatch(queries);
    const byTag = new Map(results.map((r) => [r.tag || '', r]));
    const pick = <T,>(tag: string): T[] => {
      const r = byTag.get(tag);
      return r && !r.error && Array.isArray(r.items) ? (r.items as T[]) : [];
    };

    const body: Record<string, any> = {
      products: pick('products'),
      categories: pick('categories'),
      languages: pick('languages'),
      currencies: pick('currencies'),
      batched: true,
    };
    if (user) {
      body.cart = pick('cart');
      body.wishlist = pick('wishlist');
      body.user = { id: user.id };
    }
    return jsonResponse(body);
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
