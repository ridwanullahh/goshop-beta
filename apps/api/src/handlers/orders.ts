// BismiLLAH Ar-Rahman Ar-Roheem.
// Platform-agnostic orders handler. Mirrors src/pages/api/orders/index.ts.
// Email emissions are fire-and-forget; on Workers they no-op (no transport).

import {
  getAll, getById, insert, update, removeWhere,
  jsonResponse, errorResponse, requireAuth,
} from '../lib/auth';
import { emitEmailEventSafe } from '../lib/email';
import { getEnv } from '../lib/env';

function statusMessage(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'Your order has been confirmed and is being prepared.';
    case 'processing':
      return 'Your order is now being processed.';
    case 'shipped':
      return 'Your order has been shipped. See the tracking details below.';
    case 'out_for_delivery':
      return 'Your order is out for delivery and will arrive soon.';
    case 'delivered':
      return 'Your order has been delivered. Enjoy your purchase!';
    case 'cancelled':
      return 'Your order has been cancelled. If you did not request this, please contact support.';
    case 'refunded':
      return 'A refund has been processed for your order.';
    default:
      return `Your order status is now: ${status}.`;
  }
}

async function get(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const url = new URL(request.url);
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

async function post(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

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

    try {
      const appUrl = getEnv('APP_URL') || '';
      const base = appUrl.replace(/\/$/, '');
      const trackingLink = order.id ? `${base}/order/${order.id}` : '';
      emitEmailEventSafe({
        event: 'orderConfirmation',
        to: user.email,
        data: {
          name: user.name || user.firstName || '',
          orderId: order.id,
          items: validatedItems,
          total: order.total,
          currency: body.currency || 'USD',
          estimatedDelivery: body.estimatedDelivery || '3-7 business days',
          trackingLink,
        },
      });
      const sellerIds: string[] = Array.from(
        new Set(validatedItems.map((it: any) => it.sellerId).filter(Boolean) as string[])
      );
      for (const sellerId of sellerIds) {
        try {
          const seller = await getById<any>('users', sellerId);
          if (seller && seller.email) {
            const sellerItems = validatedItems.filter((it: any) => it.sellerId === sellerId);
            const sellerTotal = sellerItems.reduce(
              (sum: number, it: any) => sum + (it.total !== undefined ? Number(it.total) : (it.quantity || 0) * (it.price || 0)),
              0
            );
            emitEmailEventSafe({
              event: 'newOrder',
              to: seller.email,
              data: {
                orderId: order.id,
                customerName: user.name || user.firstName || 'Customer',
                items: sellerItems,
                total: sellerTotal,
                currency: body.currency || 'USD',
                dashboardLink: `${base}/seller/dashboard`,
              },
            });
          }
        } catch (sellerErr) {
          console.error('[orders POST] seller lookup/notify failed:', sellerErr);
        }
      }
    } catch (emailErr) {
      console.error('[orders POST] order email emit failed:', emailErr);
    }

    return jsonResponse(order, 201);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Order creation error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

async function patch(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return errorResponse('Order ID required', 400);

    const order = await getById<any>('orders', id);
    if (!order) return errorResponse('Order not found', 404);

    if (order.sellerId !== user.id && order.userId !== user.id && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const updated = await update('orders', id, updates);

    try {
      const prevStatus = order.status;
      const newStatus = updates.status;
      if (newStatus && newStatus !== prevStatus) {
        const appUrl = getEnv('APP_URL') || '';
        const base = appUrl.replace(/\/$/, '');
        const trackingLink = `${base}/order/${id}`;
        const customer = await getById<any>('users', order.userId);
        const customerEmail = customer?.email;
        const customerName = customer?.name || customer?.firstName || '';
        if (customerEmail) {
          emitEmailEventSafe({
            event: 'orderStatusUpdate',
            to: customerEmail,
            data: {
              name: customerName,
              orderId: id,
              newStatus,
              trackingLink,
              message: statusMessage(newStatus),
            },
          });
          if (newStatus === 'shipped') {
            emitEmailEventSafe({
              event: 'orderShipped',
              to: customerEmail,
              data: {
                name: customerName,
                orderId: id,
                trackingNumber: updates.trackingNumber || order.trackingNumber || '',
                carrier: updates.carrier || 'Shipping partner',
                trackingLink,
              },
            });
          }
          if (newStatus === 'delivered') {
            emitEmailEventSafe({
              event: 'orderDelivered',
              to: customerEmail,
              data: {
                name: customerName,
                orderId: id,
                reviewLink: `${base}/order/${id}?review=1`,
              },
            });
          }
        }
      }
    } catch (emailErr) {
      console.error('[orders PATCH] status-change email emit failed:', emailErr);
    }

    return jsonResponse(updated);
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function ordersHandler(request: Request): Promise<Response> {
  switch (request.method) {
    case 'GET': return get(request);
    case 'POST': return post(request);
    case 'PATCH': return patch(request);
    default:
      return errorResponse('Method Not Allowed', 405);
  }
}
