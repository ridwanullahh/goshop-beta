import { CommerceSDK } from '@/lib';
import paypalClient from '@/lib/paypal-client';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export default async function handler(req: Request): Promise<Response> {
  const sdk = new CommerceSDK();
  const url = new URL(req.url);
  const orderId = url.searchParams.get('orderId');
  const paypalToken = url.searchParams.get('token');

  if (!orderId || !paypalToken) {
    return new Response('Missing required parameters.', { status: 400 });
  }

  try {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypalToken);
    request.requestBody({} as any);

    const capture = await paypalClient.execute(request);
    const captureId = capture.result.purchase_units[0].payments.captures[0].id;
    
    console.log(`Successfully captured payment: ${captureId}`);

    await sdk.updateOrderStatus(orderId, 'paid', undefined, { paypalCaptureId: captureId });

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/order-detail/${orderId}`,
      },
    });

  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return new Response('Failed to capture payment.', { status: 500 });
  }
}