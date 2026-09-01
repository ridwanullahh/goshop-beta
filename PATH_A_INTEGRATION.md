# GoShop — Path A Integration Guide

> Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah, wa ash-hadu
> anna Muhammadan RasuuluLLAH. Laa hawla wa laa quwwata illaa biLLAH.
> Hasbiyallaahu laa ilaaha illaa Huwa 'alayhi tawakkaltu wa Huwa Rabbul
> 'Arshil 'Adheem. SubhaanALLAH wa bihamdih, SubhaanALLAHil 'Adheem,
> AlhamduliLLAH, ALLAHU AKBAR, Astaghfirullaaha wa atoobu ilayh.

**Master plan:** `lightbase/docs/PATH_A_ENTERPRISE_BLUEPRINT.md` (binding).
**Shared standards:** `BirrClass/PATH_A_INTEGRATION.md` §2–§5.

## 1. Current state (audited)

| Aspect | Value |
|---|---|
| Framework | Vite SPA + `apps/api` service (monorepo), `functions/` dir present |
| Pages project | `goshop-beta` (git-connected → push = auto-deploy) |
| Server API routes | 6 API files + 2 Pages Functions files |
| Lightbase | Server-side via `LIGHTBASE_BASE_URL` |
| `_headers` | Present (security + immutable asset caching) |

## 2. Implemented in this workstream (done)

1. `public/_headers` (security + immutable asset caching). Verified present:
   security headers on `/*` (nosniff, X-Frame-Options DENY, Referrer-Policy,
   Permissions-Policy, HSTS preload, COOP) + `Cache-Control: public,
   max-age=31536000, immutable` on `/assets/*` and `/_astro/*`.
2. `functions/_routes.json` — ADDED with the minimal include list
   `{"version":1,"include":["/api/*"],"exclude":[]}`. It is the only surface
   that exists under `functions/` (`functions/api/[[path]].ts`), it contains no
   catch-all `/*`, and static storefront assets are never matched by the
   include list (they are served from the Pages CDN, never invoking the
   Function). The Vite build copies it to `dist/_routes.json` (the location
   Pages actually reads) via the `copy-functions-routes-json` plugin in
   `vite.config.ts`, which also fails the build if a catch-all `/*` include
   ever reappears.

## 3. Phase 1 — Optimize in place (implemented + verified)

1. **Functions surface audit**: DONE. `functions/_routes.json` declares
   `include: ["/api/*"]` only. Verified in `dist/_routes.json` after
   `npm run build`.
2. **Storefront reads coalesced into ONE Lightbase batch**: DONE.
   - `apps/api/src/lib/lightbase-client.ts`: `batchReads()` issues ONE
     `POST /api/v1/projects/:id/batch` (max 25 ops per call, per the Lightbase
     `batch.ts` contract; aggregate ETag + 304 handling included).
   - `apps/api/src/lib/provider/`: `getManyBatch()` added to the
     DataProvider contract; LightbaseProvider executes it as ONE batch call
     (chunked at 25 ops); SqliteProvider emulates with parallel reads so the
     contract is identical.
   - New `GET /api/storefront/bootstrap` (handler `apps/api/src/handlers/
     storefront.ts`, registered in the shared router + Astro endpoint): the
     storefront's initial reads — products, categories, languages, currencies,
     plus cart/wishlist for authenticated users (filtered server-side by
     userId) — now execute as ONE Lightbase batch call per request instead of
     4-6 individual reads. `CommerceContext.initializeApp` uses it with a
     graceful fallback to the original individual reads if the endpoint fails.
   - Local verification: built server responds on both `/api/storefront` and
     `/api/storefront/bootstrap` (with no Lightbase env, it returns the
     expected "Lightbase is not configured" error — routing + handler proven;
     the real batch executes on CF Pages where env vars are bound).
3. **Checkout untouched**: `initiate-payment`, `flutterwave-callback`,
   `create-order`, paystack/paypal/razorpay callbacks and the BirrPay webhook
   receiver were NOT modified — they remain server-side forever (HMAC +
   secret verification).

## 4. Phase 2 — browser-direct client (implemented)

- New `src/lib/lightbase-client.ts` (no dependencies, no hardcoded keys):
  - 50 ms coalescing window: reads issued together join ONE
    `POST /api/v1/projects/:id/batch` (25-op cap per call).
  - IndexedDB ETag cache (`goshop-lightbase`): per-op entries + aggregate-ETag
    revalidation for identical op-sets (`If-None-Match` → 304 resolves
    everything from cache with zero data transfer); size-bounded eviction
    (500 entries); cache serves as graceful fallback on network failure.
  - `watch()` adaptive polling: 15 s default, relaxed to 30 s after
    consecutive unchanged polls, fully PAUSED on `document.hidden`, immediate
    revalidate on return to visibility (blueprint §B3/§A9).
