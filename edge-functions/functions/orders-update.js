// BismiLLAH Ar-Rahman Ar-Raheem.
// orders-update — buyer/seller/admin order status updates with ownership
// checks. Port of the PATCH side of apps/api/src/handlers/orders.ts.
// Body: { id, ...updates }.

function statusMessage(status) {
  switch (status) {
    case 'confirmed': return 'Your order has been confirmed and is being prepared.';
    case 'processing': return 'Your order is now being processed.';
    case 'shipped': return 'Your order has been shipped. See the tracking details below.';
    case 'out_for_delivery': return 'Your order is out for delivery and will arrive soon.';
    case 'delivered': return 'Your order has been delivered. Enjoy your purchase!';
    case 'cancelled': return 'Your order has been cancelled. If you did not request this, please contact support.';
    case 'refunded': return 'A refund has been processed for your order.';
    default: return 'Your order status is now: ' + status + '.';
  }
}

return handleSafe(async function () {
  var user = await requireUser();
  var body = ctx.body || {};
  var id = body.id;
  if (!id) return jerr('Order ID required', 400);

  var order = await qGet('orders', String(id));
  if (!order) return jerr('Order not found', 404);

  if (order.sellerId !== user.id && order.userId !== user.id && user.role !== 'admin') {
    return jerr('Forbidden', 403);
  }

  var updates = {};
  for (var k in body) { if (k !== 'id') updates[k] = body[k]; }
  var updated = await qUpdate('orders', String(id), updates);

  // Status-change email events (recorded, fire-and-forget).
  try {
    var prevStatus = order.status;
    var newStatus = updates.status;
    if (newStatus && newStatus !== prevStatus) {
      var customer = await qGet('users', order.userId);
      if (customer && customer.email) {
        var base = ((ctx.env && ctx.env.APP_URL) || '').replace(/\/$/, '');
        var payload = {
          name: customer.name || customer.firstName || '',
          orderId: id,
          newStatus: newStatus,
          trackingLink: base + '/order/' + id,
          message: statusMessage(newStatus),
        };
        await recordEmailEvent('orderStatusUpdate', customer.email, payload);
        if (newStatus === 'shipped') {
          await recordEmailEvent('orderShipped', customer.email, {
            name: payload.name,
            orderId: id,
            trackingNumber: updates.trackingNumber || order.trackingNumber || '',
            carrier: updates.carrier || 'Shipping partner',
            trackingLink: payload.trackingLink,
          });
        }
        if (newStatus === 'delivered') {
          await recordEmailEvent('orderDelivered', customer.email, {
            name: payload.name,
            orderId: id,
            reviewLink: base + '/order/' + id + '?review=1',
          });
        }
      }
    }
  } catch (emailErr) {
    console.error('[orders-update] email event failed:', String(emailErr && emailErr.message ? emailErr.message : emailErr));
  }

  return json(updated, 200);
});
