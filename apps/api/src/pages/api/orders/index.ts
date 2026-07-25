import type { APIContext } from 'astro';
import { getAll, getById, insert, update, removeWhere, jsonResponse, errorResponse, requireAuth } from '../../../lib/auth';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const user = await requireAuth(context);
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    const status = url.searchParams.get('status');

    if (id) {
      const order = await getById<any>('orders', id);
      if (!order) return errorResponse('Order not found', 404);
      if (order.userId !== user.id && order.sellerId !== user.id && user.role !== 'admin') {
        return errorResponse('Forbidden', 403);
      }
      return jsonResponse(order);
    }

    let orders = await getAll<any>('orders');
    if (user.role !== 'admin') {
      orders = orders.filter((o: any) => o.userId === user.id || o.sellerId === user.id);
    }
    if (status) {
      orders = orders.filter((o: any) => o.status === status);
    }
    return jsonResponse(orders.sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || '')));
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function POST(context: APIContext): Promise<Response> {
  try {
    const user = await requireAuth(context);
    const body = await context.request.json();

    const products = await getAll<any>('products');
    let serverTotal = 0;
    const validatedItems = (body.items || []).map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const itemTotal = product.price * item.quantity;
      serverTotal += itemTotal;
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        images: product.images || [],
        sellerId: product.sellerId,
        storeId: product.storeId,
        shippingCost: product.shippingCost || 0,
        deliveryMethod: item.deliveryMethod || 'shipping',
        platformCommission: product.affiliateCommission || 0,
        affiliateCommission: 0,
        status: 'pending',
      };
    });

    const order = await insert('orders', {
      userId: user.id,
      items: validatedItems,
      total: serverTotal + (body.shippingTotal || 0),
      subtotal: serverTotal,
      platformCommission: body.platformCommission || 0,
      affiliateCommission: body.affiliateCommission || 0,
      shippingTotal: body.shippingTotal || 0,
      paidAmount: body.paidAmount || 0,
      remainingAmount: body.remainingAmount || serverTotal,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: body.paymentMethod || 'cod',
      shippingAddress: body.shippingAddress || {},
      billingAddress: body.billingAddress || body.shippingAddress || {},
      deliveryMethod: body.deliveryMethod || 'shipping',
      affiliateId: body.affiliateId,
    });

    await removeWhere('cart_items', { userId: user.id });

    return jsonResponse(order, 201);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Order creation error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function PATCH(context: APIContext): Promise<Response> {
  try {
    const user = await requireAuth(context);
    const body = await context.request.json();
    const { id, ...updates } = body;

    if (!id) return errorResponse('Order ID required', 400);

    const order = await getById<any>('orders', id);
    if (!order) return errorResponse('Order not found', 404);

    if (order.sellerId !== user.id && order.userId !== user.id && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const updated = await update('orders', id, updates);
    return jsonResponse(updated);
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
