import CommerceSDK from '@/lib/commerce-sdk';
import { initiatePaymentSchema } from '@/lib/validation';
import paypalClient from '@/lib/paypal-client';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import Razorpay from 'razorpay';
import { verifyAuth } from '@/lib/auth';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

const initiatePaystackPayment = async (sdk: CommerceSDK, order: any) => {
  const url = 'https://api.paystack.co/transaction/initialize';
  const reference = `goshop_${order.id}_${Date.now()}`;

  const payload = {
    email: order.shippingAddress.email,
    amount: Math.round(order.total * 100),
    reference: reference,
    callback_url: `${process.env.VITE_APP_URL}/order-detail/${order.id}`,
    metadata: {
      orderId: order.id,
      userId: order.userId,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Paystack API error: ${response.status} ${errorBody}`);
  }

  const data = await response.json();

  if (!data.status) {
    throw new Error(`Paystack payment initialization failed: ${data.message}`);
  }

  await sdk.updateOrderStatus(order.id, 'pending_payment', undefined, { transactionRef: reference });

  return { redirectUrl: data.data.authorization_url };
};

const initiatePayPalPayment = async (sdk: CommerceSDK, order: any) => {
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: order.total.toFixed(2),
      },
      reference_id: order.id,
    }],
    application_context: {
      return_url: `${process.env.VITE_APP_URL}/paypal-capture-payment?orderId=${order.id}`,
      cancel_url: `${process.env.VITE_APP_URL}/checkout`,
    }
  });

  const payPalOrder = await paypalClient.execute(request);
  const paypalOrderId = payPalOrder.result.id;

  await sdk.updateOrderStatus(order.id, 'pending_payment', undefined, { transactionRef: paypalOrderId });

  const approvalLink = payPalOrder.result.links.find((link: any) => link.rel === 'approve');
  
  if (!approvalLink) {
    throw new Error('Could not find PayPal approval link.');
  }

  return { redirectUrl: approvalLink.href };
};


const initiateFlutterwavePayment = async (sdk: CommerceSDK, order: any) => {
    const url = 'https://api.flutterwave.com/v3/payments';
    const reference = `goshop_flw_${order.id}_${Date.now()}`;

    const payload = {
        tx_ref: reference,
        amount: order.total.toFixed(2),
        currency: "USD",
        redirect_url: `${process.env.VITE_APP_URL}/flutterwave-callback`,
        customer: {
            email: order.shippingAddress.email,
            name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        },
        customizations: {
            title: "GoShop Purchase",
            description: `Payment for order #${order.id}`,
        },
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Flutterwave API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();

    if (data.status !== 'success') {
        throw new Error(`Flutterwave payment initialization failed: ${data.message}`);
    }

    await sdk.updateOrderStatus(order.id, 'pending_payment', undefined, { transactionRef: reference });

    return { redirectUrl: data.data.link };
};

const initiateRazorpayPayment = async (sdk: CommerceSDK, order: any) => {
    const instance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: Math.round(order.total * 100),
        currency: "INR",
        receipt: order.id,
    };

    const razorpayOrder = await instance.orders.create(options);
    
    await sdk.updateOrderStatus(order.id, 'pending_payment', undefined, { transactionRef: razorpayOrder.id });

    return { razorpayOrderId: razorpayOrder.id };
};

const processWalletPayment = async (sdk: CommerceSDK, order: any) => {
    const transaction = await sdk.payWithWallet(order.userId, order.total, `Payment for Order #${order.id}`);
    return { transactionId: transaction.id };
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sdk = new CommerceSDK();

  try {
    const user = await verifyAuth(req);
    const body = await req.json();
    const validationResult = initiatePaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validationResult.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { orderId, paymentMethod } = validationResult.data;

    const order = await sdk.getOrder(orderId, user.id);
    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found or you do not have permission to access it.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let paymentResult;

    switch (paymentMethod) {
      case 'paystack':
        paymentResult = await initiatePaystackPayment(sdk, order);
        break;
      case 'paypal':
        paymentResult = await initiatePayPalPayment(sdk, order);
        break;
      case 'flutterwave':
        paymentResult = await initiateFlutterwavePayment(sdk, order);
        break;
      case 'razorpay':
        paymentResult = await initiateRazorpayPayment(sdk, order);
        break;
      case 'wallet':
        paymentResult = await processWalletPayment(sdk, order);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid payment method' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(paymentResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    const statusCode = errorMessage.startsWith('Unauthorized') ? 401 : 500;
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}