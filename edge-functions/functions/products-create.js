// BismiLLAH Ar-Rahman Ar-Raheem.
// products-create — seller/admin product creation. Port of POST side of
// apps/api/src/handlers/products.ts. Requires a valid GoShop JWT with the
// seller or admin role.
// Body: full product document (sellerId/sellerName are forced server-side).

return handleSafe(async function () {
  var user = await requireUser();
  requireRole(user, ['seller', 'admin']);

  var body = ctx.body || {};
  var product = await qInsert('products', {
    name: body.name !== undefined ? body.name : undefined,
    description: body.description,
    images: body.images,
    price: body.price !== undefined ? num(body.price) : undefined,
    originalPrice: body.originalPrice,
    discount: body.discount,
    category: body.category,
    storeId: body.storeId,
    sellerId: user.id,
    sellerName: user.name || user.businessName,
    inventory: body.inventory,
    tags: body.tags,
    isFeatured: body.isFeatured,
    isActive: body.isActive !== undefined ? body.isActive : true,
    sku: body.sku,
    shippingCost: body.shippingCost,
    affiliateEnabled: body.affiliateEnabled,
    affiliateCommission: body.affiliateCommission,
    type: body.type || 'simple',
    currency: body.currency || 'USD',
    brand: body.brand,
    specifications: body.specifications,
    variations: body.variations,
    variants: body.variants,
    bundles: body.bundles,
  });

  return json(product, 201);
});
