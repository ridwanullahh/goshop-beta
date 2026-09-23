#!/usr/bin/env node
// بسم الله الرحمن الرحيم
// GoShop — AppSail full-Node server (API + static SPA, one origin).
//
// BismiLLAH (2026-09-23): the CF Pages "static + lightbase edge functions"
// architecture is retired per the fleet mandate ("no edge functions — full
// Node environment"). This server:
//   1. serves the built SPA (dist/) with SPA fallback,
//   2. hosts the GoShop API natively in Node: the EXACT same function sources
//      (edge-functions/lib/prelude.js + edge-functions/functions/*.js) are
//      executed in-process against a Lightbase REST adapter — behaviour parity
//      with the old engine (same { __response } takeover, same status codes),
//      reachable at POST /api/fn/<name> with the same {body, headers} envelope,
//   3. exposes POST /api/webhooks/birrpay as a REAL raw-body webhook
//      (byte-identical HMAC verification — the old engine envelope限制 is gone),
//   4. runs the email relay: email_events queued by the handlers are drained
//      via Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD) every 60s and marked
//      sent — previously they queued forever with no transport.
// No edge functions anywhere — everything is plain Node HTTP.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { webcrypto } from 'node:crypto'
import vm from 'node:vm'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 8080)
const HOST = process.env.HOST || '0.0.0.0'
const DIST = path.join(__dirname, 'dist')
const BRAND = process.env.APP_SPLASH_NAME || 'GoShop'

// ---------------------------------------------------------------------------
// Lightbase REST adapter (server-side, full API key — NEVER exposed to browser)
// ---------------------------------------------------------------------------
const LB_BASE = (process.env.LIGHTBASE_BASE_URL || 'https://lightbase-10133292663.development.catalystappsail.com').replace(/\/+$/, '')
const LB_KEY = process.env.LIGHTBASE_API_KEY || ''
const LB_PROJECT = process.env.LIGHTBASE_PROJECT_ID || process.env.LIGHTBASE_PROJECT || 'goshop-beta'

function lbHeaders() {
  return { apikey: LB_KEY, 'x-lightbase-project': LB_PROJECT, 'Content-Type': 'application/json' }
}

async function lbFetch(pathname, init = {}) {
  const res = await fetch(`${LB_BASE}${pathname}`, {
    method: init.method || 'GET',
    headers: lbHeaders(),
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* keep null */ }
  if (!res.ok) {
    const err = new Error(`Lightbase ${res.status}: ${text.slice(0, 300)}`)
    err.status = res.status
    err.code = json?.error?.code
    throw err
  }
  return json
}

// The sandbox `db` contract used by the function sources:
//   db.insert(c, data) -> doc        db.get(c, id) -> doc (THROWS 404)
//   db.update(c, id, data) -> doc    db.delete(c, id)
//   db.query(c, {filter,limit,sort}) -> { data: docs }
const db = {
  async insert(collection, data) {
    const res = await lbFetch(`/api/v1/projects/${encodeURIComponent(LB_PROJECT)}/collections/${encodeURIComponent(collection)}/docs`, { method: 'POST', body: data })
    return res?.data ?? res
  },
  async get(collection, id) {
    const res = await lbFetch(`/api/v1/projects/${encodeURIComponent(LB_PROJECT)}/collections/${encodeURIComponent(collection)}/docs/${encodeURIComponent(id)}`)
    return res?.data?.document ?? res?.data ?? res
  },
  async update(collection, id, data) {
    const res = await lbFetch(`/api/v1/projects/${encodeURIComponent(LB_PROJECT)}/collections/${encodeURIComponent(collection)}/docs/${encodeURIComponent(id)}`, { method: 'PATCH', body: data })
    return res?.data?.document ?? res?.data ?? res
  },
  async delete(collection, id) {
    const res = await lbFetch(`/api/v1/projects/${encodeURIComponent(LB_PROJECT)}/collections/${encodeURIComponent(collection)}/docs/${encodeURIComponent(id)}`, { method: 'DELETE' })
    return res?.data ?? res
  },
  async query(collection, req = {}) {
    const params = new URLSearchParams()
    if (req.filter) params.set('filter', JSON.stringify(req.filter))
    if (req.limit) params.set('limit', String(req.limit))
    if (req.offset) params.set('offset', String(req.offset))
    if (req.sort) params.set('sort', typeof req.sort === 'string' ? req.sort : JSON.stringify(req.sort))
    const qs = params.toString()
    const res = await lbFetch(`/api/v1/projects/${encodeURIComponent(LB_PROJECT)}/collections/${encodeURIComponent(collection)}/docs${qs ? '?' + qs : ''}`)
    const data = res?.data ?? res
    // Normalise to the engine's { data: docs } shape.
    if (Array.isArray(data)) return { data }
    if (Array.isArray(data?.documents)) return { data: data.documents }
    if (Array.isArray(data?.docs)) return { data: data.docs }
    return { data: data?.data || [] }
  },
}

// ---------------------------------------------------------------------------
// Function runtime — executes the UNMODIFIED edge-function sources in Node.
// The engine contract: wrap `prelude + handler` in `async function(ctx, db)`.
// Node 22 globals already provide fetch, TextEncoder/Decoder, btoa/atob and
// console; crypto.subtle/getRandomValues/randomUUID are provided from
// node:crypto webcrypto inside the sandbox scope.
// ---------------------------------------------------------------------------
const PRELUDE = fs.readFileSync(path.join(__dirname, 'edge-functions', 'lib', 'prelude.js'), 'utf8')
const FUNCTIONS_DIR = path.join(__dirname, 'edge-functions', 'functions')
const compiled = new Map()

function compileFn(name) {
  if (compiled.has(name)) return compiled.get(name)
  const file = path.join(FUNCTIONS_DIR, `${name}.js`)
  if (!fs.existsSync(file)) return null
  const src = fs.readFileSync(file, 'utf8')
  const factory = new Function('ctx', 'db', 'crypto', `
    ${PRELUDE}
    return (async () => {
      ${src}
    })().catch((e) => { throw e; });
  `)
  const entry = (ctx) => factory(ctx, db, webcrypto)
  compiled.set(name, entry)
  return entry
}

const FN_HEADER_BLOCK = (name) => `/* ${name} executed in Node (AppSail) — source: edge-functions/functions/${name}.js */`

async function runFunction(name, body, headers, res) {
  const fn = compileFn(name)
  if (!fn) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: `Unknown function: ${name}` }))
  }
  const ctx = {
    body,
    headers: headers || {},
    env: process.env,
    principal: null,
    __fnName: name,
  }
  try {
    const result = await fn(ctx)
    // { __response } raw takeover — exact parity with the engine.
    if (result && result.__response) {
      res.writeHead(result.__response.status || 200, result.__response.headers || { 'Content-Type': 'application/json' })
      return res.end(typeof result.__response.body === 'string' ? result.__response.body : JSON.stringify(result.__response.body))
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: true, result, durationMs: 0, note: FN_HEADER_BLOCK(name) }))
  } catch (e) {
    console.error(`[goshop-api] ${name} failed:`, e?.message || e)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: (e && e.message) || 'Internal server error' }))
  }
}

