// BismiLLAH Ar-Rahman Ar-Raheem.
// webhook-birrpay — BirrPay payment event receiver (public function; enforces
// its own HMAC auth). Port of apps/api/src/handlers/birrpay-webhook.ts.
//
// INVOKE ENVELOPE: the engine invoke route only forwards the JSON envelope
// { body, headers }, so senders must POST:
//   { "body": <raw event JSON string or object>,
//     "headers": { "x-birrpay-signature": "t=<ts>,v1=<hex>" , ... } }
// (The engine has no raw-webhook passthrough yet — see WORKLOG/DEPLOYMENT.md.)
//
// SIGNATURE: header `t=<unix ts>,v1=<hex>` is HMAC-SHA256(secret, "<t>.<body>")
// (current BirrPay relay format, BirrPay-Beta1b src/lib/relay.ts). `v2=<hex>`
// is the upgraded HMAC-SHA512(secret, "<t>.<body>") — accepted in parallel.
// Both verify through crypto.subtle with a constant-time compare and a
// 10-minute replay window. Secret: env BIRRPAY_WEBHOOK_SECRET.
//
// BEHAVIOUR: on payment.succeeded, marks the order referenced by
// goshop_<orderId>_<ts> as confirmed/paid. Idempotent; unknown references ACK
// 200 so BirrPay does not retry forever. Responds via { __response } takeover.

async function verifySignature(rawBody, sigHeader) {
  var secret = (ctx.env && ctx.env.BIRRPAY_WEBHOOK_SECRET) || '';
  if (!secret || !sigHeader) return false;

  var parts = {};
  var pieces = String(sigHeader).split(',');
  for (var i = 0; i < pieces.length; i++) {
    var kv = pieces[i].split('=');
    if (kv.length >= 2) parts[kv[0].trim()] = kv.slice(1).join('=').trim();
  }
  var t = parts['t'];
  var v1 = parts['v1']; // HMAC-SHA256 (current BirrPay relay)
  var v2 = parts['v2']; // HMAC-SHA512 (upgraded scheme)
  if (!t || (!v1 && !v2)) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 600) return false; // replay guard

  var signed = t + '.' + rawBody;

  if (v1) {
    var key1 = await crypto.subtle.importKey('raw', __ENC.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    var sig1 = await crypto.subtle.sign('HMAC', key1, __ENC.encode(signed));
    var hex1 = hexEncode(sig1);
    if (constantTimeEqualStr(hex1, String(v1).toLowerCase())) return true;
  }
  if (v2) {
    var key2 = await crypto.subtle.importKey('raw', __ENC.encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
    var sig2 = await crypto.subtle.sign('HMAC', key2, __ENC.encode(signed));
    var hex2 = hexEncode(sig2);
    if (constantTimeEqualStr(hex2, String(v2).toLowerCase())) return true;
  }
  return false;
}

return handleSafe(async function () {
  // Envelope passthrough: senders may forward the verbatim signed body string
  // (preferred — byte-identical HMAC) or the parsed event object.
  var rawBody;
  var event;
  if (typeof ctx.body === 'string') {
    rawBody = ctx.body;
    try {
      event = JSON.parse(rawBody);
    } catch (e) {
      return json({ success: false, error: 'Invalid JSON' }, 400);
    }
  } else if (ctx.body && typeof ctx.body === 'object') {
    event = ctx.body;
    rawBody = JSON.stringify(event);
  } else {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  var sigHeader =
    (ctx.headers && (ctx.headers['x-birrpay-signature'] || ctx.headers['X-BirrPay-Signature'])) || null;

  if (!(await verifySignature(rawBody, sigHeader))) {
    return json({ success: false, error: 'Invalid signature' }, 401);
  }

  var reference = (event && event.data && event.data.reference) || '';
  if (event && event.event === 'payment.succeeded' && reference) {
    // Our references carry the order id: goshop_<orderId>_<ts>
    var segs = String(reference).split('_');
    var orderId = segs.length > 1 ? segs[1] : '';
    if (orderId) {
      var order = await qGet('orders', orderId);
      if (order && order.paymentStatus !== 'completed') {
        await qUpdate('orders', orderId, {
          status: 'confirmed',
          paymentStatus: 'completed',
          transactionRef: reference,
        });
      }
    }
  }

  return json({ success: true, received: true }, 200);
});
