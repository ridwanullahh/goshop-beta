// BismiLLAH Ar-Rahman Ar-Raheem.
// GoShop Edge Functions end-to-end battle test (function boundary).
//
// Usage:
//   node scripts/lightbase-e2e.mjs
//
// Env:
//   LB_BASE_URL   engine origin (default: http://localhost:4400 — LOCAL dev)
//   LB_ROOT_KEY   root/admin key (needed for verification reads + writes)
//   LB_PROJECT    project id (default: goshop-beta)
//   LB_BROWSER_KEY read-only browser key (tests the browser-direct path)
//   LB_BIRRPAY_SECRET  BirrPay webhook secret baked into the function env
//
// Covers: register/login/me, product reads (function + browser key), catalog
// reads, order create/list, wallet payment, BirrPay webhook HMAC-SHA256 v1 AND
// HMAC-SHA512 v2 (positive + negative), cart CRUD, seller product create,
// referral track, contact email event, settings-ish reads (currencies +
// platform commission via root), and read-only key write rejection.

const BASE_URL = (process.env.LB_BASE_URL || 'http://localhost:4400').replace(/\/+$/, '');
const PROJECT = process.env.LB_PROJECT || 'goshop-beta';
const ROOT_KEY = process.env.LB_ROOT_KEY || '';
const BROWSER_KEY = process.env.LB_BROWSER_KEY || '';
const BIRRPAY_SECRET = process.env.LB_BIRRPAY_SECRET || 'whsec_goshop_local_test_2026';

if (!ROOT_KEY) {
  console.error('[e2e] LB_ROOT_KEY is required.');
  process.exit(1);
}

let pass = 0, fail = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) {
    pass++;
    console.log(`  PASS ${name}`);
  } else {
    fail++;
    failures.push(name);
    console.error(`  FAIL ${name}${detail ? ' :: ' + String(detail).slice(0, 300) : ''}`);
  }
}

async function invokeFn(name, payload, extraHeaders) {
  const res = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT}/functions/${name}/invoke`, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, extraHeaders || {}),
    body: JSON.stringify(payload || {}),
  });
  const status = res.status;
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status, data };
}

async function rootApi(method, path, body) {
  const res = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT}${path}`, {
    method,
    headers: { apikey: ROOT_KEY, 'x-lightbase-project': PROJECT, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, data };
}

function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(secret, message, hash) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

// ---- 1. auth: register ---------------------------------------------------
console.log('1) auth');
const stamp = Date.now();
const regEmail = `e2e-${stamp}@goshop.test`;
let r = await invokeFn('auth-register', { body: { email: regEmail, password: 'E2ePass@123', name: 'E2E Tester', role: 'customer' } });
check('auth-register 201 + token', r.status === 201 && r.data && r.data.token && r.data.user && r.data.user.email === regEmail, JSON.stringify(r.data));
const userToken = r.data && r.data.token;
const userId = r.data && r.data.user && r.data.user.id;

r = await invokeFn('auth-register', { body: { email: regEmail, password: 'E2ePass@123', name: 'Dup' } });
check('auth-register duplicate 409', r.status === 409, JSON.stringify(r.data));

r = await invokeFn('auth-login', { body: { email: 'customer@goshop.com', password: 'Customer@123' } });
check('auth-login seeded customer', r.status === 200 && r.data && r.data.token, JSON.stringify(r.data));
const customerToken = r.data && r.data.token;
const customerId = r.data && r.data.user && r.data.user.id;

r = await invokeFn('auth-login', { body: { email: 'customer@goshop.com', password: 'wrong' } });
check('auth-login bad password 401', r.status === 401, JSON.stringify(r.data));

r = await invokeFn('auth-login', { body: { email: 'seller1@goshop.com', password: 'Seller@123' } });
check('auth-login seeded seller', r.status === 200 && r.data && r.data.token, JSON.stringify(r.data));
const sellerToken = r.data && r.data.token;
const sellerId = r.data && r.data.user && r.data.user.id;

