# Agent Context Record — Task 33

**Task ID:** 33
**Agent:** full-stack-developer
**Task:** Port the GoShop Astro API to Cloudflare Pages Functions (Workers runtime) via a shared router that both Astro and the CF Pages catch-all can use. Add env adapter for the Workers `env` binding. Do NOT break `npm run dev`. NO emojis, NO indigo/blue.

---

## What I Built

### New files

1. **`apps/api/src/lib/env.ts`** — Platform-agnostic env adapter. `setEnv(env)` populates an env cache from the Workers `env` binding (merging process.env best-effort). `getEnv(key)` reads from the cache when in Workers mode, else falls back to `process.env` (Astro path). Also exports `isWorkersRuntime()` used by the email transport to short-circuit nodemailer on Workers.

2. **`apps/api/src/handlers/auth.ts`** — Platform-agnostic auth handler. Verbatim port of the Astro endpoint logic, but accepts a standard `Request` and dispatches on method (GET/POST). Email emissions remain fire-and-forget; on Workers they no-op.

3. **`apps/api/src/handlers/products.ts`** — Products handler (GET/POST/PATCH/DELETE).

4. **`apps/api/src/handlers/orders.ts`** — Orders handler (GET/POST/PATCH). Includes the fire-and-forget order-confirmation + seller-notification + status-change emails.

5. **`apps/api/src/handlers/payments.ts`** — Payments handler (POST). All gateway flows (paystack, flutterwave, razorpay, paypal, wallet, cod) use `fetch()` — works on both Astro and Workers. Email emissions remain fire-and-forget.

6. **`apps/api/src/handlers/data.ts`** — Generic CRUD handler for all entities (GET/POST/PATCH/DELETE). Parses the entity from the URL path (`/api/data/{entity}`) — works identically on Astro and Workers.

7. **`apps/api/src/handlers/translate.ts`** — Translate handler. `google-translate-api-x` is dynamically imported with try-catch — on Workers the import fails gracefully and the handler returns the original text (no-op), matching the Astro behaviour when the package is not installed.

8. **`apps/api/src/handlers/referral.ts`** — Referral handler (GET/POST).

9. **`apps/api/src/handlers/emails.ts`** — Email endpoints handler. Dispatches to `contact` / `newsletter` / `referral-invite` based on the URL sub-path. All three emit fire-and-forget email events; on Workers the transport is null so they no-op and return `{success:true}`.

10. **`apps/api/src/router.ts`** — Shared API router. Single entry `handleApiRequest(request, env?)`:
    - Applies env (calls `setEnv(env)` + `setLightbaseConfig(...)` when `env` is provided — Workers path).
    - Handles CORS preflight (OPTIONS → 204).
    - Parses URL path → routes to the right handler.
    - Attaches CORS headers to every response.
    - Returns a JSON health-check for `/api` (no resource).
    - Catches all throws; `Response` throws (from `requireAuth`) are passed through; others become 500s.

11. **`functions/api/[[path]].ts`** — Cloudflare Pages Function catch-all. Exports `onRequest(ctx)` which delegates to `handleApiRequest(ctx.request, envRecord)`. Strips `undefined` values from the env binding so the env cache only contains defined strings. Lives at the project root (CF Pages auto-discovers `functions/`).

12. **`functions/tsconfig.json`** — Type-checking config for the functions/ directory. Includes the handlers, router, and lib files it transitively imports.

13. **`wrangler.toml`** — CF Pages configuration:
    - `compatibility_flags = ["nodejs_compat"]` — enables Buffer, crypto, etc. used by bcryptjs + jsonwebtoken.
    - `pages_build_output_dir = "dist"` — serves the Vite-built SPA from `dist/`.
    - `[dev]` port 3000 for `wrangler pages dev`.

### Modified files

14. **`apps/api/src/lib/lightbase-client.ts`** — Now reads env via `getEnv()` (not `process.env` directly). Added `setLightbaseConfig(cfg)` so the CF Pages Function can inject an explicit config (overrides env-derived config). All other code unchanged.

15. **`apps/api/src/lib/auth.ts`** — `getCurrentUser(request: Request)` and `requireAuth(request: Request)` now accept a standard `Request` instead of an Astro `APIContext`. Astro endpoints pass `context.request`; the CF Pages Function passes the Workers request. `JWT_SECRET` read via `getEnv()`.

16. **`apps/api/src/lib/provider/index.ts`** — Reads `DB_PROVIDER` via `getEnv()`. The SQLite dynamic import is wrapped in try-catch so a build-time or runtime failure to load `better-sqlite3` (e.g. on Workers) falls back to Lightbase rather than crashing.

