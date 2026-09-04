// BismiLLAH Ar-Rahman Ar-Raheem.
// Deploy GoShop Edge Functions to a lightbase instance.
//
// Usage:
//   node scripts/lightbase-deploy-functions.mjs [list]
//
// Env:
//   LB_BASE_URL   engine origin (default: http://localhost:4400 — LOCAL dev)
//   LB_ROOT_KEY   root/admin key for the project
//   LB_PROJECT    project id (default: goshop-beta)
//   GOSHOP_JWT_SECRET      optional; baked into function env (auth functions)
//   GOSHOP_APP_URL         optional; public app origin baked into function env
//   GOSHOP_BIRRPAY_WEBHOOK_SECRET  optional; baked into webhook-birrpay env
//   GOSHOP_BIRRPAY_SECRET_KEY / GOSHOP_BIRRPAY_BASE_URL / GOSHOP_BIRRPAY_CURRENCY
//   GOSHOP_PAYSTACK_SECRET_KEY, GOSHOP_FLUTTERWAVE_SECRET_KEY,
//   GOSHOP_RAZORPAY_KEY_ID, GOSHOP_RAZORPAY_KEY_SECRET,
//   GOSHOP_PAYPAL_CLIENT_ID, GOSHOP_PAYPAL_CLIENT_SECRET
//   GOSHOP_ADMIN_EMAIL / GOSHOP_SUPPORT_EMAIL
//
// NOTE: the engine currently has create/list/invoke routes only — created
// functions are immutable over REST. On 409 the script reports the conflict;
// delete the function on the instance (ops) or use a new name to redeploy.
// See WORKLOG "Known gaps".

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = (process.env.LB_BASE_URL || 'http://localhost:4400').replace(/\/+$/, '');
const PROJECT = process.env.LB_PROJECT || 'goshop-beta';
const ROOT_KEY = process.env.LB_ROOT_KEY || '';

if (!ROOT_KEY) {
  console.error('[deploy] LB_ROOT_KEY is required.');
  process.exit(1);
}

const HEADERS = {
  apikey: ROOT_KEY,
  'x-lightbase-project': PROJECT,
  'Content-Type': 'application/json',
};

const PRELUDE = readFileSync(join(__dirname, '..', 'edge-functions', 'lib', 'prelude.js'), 'utf8');

// name, auth mode, timeout, description, handler file (relative to functions/).
const FUNCTIONS = [
  { name: 'auth-register',      auth: 'public',  timeoutMs: 20000, file: 'auth-register.js',      description: 'GoShop user registration (PBKDF2 hashing, wallet + referral bootstrap).' },
  { name: 'auth-login',         auth: 'public',  timeoutMs: 20000, file: 'auth-login.js',         description: 'GoShop login (PBKDF2 verify, HS256 JWT issue).' },
  { name: 'auth-me',            auth: 'public',  timeoutMs: 10000, file: 'auth-me.js',            description: 'GoShop session check (app JWT verified in-function).' },
  { name: 'products-list',      auth: 'public',  timeoutMs: 15000, file: 'products-list.js',      description: 'Public product catalog reads + search (fallback for browser-direct reads).' },
  { name: 'products-create',    auth: 'public',  timeoutMs: 15000, file: 'products-create.js',    description: 'Seller/admin product creation (app JWT; role check in-function).' },
  { name: 'products-update',    auth: 'public',  timeoutMs: 15000, file: 'products-update.js',    description: 'Owner/admin product update (app JWT).' },
  { name: 'products-delete',    auth: 'public',  timeoutMs: 15000, file: 'products-delete.js',    description: 'Owner/admin product delete (app JWT).' },
  { name: 'orders-list',        auth: 'public',  timeoutMs: 15000, file: 'orders-list.js',        description: 'Order reads scoped to the caller (app JWT).' },
  { name: 'orders-create',      auth: 'public',  timeoutMs: 25000, file: 'orders-create.js',      description: 'Order creation with server-side price validation + cart clear (app JWT).' },
  { name: 'orders-update',      auth: 'public',  timeoutMs: 20000, file: 'orders-update.js',      description: 'Order status updates with ownership checks (app JWT).' },
  { name: 'payments-initiate',  auth: 'public',  timeoutMs: 25000, file: 'payments-initiate.js',  description: 'Payment initiation: wallet/cod + gateway redirects via outbound fetch (app JWT).' },
  { name: 'webhook-birrpay',    auth: 'public',  timeoutMs: 15000, file: 'webhook-birrpay.js',    description: 'BirrPay webhook receiver: HMAC-SHA256 v1 / SHA-512 v2 verify via WebCrypto, marks orders paid.' },
  { name: 'data-crud',          auth: 'public',  timeoutMs: 25000, file: 'data-crud.js',          description: 'Generic entity CRUD (cart/wishlist/etc.) with the legacy auth rules (app JWT where required).' },
  { name: 'referral',           auth: 'public',  timeoutMs: 15000, file: 'referral.js',           description: 'Referral stats (app JWT) + anonymous click tracking.' },
  { name: 'translate',          auth: 'public',  timeoutMs: 15000, file: 'translate.js',          description: 'Translation with graceful passthrough fallback.' },
  { name: 'emails',             auth: 'public',  timeoutMs: 15000, file: 'emails.js',             description: 'Contact/newsletter/referral-invite: records queued email_events.' },
];

