import crypto from 'crypto';
import CommerceSDK from '@/lib/commerce-sdk';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    amount: number; // Amount is in kobo
    status: string;
    customer: {
      email: string;
    };
  };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const body = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  if (!PAYSTACK_SECRET_KEY || !signature) {
    console.error('Paystack secret key or signature is missing.');
    return new Response('Server configuration error.', { status: 500 });
  }

  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(body).digest('hex');

  if (hash !== signature) {
    return new Response('Invalid signature', { status: 401 });
  }

  const sdk = new CommerceSDK();

  try {
    const event = JSON.parse(body) as PaystackEvent;

    if (event.event === 'charge.success') {
      const { reference, amount, status } = event.data;

      // 1. Find the order in the database using the transaction reference.
      // The reference should have been saved when the order was created.
      const order = await sdk.getOrder(reference);

      if (!order) {
        console.error(`Webhook Error: Order with reference ${reference} not found.`);
        // Return a 200 to prevent Paystack from retrying a non-existent order.
        return new Response('Order not found, but acknowledged.', { status: 200 });
      }

      // 2. Verify that the order is still pending to prevent double-processing.
      if (order.status !== 'pending') {
        console.warn(`Webhook Warning: Order ${order.id} is already processed. Status: ${order.status}`);
        return new Response('Order already processed.', { status: 200 });
      }
      
      // 3. Verify that the amount paid matches the order total.
      // Paystack amount is in kobo, so convert our total to kobo for comparison.
      const orderTotalInKobo = Math.round(order.total * 100);
      if (amount !== orderTotalInKobo) {
        console.error(`Webhook Error: Amount mismatch for order ${order.id}. Expected ${orderTotalInKobo}, got ${amount}.`);
        // Optionally, update order status to 'failed' or 'underpaid'.
        await sdk.updateOrderStatus(order.id, 'payment_failed');
        return new Response('Amount mismatch.', { status: 400 });
      }

      // 4. If all checks pass, update the order status to 'paid'.
      await sdk.updateOrderStatus(order.id, 'paid');
      
      console.log(`Successfully verified and updated order ${order.id} to paid.`);
      
      // TODO: Trigger post-payment actions (e.g., send confirmation email, notify seller).
    }

    return new Response('Webhook processed successfully.', { status: 200 });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}