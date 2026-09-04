// BismiLLAH Ar-Rahman Ar-Raheem.
// orders-create — authenticated order creation with server-side total
// validation and cart clearing. Port of the POST side of
// apps/api/src/handlers/orders.ts.
// Body: { items: [{ productId, quantity, deliveryMethod? }], shippingTotal?,
//         platformCommission?, affiliateCommission?, paidAmount?,
//         remainingAmount?, paymentMethod?, shippingAddress?, billingAddress?,
//         deliveryMethod?, affiliateId?, currency?, estimatedDelivery? }

return handleSafe(async function () {
  var user = await requireUser();
  var body = ctx.body || {};
  var items = Array.isArray(body.items) ? body.items : [];

  // Validate items against live product prices (never trust client totals).
  var serverTotal = 0;
  var validatedItems = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i] || {};
    var product = await qGet('products', String(item.productId || ''));
    if (!product) return jerr('Product ' + item.productId + ' not found', 400);
    var quantity = num(item.quantity) || 1;
    var itemTotal = num(product.price) * quantity;
    serverTotal += itemTotal;
    validatedItems.push({
      productId: product.id,
      quantity: quantity,
      price: num(product.price),
      name: product.name,
      images: product.images || [],
      sellerId: product.sellerId,
      storeId: product.storeId,
      shippingCost: num(product.shippingCost),
      deliveryMethod: item.deliveryMethod || 'shipping',
      platformCommission: num(product.affiliateCommission),
      affiliateCommission: 0,
      status: 'pending',
    });
  }

  var order = await qInsert('orders', {
    userId: user.id,
    items: validatedItems,
    total: serverTotal + num(body.shippingTotal),
    subtotal: serverTotal,
    platformCommission: num(body.platformCommission),
    affiliateCommission: num(body.affiliateCommission),
    shippingTotal: num(body.shippingTotal),
    paidAmount: num(body.paidAmount),
    remainingAmount: body.remainingAmount !== undefined ? num(body.remainingAmount) : serverTotal,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: body.paymentMethod || 'cod',
    shippingAddress: body.shippingAddress || {},
    billingAddress: body.billingAddress || body.shippingAddress || {},
    deliveryMethod: body.deliveryMethod || 'shipping',
    affiliateId: body.affiliateId,
  });

  // Clear the buyer's cart (old removeWhere('cart_items', { userId })).
  try {
    var cartItems = await qAll('cart_items', { userId: user.id }, 500);
    for (var c = 0; c < cartItems.length; c++) {
      await db.delete('cart_items', cartItems[c].id);
    }
  } catch (cartErr) {
    console.error('[orders-create] cart clear failed:', String(cartErr && cartErr.message ? cartErr.message : cartErr));
  }

  // Order confirmation email event for the buyer + newOrder events per seller.
  var appUrl = (ctx.env && ctx.env.APP_URL) || '';
  var base = appUrl.replace(/\/$/, '');
  await recordEmailEvent('orderConfirmation', user.email, {
    name: user.name || user.firstName || '',
    orderId: order.id,
    items: validatedItems,
    total: order.total,
    currency: body.currency || 'USD',
    estimatedDelivery: body.estimatedDelivery || '3-7 business days',
    trackingLink: base ? base + '/order/' + order.id : '',
  });
  try {
    var sellerIds = [];
    for (var s = 0; s < validatedItems.length; s++) {
      var sid = validatedItems[s].sellerId;
      if (sid && sellerIds.indexOf(sid) === -1) sellerIds.push(sid);
    }
    for (var t = 0; t < sellerIds.length; t++) {
      var seller = await qGet('users', sellerIds[t]);
      if (seller && seller.email) {
        var sellerItems = validatedItems.filter(function (it) { return it.sellerId === sellerIds[t]; });
        var sellerTotal = sellerItems.reduce(function (sum, it) { return sum + (it.quantity || 0) * (it.price || 0); }, 0);
        await recordEmailEvent('newOrder', seller.email, {
          orderId: order.id,
          customerName: user.name || user.firstName || 'Customer',
          items: sellerItems,
          total: sellerTotal,
          currency: body.currency || 'USD',
          dashboardLink: base + '/seller/dashboard',
        });
      }
    }
  } catch (sellerErr) {
    console.error('[orders-create] seller notify failed:', String(sellerErr && sellerErr.message ? sellerErr.message : sellerErr));
  }

  return json(order, 201);
});