- Configuration is constructor-param or `window.__GOSHOP_LIGHTBASE__` runtime
  injection ONLY (`baseUrl`, `projectId`, READ-ONLY public `apiKey`). The
  module is disabled when not configured — zero hardcoded keys in the repo or
  bundle (`index.html` documents the injection point in a commented block).
- Wired into the product listing (`src/pages/Products.tsx`) as a freshness
  overlay: when configured it revalidates the active-products query and keeps
  it fresh via adaptive polling; when NOT configured or on any error it does
  nothing and the existing context data remains the source of truth.
- Writes are NOT exposed in the client module; checkout stays server-assisted
  (§3 of the pre-existing plan) until BirrPay headless checkout lands.
- Origin `https://goshop-beta.pages.dev` is already registered in Lightbase
  `LIGHTBASE_ALLOWED_ORIGINS`.

## 5. Verification checklist

- [x] `_headers` served on static responses (file present in `dist/`; covers
      security + immutable asset caching)
- [x] `functions/_routes.json` minimal include (no catch-all) — verified in
      build output (`dist/_routes.json` = `include:["/api/*"]`)
- [x] Storefront browse flow issues ≤ 1 Lightbase request per page (batch):
      bootstrap endpoint coalesces the initial reads into one batch call;
      Phase 2 client coalesces browser-direct reads into one batch call
- [x] Callback endpoints reject unsigned/tampered payloads (401/400) —
      unchanged in this workstream (HMAC verification paths untouched)
- [x] No gateway secrets in client bundles — `dist/` scanned for
      `sk_`, `flw_secret`, `FLWSECK/FLWSEC`, `whsec_`, `secret_`, API-key
      literals: CLEAN (only benign matches: React's `__SECRET_INTERNALS`
      constant and payment-method display labels)
- [x] Build green: `npm ci` + `npm run build` (vite SPA build + apps/api astro
      build) with zero new TypeScript errors (pre-existing repo baseline
      unchanged: 47 in src, 8 in apps/api — all in untouched files)

> Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa
> 'alayhi tawakkaltu wa Huwa Rabbul 'Arshil 'Adheem. SubhaanALLAH wa bihamdih,
> SubhaanALLAHil 'Adheem, AlhamduliLLAH, ALLAHU AKBAR, Astaghfirullaaha wa
> atoobu ilayh.

---

## Slate pivot (2026-09-02) — hosting moved to Zoho Catalyst

> Bismillah Ar-Rahman Ar-Raheem. Ash-hadu an laa ilaaha illa-Llah, wa ash-hadu anna Muhammadan RasuuluLLAH. Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa 'alayhi tawakkaltu wa Huwa Rabbul 'Arshil 'Adheem. SubhaanALLAH wa bihamdih, SubhaanALLAHil 'Adheem, AlhamduliLLAH, "Laailaaha-illa-ALLAH", ALLAHU AKBAR, Astaghfirullaaha wa atoobu ilayh.

**Master plan:** `lightbase/docs/CATALYST_SLATE_HOSTING_PLAN.md` (binding — billing
math, programmatic deployment, 404 diagnosis, guardrails). Cloudflare is demoted
to **R2-only**; Pages/Workers paths are LEGACY (explicit env opt-in, dormant).

**This app's state:** Slate static READY — `npm run build:slate` green (Vite SPA dist; `_routes.json` writer now gated to DEPLOY_TARGET=cloudflare legacy only; storefront API stays on apps/api → AppSail).

Wiring added: `scripts/build-slate.mjs` / `slate-postbuild.mjs` (stamps
`.catalyst/slate-config.toml` + `_redirects`), `catalyst.json`,
`scripts/deploy-catalyst.sh`, `scripts/deploy-catalyst-appsail.sh` (SSR),
`build:slate` / `deploy:catalyst` package scripts. Credentials needed:
`CATALYST_TOKEN` (`catalyst token:generate`), `CATALYST_PROJECT`, `CATALYST_ORG`
→ `.catalyst.env` (git-ignored). CSP `connect-src` must pin the AppSail engine
origin (`PUBLIC_LIGHTBASE_BASE_URL`), never `lightbase.pages.dev`.