r = await invokeFn('auth-me', { body: {}, headers: { authorization: `Bearer ${customerToken}` } });
check('auth-me with token', r.status === 200 && r.data && r.data.email === 'customer@goshop.com' && !r.data.passwordHash, JSON.stringify(r.data));

r = await invokeFn('auth-me', { body: {}, headers: { authorization: 'Bearer forged.token.value' } });
check('auth-me forged token 401', r.status === 401, JSON.stringify(r.data));

// ---- 2. products (function + browser-direct key) --------------------------
console.log('2) products');
r = await invokeFn('products-list', { body: {} });
check('products-list public returns array', r.status === 200 && Array.isArray(r.data) && r.data.length >= 3, r.status + ' ' + JSON.stringify(r.data).slice(0, 120));
const headphone = (r.data || []).find((p) => p.name === 'Wireless Noise-Canceling Headphones');

r = await invokeFn('products-list', { body: { search: 'fitness' } });
check('products-list search', r.status === 200 && Array.isArray(r.data) && r.data.some((p) => /fitness/i.test(p.name)), JSON.stringify(r.data).slice(0, 120));

if (headphone) {
  r = await invokeFn('products-list', { body: { id: headphone.id } });
  check('products-list by id', r.status === 200 && r.data && r.data.id === headphone.id, JSON.stringify(r.data).slice(0, 120));
}

if (BROWSER_KEY) {
  const batchRes = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT}/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: BROWSER_KEY, 'x-lightbase-project': PROJECT },
    body: JSON.stringify({
      ops: [
        { kind: 'query', collection: 'products', filter: { field: 'isActive', op: 'eq', value: true }, limit: 100, tag: 'products' },
        { kind: 'query', collection: 'categories', limit: 100, tag: 'categories' },
        { kind: 'query', collection: 'currencies', limit: 100, tag: 'currencies' },
      ],
    }),
  });
  const batchData = await batchRes.json().catch(() => null);
  check('browser key batch reads (catalog)', batchRes.status === 200 && batchData && Array.isArray(batchData.results) && batchData.results.length === 3 && Array.isArray(batchData.results[0].data), JSON.stringify(batchData).slice(0, 200));

  const denied = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT}/collections/users/docs?limit=1`, {
    headers: { apikey: BROWSER_KEY, 'x-lightbase-project': PROJECT },
  });
  check('browser key denied on users collection', denied.status === 403, 'status ' + denied.status);

  const writeDenied = await fetch(`${BASE_URL}/api/v1/projects/${PROJECT}/collections/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: BROWSER_KEY, 'x-lightbase-project': PROJECT },
    body: JSON.stringify({ name: 'nope', fields: [{ name: 'x', type: 'string' }] }),
  });
  check('browser key write denied', writeDenied.status === 403, 'status ' + writeDenied.status);
} else {
  console.log('  (LB_BROWSER_KEY not set — skipping browser-direct tests)');
}

// ---- 3. catalog + settings reads ----------------------------------------
console.log('3) catalog');
r = await invokeFn('data-crud', { body: { entity: 'categories', op: 'list' } });
check('data-crud categories public list', r.status === 200 && Array.isArray(r.data) && r.data.length >= 3, JSON.stringify(r.data).slice(0, 120));

r = await invokeFn('data-crud', { body: { entity: 'currencies', op: 'list' } });
check('data-crud currencies public list', r.status === 200 && Array.isArray(r.data) && r.data.length >= 2, JSON.stringify(r.data).slice(0, 120));

r = await invokeFn('data-crud', { body: { entity: 'platform_commissions', op: 'list' } });
check('data-crud platform_commissions requires auth (401 anon)', r.status === 401, JSON.stringify(r.data));

r = await invokeFn('data-crud', { body: { entity: 'platform_commissions', op: 'list' }, headers: { authorization: `Bearer ${customerToken}` } });
check('data-crud platform_commissions authed (settings read)', r.status === 200 && Array.isArray(r.data) && r.data.length >= 1 && r.data[0].percentage === 5, JSON.stringify(r.data).slice(0, 120));

