// BismiLLAH Ar-Rahman Ar-Raheem.
// products-list — public product catalog reads (no auth). Port of the GET side
// of apps/api/src/handlers/products.ts (incl. searchProducts filter building).
// Body: { id?, search?, category?, sellerId?, storeId?, featured?, limit?,
//         offset?, minPrice?, maxPrice? }
// With `id`: returns a single product (or 404). Otherwise returns an array.

return handleSafe(async function () {
  var q = ctx.body || {};

  if (q.id) {
    var product = await qGet('products', String(q.id));
    if (!product) return jerr('Product not found', 404);
    return json(product, 200);
  }

  var wantsFilter = q.search || q.category || q.sellerId || q.storeId || q.featured;

  if (wantsFilter) {
    var and = [{ field: 'isActive', op: 'eq', value: true }];
    var search = q.search ? String(q.search) : '';
    if (search) {
      and.push({
        or: [
          { field: 'name', op: 'ilike', value: '%' + search + '%' },
          { field: 'description', op: 'ilike', value: '%' + search + '%' },
          { field: 'category', op: 'ilike', value: '%' + search + '%' },
          { field: 'tags', op: 'contains', value: search },
        ],
      });
    }
    if (q.category) and.push({ field: 'category', op: 'eq', value: q.category });
    if (q.sellerId) and.push({ field: 'sellerId', op: 'eq', value: q.sellerId });
    if (q.storeId) and.push({ field: 'storeId', op: 'eq', value: q.storeId });
    if (q.featured === true || q.featured === 'true') and.push({ field: 'isFeatured', op: 'eq', value: true });
    if (q.minPrice != null && q.minPrice !== '') and.push({ field: 'price', op: 'gte', value: num(q.minPrice) });
    if (q.maxPrice != null && q.maxPrice !== '') and.push({ field: 'price', op: 'lte', value: num(q.maxPrice) });

    var limit = q.limit ? num(q.limit) : 1000;
    var offset = q.offset ? num(q.offset) : 0;
    var req = { filter: { and: and }, sort: [{ field: '_created_at', direction: 'desc' }], limit: limit };
    if (offset > 0) req.cursor = { limit: limit, offset: offset };

    var res = await db.query('products', req);
    return json(((res && res.data) || []).map(mapDoc), 200);
  }

  var rows = await qAll('products', null, 1000, [{ field: '_created_at', direction: 'desc' }]);
  return json(rows, 200);
});