// ---------------------------------------------------------------------------
// Email relay — drain queued email_events via Gmail SMTP (nodemailer).
// Handlers queue events with status:'queued'; this relay sends them and marks
// them sent/failed. Runs every 60s and once shortly after boot.
// ---------------------------------------------------------------------------
let smtpTransport = null
let smtpReady = false
async function getSmtp() {
  if (smtpReady) return smtpTransport
  smtpReady = true
  const user = process.env.GMAIL_USER || ''
  const pass = process.env.GMAIL_APP_PASSWORD || ''
  if (!user || !pass) return null
  try {
    const nodemailer = await import('nodemailer')
    smtpTransport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
  } catch (e) {
    console.warn('[goshop-mailer] nodemailer unavailable:', e?.message)
    smtpTransport = null
  }
  return smtpTransport
}

function renderEmailEvent(ev) {
  const d = ev.data || {}
  const ov = ev.overrides || {}
  const name = d.name || 'there'
  const appUrl = (process.env.APP_URL || '').replace(/\/$/, '')
  const map = {
    welcome: { subject: 'Welcome to GoShop!', html: `<h2>Assalamu Alaikum ${name}!</h2><p>Your GoShop account is ready. Happy shopping!</p>` },
    orderConfirmation: { subject: `Order confirmed #${d.orderId || ''}`, html: `<h2>Shukran ${name}!</h2><p>Your order <strong>#${d.orderId}</strong> totalling <strong>${d.total ?? ''}</strong> has been received.</p>` },
    newOrder: { subject: `New order #${d.orderId || ''}`, html: `<p>New order from ${d.buyerEmail || d.buyerName || 'a customer'}.</p>` },
    orderStatusUpdate: { subject: `Order #${d.orderId || ''} update`, html: `<p>Your order status is now: <strong>${d.status || d.orderStatus || 'updated'}</strong>.</p>` },
    orderShipped: { subject: `Order #${d.orderId || ''} shipped`, html: `<p>Your order has shipped, ${name}!</p>` },
    orderDelivered: { subject: `Order #${d.orderId || ''} delivered`, html: `<p>Your order was delivered. Enjoy!</p>` },
    paymentSuccess: { subject: `Payment received for order #${d.orderId || ''}`, html: `<p>Payment of <strong>${d.amount ?? ''}</strong> received via ${d.paymentMethod || 'BirrPay'}.</p>` },
    walletDebited: { subject: 'Wallet debited', html: `<p>${d.description || ''} — amount ${d.amount ?? ''}, new balance ${d.balance ?? ''}.</p>` },
    contactForm: { subject: ov.subject || 'Contact form message', html: `<p><strong>${d.name}</strong> (${d.email}) wrote:</p><p>${d.message || ''}</p>` },
    newsletterWelcome: { subject: 'Welcome to the GoShop newsletter', html: `<p>Welcome aboard, ${name}! Unsubscribe anytime: ${appUrl}/unsubscribe?email=${encodeURIComponent(ev.to || '')}</p>` },
    referralInvite: { subject: `${d.referrerName || 'A friend'} invited you to GoShop`, html: `<p>Join using code <strong>${d.referralCode || ''}</strong>: ${appUrl}/register?ref=${d.referralCode || ''}</p>` },
    sellerAgreement: { subject: 'Seller agreement received', html: `<p>Your seller agreement was recorded, ${name}.</p>` },
  }
  const tpl = map[ev.event] || { subject: `GoShop: ${ev.event}`, html: `<pre>${JSON.stringify(d, null, 2).replace(/</g, '&lt;')}</pre>` }
  return {
    to: ev.to,
    from: `GoShop <${process.env.GMAIL_USER || 'noreply@goshop.com'}>`,
    subject: ov.subject || tpl.subject,
    html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">${tpl.html}<hr><p style="color:#9ca3af;font-size:12px">GoShop — powered by BirrPay</p></body></html>`,
    replyTo: ov.replyTo || undefined,
  }
}

