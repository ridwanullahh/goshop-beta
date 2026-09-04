// BismiLLAH Ar-Rahman Ar-Raheem.
// orders-list — authenticated order reads with ownership scoping. Port of the
// GET side of apps/api/src/handlers/orders.ts.
// Body: { id?, status? }. Single order when `id` is present.

return handleSafe(async function () {
  var user = await requireUser();
  var q = ctx.body || {};

  if (q.id) {
    var order = await qGet('orders', String(q.id));
    if (!order) return jerr('Order not found', 404);
    if (order.userId !== user.id && order.sellerId !== user.id && user.role !== 'admin') {
      return jerr('Forbidden', 403);
    }
    return json(order, 200);
  }

  var orders = await qAll('orders', null, 1000, [{ field: '_created_at', direction: 'desc' }]);
  if (user.role !== 'admin') {
    orders = orders.filter(function (o) { return o.userId === user.id || o.sellerId === user.id; });
  }
  if (q.status) {
    orders = orders.filter(function (o) { return o.status === q.status; });
  }
  return json(orders, 200);
});
