import { CommerceSDK } from '@/lib';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!;

export default async function handler(req: Request): Promise<Response> {
  const sdk = new CommerceSDK();
  const url = new URL(req.url);
  const tx_ref = url.searchParams.get('tx_ref');
  const transaction_id = url.searchParams.get('transaction_id');
  const status = url.searchParams.get('status');

  if (status === 'cancelled') {
    return new Response(null, {
      status: 302,
      headers: { Location: '/checkout?status=cancelled' },
    });
  }

  if (!tx_ref || !transaction_id || status !== 'successful') {
    return new Response('Invalid callback parameters.', { status: 400 });
  }

  try {
    // 1. Verify the transaction with Flutterwave
    const verificationUrl = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
    const verificationResponse = await fetch(verificationUrl, {
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
      },
    });

    if (!verificationResponse.ok) {
      throw new Error('Failed to verify transaction with Flutterwave.');
    }

    const verificationData = await verificationResponse.json();

    if (verificationData.status !== 'success' || verificationData.data.tx_ref !== tx_ref) {
      throw new Error('Transaction verification failed.');
    }

    // 2. Find the order in our database
    const order = await sdk.getOrder(tx_ref); // Assuming tx_ref is stored as the transactionRef
    if (!order) {
      throw new Error(`Order with reference ${tx_ref} not found.`);
    }

    // 3. Verify amount and currency
    const orderTotal = order.total.toFixed(2);
    const paidAmount = verificationData.data.amount.toString();
    if (orderTotal !== paidAmount || verificationData.data.currency !== 'USD') {
        throw new Error(`Amount mismatch for order ${order.id}.`);
    }

    // 4. Update order status
    await sdk.updateOrderStatus(order.id, 'paid', undefined, { flutterwaveTransactionId: transaction_id });

    // 5. Redirect to confirmation page
    return new Response(null, {
      status: 302,
      headers: { Location: `/order-detail/${order.id}` },
    });

  } catch (error) {
    console.error('Error processing Flutterwave callback:', error);
    return new Response('Failed to process payment.', { status: 500 });
  }
}