async function drainEmailEvents() {
  try {
    const transport = await getSmtp()
    if (!transport) return
    const res = await db.query('email_events', { filter: { field: 'status', op: 'eq', value: 'queued' }, limit: 25 })
    const events = res.data || []
    for (const ev of events) {
      try {
        const mail = renderEmailEvent(ev)
        await transport.sendMail(mail)
        await db.update('email_events', ev.id, { status: 'sent', sentAt: new Date().toISOString() })
      } catch (e) {
        console.warn('[goshop-mailer] send failed for', ev.id, e?.message)
        await db.update('email_events', ev.id, { status: 'failed', failedAt: new Date().toISOString(), error: String(e?.message || e).slice(0, 300) }).catch(() => {})
      }
    }
  } catch (e) {
    console.warn('[goshop-mailer] drain failed:', e?.message)
  }
}

setInterval(drainEmailEvents, 60_000)
setTimeout(drainEmailEvents, 8_000)

// ---------------------------------------------------------------------------
// Static file serving with SPA fallback
// ---------------------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.map': 'application/json', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  let filePath = path.join(DIST, decodeURIComponent(url.pathname))
  if (!filePath.startsWith(DIST)) { res.writeHead(403); return res.end('Forbidden') }
  if (!existsSafe(filePath)) filePath = path.join(DIST, 'index.html')
  if (!existsSafe(filePath)) {
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' })
    return res.end(`<!DOCTYPE html><html><body style="font-family:system-ui;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh"><div style="text-align:center"><h1 style="font-size:48px;font-weight:800;color:#10b981">${BRAND}</h1><p>Building your storefront… refresh in a moment.</p></div></body></html>`)
  }
  const ext = path.extname(filePath).toLowerCase()
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    ...(url.pathname.startsWith('/assets/') ? { 'Cache-Control': 'public, max-age=31536000, immutable' } : { 'Cache-Control': 'no-cache' }),
  })
  res.end(fs.readFileSync(filePath))
}
function existsSafe(p) { try { return fs.existsSync(p) } catch { return false } }

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  if (req.url === '/__boot') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ app: BRAND, mode: 'node-api', lightbase: LB_PROJECT, smtp: Boolean(process.env.GMAIL_USER) }))
  }

  // Raw BirrPay webhook — byte-identical signature verification.
  if (url.pathname === '/api/webhooks/birrpay' && req.method === 'POST') {
    const raw = await readBody(req)
    const headers = {}
    for (const [k, v] of Object.entries(req.headers)) headers[k] = Array.isArray(v) ? v.join(',') : v
    return runFunction('webhook-birrpay', raw, headers, res)
  }

  // Function invoke — same {body, headers} envelope as the old engine route.
  const fnMatch = url.pathname.match(/^\/api\/fn\/([a-zA-Z0-9_-]+)$/)
  if (fnMatch && req.method === 'POST') {
    const raw = await readBody(req)
    let envelope = {}
    try { envelope = raw ? JSON.parse(raw) : {} } catch { envelope = { body: raw } }
    const headers = envelope.headers || {}
    // Merge the caller's real headers (authorization flows through here).
    for (const [k, v] of Object.entries(req.headers)) {
      const lk = k.toLowerCase()
      if (lk === 'authorization' && !headers.authorization) headers.authorization = Array.isArray(v) ? v.join(',') : v
    }
    return runFunction(fnMatch[1], envelope.body ?? {}, headers, res)
  }

  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: true, provider: 'lightbase', project: LB_PROJECT, mode: 'node-api' }))
  }

  if (url.pathname.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Unknown API route' }))
  }

  return serveStatic(req, res)
})

function readBody(req, limit = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > limit) { reject(new Error('Body too large')); req.destroy() }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

server.listen(PORT, HOST, () => {
  console.log(`[GoShop] node server listening on ${HOST}:${PORT} — API + static in one process. BismiLLAH`)
})