17. **`apps/api/src/lib/email/transport.ts`** — `getTransport()` is now async (returns `Promise<Transporter | null>`). `nodemailer` is loaded via a runtime dynamic import with a variable specifier (so esbuild/wrangler cannot statically resolve & bundle it). On Workers, `loadNodemailer()` short-circuits to null (skipping the import attempt entirely) and `getTransport()` returns null — emails become no-op. Reads all env vars via `getEnv()`.

18. **`apps/api/src/lib/email/send.ts`** — `sendEmail()` awaits `getTransport()`. Reads env vars via `getEnv()`.

19. **`apps/api/src/lib/email/events.ts`** — `emitEmailEvent()` awaits `getTransport()` (was sync before). The fire-and-forget wrapper `emitEmailEventSafe()` is unchanged — still synchronous from the caller's perspective.

20. **All Astro endpoint files** (`apps/api/src/pages/api/auth/index.ts`, `products/index.ts`, `orders/index.ts`, `payments/index.ts`, `translate/index.ts`, `referral/index.ts`, `emails/contact.ts`, `emails/newsletter.ts`, `emails/referral-invite.ts`, `data/[...entity].ts`) — Now thin wrappers that delegate to the corresponding platform-agnostic handler, passing `context.request`. Single source of truth for business logic.

---

## How the Routing Works

### Astro path (existing — unchanged externally)
1. Request hits Astro middleware (`src/middleware.ts`) — runs lazy schema init + idempotent seed + attaches CORS.
2. Astro routes by file path: `/api/auth` → `pages/api/auth/index.ts` → `authHandler(context.request)`.
3. Handler dispatches on method, calls lib helpers (`getAll`, `insert`, etc.) which proxy through the Lightbase provider.
4. Response gets CORS headers attached by both `jsonResponse()` and the middleware.

