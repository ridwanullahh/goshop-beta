import type { APIContext } from 'astro';
import { getAll, getById, insert, update, remove, searchProducts, jsonResponse, errorResponse, requireAuth, requireRole } from '../../lib/auth.js';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (id) {
      const product = await getById('products', id);
      if (!product) return errorResponse('Product not found', 404);
      return jsonResponse(product);
    }

    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const sellerId = url.searchParams.get('sellerId');
    const storeId = url.searchParams.get('storeId');
    const featured = url.searchParams.get('featured');
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');

    if (search || category || sellerId || storeId || featured) {
      const products = await searchProducts(search || '', {
        category, sellerId, storeId, featured: featured === 'true',
        limit, offset, minPrice, maxPrice,
      });
      return jsonResponse(products);
    }

    const products = await getAll('products');
    return jsonResponse(products);
  } catch (error: any) {
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function POST(context: APIContext): Promise<Response> {
  try {
    const user = await requireAuth(context);
    requireRole(user, ['seller', 'admin']);

    const body = await context.request.json();
    const product = await insert('products', {
      ...body,
      sellerId: user.id,
      sellerName: user.name || user.businessName,
      isActive: body.isActive !== undefined ? body.isActive : true,
      type: body.type || 'simple',
      currency: body.currency || 'USD',
    });

    return jsonResponse(product, 201);
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function PATCH(context: APIContext): Promise<Response> {
  try {
    const user = await requireAuth(context);
    const body = await context.request.json();
    const { id, ...updates } = body;

    if (!id) return errorResponse('Product ID required', 400);

    const existing = await getById<any>('products', id);
    if (!existing) return errorResponse('Product not found', 404);

    if (existing.sellerId !== user.id && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const updated = await update('products', id, updates);
    return jsonResponse(updated);
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function DELETE(context: APIContext): Promise<Response> {
  try {
    const user = await requireAuth(context);
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) return errorResponse('Product ID required', 400);

    const existing = await getById<any>('products', id);
    if (!existing) return errorResponse('Product not found', 404);

    if (existing.sellerId !== user.id && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    await remove('products', id);
    return jsonResponse({ success: true });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
