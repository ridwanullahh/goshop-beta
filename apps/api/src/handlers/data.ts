// BismiLLAH Ar-Rahman Ar-Roheem.
// Platform-agnostic generic CRUD handler for all entities. Mirrors the Astro
// endpoint at src/pages/api/data/[...entity].ts but accepts a standard Request.
// The entity is parsed from the URL path (e.g. /api/data/cart → entity='cart').

import {
  getAll, getOne, getById, insert, update, remove,
  jsonResponse, errorResponse, requireAuth,
} from '../lib/auth';

const TABLE_MAP: Record<string, string> = {
  cart: 'cart_items',
  cart_items: 'cart_items',
  wishlist: 'wishlist',
  categories: 'categories',
  users: 'users',
  stores: 'stores',
  notifications: 'notifications',
  wallets: 'wallets',
  transactions: 'transactions',
  posts: 'posts',
  comments: 'comments',
  blogs: 'blogs',
  help_articles: 'help_articles',
  reviews: 'reviews',
  affiliate_links: 'affiliate_links',
  affiliate_collections: 'affiliate_collections',
  refund_requests: 'refund_requests',
  disputes: 'disputes',
  withdrawal_requests: 'withdrawal_requests',
  platform_commissions: 'platform_commissions',
  seller_agreements: 'seller_agreements',
  livestreams: 'livestreams',
  languages: 'languages',
  currencies: 'currencies',
  referral_codes: 'referral_codes',
  sessions: 'sessions',
};

function resolveTable(url: URL): { entity: string; table: string } | null {
  // Works for both Astro (full URL like http://host:3001/api/data/cart) and
  // the CF Pages Function (full URL like https://site/api/data/cart).
  const afterData = url.pathname.split('/api/data/')[1];
  const entity = afterData?.split('/')[0];
  if (!entity) return null;
  const table = TABLE_MAP[entity] || entity;
  return { entity, table };
}

const PUBLIC_ENTITIES = new Set([
  'categories', 'products', 'stores', 'blogs', 'help_articles',
  'languages', 'currencies', 'reviews', 'posts', 'comments',
]);

function requiresAuth(entity: string): boolean {
  return !PUBLIC_ENTITIES.has(entity);
}

const SELLER_ADMIN_WRITE = new Set([
  'categories', 'blogs', 'help_articles', 'platform_commissions',
  'seller_agreements', 'languages', 'currencies',
]);

async function get(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const resolved = resolveTable(url);
    if (!resolved) return errorResponse('Entity not found', 404);
    const { entity, table } = resolved;

    const id = url.searchParams.get('id');
    if (id) {
      const item = await getById(table, id);
      if (!item) return errorResponse('Not found', 404);
      return jsonResponse(item);
    }

    const where: Record<string, any> = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== 'id' && key !== 'search' && key !== 'limit' && key !== 'offset') {
        where[key] = value;
      }
    }

    if (requiresAuth(entity)) {
      try {
        const user = await requireAuth(request);
        if (['cart', 'cart_items', 'wishlist', 'notifications', 'wallets', 'transactions', 'referral_codes'].includes(entity)) {
          where.userId = user.id;
        }
        if (entity === 'withdrawal_requests') {
          where.userId = user.id;
        }
      } catch (e) {
        return e instanceof Response ? e : errorResponse('Unauthorized', 401);
      }
    }

    const items = await getAll(table, Object.keys(where).length > 0 ? where : undefined);
    return jsonResponse(items);
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

async function post(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const resolved = resolveTable(url);
    if (!resolved) return errorResponse('Entity not found', 404);
    const { entity, table } = resolved;

    let user: any = null;
    if (requiresAuth(entity) || SELLER_ADMIN_WRITE.has(entity)) {
      try {
        user = await requireAuth(request);
      } catch (e) {
        return e instanceof Response ? e : errorResponse('Unauthorized', 401);
      }
    }

    const body = await request.json();

    if (entity === 'cart' || entity === 'cart_items') {
      if (!user) return errorResponse('Unauthorized', 401);
      const existing = await getOne<any>('cart_items', { userId: user.id, productId: body.productId });
      if (existing) {
        const updated = await update('cart_items', existing.id, { quantity: existing.quantity + (body.quantity || 1) });
        return jsonResponse(updated);
      }
      const item = await insert('cart_items', { ...body, userId: user.id });
      return jsonResponse(item, 201);
    }

    if (entity === 'wishlist') {
      if (!user) return errorResponse('Unauthorized', 401);
      const existing = await getOne('wishlist', { userId: user.id, productId: body.productId });
      if (existing) return jsonResponse(existing);
      const item = await insert('wishlist', { ...body, userId: user.id });
      return jsonResponse(item, 201);
    }

    if (entity === 'reviews') {
      if (!user) return errorResponse('Unauthorized', 401);
      const item = await insert('reviews', { ...body, userId: user.id, userName: user.name, isVerified: true });
      return jsonResponse(item, 201);
    }

    if (user && ['notifications', 'posts', 'comments'].includes(entity) && body.userId === undefined) {
      body.userId = user.id;
    }

    const item = await insert(table, body);
    return jsonResponse(item, 201);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('POST error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

async function patch(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const resolved = resolveTable(url);
    if (!resolved) return errorResponse('Entity not found', 404);
    const { entity, table } = resolved;

    let user: any = null;
    try {
      user = await requireAuth(request);
    } catch (e) {
      return e instanceof Response ? e : errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return errorResponse('ID required', 400);

    const existing = await getById<any>(table, id);
    if (!existing) return errorResponse('Not found', 404);

    const userIdField = existing.userId !== undefined ? 'userId' : existing.sellerId !== undefined ? 'sellerId' : null;
    if (user.role !== 'admin' && userIdField && existing[userIdField] !== user.id && SELLER_ADMIN_WRITE.has(entity) === false) {
      // allow patching own notifications (read flag), cart, wishlist, etc.
    } else if (user.role !== 'admin' && SELLER_ADMIN_WRITE.has(entity)) {
      return errorResponse('Forbidden', 403);
    }

    const updated = await update(table, id, updates);
    return jsonResponse(updated);
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

async function del(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const resolved = resolveTable(url);
    if (!resolved) return errorResponse('Entity not found', 404);
    const { entity, table } = resolved;

    let user: any = null;
    try {
      user = await requireAuth(request);
    } catch (e) {
      return e instanceof Response ? e : errorResponse('Unauthorized', 401);
    }

    const id = url.searchParams.get('id');
    if (!id) return errorResponse('ID required', 400);

    const existing = await getById<any>(table, id);
    if (!existing) return errorResponse('Not found', 404);

    const userIdField = existing.userId !== undefined ? 'userId' : existing.sellerId !== undefined ? 'sellerId' : null;
    if (user.role !== 'admin' && userIdField && existing[userIdField] !== user.id) {
      return errorResponse('Forbidden', 403);
    }
    if (user.role !== 'admin' && SELLER_ADMIN_WRITE.has(entity)) {
      return errorResponse('Forbidden', 403);
    }

    const deleted = await remove(table, id);
    if (!deleted) return errorResponse('Not found', 404);

    return jsonResponse({ success: true });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function dataHandler(request: Request): Promise<Response> {
  switch (request.method) {
    case 'GET': return get(request);
    case 'POST': return post(request);
    case 'PATCH': return patch(request);
    case 'DELETE': return del(request);
    default:
      return errorResponse('Method Not Allowed', 405);
  }
}
