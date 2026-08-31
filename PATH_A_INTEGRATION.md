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
| `_headers` | **Absent — added in this workstream** |

## 2. Implemented in this workstream (done)

1. `public/_headers` (security + immutable asset caching).
2. `functions/_routes.json` contract note: Pages Functions must declare a
   minimal include list (see §3.3) so static storefront assets never invoke
   the Function.

## 3. Phase 1 — Optimize in place

1. **Functions surface audit**: the `functions/` directory (checkout/order
   helpers) must stay the ONLY dynamic surface; verify `functions/_routes.json`
   includes only what exists under `functions/`.
2. Storefront reads (products, collections, cart) via coalesced
   `POST /api/v1/projects/:id/batch`; product pages are the ideal first
   browser-direct + ETag/IndexedDB migration target (Phase 2).
3. Checkout (`initiate-payment`, `flutterwave-callback`, `create-order`)
   handles gateway callbacks — these remain server-side forever (HMAC +
   secret verification, same rule as BirrPay webhook receivers).

## 4. Phase 2/3

Product/category/cart → client SDK; catalog pages prerendered; checkout stays
server-assisted until BirrPay headless checkout (no-redirect, tokenized) is
integrated per the estate roadmap. Origin `https://goshop-beta.pages.dev` is
already registered in Lightbase `LIGHTBASE_ALLOWED_ORIGINS`.

## 5. Verification checklist

- [ ] `_headers` served on static responses
- [ ] `functions/_routes.json` minimal include (no catch-all)
- [ ] Storefront browse flow issues ≤ 1 Lightbase request per page (batch)
- [ ] Callback endpoints reject unsigned/tampered payloads (401/400)
- [ ] No gateway secrets in client bundles

> Laa hawla wa laa quwwata illaa biLLAH. Hasbiyallaahu laa ilaaha illaa Huwa
> 'alayhi tawakkaltu wa Huwa Rabbul 'Arshil 'Adheem. SubhaanALLAH wa bihamdih,
> SubhaanALLAHil 'Adheem, AlhamduliLLAH, ALLAHU AKBAR, Astaghfirullaaha wa
> atoobu ilayh.