r = await invokeFn('data-crud', { body: { entity: 'seller_agreements', op: 'list' }, headers: { authorization: `Bearer ${customerToken}` } });
check('data-crud seller_agreements authed', r.status === 200 && Array.isArray(r.data) && r.data.length >= 1, JSON.stringify(r.data).slice(0, 120));

// ---- 4. cart CRUD --------------------------------------------------------
console.log('4) cart');
let productId = headphone ? headphone.id : null;
r = await invokeFn('data-crud', { body: { entity: 'cart', op: 'create', data: { productId, quantity: 2 } }, headers: { authorization: `Bearer ${customerToken}` } });
check('cart add', r.status === 201 && r.data && r.data.quantity === 2, JSON.stringify(r.data));
const cartId = r.data && r.data.id;

r = await invokeFn('data-crud', { body: { entity: 'cart', op: 'create', data: { productId, quantity: 1 } }, headers: { authorization: `Bearer ${customerToken}` } });
check('cart merge quantity', r.status === 200 && r.data && r.data.quantity === 3, JSON.stringify(r.data));

r = await invokeFn('data-crud', { body: { entity: 'cart', op: 'list' }, headers: { authorization: `Bearer ${customerToken}` } });
check('cart list scoped to caller', r.status === 200 && Array.isArray(r.data) && r.data.every((c) => c.userId === customerId), JSON.stringify(r.data).slice(0, 120));

r = await invokeFn('data-crud', { body: { entity: 'cart', op: 'update', id: cartId, data: { quantity: 1 } }, headers: { authorization: `Bearer ${customerToken}` } });
check('cart update quantity', r.status === 200 && r.data && r.data.quantity === 1, JSON.stringify(r.data));

r = await invokeFn('data-crud', { body: { entity: 'cart', op: 'delete', id: cartId }, headers: { authorization: `Bearer ${sellerToken}` } });
check('cart delete by OTHER user 403', r.status === 403, JSON.stringify(r.data));

r = await invokeFn('data-crud', { body: { entity: 'cart', op: 'delete', id: cartId }, headers: { authorization: `Bearer ${customerToken}` } });
check('cart delete by owner', r.status === 200 && r.data && r.data.success === true, JSON.stringify(r.data));

// ---- 5. orders ------------------------------------------------------------
console.log('5) orders');
r = await invokeFn('orders-create', { body: { items: [{ productId, quantity: 2 }], shippingTotal: 0, paymentMethod: 'cod' }, headers: { authorization: `Bearer ${customerToken}` } });
const orderTotal = r.data && r.data.total;
check('orders-create 201 with server-side total', r.status === 201 && r.data && r.data.status === 'pending' && orderTotal === 179.98, JSON.stringify(r.data).slice(0, 200));
const orderId = r.data && r.data.id;

r = await invokeFn('orders-create', { body: { items: [{ productId: 'nonexistent', quantity: 1 }] }, headers: { authorization: `Bearer ${customerToken}` } });
check('orders-create unknown product 400', r.status === 400, JSON.stringify(r.data));

r = await invokeFn('orders-list', { body: {}, headers: { authorization: `Bearer ${customerToken}` } });
check('orders-list scoped', r.status === 200 && Array.isArray(r.data) && r.data.some((o) => o.id === orderId), JSON.stringify(r.data).slice(0, 120));

r = await invokeFn('orders-list', { body: {}, headers: { authorization: `Bearer ${sellerToken}` } });
check('orders-list seller does not see buyer-only orders', r.status === 200 && Array.isArray(r.data) && !r.data.some((o) => o.id === orderId), JSON.stringify(r.data).slice(0, 120));

r = await invokeFn('orders-list', { body: { id: orderId }, headers: { authorization: `Bearer ${sellerToken}` } });
check('orders-list by id other user 403', r.status === 403, JSON.stringify(r.data));

