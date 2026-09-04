// BismiLLAH Ar-Rahman Ar-Raheem.
// products-delete — owner/admin product delete. Port of DELETE side of
// apps/api/src/handlers/products.ts.
// Body: { id }.

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

  await db.delete('products', String(id));
  return json({ success: true }, 200);
});
