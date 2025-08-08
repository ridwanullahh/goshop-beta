import CommerceSDK from '@/lib/commerce-sdk';
import crypto from 'crypto';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const sdk = new CommerceSDK();
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    return new Response('Signature not found', { status: 400 });
  }

  try {
    const shasum = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET);
    shasum.update(body);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return new Response('Invalid signature', { status: 403 });
    }

    const event = JSON.parse(body);

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id; // This is the Razorpay Order ID
      
      // We need to find our internal order via the transaction reference.
      const orders = await sdk.getOrders();
      const order = orders.find(o => o.transactionRef === orderId);

      if (!order) {
        console.error(`Webhook Error: Order with Razorpay reference ${orderId} not found.`);
        return new Response('Order not found, but acknowledged.', { status: 200 });
      }

      if (order.status !== 'pending_payment') {
        console.warn(`Webhook Warning: Order ${order.id} is already processed. Status: ${order.status}`);
        return new Response('Order already processed.', { status: 200 });
      }

      await sdk.updateOrderStatus(order.id, 'paid', undefined, { razorpayPaymentId: payment.id });
      
      console.log(`Successfully verified and updated order ${order.id} to paid.`);
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}