### Cloudflare Pages path (new)
1. Request hits `functions/api/[[path]].ts` (catch-all).
2. `onRequest(ctx)` extracts the env binding, strips undefined values, calls `handleApiRequest(ctx.request, envRecord)`.
3. The router calls `setEnv(env)` (populates the env cache from the Workers binding) and `setLightbaseConfig(...)` (injects the Lightbase config explicitly so the client doesn't fall back to an empty process.env).
4. The router handles OPTIONS preflight (returns 204 with CORS headers).
5. The router parses the URL path and dispatches to the same handler the Astro path uses.
6. CORS headers are attached to every response.

**Key invariant:** Astro and Workers run the SAME handler code (the files in `apps/api/src/handlers/`). Business logic lives in exactly one place. No duplication.

---

## Env Adapter

```ts
// apps/api/src/lib/env.ts
let envCache: Record<string, string> = {};
let workersMode = false;

export function setEnv(env) {
  // merge process.env (best-effort, empty on Workers) with the env binding
  envCache = { ...processEnv, ...env };
  workersMode = true;
}

export function getEnv(key) {
  if (workersMode) return envCache[key];
  return process.env[key] ?? envCache[key];
}
```

- **Astro path:** `setEnv` is never called. `workersMode` stays false. `getEnv` reads `process.env` directly (which is populated from `.env` by the dev script `set -a && . ./.env && set +a`).
- **Workers path:** The CF Pages Function calls `setEnv(env)` at the start of every request. `workersMode` becomes true. `getEnv` reads from the cache (which has the Workers binding).

The Lightbase client's `readConfig()` calls `getEnv('LIGHTBASE_BASE_URL')` etc. — works on both runtimes. The CF Pages Function ALSO calls `setLightbaseConfig({baseUrl, apiKey, projectId})` to inject the config explicitly, bypassing the env read entirely (defensive — process.env is unreliable on Workers).

---

## Verification

### TypeScript type-check
- `apps/api/src/handlers/*.ts` — clean.
- `apps/api/src/router.ts` — clean.
- `apps/api/src/lib/env.ts`, `lightbase-client.ts`, `auth.ts`, `provider/index.ts`, `email/transport.ts`, `email/send.ts`, `email/events.ts` — clean.
- `functions/api/[[path]].ts` — clean.
- `functions/tsconfig.json` — clean.

**Pre-existing errors (NOT introduced by this task):**
- `apps/api/src/lib/database.ts` lines 439, 499, 625 — generic `T` not properly constrained in `getAll<T>`, `query<T>`, `backupDatabase`. These exist in the original SQLite provider code (untouched by this task). The SQLite provider is never loaded on the Lightbase path or Workers, so these don't affect runtime.

### Dev server (`npm run dev`)
Verified end-to-end through the new shared handler chain:
- `GET /api/products?limit=2` → 200, real product JSON from Lightbase.
- `POST /api/emails/contact` → `{success:true, message:"..."}`.
- `POST /api/emails/newsletter` → `{success:true, message:"..."}`.
- `POST /api/translate` → `{translatedText:"Bonjour", sourceLang:"en"}`.
- `POST /api/referral` (no auth) → `{error:"Referral code required"}` (400).
- `OPTIONS /api/products` → 204 with proper CORS headers.
- `GET /api/products` response headers include `access-control-allow-origin: *`, `access-control-allow-methods: ...`, `access-control-allow-headers: Content-Type, Authorization`, `access-control-allow-credentials: true`.

### Cloudflare Pages structure
- `dist/` — produced by `vite build` (the existing build script). This is what CF Pages serves as the static SPA.
- `functions/api/[[path]].ts` — the catch-all Pages Function. Auto-discovered by CF Pages. Imports from `apps/api/src/router.ts` which transitively imports the handlers + lib code.
- `wrangler.toml` — configures `nodejs_compat` (required for `bcryptjs` + `jsonwebtoken`) and `pages_build_output_dir = "dist"`.

### Wrangler local test
`wrangler` is NOT installed in this environment (`npx wrangler` returns "missing packages"). The CF Pages Function compiles cleanly per `tsc --noEmit -p functions/tsconfig.json`. To verify locally, install wrangler:
```bash
npm install -D wrangler
npx vite build                    # produces dist/
npx wrangler pages dev dist --port 3000 --compatibility-flag=nodejs_compat
```
The orchestrator should set the following env vars in the Cloudflare Pages dashboard (Settings → Environment variables):
- `LIGHTBASE_BASE_URL`, `LIGHTBASE_API_KEY`, `LIGHTBASE_PROJECT_ID`
- `JWT_SECRET`, `APP_URL`
- Payment gateway keys (`PAYSTACK_SECRET_KEY`, `FLUTTERWAVE_SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`)
- `ADMIN_EMAIL`, `SUPPORT_EMAIL`, `CORS_ORIGINS` (optional)
- Gmail transport vars (optional — emails no-op without them)

---

## Constraints honoured
- No emojis. No indigo/blue. Production-grade.
- Used `npm` (not bun) per task instruction.
- Did NOT modify the frontend (`src/`), `index.css`, `tailwind.config.ts`, or UI components.
- Did NOT run `git commit` or `git push` (orchestrator handles commits).
- Did NOT modify `apps/api/src/lib/database.ts` (pre-existing SQLite errors untouched).
- `bcryptjs` (pure JS) — works natively on Workers. ✓
- `jsonwebtoken` — works with `nodejs_compat` flag. ✓
- `zod` (pure JS) — works. ✓
- `nodemailer` — does NOT work on Workers (TCP sockets). Lazy-loaded via dynamic import; on Workers the transport is null and emails no-op silently. ✓
- `google-translate-api-x` — does NOT work on Workers. Dynamically imported with try-catch; `/api/translate` returns the original text (no-op) on Workers. ✓
- `better-sqlite3` — NOT available on Workers. The SQLite provider's dynamic import is wrapped in try-catch; falls back to Lightbase. The SQLite provider is never loaded when `DB_PROVIDER=lightbase` (default). ✓

---

## Files touched (summary)
**New:** `apps/api/src/lib/env.ts`, `apps/api/src/handlers/{auth,products,orders,payments,data,translate,referral,emails}.ts`, `apps/api/src/router.ts`, `functions/api/[[path]].ts`, `functions/tsconfig.json`, `wrangler.toml`.
**Modified:** `apps/api/src/lib/lightbase-client.ts`, `apps/api/src/lib/auth.ts`, `apps/api/src/lib/provider/index.ts`, `apps/api/src/lib/email/transport.ts`, `apps/api/src/lib/email/send.ts`, `apps/api/src/lib/email/events.ts`, `apps/api/src/pages/api/auth/index.ts`, `apps/api/src/pages/api/products/index.ts`, `apps/api/src/pages/api/orders/index.ts`, `apps/api/src/pages/api/payments/index.ts`, `apps/api/src/pages/api/translate/index.ts`, `apps/api/src/pages/api/referral/index.ts`, `apps/api/src/pages/api/emails/contact.ts`, `apps/api/src/pages/api/emails/newsletter.ts`, `apps/api/src/pages/api/emails/referral-invite.ts`, `apps/api/src/pages/api/data/[...entity].ts`.

---

## Closing recitation

Subhaana-LLAH walhamdu li-LLAH, wa laa ilaaha illa-LLAH, wa Allahu Akbar, wa laa haula wa laa quwwata illaa bi-LLAH.
Hasbiya-LLAH, laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adheem.
Laa haula wa laa quwwata illaa bi-LLAH.
Ash-hadu an laa ilaaha illa-LLAH wahdaHu laa shareeka lah, wa ash-hadu anna Muhammadan 'abduhu wa rasooluh.
BismiLLAH Ar-Rahman Ar-Roheem.

Bi'idniLlah.