// ---- 6. payments (wallet) --------------------------------------------------
console.log('6) payments');
// Top the seeded customer's wallet up first so repeated runs are idempotent.
const wlist = await rootApi('GET', `/collections/wallets/docs?${new URLSearchParams({ filter: JSON.stringify({ field: 'userId', op: 'eq', value: customerId }), limit: '1' })}`);
check('customer wallet exists', wlist.status === 200 && wlist.data.data.length === 1, JSON.stringify(wlist.data).slice(0, 160));
await rootApi('PATCH', `/collections/wallets/${wlist.data.data[0].id}`, { balance: 250 });

r = await invokeFn('payments-initiate', { body: { orderId, paymentMethod: 'wallet' }, headers: { authorization: `Bearer ${customerToken}` } });
check('wallet payment succeeds (250 balance)', r.status === 200 && r.data && r.data.success === true, JSON.stringify(r.data));

r = await invokeFn('orders-list', { body: { id: orderId }, headers: { authorization: `Bearer ${customerToken}` } });
check('order confirmed + paid after wallet payment', r.status === 200 && r.data && r.data.status === 'confirmed' && r.data.paymentStatus === 'completed' && typeof r.data.transactionRef === 'string', JSON.stringify(r.data).slice(0, 200));

const wq = await rootApi('GET', `/collections/wallets/docs?${new URLSearchParams({ filter: JSON.stringify({ field: 'userId', op: 'eq', value: customerId }), limit: '1' })}`);
check('wallet debited to 70.02 (250 - 179.98)', wq.status === 200 && wq.data.data[0] && Math.abs(wq.data.data[0].balance - 70.02) < 0.001, JSON.stringify(wq.data).slice(0, 200));

// ---- 7. BirrPay webhook (HMAC-SHA256 v1 + HMAC-SHA512 v2) ------------------
console.log('7) birrpay webhook');
// Create a fresh pending order to be paid by the webhook.
r = await invokeFn('orders-create', { body: { items: [{ productId, quantity: 1 }], paymentMethod: 'birrpay' }, headers: { authorization: `Bearer ${customerToken}` } });
const webhookOrderId = r.data && r.data.id;
const reference = `goshop_${webhookOrderId}_${Date.now()}`;
const event = { event: 'payment.succeeded', created_at: new Date().toISOString(), data: { reference } };
const rawBody = JSON.stringify(event);
const ts = Math.floor(Date.now() / 1000);

const sig256 = await hmacHex(BIRRPAY_SECRET, `${ts}.${rawBody}`, 'SHA-256');
const sig512 = await hmacHex(BIRRPAY_SECRET, `${ts}.${rawBody}`, 'SHA-512');

r = await invokeFn('webhook-birrpay', { body: rawBody, headers: { 'x-birrpay-signature': `t=${ts},v1=${sig256}` } });
check('webhook v1 (SHA-256) accepted 200', r.status === 200 && r.data && r.data.success === true, JSON.stringify(r.data));

r = await invokeFn('webhook-birrpay', { body: rawBody, headers: { 'x-birrpay-signature': `t=${ts},v2=${sig512}` } });
check('webhook v2 (SHA-512) accepted 200', r.status === 200 && r.data && r.data.success === true, JSON.stringify(r.data));

r = await invokeFn('webhook-birrpay', { body: rawBody, headers: { 'x-birrpay-signature': `t=${ts},v1=${'0'.repeat(64)}` } });
check('webhook bad signature 401', r.status === 401, JSON.stringify(r.data));

r = await invokeFn('webhook-birrpay', { body: rawBody, headers: { 'x-birrpay-signature': `t=${ts - 4000},v1=${sig256}` } });
check('webhook replay (stale timestamp) 401', r.status === 401, JSON.stringify(r.data));

r = await invokeFn('orders-list', { body: { id: webhookOrderId }, headers: { authorization: `Bearer ${customerToken}` } });
check('order marked paid by webhook', r.status === 200 && r.data && r.data.paymentStatus === 'completed' && r.data.transactionRef === reference, JSON.stringify(r.data).slice(0, 200));

