# WORKLOG — goshop-beta

> BismiLLAH Ar-Rahman Ar-Raheem. Dedicated repo worklog. One entry per milestone,
> updated in the same commit as the work it describes. No emojis.

---

## Task ID 3 — Migrate goshop-beta to 100% static Cloudflare Pages + lightbase

- **Agent:** Task 3 migration agent (zero-Workers fleet audit follow-up,
  `lightbase/docs/ZERO_WORKERS_AUDIT.md` §3.1).
- **Task:** Remove all CF Workers/Pages Functions (`functions/`, `apps/api`
  server wiring, Slate/Catalyst deploy paths) from goshop-beta; move every
  server need to lightbase (Edge Functions + REST + scoped browser key); keep
  the SPA 100% static; document dual-target readiness (static CF Pages
  primary, plain Node static host fallback); battle-test end-to-end against
  the local lightbase instance before each push.

### Work Log

- Cloned repo (was missing from the sandbox) and surveyed: `functions/api/[[path]].ts`
  (CF Pages Function delegating to `apps/api/src/router.ts`), `apps/api`
  handlers (auth, products, orders, payments, birrpay-webhook, data,
  storefront, translate, referral, emails), provider layer (lightbase REST
  client), SPA `src/lib/api-client.ts` (all `/api/*` callers), browser-direct
  `src/lib/lightbase-client.ts` (batch/ETag/polling, key injected at runtime).
- Read lightbase engine sources to pin exact contracts: functions create/list/
  invoke routes, auth modes (`project`/`user`/`public`), `{ __response }` raw
  takeover, sandbox surface (WebCrypto incl. PBKDF2 + HMAC, fetch, URL,
  btoa/atob, no Buffer/require/process), `db.*` semantics (throws NotFound on
  missing get; strict schema validation strips unknown fields; `sort` is an
  array of `{field, direction}`), scoped keys route (`POST /api/v1/projects/:id/keys`,
  `collections` restriction), CORS origin pinning (env `LIGHTBASE_ALLOWED_ORIGINS`).
- Confirmed BirrPay relay signs `t=...,v1=<hex>` with HMAC-SHA256 over
  `<ts>.<body>` (BirrPay-Beta1b `src/lib/relay.ts`); the ported webhook
  verifies SHA-256 `v1` and additionally SHA-512 `v2` via `crypto.subtle`.
- Probed the local engine (temp function): `public` invoke works anonymously,
  `{ __response }` raw takeover works (418 + custom headers verified),
  WebCrypto PBKDF2/HMAC-SHA512 available, `db.query` SortSpec arrays work,
  collections must pre-exist for function `db` access.
- **Milestone A — lightbase port committed:**
  - `edge-functions/lib/prelude.js` + 16 handler bodies under `edge-functions/`
    (source of truth): `auth-register`, `auth-login`, `auth-me`,
    `products-list`, `products-create`, `products-update`, `products-delete`,
    `orders-list`, `orders-create`, `orders-update`, `payments-initiate`,
    `webhook-birrpay`, `data-crud`, `referral`, `translate`, `emails`.
    All `auth: public` (app enforces its own PBKDF2 + HS256-JWT session auth
    in-function, matching the engine's guidance for browser endpoints);
    password hashing = PBKDF2-SHA256 (100k iterations, WebCrypto; bcryptjs is
    unavailable in the sandbox — documented in DEPLOYMENT.md §6).
  - `scripts/lightbase-provision.mjs` — creates the 27 collections from the
    legacy schema + `email_events`, mints the READ-ONLY browser key
    (`browser-readonly`, scopes `["read"]`, restricted to catalog collections),
    seeds demo catalog + TEST_USERS.md accounts (PBKDF2 hashes).
  - `scripts/lightbase-deploy-functions.mjs` — syntax-gates + deploys all 16
    functions with operator-supplied env (JWT_SECRET, gateway keys, webhook
    secret); functions are immutable over REST today (no update route) — gap
    noted below.
  - `scripts/lightbase-e2e.mjs` — 52-check battle test at the function
    boundary (auth, products, browser-key reads + deny checks, catalog,
    cart, orders, wallet payment, BirrPay webhook v1+v2+begative cases,
    seller products, referral, emails + email_events, translate).
  - Local instance state: 16 functions created; browser key minted
    (`/tmp/lbdev/goshop-browser-key.txt`, outside the repo); e2e result
    **52 passed, 0 failed**.
  - Ops note: the shared local lightbase was found DOWN mid-session; restarted
    via `/tmp/lbdev/start-task3.sh` (start-quota.sh env + `LIGHTBASE_ALLOWED_ORIGINS`
    for cross-origin browser tests). Sandbox kills detached processes between
    tool calls, so tests run in single calls (start-if-down pattern).

### Stage Summary

- Stage: survey complete; migration plan fixed (16 consolidated Edge Functions,
  browser-direct catalog reads with a collections-restricted read-only key,
  app-level JWT + PBKDF2 password hashing inside public functions).
- Milestone A DONE: all server handlers ported to lightbase Edge Functions and
  battle-tested at the function boundary (52/52). Known engine gap: no
  update/delete routes for functions (immutable once created) and no raw
  webhook passthrough on the invoke route (senders must use the `{body,headers}`
  envelope) — both documented for the lightbase team.
