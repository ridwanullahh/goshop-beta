// BismiLLAH Ar-Rahman Ar-Roheem.
// Platform-agnostic payments handler. Mirrors src/pages/api/payments/index.ts.
// All gateway calls use fetch() (works on Astro + Workers). Email emissions
// are fire-and-forget; on Workers they no-op (no transport).

import {
  jsonResponse, errorResponse, requireAuth,
  getById, update, getAll, insert,
} from '../lib/auth';
import { emitEmailEventSafe } from '../lib/email';
import { getEnv } from '../lib/env';

export async function paymentsHandler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method Not Allowed', 405);
  }
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { orderId, paymentMethod } = body;

    if (!orderId || !paymentMethod) {
      return errorResponse('orderId and paymentMethod required', 400);
    }

    const order = await getById<any>('orders', orderId);
    if (!order) return errorResponse('Order not found', 404);
    if (order.userId !== user.id) return errorResponse('Forbidden', 403);

    const reference = `goshop_${order.id}_${Date.now()}`;

    if (paymentMethod === 'wallet') {
      const wallets = await getAll<any>('wallets', { userId: user.id });
      const wallet = wallets[0];
      if (!wallet || wallet.balance < order.total) {
        return errorResponse('Insufficient wallet balance', 400);
      }

      const newBalance = wallet.balance - order.total;
      await update('wallets', wallet.id, { balance: newBalance });
      await insert('transactions', {
        walletId: wallet.id,
        amount: order.total,
        type: 'debit',
        description: `Payment for Order #${order.id}`,
        orderId: order.id,
        status: 'completed',
      });

      await update('orders', order.id, {
        status: 'confirmed',
        paymentStatus: 'completed',
        transactionRef: reference,
      });

      try {
        const appUrl = getEnv('APP_URL') || '';
        const base = appUrl.replace(/\/$/, '');
        const receiptLink = `${base}/order/${order.id}?receipt=1`;
        emitEmailEventSafe({
          event: 'paymentSuccess',
          to: user.email,
          data: {
            name: user.name || user.firstName || '',
            orderId: order.id,
            amount: order.total,
            paymentMethod: 'wallet',
            receiptLink,
          },
        });
        emitEmailEventSafe({
          event: 'walletDebited',
          to: user.email,
          data: {
            name: user.name || user.firstName || '',
            amount: order.total,
            balance: newBalance,
            description: `Payment for Order #${order.id}`,
          },
        });
      } catch (emailErr) {
        console.error('[payments POST wallet] email emit failed:', emailErr);
      }

      return jsonResponse({ success: true, transactionId: Date.now().toString() });
    }

    if (paymentMethod === 'cod') {
      await update('orders', order.id, {
        status: 'confirmed',
        paymentStatus: 'pending',
        paymentMethod: 'cod',
        transactionRef: reference,
      });
      return jsonResponse({ success: true, transactionRef: reference });
    }

    if (paymentMethod === 'paystack') {
      const paystackKey = getEnv('PAYSTACK_SECRET_KEY');
      if (!paystackKey) return errorResponse('Paystack not configured', 503);

      const appUrl = getEnv('APP_URL') || '';
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          amount: Math.round(order.total * 100),
          reference,
          callback_url: `${appUrl}/order/${order.id}`,
          metadata: { orderId: order.id, userId: user.id },
        }),
      });

      if (!response.ok) return errorResponse('Paystack error', 500);
      const data = await response.json();

      await update('orders', order.id, { status: 'pending_payment', transactionRef: reference });
      return jsonResponse({ redirectUrl: data.data.authorization_url });
    }

    if (paymentMethod === 'flutterwave') {
      const flwKey = getEnv('FLUTTERWAVE_SECRET_KEY');
      if (!flwKey) return errorResponse('Flutterwave not configured', 503);

      const appUrl = getEnv('APP_URL') || '';
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${flwKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: reference,
          amount: order.total.toFixed(2),
          currency: 'USD',
          redirect_url: `${appUrl}/order/${order.id}`,
          customer: { email: user.email, name: user.name },
        }),
      });

      if (!response.ok) return errorResponse('Flutterwave error', 500);
      const data = await response.json();

      await update('orders', order.id, { status: 'pending_payment', transactionRef: reference });
      return jsonResponse({ redirectUrl: data.data.link });
    }

    if (paymentMethod === 'razorpay') {
      const rzKeyId = getEnv('RAZORPAY_KEY_ID');
      const rzSecret = getEnv('RAZORPAY_KEY_SECRET');
      if (!rzKeyId || !rzSecret) return errorResponse('Razorpay not configured', 503);

      const authHeader = 'Basic ' + Buffer.from(`${rzKeyId}:${rzSecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(order.total * 100),
          currency: 'INR',
          receipt: order.id,
        }),
      });

      if (!response.ok) return errorResponse('Razorpay error', 500);
      const data = await response.json();

      await update('orders', order.id, { status: 'pending_payment', transactionRef: data.id });
      return jsonResponse({ razorpayOrderId: data.id, keyId: rzKeyId });
    }

    if (paymentMethod === 'paypal') {
      const paypalClientId = getEnv('PAYPAL_CLIENT_ID');
      const paypalSecret = getEnv('PAYPAL_CLIENT_SECRET');
      if (!paypalClientId || !paypalSecret) return errorResponse('PayPal not configured', 503);

      const appUrl = getEnv('APP_URL') || '';
      const authResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      const authData = await authResponse.json();

      const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{ amount: { currency_code: 'USD', value: order.total.toFixed(2) }, reference_id: order.id }],
          application_context: {
            return_url: `${appUrl}/order/${order.id}`,
            cancel_url: `${appUrl}/checkout`,
          },
        }),
      });

      const paypalOrder = await orderResponse.json();
      const approvalLink = paypalOrder.links?.find((l: any) => l.rel === 'approve');

      await update('orders', order.id, { status: 'pending_payment', transactionRef: paypalOrder.id });
      return jsonResponse({ redirectUrl: approvalLink?.href });
    }

    return errorResponse('Invalid payment method', 400);
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Payment error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
