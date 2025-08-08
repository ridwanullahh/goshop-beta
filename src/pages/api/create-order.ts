import CommerceSDK from '@/lib/commerce-sdk';
import { createOrderSchema } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';

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
    const validationResult = createOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validationResult.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { cartItems, shippingInfo, paymentMethod } = validationResult.data;

    const productIds = cartItems.map(item => item.productId);
    const allProducts = await sdk.getProducts();
    const productsInCart = allProducts.filter(p => productIds.includes(p.id));

    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = productsInCart.find(p => p.id === item.productId);

      if (!product) {
        return new Response(JSON.stringify({ error: `Product with ID ${item.productId} not found.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      if (product.inventory! < item.quantity) {
        return new Response(JSON.stringify({ error: `Not enough stock for ${product.name}.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      subtotal += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        images: product.images,
      });
    }
    
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const orderData = {
      userId: user.id,
      items: orderItems,
      shippingInfo,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
    };

    const newOrder = await sdk.createOrder(orderData);

    return new Response(JSON.stringify(newOrder), {
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