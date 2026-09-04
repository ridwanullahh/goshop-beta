// BismiLLAH Ar-Rahman Ar-Raheem.
// GoShop Edge Functions — shared prelude.
// This file is NOT deployed on its own: scripts/lightbase-deploy-functions.mjs
// concatenates it in front of every handler body before POSTing the source to
// the lightbase engine (the engine wraps the result in
// `async function(ctx, db) { ... }`).
//
// Runtime contract (lightbase sandbox): ctx.body, ctx.headers, ctx.env,
// ctx.principal, fetch, crypto.subtle/getRandomValues/randomUUID, TextEncoder,
// TextDecoder, btoa/atob, URL/URLSearchParams, JSON/Math/Date/Object/Array,
// setTimeout, and db.{insert,get,update,delete,query}. No require/import/
// process/Buffer.

// ---- document mapping -------------------------------------------------
// StoredDocument is { id, _created_at, _updated_at, _revision, _deleted, ...fields }.
// mapDoc strips engine-reserved keys and restores camelCase createdAt/updatedAt
// exactly like the old apps/api provider layer did.
var __RESERVED = { id: 1, _created_at: 1, _updated_at: 1, _revision: 1, _deleted: 1, _checksum: 1 };

function mapDoc(doc) {
  if (!doc) return doc;
  var out = {};
  for (var k in doc) {
    if (__RESERVED[k]) continue;
    out[k] = doc[k];
  }
  out.id = doc.id;
  out.createdAt = doc._created_at || doc.createdAt || null;
  out.updatedAt = doc._updated_at || doc.updatedAt || null;
  return out;
}

// Managed fields the engine owns — stripped from client input before writes
// (mirrors the old provider sanitizeInput).
var __MANAGED = { id: 1, createdAt: 1, updatedAt: 1, _created_at: 1, _updated_at: 1, _revision: 1, _deleted: 1, _checksum: 1 };

function sanitizeInput(data) {
  var out = {};
  for (var k in data || {}) {
    if (__MANAGED[k]) continue;
    if (data[k] === undefined) continue;
    out[k] = data[k];
  }
  return out;
}

// ---- responses --------------------------------------------------------
// Functions return plain JSON by default, but every GoShop handler uses the
// raw takeover so status codes and Content-Type match the old Pages Function
// responses exactly (401/403/404 bodies included).
function json(data, status) {
  return {
    __response: {
      status: status || 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: data,
    },
  };
}

function jerr(message, status) {
  return json({ error: message }, status || 400);
}

function isResponseMarker(e) {
  return !!(e && e.__response);
}

// ---- encoding helpers -------------------------------------------------
var __ENC = new TextEncoder();
var __DEC = new TextDecoder();

