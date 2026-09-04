// BismiLLAH Ar-Rahman Ar-Raheem.
// GoShop lightbase provisioning: collections, read-only browser key, demo seed.
//
// Usage:
//   node scripts/lightbase-provision.mjs [collections|key|seed|all]
//
// Env:
//   LB_BASE_URL   engine origin (default: http://localhost:4400 — LOCAL dev;
//                 production default lives in the SPA build env, never here)
//   LB_ROOT_KEY   root/admin key for the project
//   LB_PROJECT    project id (default: goshop-beta)
//
// Idempotent: existing collections/keys are skipped, seeds are deduped on
// natural keys. Secrets are never written into the repo.

const BASE_URL = (process.env.LB_BASE_URL || 'http://localhost:4400').replace(/\/+$/, '');
const PROJECT = process.env.LB_PROJECT || 'goshop-beta';
const ROOT_KEY = process.env.LB_ROOT_KEY || '';

if (!ROOT_KEY) {
  console.error('[provision] LB_ROOT_KEY is required (root key of the project).');
  process.exit(1);
}

const HEADERS = {
  apikey: ROOT_KEY,
  'x-lightbase-project': PROJECT,
  'Content-Type': 'application/json',
};

async function api(method, path, body) {
  const res = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT}${path}`, {
    method,
    headers: HEADERS,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, ok: res.ok, data };
}

// ---- collection schemas (port of apps/api/src/lib/schema.ts) ------------
// Same field definitions the LightbaseProvider used to auto-create. The extra
// `email_events` collection records queued email events (see edge-functions).
function f(name, type, opts = {}) {
  return Object.assign({ name, type }, opts);
}

const SCHEMA = {
  users: [
    f('email', 'email', { required: true, unique: true, indexed: true }),
    f('passwordHash', 'string'),
    f('name', 'string'),
    f('firstName', 'string'),
    f('lastName', 'string'),
    f('avatar', 'url'),
    f('role', 'string', { default: 'customer' }),
    f('roles', 'json', { default: ['customer'] }),
    f('onboardingCompleted', 'boolean', { default: false }),
    f('businessName', 'string'),
    f('phone', 'phone'),
    f('address', 'text'),
    f('verified', 'boolean', { default: false }),
    f('permissions', 'json'),
    f('walletBalance', 'number', { default: 0 }),
    f('language', 'string', { default: 'en' }),
    f('currency', 'string', { default: 'USD' }),
    f('referralCode', 'string', { unique: true, indexed: true }),
    f('referredBy', 'string', { indexed: true }),
    f('referralEarnings', 'number', { default: 0 }),
    f('referralCount', 'integer', { default: 0 }),
  ],
  products: [
    f('name', 'string', { required: true }),
    f('description', 'text'),
    f('images', 'json', { default: [] }),
    f('price', 'number', { required: true, default: 0 }),
    f('originalPrice', 'number'),
    f('discount', 'number', { default: 0 }),
    f('rating', 'number', { default: 0 }),
    f('reviewCount', 'integer', { default: 0 }),
    f('category', 'string', { indexed: true }),
    f('storeId', 'string', { indexed: true }),
    f('sellerId', 'string', { indexed: true }),
    f('sellerName', 'string'),
    f('inventory', 'integer', { default: 0 }),
    f('tags', 'json', { default: [] }),
    f('isFeatured', 'boolean', { default: false, indexed: true }),
    f('isActive', 'boolean', { default: true }),
    f('sku', 'string'),
    f('weight', 'number'),
    f('dimensions', 'string'),
    f('shippingClass', 'string'),
    f('seoTitle', 'string'),
    f('seoDescription', 'text'),
    f('metaKeywords', 'string'),
    f('soldCount', 'integer', { default: 0 }),
    f('cloudinaryId', 'string'),
    f('type', 'string', { default: 'simple' }),
    f('variations', 'json', { default: [] }),
    f('variants', 'json', { default: [] }),
    f('bundles', 'json', { default: [] }),
    f('shippingEnabled', 'boolean', { default: true }),
    f('shippingCost', 'number', { default: 0 }),
    f('affiliateEnabled', 'boolean', { default: false }),
    f('affiliateCommission', 'number', { default: 0 }),
    f('currency', 'string', { default: 'USD' }),
    f('brand', 'string'),
    f('specifications', 'json', { default: {} }),
  ],
  categories: [
    f('name', 'string', { required: true }),
    f('slug', 'string', { required: true, unique: true, indexed: true }),
    f('description', 'text'),
    f('image', 'url'),
    f('icon', 'string'),
    f('parentId', 'string'),
    f('isActive', 'boolean', { default: true }),
    f('sortOrder', 'integer', { default: 0 }),
  ],
  orders: [
    f('userId', 'string', { required: true, indexed: true }),
    f('items', 'json', { required: true, default: [] }),
    f('total', 'number', { required: true, default: 0 }),
    f('subtotal', 'number'),
    f('platformCommission', 'number'),
    f('affiliateCommission', 'number'),
    f('shippingTotal', 'number'),
    f('paidAmount', 'number'),
    f('remainingAmount', 'number'),
    f('status', 'string', { default: 'pending', indexed: true }),
    f('paymentStatus', 'string', { default: 'pending' }),
    f('paymentMethod', 'string'),
    f('shippingAddress', 'json'),
    f('billingAddress', 'json'),
    f('sellerId', 'string', { indexed: true }),
    f('transactionRef', 'string'),
    f('deliveryMethod', 'string', { default: 'shipping' }),
    f('trackingNumber', 'string'),
    f('deliveredAt', 'datetime'),
    f('affiliateId', 'string'),
  ],
  cart_items: [
    f('userId', 'string', { required: true, indexed: true }),
    f('productId', 'string', { required: true }),
    f('quantity', 'integer', { default: 1 }),
  ],
  wishlist: [
    f('userId', 'string', { required: true, indexed: true }),
    f('productId', 'string', { required: true }),
  ],
  stores: [
    f('name', 'string', { required: true }),
    f('description', 'text'),
    f('logo', 'url'),
    f('banner', 'url'),
    f('address', 'text'),
    f('ownerId', 'string'),
    f('sellerId', 'string'),
    f('slug', 'string', { required: true, unique: true, indexed: true }),
    f('rating', 'number', { default: 0 }),
    f('reviewCount', 'integer', { default: 0 }),
    f('productCount', 'integer', { default: 0 }),
    f('isVerified', 'boolean', { default: false }),
    f('isApproved', 'boolean', { default: false }),
    f('isActive', 'boolean', { default: false }),
    f('location', 'string'),
    f('established', 'string'),
    f('totalSales', 'number', { default: 0 }),
    f('businessType', 'string'),
    f('website', 'url'),
    f('phone', 'phone'),
    f('email', 'email'),
    f('socialMedia', 'json', { default: {} }),
    f('policies', 'json', { default: {} }),
    f('categories', 'json', { default: [] }),
    f('tags', 'json', { default: [] }),
    f('bannerImages', 'json', { default: [] }),
  ],
  notifications: [
    f('userId', 'string', { required: true, indexed: true }),
    f('title', 'string', { required: true }),
    f('message', 'string', { required: true }),
    f('type', 'string', { default: 'info' }),
    f('read', 'boolean', { default: false }),
    f('link', 'string'),
  ],
  posts: [
    f('userId', 'string', { required: true }),
    f('userName', 'string'),
    f('userAvatar', 'url'),
    f('role', 'string', { default: 'seller' }),
    f('content', 'text'),
    f('images', 'json', { default: [] }),
    f('productIds', 'json', { default: [] }),
    f('storeId', 'string'),
    f('likes', 'integer', { default: 0 }),
    f('comments', 'integer', { default: 0 }),
    f('tags', 'json', { default: [] }),
    f('status', 'string', { default: 'pending', indexed: true }),
  ],
  comments: [
    f('postId', 'string', { required: true }),
    f('userId', 'string', { required: true }),
    f('userName', 'string'),
    f('userAvatar', 'url'),
    f('content', 'text'),
  ],
  wallets: [
    f('userId', 'string', { required: true, unique: true, indexed: true }),
    f('balance', 'number', { default: 0 }),
  ],
  transactions: [
    f('walletId', 'string', { required: true, indexed: true }),
    f('amount', 'number', { required: true }),
    f('type', 'string', { required: true }),
    f('description', 'text'),
    f('orderId', 'string'),
    f('productId', 'string'),
    f('status', 'string', { default: 'pending' }),
  ],
  blogs: [
    f('title', 'string', { required: true }),
    f('content', 'text'),
    f('excerpt', 'text'),
    f('slug', 'string', { required: true, unique: true, indexed: true }),
    f('author', 'string'),
    f('authorId', 'string'),
    f('storeId', 'string'),
    f('storeName', 'string'),
    f('category', 'string'),
    f('tags', 'json', { default: [] }),
    f('featuredImage', 'url'),
    f('isPublished', 'boolean', { default: false }),
  ],
  help_articles: [
    f('title', 'string', { required: true }),
    f('content', 'text'),
    f('category', 'string'),
    f('slug', 'string', { required: true, unique: true, indexed: true }),
    f('isPublished', 'boolean', { default: false }),
  ],
  reviews: [
    f('productId', 'string', { required: true, indexed: true }),
    f('userId', 'string', { required: true }),
    f('userName', 'string'),
    f('rating', 'integer', { required: true, default: 5 }),
    f('title', 'string'),
    f('content', 'text'),
    f('images', 'json', { default: [] }),
    f('isVerified', 'boolean', { default: false }),
  ],
  affiliate_links: [
    f('affiliateId', 'string', { required: true }),
    f('productId', 'string', { required: true }),
    f('collectionId', 'string'),
    f('code', 'string', { required: true, unique: true, indexed: true }),
    f('clicks', 'integer', { default: 0 }),
    f('conversions', 'integer', { default: 0 }),
    f('earnings', 'number', { default: 0 }),
    f('isActive', 'boolean', { default: true }),
  ],
  affiliate_collections: [
    f('affiliateId', 'string', { required: true }),
    f('name', 'string', { required: true }),
    f('description', 'text'),
    f('productIds', 'json', { default: [] }),
    f('linkCode', 'string', { required: true, unique: true, indexed: true }),
    f('isActive', 'boolean', { default: true }),
  ],
  refund_requests: [
    f('orderId', 'string', { required: true }),
    f('productId', 'string', { required: true }),
    f('customerId', 'string', { required: true }),
    f('sellerId', 'string', { required: true }),
    f('amount', 'number', { required: true }),
    f('reason', 'text'),
    f('status', 'string', { default: 'pending' }),
    f('adminNotes', 'text'),
    f('evidence', 'json', { default: [] }),
    f('resolvedAt', 'datetime'),
    f('resolvedBy', 'string'),
  ],
  disputes: [
    f('refundRequestId', 'string'),
    f('customerId', 'string', { required: true }),
    f('sellerId', 'string', { required: true }),
    f('adminId', 'string'),
    f('status', 'string', { default: 'open' }),
    f('messages', 'json', { default: [] }),
    f('resolution', 'text'),
  ],
  withdrawal_requests: [
    f('userId', 'string', { required: true }),
    f('userType', 'string', { default: 'customer' }),
    f('amount', 'number', { required: true }),
    f('bankDetails', 'json'),
    f('status', 'string', { default: 'pending' }),
    f('adminNotes', 'text'),
    f('processedAt', 'datetime'),
    f('processedBy', 'string'),
  ],
  platform_commissions: [
    f('percentage', 'number', { required: true, default: 5 }),
    f('category', 'string'),
    f('isGlobal', 'boolean', { default: false }),
  ],
  seller_agreements: [
    f('version', 'string'),
    f('content', 'text'),
    f('variables', 'json', { default: {} }),
    f('isActive', 'boolean', { default: false }),
  ],
  livestreams: [
    f('sellerId', 'string', { required: true }),
    f('title', 'string', { required: true }),
    f('description', 'text'),
    f('productIds', 'json', { default: [] }),
    f('status', 'string', { default: 'scheduled' }),
    f('startTime', 'datetime'),
    f('endTime', 'datetime'),
    f('agoraToken', 'string'),
  ],
  languages: [
    f('code', 'string', { required: true, unique: true, indexed: true }),
    f('name', 'string', { required: true }),
    f('nativeName', 'string'),
    f('flag', 'string'),
    f('rtl', 'boolean', { default: false }),
  ],
  currencies: [
    f('code', 'string', { required: true, unique: true, indexed: true }),
    f('name', 'string', { required: true }),
    f('symbol', 'string', { required: true }),
    f('exchangeRate', 'number', { required: true, default: 1 }),
  ],
  sessions: [
    f('userId', 'string', { required: true }),
    f('token', 'string', { required: true, unique: true, indexed: true }),
    f('expiresAt', 'datetime', { required: true }),
  ],
  referral_codes: [
    f('userId', 'string', { required: true, indexed: true }),
    f('code', 'string', { required: true, unique: true, indexed: true }),
    f('userType', 'string', { default: 'customer' }),
    f('clicks', 'integer', { default: 0 }),
    f('signups', 'integer', { default: 0 }),
    f('earnings', 'number', { default: 0 }),
    f('isActive', 'boolean', { default: true }),
  ],
  // New in the static migration: queued email events (contact form,
  // newsletter, referral invites, order emails) awaiting a lightbase relay.
  email_events: [
    f('event', 'string', { required: true, indexed: true }),
    f('to', 'string', { required: true, indexed: true }),
    f('data', 'json', { default: {} }),
    f('overrides', 'json', { default: {} }),
    f('status', 'string', { default: 'queued', indexed: true }),
  ],
};

// Public catalog collections the READ-ONLY browser key may touch. Deliberately
// excludes users/orders/wallets/etc. — user-scoped reads go through Edge
// Functions that verify the app JWT.
export const BROWSER_KEY_COLLECTIONS = [
  'products', 'categories', 'stores', 'languages', 'currencies',
  'blogs', 'help_articles', 'reviews',
];

async function cmdCollections() {
  const list = await api('GET', '/collections');
  if (!list.ok) throw new Error(`list collections failed: ${list.status} ${JSON.stringify(list.data)}`);
  const existing = new Set((list.data.collections || []).map((c) => c.name || c));
  let created = 0;
  for (const [name, fields] of Object.entries(SCHEMA)) {
    if (existing.has(name)) continue;
    const res = await api('POST', '/collections', { name, fields, indexes: [] });
    if (res.ok || res.status === 409) {
      created++;
      console.log(`[provision] collection ${name}: created`);
    } else {
      console.error(`[provision] collection ${name}: FAILED ${res.status} ${JSON.stringify(res.data).slice(0, 200)}`);
    }
  }
  console.log(`[provision] collections done (${created} created, ${existing.size} pre-existing)`);
}

async function cmdKey() {
  // List first; mint only when absent. The secret is printed once — capture it
  // into the build env (VITE_LIGHTBASE_BROWSER_KEY).
  const list = await api('GET', '/keys');
  if (list.ok) {
    const found = (list.data.keys || []).find((k) => k.name === 'browser-readonly');
    if (found) {
      console.log('[provision] browser key "browser-readonly" already exists (secret not re-issuable). Reuse the stored value or mint a new key with a different name.');
      return;
    }
  }
  const res = await api('POST', '/keys', {
    name: 'browser-readonly',
    env: 'live',
    scopes: ['read'],
    collections: BROWSER_KEY_COLLECTIONS,
  });
  if (!res.ok) throw new Error(`mint key failed: ${res.status} ${JSON.stringify(res.data)}`);
  console.log('[provision] browser key minted (READ-ONLY, catalog collections only).');
  console.log(`[provision] VITE_LIGHTBASE_BROWSER_KEY=${res.data.secret}`);
  try {
    const fs = await import('node:fs');
    fs.writeFileSync('/tmp/lbdev/goshop-browser-key.txt', res.data.secret + '\n', { mode: 0o600 });
    console.log('[provision] secret also saved to /tmp/lbdev/goshop-browser-key.txt (outside the repo)');
  } catch { /* best effort */ }
}

// ---- demo seed ----------------------------------------------------------
// PBKDF2-SHA256, identical format to edge-functions/lib/prelude.js hashPassword.
function b64url(bytes) {
  return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256);
  return `pbkdf2$100000$${b64url(salt)}$${b64url(bits)}`;
}

async function insertDedup(collection, doc, dedupKey) {
  if (dedupKey) {
    const field = Object.keys(dedupKey)[0];
    const value = dedupKey[field];
    const params = new URLSearchParams({ filter: JSON.stringify({ field, op: 'eq', value }), limit: '1' });
    const q = await api('GET', `/collections/${collection}/docs?${params}`);
    const rows = (q.data && q.data.data) || [];
    if (rows.length > 0) {
      console.log(`[provision] seed ${collection}/${doc.name || doc.email || doc.slug || doc.code}: exists`);
      return rows[0];
    }
  }
  const res = await api('POST', `/collections/${collection}`, doc);
  if (!res.ok && res.status !== 409) {
    console.error(`[provision] seed ${collection}: FAILED ${res.status} ${JSON.stringify(res.data).slice(0, 200)}`);
    return null;
  }
  console.log(`[provision] seed ${collection}/${doc.name || doc.email || doc.slug || doc.code}: inserted`);
  return (res.data && res.data.document) || res.data;
}

async function cmdSeed() {
  const adminHash = await hashPassword('Admin@123');
  const sellerHash = await hashPassword('Seller@123');
  const customerHash = await hashPassword('Customer@123');

  const admin = await insertDedup('users', {
    email: 'admin@goshop.com', passwordHash: adminHash, name: 'Platform Admin',
    role: 'admin', roles: ['admin'], verified: true, onboardingCompleted: true,
    referralCode: 'ADMIN1000',
  }, { email: 'admin@goshop.com' });

  const seller1 = await insertDedup('users', {
    email: 'seller1@goshop.com', passwordHash: sellerHash, name: 'Ahmad Electronics',
    role: 'seller', roles: ['seller'], verified: true, onboardingCompleted: true,
    businessName: 'Ahmad Electronics Store', referralCode: 'AHMAD1000',
  }, { email: 'seller1@goshop.com' });

  const customer1 = await insertDedup('users', {
    email: 'customer@goshop.com', passwordHash: customerHash, name: 'Bilal Rahman',
    role: 'customer', roles: ['customer'], verified: true, onboardingCompleted: true,
    referralCode: 'BILAL1000',
  }, { email: 'customer@goshop.com' });

  if (seller1) await insertDedup('stores', {
    name: 'Ahmad Electronics Store', description: 'Authentic electronics and gadgets.',
    sellerId: seller1.id, slug: 'ahmad-electronics', isActive: true, isApproved: true,
    isVerified: true, location: 'Lagos, Nigeria',
  }, { slug: 'ahmad-electronics' });

  const catElectronics = await insertDedup('categories', { name: 'Electronics', slug: 'electronics', isActive: true, sortOrder: 1 }, { slug: 'electronics' });
  const catFashion = await insertDedup('categories', { name: 'Fashion', slug: 'fashion', isActive: true, sortOrder: 2 }, { slug: 'fashion' });
  const catHome = await insertDedup('categories', { name: 'Home & Kitchen', slug: 'home-kitchen', isActive: true, sortOrder: 3 }, { slug: 'home-kitchen' });

  const store = await insertDedup('stores', { name: 'Ahmad Electronics Store', slug: 'ahmad-electronics', isActive: true, isApproved: true, isVerified: true, sellerId: seller1 ? seller1.id : undefined }, { slug: 'ahmad-electronics' });

  const p1 = await insertDedup('products', {
    name: 'Wireless Noise-Canceling Headphones', description: 'Over-ear Bluetooth headphones with 40h battery.',
    price: 89.99, originalPrice: 119.99, category: 'Electronics', images: [],
    sellerId: seller1 ? seller1.id : undefined, sellerName: seller1 ? seller1.name : undefined,
    storeId: store ? store.id : undefined, inventory: 50, isActive: true, isFeatured: true,
    tags: ['audio', 'bluetooth'], sku: 'AE-HP-001', currency: 'USD', shippingCost: 0,
  }, { name: 'Wireless Noise-Canceling Headphones' });
  const p2 = await insertDedup('products', {
    name: 'Smart Fitness Watch', description: 'Heart-rate, GPS, and 7-day battery life.',
    price: 59.5, category: 'Electronics', images: [],
    sellerId: seller1 ? seller1.id : undefined, sellerName: seller1 ? seller1.name : undefined,
    storeId: store ? store.id : undefined, inventory: 80, isActive: true, isFeatured: true,
    tags: ['wearable', 'fitness'], sku: 'AE-WT-002', currency: 'USD', shippingCost: 0,
  }, { name: 'Smart Fitness Watch' });
  await insertDedup('products', {
    name: 'Ceramic Nonstick Pan Set', description: '10-piece cookware set, PFOA free.',
    price: 120, category: 'Home & Kitchen', images: [], inventory: 25, isActive: true,
    tags: ['kitchen', 'cookware'], sku: 'HK-CK-010', currency: 'USD', shippingCost: 4.99,
  }, { name: 'Ceramic Nonstick Pan Set' });

  await insertDedup('languages', { code: 'en', name: 'English', nativeName: 'English', rtl: false }, { code: 'en' });
  await insertDedup('languages', { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true }, { code: 'ar' });
  await insertDedup('currencies', { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1 }, { code: 'USD' });
  await insertDedup('currencies', { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', exchangeRate: 1550 }, { code: 'NGN' });
  await insertDedup('platform_commissions', { percentage: 5, isGlobal: true }, { isGlobal: true });
  await insertDedup('seller_agreements', { version: '1.0', content: 'Standard GoShop seller agreement.', isActive: true }, { version: '1.0' });

  if (customer1) await insertDedup('wallets', { userId: customer1.id, balance: 250 }, { userId: customer1.id });
  if (customer1) await insertDedup('referral_codes', { userId: customer1.id, code: 'BILAL1000', userType: 'customer', isActive: true }, { userId: customer1.id });

  console.log('[provision] seed done. Test accounts: admin@goshop.com/Admin@123, seller1@goshop.com/Seller@123, customer@goshop.com/Customer@123');
}

const cmd = process.argv[2] || 'all';
if (cmd === 'collections') await cmdCollections();
else if (cmd === 'key') await cmdKey();
else if (cmd === 'seed') await cmdSeed();
else if (cmd === 'all') { await cmdCollections(); await cmdKey(); await cmdSeed(); }
else {
  console.error('usage: node scripts/lightbase-provision.mjs [collections|key|seed|all]');
  process.exit(1);
}
