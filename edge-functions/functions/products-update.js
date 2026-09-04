// BismiLLAH Ar-Rahman Ar-Raheem.
// products-update — owner/admin product update. Port of PATCH side of
// apps/api/src/handlers/products.ts.
// Body: { id, ...updates }.

return handleSafe(async function () {
  var user = await requireUser();
  var body = ctx.body || {};
  var id = body.id;
  if (!id) return jerr('Product ID required', 400);

  var existing = await qGet('products', String(id));
  if (!existing) return jerr('Product not found', 404);

  if (existing.sellerId !== user.id && user.role !== 'admin') {
    return jerr('Forbidden', 403);
  }

  var updates = {};
  for (var k in body) { if (k !== 'id') updates[k] = body[k]; }
  var updated = await qUpdate('products', String(id), updates);
  return json(updated, 200);
});