// ---- 8. seller product create ---------------------------------------------
console.log('8) seller products');
r = await invokeFn('products-create', { body: { name: `E2E Product ${stamp}`, price: 9.99, category: 'Electronics', inventory: 5 }, headers: { authorization: `Bearer ${sellerToken}` } });
check('products-create by seller 201', r.status === 201 && r.data && r.data.sellerId === sellerId, JSON.stringify(r.data).slice(0, 200));
const sellerProductId = r.data && r.data.id;

r = await invokeFn('products-create', { body: { name: 'Nope', price: 1 }, headers: { authorization: `Bearer ${customerToken}` } });
check('products-create by customer 403', r.status === 403, JSON.stringify(r.data));

r = await invokeFn('products-update', { body: { id: sellerProductId, price: 12.49 }, headers: { authorization: `Bearer ${sellerToken}` } });
check('products-update by owner', r.status === 200 && r.data && r.data.price === 12.49, JSON.stringify(r.data).slice(0, 200));

r = await invokeFn('products-update', { body: { id: sellerProductId, price: 1 }, headers: { authorization: `Bearer ${customerToken}` } });
check('products-update by non-owner 403', r.status === 403, JSON.stringify(r.data));

r = await invokeFn('products-delete', { body: { id: sellerProductId }, headers: { authorization: `Bearer ${sellerToken}` } });
check('products-delete by owner', r.status === 200 && r.data && r.data.success === true, JSON.stringify(r.data));

// ---- 9. referral ------------------------------------------------------------
console.log('9) referral');
r = await invokeFn('referral', { body: { op: 'track', code: 'BILAL1000' } });
check('referral click track (anon)', r.status === 200 && r.data && r.data.success === true, JSON.stringify(r.data));

r = await invokeFn('referral', { body: { op: 'track', code: 'NOPE123' } });
check('referral track invalid code 404', r.status === 404, JSON.stringify(r.data));

r = await invokeFn('referral', { body: {}, headers: { authorization: `Bearer ${customerToken}` } });
check('referral stats authed', r.status === 200 && r.data && r.data.code === 'BILAL1000' && r.data.clicks >= 1, JSON.stringify(r.data).slice(0, 200));

// ---- 10. emails -------------------------------------------------------------
console.log('10) emails');
r = await invokeFn('emails', { body: { op: 'contact', name: 'E2E Bot', email: 'e2e@goshop.test', message: 'Hello from the battle test.' } });
check('contact form 200', r.status === 200 && r.data && r.data.success === true, JSON.stringify(r.data));

r = await invokeFn('emails', { body: { op: 'newsletter', email: 'not-an-email' } });
check('newsletter invalid email 400', r.status === 400, JSON.stringify(r.data));

r = await invokeFn('emails', { body: { op: 'referral-invite', toEmail: 'friend@goshop.test' }, headers: { authorization: `Bearer ${customerToken}` } });
check('referral-invite authed 200', r.status === 200 && r.data && r.data.success === true, JSON.stringify(r.data));

const evq = await rootApi('GET', `/collections/email_events/docs?${new URLSearchParams({ filter: JSON.stringify({ field: 'event', op: 'eq', value: 'contactForm' }), limit: '3' })}`);
check('email_events recorded', evq.status === 200 && evq.data.data.length >= 1, JSON.stringify(evq.data).slice(0, 160));

// ---- 11. translate ----------------------------------------------------------
console.log('11) translate');
r = await invokeFn('translate', { body: { text: 'Hello', targetLang: 'es', sourceLang: 'en' } });
check('translate returns shape (passthrough or real)', r.status === 200 && r.data && typeof r.data.translatedText === 'string', JSON.stringify(r.data).slice(0, 160));

r = await invokeFn('translate', { body: { text: 'Hello', targetLang: 'en', sourceLang: 'en' } });
check('translate same-lang passthrough', r.status === 200 && r.data && r.data.translatedText === 'Hello', JSON.stringify(r.data).slice(0, 160));

// ---- summary ----------------------------------------------------------------
console.log(`\n[e2e] RESULT: ${pass} passed, ${fail} failed`);
if (failures.length > 0) {
  console.error('[e2e] failures: ' + failures.join(', '));
  process.exit(1);
}