// Env injected into every function (strings only). Secrets flow from the
// operator's environment — never committed.
function functionEnv() {
  const env = {};
  const pick = (k, alias) => {
    const v = process.env[alias];
    if (v !== undefined && v !== '') env[k] = String(v);
  };
  pick('JWT_SECRET', 'GOSHOP_JWT_SECRET');
  pick('APP_URL', 'GOSHOP_APP_URL');
  pick('BIRRPAY_WEBHOOK_SECRET', 'GOSHOP_BIRRPAY_WEBHOOK_SECRET');
  pick('BIRRPAY_SECRET_KEY', 'GOSHOP_BIRRPAY_SECRET_KEY');
  pick('BIRRPAY_BASE_URL', 'GOSHOP_BIRRPAY_BASE_URL');
  pick('BIRRPAY_CURRENCY', 'GOSHOP_BIRRPAY_CURRENCY');
  pick('PAYSTACK_SECRET_KEY', 'GOSHOP_PAYSTACK_SECRET_KEY');
  pick('FLUTTERWAVE_SECRET_KEY', 'GOSHOP_FLUTTERWAVE_SECRET_KEY');
  pick('RAZORPAY_KEY_ID', 'GOSHOP_RAZORPAY_KEY_ID');
  pick('RAZORPAY_KEY_SECRET', 'GOSHOP_RAZORPAY_KEY_SECRET');
  pick('PAYPAL_CLIENT_ID', 'GOSHOP_PAYPAL_CLIENT_ID');
  pick('PAYPAL_CLIENT_SECRET', 'GOSHOP_PAYPAL_CLIENT_SECRET');
  pick('ADMIN_EMAIL', 'GOSHOP_ADMIN_EMAIL');
  pick('SUPPORT_EMAIL', 'GOSHOP_SUPPORT_EMAIL');
  return env;
}

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

function buildSource(file) {
  const body = readFileSync(join(__dirname, '..', 'edge-functions', 'functions', file), 'utf8');
  const source = PRELUDE + '\n' + body;
  // Syntax gate: the engine wraps source as `async function(ctx, db) { ... }`.
  // The prelude + body must compile inside that exact wrapper shape.
  // eslint-disable-next-line no-new-func
  new Function('ctx', 'db', source);
  return source;
}

if (process.argv[2] === 'list') {
  const res = await api('GET', '/functions');
  if (!res.ok) {
    console.error(`[deploy] list failed: ${res.status} ${JSON.stringify(res.data)}`);
    process.exit(1);
  }
  console.log(JSON.stringify(res.data, null, 2));
  process.exit(0);
}

const env = functionEnv();
let created = 0, skipped = 0, failed = 0;
for (const fn of FUNCTIONS) {
  let source;
  try {
    source = buildSource(fn.file);
  } catch (err) {
    console.error(`[deploy] ${fn.name}: SYNTAX ERROR in ${fn.file}: ${err.message}`);
    failed++;
    continue;
  }
  const res = await api('POST', '/functions', {
    name: fn.name,
    source,
    timeoutMs: fn.timeoutMs,
    auth: fn.auth,
    env,
    description: fn.description,
  });
  if (res.ok) {
    created++;
    console.log(`[deploy] ${fn.name}: created (auth=${fn.auth}, timeout=${fn.timeoutMs}ms)`);
  } else if (res.status === 409) {
    skipped++;
    console.warn(`[deploy] ${fn.name}: already exists (immutable over REST; delete it on the instance to redeploy)`);
  } else {
    failed++;
    console.error(`[deploy] ${fn.name}: FAILED ${res.status} ${JSON.stringify(res.data).slice(0, 300)}`);
  }
}
console.log(`[deploy] done: ${created} created, ${skipped} skipped (exist), ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
