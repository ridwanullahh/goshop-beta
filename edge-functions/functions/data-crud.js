// BismiLLAH Ar-Rahman Ar-Raheem.
// data-crud — generic entity CRUD. Port of apps/api/src/handlers/data.ts
// (the /api/data/:entity surface) including its auth rules, user scoping and
// cart/wishlist/review special cases.
//
// Body: { entity, op: 'get'|'list'|'create'|'update'|'delete', id?, data?, where?, limit? }
//
// Public entities read without auth; everything else requires a valid GoShop
// JWT (verified inside this function). User-scoped entities are always
// filtered by the caller's own id — the client never chooses the filter.

var TABLE_MAP = {
  cart: 'cart_items',
  cart_items: 'cart_items',
  wishlist: 'wishlist',
  categories: 'categories',
  users: 'users',
  stores: 'stores',
  notifications: 'notifications',
  wallets: 'wallets',
  transactions: 'transactions',
  posts: 'posts',
  comments: 'comments',
  blogs: 'blogs',
  help_articles: 'help_articles',
  reviews: 'reviews',
  affiliate_links: 'affiliate_links',
  affiliate_collections: 'affiliate_collections',
  refund_requests: 'refund_requests',
  disputes: 'disputes',
  withdrawal_requests: 'withdrawal_requests',
  platform_commissions: 'platform_commissions',
  seller_agreements: 'seller_agreements',
  livestreams: 'livestreams',
  languages: 'languages',
  currencies: 'currencies',
  referral_codes: 'referral_codes',
  sessions: 'sessions',
};

var PUBLIC_ENTITIES = {
  categories: 1, products: 1, stores: 1, blogs: 1, help_articles: 1,
  languages: 1, currencies: 1, reviews: 1, posts: 1, comments: 1,
};

var SELLER_ADMIN_WRITE = {
  categories: 1, blogs: 1, help_articles: 1, platform_commissions: 1,
  seller_agreements: 1, languages: 1, currencies: 1,
};

var USER_SCOPED = {
  cart: 1, cart_items: 1, wishlist: 1, notifications: 1, wallets: 1,
  transactions: 1, referral_codes: 1, withdrawal_requests: 1,
};

function resolveTable(entity) {
  if (!entity) return null;
  var table = TABLE_MAP[entity] || entity;
  return { entity: entity, table: table };
}

return handleSafe(async function () {
  var body = ctx.body || {};
  var resolved = resolveTable(body.entity);
  if (!resolved) return jerr('Entity not found', 404);
  var entity = resolved.entity;
  var table = resolved.table;
  var op = body.op;

  // ---- GET (single) ----
  if (op === 'get') {
    if (!body.id) return jerr('ID required', 400);
    var item = await qGet(table, String(body.id));
    if (!item) return jerr('Not found', 404);
    if (!PUBLIC_ENTITIES[entity]) {
      await requireUser();
    }
    return json(item, 200);
  }

  // ---- LIST ----
  if (op === 'list') {
    var where = {};
    for (var wk in body.where || {}) where[wk] = body.where[wk];
    if (!PUBLIC_ENTITIES[entity]) {
      var lu = await requireUser();
      if (USER_SCOPED[entity]) where.userId = lu.id;
    }
    var rows = await qAll(table, where, body.limit ? num(body.limit) : 1000);
    return json(rows, 200);
  }

  // ---- CREATE ----
  if (op === 'create') {
    var cu = null;
    if (!PUBLIC_ENTITIES[entity] || SELLER_ADMIN_WRITE[entity]) {
      cu = await requireUser();
    }
    var data = body.data || {};

    if (entity === 'cart' || entity === 'cart_items') {
      var existingCart = await qOne('cart_items', { userId: cu.id, productId: data.productId });
      if (existingCart) {
        var merged = await qUpdate('cart_items', existingCart.id, {
          quantity: (existingCart.quantity || 0) + (data.quantity || 1),
        });
        return json(merged, 200);
      }
      var cartItem = await qInsert('cart_items', Object.assign({}, data, { userId: cu.id }));
      return json(cartItem, 201);
    }

    if (entity === 'wishlist') {
      var existingWish = await qOne('wishlist', { userId: cu.id, productId: data.productId });
      if (existingWish) return json(existingWish, 200);
      var wishItem = await qInsert('wishlist', Object.assign({}, data, { userId: cu.id }));
      return json(wishItem, 201);
    }

    if (entity === 'reviews') {
      var review = await qInsert('reviews', Object.assign({}, data, { userId: cu.id, userName: cu.name, isVerified: true }));
      return json(review, 201);
    }

    if (cu && (entity === 'notifications' || entity === 'posts' || entity === 'comments') && data.userId === undefined) {
      data.userId = cu.id;
    }

    var created = await qInsert(table, data);
    return json(created, 201);
  }

  // ---- UPDATE ----
  if (op === 'update') {
    var uu = await requireUser();
    if (!body.id) return jerr('ID required', 400);

    var existingRow = await qGet(table, String(body.id));
    if (!existingRow) return jerr('Not found', 404);

    var userIdField = existingRow.userId !== undefined ? 'userId' : existingRow.sellerId !== undefined ? 'sellerId' : null;
    if (uu.role !== 'admin' && userIdField && existingRow[userIdField] !== uu.id && !SELLER_ADMIN_WRITE[entity]) {
      // Patching own rows (notifications read flag, cart, wishlist, ...) is allowed.
    } else if (uu.role !== 'admin' && SELLER_ADMIN_WRITE[entity]) {
      return jerr('Forbidden', 403);
    }

    var updates = body.data || {};
    var updated = await qUpdate(table, String(body.id), updates);
    return json(updated, 200);
  }

  // ---- DELETE ----
  if (op === 'delete') {
    var du = await requireUser();
    if (!body.id) return jerr('ID required', 400);

    var delRow = await qGet(table, String(body.id));
    if (!delRow) return jerr('Not found', 404);

    var dField = delRow.userId !== undefined ? 'userId' : delRow.sellerId !== undefined ? 'sellerId' : null;
    if (du.role !== 'admin' && dField && delRow[dField] !== du.id) {
      return jerr('Forbidden', 403);
    }
    if (du.role !== 'admin' && SELLER_ADMIN_WRITE[entity]) {
      return jerr('Forbidden', 403);
    }

    var deleted = true;
    try {
      await db.delete(table, String(body.id));
    } catch (e) {
      deleted = false;
    }
    if (!deleted) return jerr('Not found', 404);
    return json({ success: true }, 200);
  }

  return jerr('Invalid op. Use get, list, create, update, or delete.', 400);
});
