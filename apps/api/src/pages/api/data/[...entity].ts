import type { APIContext } from 'astro';
import { getAll, getOne, getById, insert, update, remove, removeWhere, jsonResponse, errorResponse, requireAuth } from '../../lib/auth.js';

// Generic CRUD endpoint for: cart, wishlist, categories, users, stores, notifications,
// wallets, transactions, posts, comments, blogs, help_articles, reviews,
// affiliate_links, affiliate_collections, refund_requests, disputes,
// withdrawal_requests, platform_commissions, seller_agreements, livestreams,
// languages, currencies

const TABLE_MAP: Record<string, string> = {
  cart: 'cart_items',
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
};

function resolveTable(url: URL): string | null {
  const parts = url.pathname.split('/api/data/')[1]?.split('/');
  const entity = parts?.[0];
  return entity ? TABLE_MAP[entity] || entity : null;
}

function requiresAuth(entity: string): boolean {
  const publicEntities = ['categories', 'products', 'stores', 'blogs', 'help_articles', 'languages', 'currencies', 'reviews', 'posts', 'comments'];
  return !publicEntities.includes(entity);
}

export async function GET(context: APIContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const entityPath = url.pathname.split('/api/data/')[1]?.split('/')[0];
    const table = TABLE_MAP[entityPath] || entityPath;
    if (!table) return errorResponse('Entity not found', 404);

    const id = url.searchParams.get('id');
    if (id) {
      const item = getById(table, id);
      if (!item) return errorResponse('Not found', 404);
      return jsonResponse(item);
    }

    const where: Record<string, any> = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== 'id' && key !== 'search' && key !== 'limit' && key !== 'offset') {
        where[key] = value;
      }
    }

    let items = getAll(table, Object.keys(where).length > 0 ? where : undefined);
    return jsonResponse(items);
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function POST(context: APIContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const entityPath = url.pathname.split('/api/data/')[1]?.split('/')[0];
    const table = TABLE_MAP[entityPath] || entityPath;
    if (!table) return errorResponse('Entity not found', 404);

    let user: any = null;
    if (requiresAuth(entityPath)) {
      user = await requireAuth(context);
    }

    const body = await context.request.json();

    if (entityPath === 'cart') {
      if (!user) return errorResponse('Unauthorized', 401);
      const existing = getOne<any>('cart_items', { userId: user.id, productId: body.productId });
      if (existing) {
        const updated = update('cart_items', existing.id, { quantity: existing.quantity + (body.quantity || 1) });
        return jsonResponse(updated);
      }
      const item = insert('cart_items', { ...body, userId: user.id });
      return jsonResponse(item, 201);
    }

    if (entityPath === 'wishlist') {
      if (!user) return errorResponse('Unauthorized', 401);
      const existing = getOne('wishlist', { userId: user.id, productId: body.productId });
      if (existing) return jsonResponse(existing);
      const item = insert('wishlist', { ...body, userId: user.id });
      return jsonResponse(item, 201);
    }

    const item = insert(table, body);
    return jsonResponse(item, 201);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('POST error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function PATCH(context: APIContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const entityPath = url.pathname.split('/api/data/')[1]?.split('/')[0];
    const table = TABLE_MAP[entityPath] || entityPath;
    if (!table) return errorResponse('Entity not found', 404);

    const body = await context.request.json();
    const { id, ...updates } = body;
    if (!id) return errorResponse('ID required', 400);

    const updated = update(table, id, updates);
    if (!updated) return errorResponse('Not found', 404);

    return jsonResponse(updated);
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function DELETE(context: APIContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const entityPath = url.pathname.split('/api/data/')[1]?.split('/')[0];
    const table = TABLE_MAP[entityPath] || entityPath;
    if (!table) return errorResponse('Entity not found', 404);

    const id = url.searchParams.get('id');
    if (!id) return errorResponse('ID required', 400);

    const deleted = remove(table, id);
    if (!deleted) return errorResponse('Not found', 404);

    return jsonResponse({ success: true });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