function b64urlEncode(bytes) {
  var u = new Uint8Array(bytes);
  var bin = '';
  for (var i = 0; i < u.length; i++) bin += String.fromCharCode(u[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s) {
  s = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  var bin = atob(s);
  var u = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

function hexEncode(bytes) {
  var u = new Uint8Array(bytes);
  var out = '';
  for (var i = 0; i < u.length; i++) {
    var h = (u[i] >>> 0).toString(16);
    out += h.length === 1 ? '0' + h : h;
  }
  return out;
}

function constantTimeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---- password hashing (PBKDF2-SHA256 via WebCrypto) --------------------
// bcryptjs is not available inside the sandbox, so password hashing moved to
// PBKDF2-SHA256 (WebCrypto-native). Stored format:
//   pbkdf2$<iterations>$<b64url salt>$<b64url 32-byte derived key>
// Verification is constant-time. NOTE: hashes created by the previous
// bcrypt-based seeder do NOT verify — affected accounts must re-register or
// be re-seeded (documented in DEPLOYMENT.md §6).
var PBKDF2_ITERATIONS = 100000;

async function pbkdf2Bits(password, salt, iterations) {
  var key = await crypto.subtle.importKey('raw', __ENC.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: iterations },
    key,
    256
  );
}

async function hashPassword(password) {
  var salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  var bits = await pbkdf2Bits(password, salt, PBKDF2_ITERATIONS);
  return 'pbkdf2$' + PBKDF2_ITERATIONS + '$' + b64urlEncode(salt) + '$' + b64urlEncode(bits);
}

async function verifyPassword(password, stored) {
  try {
    var parts = String(stored || '').split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
    var iterations = parseInt(parts[1], 10);
    if (!iterations || iterations < 1 || iterations > 1000000) return false;
    var salt = b64urlDecode(parts[2]);
    var expected = parts[3];
    var bits = await pbkdf2Bits(password, salt, iterations);
    return constantTimeEqualStr(b64urlEncode(bits), expected);
  } catch (e) {
    return false;
  }
}

// ---- app-level JWT (HS256 via WebCrypto) ------------------------------
// The SPA holds a GoShop JWT issued by these functions (7d expiry). The token
// is verified inside every authenticated function — the engine's
// `ctx.principal` only carries lightbase credentials, not app sessions.
function jwtSecret() {
  return (ctx.env && ctx.env.JWT_SECRET) || 'goshop_jwt_secret_change_in_production_2024';
}

var TOKEN_TTL_SECONDS = 7 * 24 * 3600;

async function hmacRaw(secret, message, hash) {
  var key = await crypto.subtle.importKey(
    'raw',
    __ENC.encode(secret),
    { name: 'HMAC', hash: hash || 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', key, __ENC.encode(message));
}

async function generateToken(userId) {
  var header = b64urlEncode(__ENC.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  var now = Math.floor(Date.now() / 1000);
  var payload = b64urlEncode(__ENC.encode(JSON.stringify({ userId: userId, iat: now, exp: now + TOKEN_TTL_SECONDS })));
  var sig = b64urlEncode(await hmacRaw(jwtSecret(), header + '.' + payload, 'SHA-256'));
  return header + '.' + payload + '.' + sig;
}

async function verifyToken(token) {
  try {
    var parts = String(token || '').split('.');
    if (parts.length !== 3) return null;
    var sig = b64urlEncode(await hmacRaw(jwtSecret(), parts[0] + '.' + parts[1], 'SHA-256'));
    if (!constantTimeEqualStr(sig, parts[2])) return null;
    var payload = JSON.parse(__DEC.decode(b64urlDecode(parts[1])));
    if (!payload || !payload.userId) return null;
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return { userId: payload.userId };
  } catch (e) {
    return null;
  }
}

// ---- auth guards (throw __response markers; see handleSafe) -----------
async function currentUser() {
  var auth = (ctx.headers && (ctx.headers.authorization || ctx.headers['Authorization'])) || '';
  if (String(auth).indexOf('Bearer ') !== 0) return null;
  var decoded = await verifyToken(String(auth).slice(7));
  if (!decoded) return null;
  var doc = await db.get('users', decoded.userId);
  if (!doc) return null;
  var user = mapDoc(doc);
  delete user.passwordHash;
  return user;
}

async function requireUser() {
  var auth = (ctx.headers && (ctx.headers.authorization || ctx.headers['Authorization'])) || '';
  if (String(auth).indexOf('Bearer ') !== 0) throw jerr('Unauthorized', 401);
  var decoded = await verifyToken(String(auth).slice(7));
  if (!decoded) throw jerr('Invalid token', 401);
  var doc = await db.get('users', decoded.userId);
  if (!doc) throw jerr('User not found', 404);
  var user = mapDoc(doc);
  delete user.passwordHash;
  return user;
}

function requireRole(user, roles) {
  var arr = Array.isArray(user.roles) ? user.roles : [user.role];
  for (var i = 0; i < roles.length; i++) {
    if (arr.indexOf(roles[i]) !== -1) return;
  }
  throw jerr('Forbidden', 403);
}

// Wrap a handler so thrown __response markers pass through untouched and all
// other errors become 500 JSON (same shape as the old shared router).
async function handleSafe(fn) {
  try {
    return await fn();
  } catch (e) {
    if (isResponseMarker(e)) return e;
    console.error('[goshop-fn] unhandled error:', String(e && e.message ? e.message : e));
    return jerr((e && e.message) || 'Internal server error', 500);
  }
}

// ---- db helpers --------------------------------------------------------
// db.get THROWS NotFoundError when the document is missing — qGet hides that.
async function qGet(collection, id) {
  try {
    var doc = await db.get(collection, id);
    return doc ? mapDoc(doc) : null;
  } catch (e) {
    return null;
  }
}

function buildEqFilter(where) {
  var entries = [];
  for (var k in where || {}) {
    if (where[k] === undefined) continue;
    entries.push({ field: k, op: 'eq', value: where[k] });
  }
  if (entries.length === 0) return null;
  if (entries.length === 1) return entries[0];
  return { and: entries };
}

// Query + map documents. `where` is a simple equality map (the shape every
// old handler used); `sort` is an engine SortSpec array.
async function qAll(collection, where, limit, sort) {
  var req = { filter: buildEqFilter(where), limit: limit || 1000 };
  if (sort) req.sort = sort;
  var res = await db.query(collection, req);
  return ((res && res.data) || []).map(mapDoc);
}

async function qOne(collection, where) {
  var rows = await qAll(collection, where, 2);
  return rows[0] || null;
}

async function qInsert(collection, data) {
  var doc = await db.insert(collection, sanitizeInput(data));
  return mapDoc(doc);
}

async function qUpdate(collection, id, data) {
  var doc = await db.update(collection, id, sanitizeInput(data));
  return doc ? mapDoc(doc) : null;
}

function num(v) {
  var n = Number(v);
  return isNaN(n) ? 0 : n;
}

// Fire-and-forget email event recorder. The old handler chain used
// emitEmailEventSafe (a no-op without an SMTP transport); the static
// architecture records the event as a document so a lightbase email relay
// can pick it up later without another migration.
async function recordEmailEvent(event, to, data, overrides) {
  try {
    await qInsert('email_events', {
      event: event,
      to: to,
      data: data || {},
      overrides: overrides || {},
      status: 'queued',
    });
  } catch (e) {
    console.error('[goshop-fn] email event record failed:', String(e && e.message ? e.message : e));
  }
}
