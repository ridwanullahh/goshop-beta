// BismiLLAH Ar-Rahman Ar-Raheem.
// payments-initiate — authenticated payment initiation. Port of
// apps/api/src/handlers/payments.ts (POST /api/payments).
// Body: { orderId, paymentMethod } — wallet | cod | paystack | flutterwave |
// birrpay | razorpay | paypal. Gateway keys come from function env; unconfigured
// gateways return 503 exactly like the old handler.

return handleSafe(async function () {
  var user = await requireUser();
  var body = ctx.body || {};
  var orderId = body.orderId;
  var paymentMethod = body.paymentMethod;

  if (!orderId || !paymentMethod) return jerr('orderId and paymentMethod required', 400);

  var order = await qGet('orders', String(orderId));
  if (!order) return jerr('Order not found', 404);
  if (order.userId !== user.id) return jerr('Forbidden', 403);

  var reference = 'goshop_' + order.id + '_' + Date.now();
  var appUrl = ((ctx.env && ctx.env.APP_URL) || '').replace(/\/$/, '');

  if (paymentMethod === 'wallet') {
    var wallets = await qAll('wallets', { userId: user.id }, 5);
    var wallet = wallets[0];
    if (!wallet || num(wallet.balance) < num(order.total)) {
      return jerr('Insufficient wallet balance', 400);
    }

    var newBalance = num(wallet.balance) - num(order.total);
    await qUpdate('wallets', wallet.id, { balance: newBalance });
    await qInsert('transactions', {
      walletId: wallet.id,
      amount: num(order.total),
      type: 'debit',
      description: 'Payment for Order #' + order.id,
      orderId: order.id,
      status: 'completed',
    });

    await qUpdate('orders', order.id, {
      status: 'confirmed',
      paymentStatus: 'completed',
      transactionRef: reference,
    });

    await recordEmailEvent('paymentSuccess', user.email, {
      name: user.name || user.firstName || '',
      orderId: order.id,
      amount: order.total,
      paymentMethod: 'wallet',
      receiptLink: appUrl ? appUrl + '/order/' + order.id + '?receipt=1' : '',
    });
    await recordEmailEvent('walletDebited', user.email, {
      name: user.name || user.firstName || '',
      amount: order.total,
      balance: newBalance,
      description: 'Payment for Order #' + order.id,
    });

    return json({ success: true, transactionId: String(Date.now()) }, 200);
  }

  if (paymentMethod === 'cod') {
    await qUpdate('orders', order.id, {
      status: 'confirmed',
      paymentStatus: 'pending',
      paymentMethod: 'cod',
      transactionRef: reference,
    });
    return json({ success: true, transactionRef: reference }, 200);
  }

  if (paymentMethod === 'paystack') {
    var paystackKey = ctx.env && ctx.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) return jerr('Paystack not configured', 503);
    var res1 = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + paystackKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(num(order.total) * 100),
        reference: reference,
        callback_url: appUrl + '/order/' + order.id,
        metadata: { orderId: order.id, userId: user.id },
      }),
    });
    if (!res1.ok) return jerr('Paystack error', 500);
    var d1 = await res1.json();
    await qUpdate('orders', order.id, { status: 'pending_payment', transactionRef: reference });
    return json({ redirectUrl: d1.data.authorization_url }, 200);
  }

  if (paymentMethod === 'flutterwave') {
    var flwKey = ctx.env && ctx.env.FLUTTERWAVE_SECRET_KEY;
    if (!flwKey) return jerr('Flutterwave not configured', 503);
    var res2 = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + flwKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tx_ref: reference,
        amount: num(order.total).toFixed(2),
        currency: 'USD',
        redirect_url: appUrl + '/order/' + order.id,
        customer: { email: user.email, name: user.name },
      }),
    });
    if (!res2.ok) return jerr('Flutterwave error', 500);
    var d2 = await res2.json();
    await qUpdate('orders', order.id, { status: 'pending_payment', transactionRef: reference });
    return json({ redirectUrl: d2.data.link }, 200);
  }

  if (paymentMethod === 'birrpay') {
    // BirrPay — PRIMARY gateway: one hosted checkout for the fleet. The old
    // handler called the same endpoint with the same payload.
    var birrpayKey = ctx.env && ctx.env.BIRRPAY_SECRET_KEY;
    var birrpayBase = ((ctx.env && ctx.env.BIRRPAY_BASE_URL) || 'https://birrpay-beta1b.pages.dev').replace(/\/+$/, '');
    if (!birrpayKey) return jerr('BirrPay not configured', 503);
    var res3 = await fetch(birrpayBase + '/api/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + birrpayKey,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'goshop:' + reference,
      },
      body: JSON.stringify({
        amount: Math.round(num(order.total) * 100),
        currency: (ctx.env && ctx.env.BIRRPAY_CURRENCY) || 'NGN',
        customer: { email: user.email, name: user.name || user.firstName || undefined },
        reference: reference,
        callback_url: appUrl + '/order/' + order.id,
        metadata: { orderId: order.id, userId: user.id },
      }),
    });
    if (!res3.ok) {
      var errTxt = await res3.text().catch(function () { return ''; });
      console.error('[payments-initiate] birrpay session failed:', res3.status, String(errTxt).slice(0, 200));
      return jerr('BirrPay error', 500);
    }
    var d3 = await res3.json();
    await qUpdate('orders', order.id, { status: 'pending_payment', transactionRef: reference, paymentMethod: 'birrpay' });
    return json({ redirectUrl: d3.data && d3.data.checkout_url, reference: reference }, 200);
  }

  if (paymentMethod === 'razorpay') {
    var rzKeyId = ctx.env && ctx.env.RAZORPAY_KEY_ID;
    var rzSecret = ctx.env && ctx.env.RAZORPAY_KEY_SECRET;
    if (!rzKeyId || !rzSecret) return jerr('Razorpay not configured', 503);
    var authHeader = 'Basic ' + btoa(rzKeyId + ':' + rzSecret);
    var res4 = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(num(order.total) * 100),
        currency: 'INR',
        receipt: order.id,
      }),
    });
    if (!res4.ok) return jerr('Razorpay error', 500);
    var d4 = await res4.json();
    await qUpdate('orders', order.id, { status: 'pending_payment', transactionRef: d4.id });
    return json({ razorpayOrderId: d4.id, keyId: rzKeyId }, 200);
  }

  if (paymentMethod === 'paypal') {
    var paypalClientId = ctx.env && ctx.env.PAYPAL_CLIENT_ID;
    var paypalSecret = ctx.env && ctx.env.PAYPAL_CLIENT_SECRET;
    if (!paypalClientId || !paypalSecret) return jerr('PayPal not configured', 503);
    var authRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(paypalClientId + ':' + paypalSecret),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    var authData = await authRes.json();
    var orderRes = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + authData.access_token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'USD', value: num(order.total).toFixed(2) }, reference_id: order.id }],
        application_context: {
          return_url: appUrl + '/order/' + order.id,
          cancel_url: appUrl + '/checkout',
        },
      }),
    });
    var paypalOrder = await orderRes.json();
    var approvalLink = null;
    if (paypalOrder.links) {
      for (var l = 0; l < paypalOrder.links.length; l++) {
        if (paypalOrder.links[l].rel === 'approve') approvalLink = paypalOrder.links[l];
      }
    }
    await qUpdate('orders', order.id, { status: 'pending_payment', transactionRef: paypalOrder.id });
    return json({ redirectUrl: approvalLink ? approvalLink.href : undefined }, 200);
  }

  return jerr('Invalid payment method', 400);
});
