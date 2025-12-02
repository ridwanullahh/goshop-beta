import { CommerceSDK, type Order, type OrderItem, type Address } from '@/lib';
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
    const orderItems: OrderItem[] = [];

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

      const lineSubtotal = product.price * item.quantity;
      subtotal += lineSubtotal;

      const perItemShipping = product.shippingEnabled ? product.shippingCost ?? 0 : 0;
      const deliveryMethod: OrderItem['deliveryMethod'] = product.shippingEnabled ? 'shipping' : 'pickup';
      const categoryCommissionPct = await sdk.getCategoryCommission(product.category);
      const platformCommission = (categoryCommissionPct / 100) * lineSubtotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        images: product.images,
        product,
        sellerId: product.sellerId || '',
        shippingCost: perItemShipping,
        deliveryMethod,
        platformCommission,
        affiliateCommission: 0,
        status: 'pending',
      });
    }
    
    const shippingTotal = orderItems.reduce((sum, it) => sum + it.shippingCost * it.quantity, 0);
    const total = subtotal + shippingTotal;

    const address: Address = {
      street: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip: shippingInfo.zipCode,
      zipCode: shippingInfo.zipCode,
      country: shippingInfo.country,
      firstName: shippingInfo.firstName,
      lastName: shippingInfo.lastName,
      address: shippingInfo.address,
      phone: shippingInfo.phone,
    };

    const platformCommissionTotal = orderItems.reduce((sum, it) => sum + it.platformCommission, 0);
    const affiliateCommissionTotal = 0;
    const paidAmount = platformCommissionTotal + shippingTotal;
    const remainingAmount = Math.max(0, total - paidAmount);

    const orderData: Partial<Order> = {
      userId: user.id,
      items: orderItems,
      paymentMethod,
      subtotal,
      shippingTotal,
      total,
      platformCommission: platformCommissionTotal,
      affiliateCommission: affiliateCommissionTotal,
      paidAmount,
      remainingAmount,
      status: 'pending',
      shippingAddress: address,
      billingAddress: address,
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