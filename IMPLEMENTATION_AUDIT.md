# GoShop Beta — Implementation Audit & Task Plan

> BismiLLAH Ar-Rahman Ar-Roheem. Laa haula wa laa quwwata illaa bi-LLAH.
> Audit conducted by Task ID 26 (Explore agent). Research-only — no code was modified.

---

## Executive Summary

- **Total files audited:** 137
  - `src/pages/*.tsx`: 49 page files
  - `src/pages/admin/*.tsx`: 2
  - `src/pages/seller-dashboard/*.tsx`: 8
  - `src/pages/api/*.ts` (legacy Vite stubs): 6
  - `src/components/*.tsx`: 33
  - `src/components/home/*.tsx`: 9
  - `src/components/store/*.tsx`: 3
  - `src/components/product/*.tsx`: 4
  - `src/components/providers/*.tsx`: 2
  - `src/components/ui/*.tsx`: 50 (shadcn primitives — excluded)
  - `src/context/*.tsx`: 4
  - `src/lib/*.ts`: 9
  - `apps/api/src/pages/api/*.ts`: 7 endpoints
  - `apps/api/src/lib/*.ts`: 7 (auth, schema, seed, providers, lightbase-client, database, middleware)

- **Fully functional (real data, working forms/buttons, server-backed):** ~52
- **Stubs / mocks / gaps / orphaned / non-functional:** ~50
- **Legacy files marked for removal:** 9 (`src/lib/commerce-sdk.ts`, `src/lib/sdk.ts`, `src/lib/auth.ts`, `src/lib/paypal-client.ts`, `src/lib/validation.ts`, `src/lib/ai.ts` (client-side), `src/lib/index.ts`, `src/pages/api/initiate-payment.ts`, `src/pages/api/create-order.ts`, `src/pages/api/paypal-capture-payment.ts`, `src/pages/api/paystack-callback.ts`, `src/pages/api/flutterwave-callback.ts`, `src/pages/api/razorpay-callback.ts`)
- **Critical security gaps still open:** 6 (SEC-007 rate limiting, SEC-008 server validation completeness, SEC-009 CSRF, SEC-011 security headers, SEC-013 verbose errors, SEC-014 audit logging)
- **i18n keys used but missing from `public/locales/en/translation.json`:** none that block UX (the false positives are URL/variable tokens, not `t()` calls). However many components render raw English strings instead of `t()` — full i18n coverage is incomplete.

---

## Priority Levels

- **P0 (critical):** breaks core flows, blocks revenue, or exposes security risks. Must be fixed before any user touches the feature.
- **P1 (high):** visible to users; should work end-to-end. Orphaned pages with substantial UI but no route.
- **P2 (medium):** nice-to-have / secondary features. Cosmetic, refactor, or future-enhancement.

---

## Audit Results & Task Plan

### P0 — Critical

---

#### Task P0-1: Remove legacy client-side SDK (`src/lib/commerce-sdk.ts`, `src/lib/sdk.ts`, `src/lib/auth.ts`, `src/lib/paypal-client.ts`)

- **Files:**
  - `src/lib/commerce-sdk.ts` (1,830 lines — GitHub-API-backed SDK with `VITE_GITHUB_TOKEN` exposure, plaintext password storage, no password verification on login, `localStorage`-only session, full client-side CRUD).
  - `src/lib/sdk.ts` (488 lines — `UniversalSDK` against GitHub contents API; line 232 stores plaintext password; lines 245–257 login compares plaintext password directly; `getCurrentUser` returns `users[0]`).
  - `src/lib/auth.ts` (26 lines — client-side `verifyAuth` using `process.env.JWT_SECRET` and `new CommerceSDK()`; will leak secrets if bundled).
  - `src/lib/paypal-client.ts` (15 lines — instantiates PayPal SDK with `process.env.PAYPAL_CLIENT_ID/SECRET` at module load; would leak credentials if imported by the SPA).
  - `src/lib/index.ts` re-exports `commerce-sdk`, `sdk`, `ai`, `validation`, `utils` — must be slimmed down.
- **Gap:** These files are the original insecure GitHub-backed implementation. They are no longer used by the routed UI (which uses `src/lib/api-client.ts`), but they are still imported by:
  - `src/pages/api/initiate-payment.ts`, `src/pages/api/create-order.ts`, `src/pages/api/paypal-capture-payment.ts`, `src/pages/api/paystack-callback.ts`, `src/pages/api/flutterwave-callback.ts`, `src/pages/api/razorpay-callback.ts` (legacy Vite API stubs).
  - `src/lib/auth.ts` (legacy client-side).
  - Many type imports across `src/pages/*` and `src/components/*` (e.g. `import type { Product, Order, Category, CartItem, WishlistItem, Language, Currency, Store, Blog } from '@/lib'` or `'@/lib/commerce-sdk'`).
- **Sub-tasks:**
  1. Audit all `import ... from '@/lib/commerce-sdk'` and `from '@/lib'` usages; identify which are pure type imports vs runtime imports.
  2. Move all shared types (`User`, `Product`, `Order`, `OrderItem`, `Address`, `CartItem`, `WishlistItem`, `Category`, `Store`, `Blog`, `Notification`, `Wallet`, `Transaction`, `LiveStream`, `Post`, `Comment`, `RefundRequest`, `Dispute`, `WithdrawalRequest`, `PlatformCommission`, `SellerAgreement`, `AffiliateLink`, `AffiliateCollection`, `Language`, `Currency`, `Review`, `HelpArticle`) into a new `src/types/index.ts` (zero runtime code).
  3. Re-point all type imports to `@/types`.
  4. Delete `src/lib/commerce-sdk.ts`, `src/lib/sdk.ts`, `src/lib/auth.ts`, `src/lib/paypal-client.ts`, `src/lib/validation.ts` (validation now lives in Astro API).
  5. Rewrite `src/lib/index.ts` to only re-export `apiClient` and `utils`.
  6. Verify `pnpm build` succeeds with no unresolved imports.
- **Acceptance criteria:**
  - `grep -rn "commerce-sdk\|sdk.ts\|lib/auth\|paypal-client" src/` returns only the (deleted) legacy API stub paths or zero matches.
  - Production bundle (`dist/`) contains no `VITE_GITHUB_TOKEN`, `PAYPAL_CLIENT_SECRET`, `JWT_SECRET`, or `Authorization: token` strings.
  - All routed pages compile and load with no console errors.

---

#### Task P0-2: Remove legacy Vite API stubs (`src/pages/api/*.ts`)

- **Files:**
  - `src/pages/api/initiate-payment.ts` (224 lines) — uses `CommerceSDK`, `paypal-client`, `verifyAuth` from `@/lib/auth`; reads `process.env.PAYSTACK_SECRET_KEY` etc. client-side; only partially functional.
  - `src/pages/api/create-order.ts` (129 lines) — same pattern; never invoked by the SPA (SPA uses `apiClient.createOrder` which calls `POST /api/orders` on Astro).
  - `src/pages/api/paypal-capture-payment.ts` (37 lines) — PayPal capture stub.
  - `src/pages/api/paystack-callback.ts` (84 lines) — webhook handler; never reachable from Vite build.
  - `src/pages/api/flutterwave-callback.ts` (68 lines) — Flutterwave redirect handler; never reachable.
  - `src/pages/api/razorpay-callback.ts` (63 lines) — Razorpay webhook handler; never reachable.
- **Gap:** Vite does not run server-side handlers. These files are dead code that import the legacy SDK and secrets, confusing the build and risking accidental exposure. Real callbacks must live on the Astro API (`apps/api`).
- **Sub-tasks:**
  1. Delete all six files in `src/pages/api/`.
  2. Implement real callback/webhook endpoints in `apps/api/src/pages/api/payments/paystack-webhook.ts`, `flutterwave-callback.ts`, `razorpay-webhook.ts`, `paypal-capture.ts` (server-side signature verification + idempotent order status update + transaction recording).
  3. Add `GET /api/payments/verify?reference=…` endpoint for the SPA to poll after redirect (used by `EnhancedCheckout`).
  4. Update `apps/api/src/pages/api/payments/index.ts` to set correct `callback_url` / `redirect_url` pointing to the SPA's `/order/:id` page (already partially done at lines 71, 97, 160, 161 — verify env var name).
- **Acceptance criteria:**
  - `apps/api` exposes all four webhook/callback endpoints with signature verification.
  - `src/pages/api/` directory is removed or empty.
  - End-to-end test: Paystack sandbox payment → webhook → order status `paid` → transaction row inserted.

---

#### Task P0-3: Fix `EnhancedCheckout` — no real payment initiation, broken redirect

- **File:** `src/pages/EnhancedCheckout.tsx:147-211`
- **Gap:** `handlePlaceOrder` calls `sdk.createOrder(orderData)` then **immediately clears the cart and shows a success toast** without ever calling `sdk.initiatePayment`. The `paymentMethod` state is bound to a `<Select>` with only `card | paypal | bank` options — there is no path to Paystack/Flutterwave/Razorpay/Wallet/COD, even though `apps/api/src/pages/api/payments/index.ts` supports all of them. The `window.location.href = '/orders/${order.id}'` redirect goes to a non-existent route (`/orders/:id` is not routed; the real route is `/order/:id`).
- **Sub-tasks:**
  1. Replace the payment-method `<Select>` with a proper PaymentMethodPicker (cards, PayPal, Paystack, Flutterwave, Razorpay, Wallet, COD) gated by env flags (`VITE_ENABLE_PAYSTACK` etc.) and wallet balance.
  2. After `sdk.createOrder`, call `sdk.initiatePayment(order.id, paymentMethod)` and handle the response:
     - `redirectUrl` → `window.location.href = redirectUrl` (Paystack, Flutterwave, PayPal).
     - `razorpayOrderId + keyId` → open Razorpay checkout modal.
     - `transactionId` (wallet) → redirect to `/order/:id?paid=1`.
     - `transactionRef` (COD) → redirect to `/order/:id?cod=1`.
  3. Fix redirect URL from `/orders/${order.id}` to `/order/${order.id}`.
  4. Add a `/order/:id/pay` route or `?payment_pending=1` query param that re-triggers `initiatePayment` if the user returns without paying.
  5. Server-side: add `apps/api/src/pages/api/payments/verify.ts` (GET) that takes `orderId` or `reference` and returns the current payment status so the SPA can poll after redirect.
  6. Add `paymentStatus` field to the order detail page so users see a clear "Payment received" / "Payment pending" banner.
- **Acceptance criteria:**
  - Selecting any enabled gateway and clicking "Pay Now" results in either a redirect to the gateway, a Razorpay modal, a wallet debit, or a COD confirmation.
  - Returning from the gateway updates the order to `paid` (via webhook or verify endpoint).
  - The cart is only cleared after the order is successfully created AND the payment is initiated (or wallet debited).

---

#### Task P0-4: Replace `NotificationsModal` mock data with real notifications

- **File:** `src/components/NotificationsModal.tsx:30-58`
- **Gap:** When opened, the modal sets `notifications` to three hardcoded mock entries ("Order Shipped #12345", "iPhone 15 Pro 15% off", "New Message"). It never calls `apiClient.getNotifications`. `markAsRead`, `deleteNotification`, `markAllAsRead` only mutate local state — the server is never updated, so the same notifications reappear next time.
- **Sub-tasks:**
  1. Replace mock with `apiClient.getNotifications(currentUser.id)` (already exists at `api-client.ts:241`).
  2. Wire `markAsRead` → `apiClient.update('notifications', id, { read: true })` (or extend apiClient with `markNotificationRead(id)`).
  3. Wire `deleteNotification` → `apiClient.deleteOne('notifications', id)`.
  4. Wire `markAllAsRead` → batch PATCH or loop.
  5. Translate notification titles/messages via `t()` using stable keys (e.g. `notification.order_shipped_title`) instead of `notification.title.toLowerCase().replace(/ /g, '_')` (which currently looks up non-existent keys).
  6. Add real-time refresh via `useEnhancedRealTime().subscribe('notifications', …)`.
- **Acceptance criteria:**
  - Opening the modal shows the user's real notifications from the database.
  - Marking as read / deleting persists to the server.
  - New notifications appear without a full page reload.

---

#### Task P0-5: Fix `CommunityHub.tsx` — broken JSX in catch block, missing SDK methods

- **File:** `src/pages/CommunityHub.tsx:144-185` and `116, 137, 157, 160, 272, 273`
- **Gap:** The `handleAddComment` catch block (lines 169-185) contains raw JSX (`{/* Admin Moderation Tab Toggle */}` and a `<div>` with two `<Button>`s) **inside the catch statement** — this is a syntax/logic error that will either crash the build or render JSX as a side-effect of an error. The page also calls SDK methods that don't exist on `apiClient`: `sdk.updatePost`, `sdk.getComments`, `sdk.createComment`, `sdk.moderatePost`.
- **Sub-tasks:**
  1. Move the admin moderation tab JSX out of the catch block — it belongs in the main render tree (probably near the "Create Post" section, gated by `currentUser?.role === 'admin'`).
  2. Add missing API client methods:
     - `apiClient.updatePost(postId, updates)` → `PATCH /api/data/posts` with `{ id, ...updates }` (generic data endpoint already supports this; add a thin wrapper).
     - `apiClient.getComments(postId)` → `GET /api/data/comments?postId=postId`.
     - `apiClient.createComment(data)` → `POST /api/data/comments`.
     - `apiClient.moderatePost(postId, action, moderatorId)` → `PATCH /api/data/posts` with `{ id, status: 'approved'|'rejected', moderatedBy: moderatorId, moderatedAt: new Date().toISOString() }`.
  3. Replace all `sdk.updatePost` / `sdk.getComments` / `sdk.createComment` / `sdk.moderatePost` calls with the new apiClient methods.
  4. Add `status` field to the Post schema (`apps/api/src/lib/schema.ts`) and seed.
  5. Default new posts to `status: 'pending'`; only show `status === 'approved'` in the public feed.
- **Acceptance criteria:**
  - `pnpm build` succeeds without JSX-in-catch-block errors.
  - Creating a post stores it with `status: 'pending'`.
  - Admin moderation tab works: approve/reject updates the post status on the server.
  - Comments persist and reload after posting.

---

#### Task P0-6: Fix `CustomerDashboard.tsx` — wrong data shape (`order.products` vs `order.items`)

- **File:** `src/pages/CustomerDashboard.tsx:252, 322, 328-336, 339`
- **Gap:** The component reads `order.products.length` and `item.productName`, but the canonical Order shape (defined in `apps/api/src/lib/schema.ts` and returned by `GET /api/orders`) uses `order.items: OrderItem[]` where each item has `name`, `images`, `quantity`, `price`, `productId`, `sellerId`, etc. There is no `products` array on an order. This will throw `Cannot read properties of undefined (reading 'length')` for every order.
- **Sub-tasks:**
  1. Replace all `order.products` with `order.items`.
  2. Replace `item.productName` with `item.name`.
  3. Replace `order.products.slice(0, 2).map((item, index) => …)` with `order.items.slice(0, 2).map(…)`.
  4. Render `item.images?.[0]` instead of `item.image`.
  5. Use `formatPrice(item.price * item.quantity)` instead of raw `$`.
  6. Apply the same fix to `MyOrders.tsx:294-307` (uses `item.images?.[0]` correctly but verify `item.name`).
- **Acceptance criteria:**
  - Customer dashboard overview and orders tab render real orders without runtime errors.
  - Items display correct name, image, quantity, and line total.

---

#### Task P0-7: Fix `Orders.tsx` — 100% hardcoded mock data

- **File:** `src/pages/Orders.tsx:1-53`
- **Gap:** The entire page is a stub. It renders `{[1, 2, 3].map((order) => …)}` with hardcoded "Order #1001/2001/3001", "Placed on Dec {n}, 2024", "Delivered", "2 items", "Total: $299.99", and a "View Details" button that does nothing (no `onClick`, no `<Link>`). This is the page actually routed at `/orders` and `/customer-dashboard/orders`.
- **Sub-tasks:**
  1. Replace the entire body with a real implementation modeled on the orphaned `MyOrders.tsx` (which has filters, search, status badges, real API calls).
  2. Use `apiClient.getOrders()` (server already scopes to the authenticated user).
  3. Add search, status filter, date filter, and a "View Details" `<Link to={`/order/${order.id}`}>`.
  4. Wire "Cancel" button → `apiClient.updateOrderStatus(order.id, 'cancelled')` with confirmation dialog.
  5. Wire "Invoice" button → generate/download invoice (server-side PDF endpoint or window.print of order detail).
  6. Delete `MyOrders.tsx` after merging its best features into `Orders.tsx`.
- **Acceptance criteria:**
  - `/orders` shows the authenticated user's real orders.
  - Filters work.
  - Clicking "View Details" navigates to `/order/:id`.
  - Cancel action updates the order status on the server.

---

#### Task P0-8: Fix `Wishlist.tsx` — uses `localStorage` instead of API

- **File:** `src/pages/Wishlist.tsx:14-35`
- **Gap:** Wishlist reads/writes `localStorage.getItem('wishlist_${currentUser.uid}')` directly, bypassing the `apiClient.addToWishlist` / `apiClient.removeFromWishlist` methods that the `CommerceContext` already provides. This means:
  - Wishlist is not synced across devices.
  - Wishlist is lost on logout / clear-cache.
  - The `wishlistItems` state in `CommerceContext` (which `Header` uses for the badge count) is out of sync with the page.
  - `currentUser.uid` may be undefined (the canonical field is `id`).
- **Sub-tasks:**
  1. Replace localStorage reads with `wishlistItems` from `useCommerce()` (already populated by `loadUserWishlist`).
  2. Replace `removeFromWishlist` local mutation with `removeFromWishlist(productId)` from `useCommerce()` (note: `CommerceContext.removeFromWishlist` currently takes `productId` and looks up the item internally — verify signature).
  3. Replace `addAllToCart` to call `addToCart(item.id)` sequentially (or add a batch endpoint).
  4. Apply the same fix to `src/components/SidebarModal.tsx:41-65` and `src/components/WishlistModal.tsx:24-40` which have the same localStorage pattern.
- **Acceptance criteria:**
  - Adding to wishlist from a product card updates the Wishlist page in real time.
  - Wishlist persists across devices and logins.
  - `Header`'s wishlist badge count matches the Wishlist page.

---

#### Task P0-9: Fix `MyWallet.tsx` — `prompt()` for amount, fake funding, missing `createWallet`/`fundWallet`

- **File:** `src/pages/MyWallet.tsx:40-59`
- **Gap:** `handleFundWallet` uses `prompt('Enter amount to fund:')` (blocking, ugly, no validation). It then calls `sdk.fundWallet(currentUser.id, amount, 'Wallet funding', paymentGateway)` — a method that **does not exist** on `apiClient` and would silently credit the wallet without any real payment verification (SEC risk: direct wallet credit without gateway).
- **Sub-tasks:**
  1. Replace `prompt()` with a proper "Fund Wallet" modal (`Dialog`) containing an amount input, gateway picker, and confirm button.
  2. Add server endpoint `POST /api/payments/fund-wallet` in `apps/api` that:
     - Validates amount > 0.
     - Initiates payment via the selected gateway (Paystack/Flutterwave/Razorpay/PayPal).
     - On success webhook, credits the wallet and inserts a `transactions` row.
  3. Add `apiClient.fundWallet(amount, gateway)` wrapper.
  4. Remove `apiClient.createWallet` (wallet auto-created on registration in `apps/api/src/pages/api/auth/index.ts:56`).
  5. Delete `MyWallet.tsx` after merging into the routed `Wallet.tsx` (which already has a withdrawal flow), OR add a route for `MyWallet` and delete `Wallet.tsx`. Decide one canonical wallet page.
- **Acceptance criteria:**
  - Funding wallet opens a modal, not a browser prompt.
  - Wallet is only credited after a real gateway payment succeeds (webhook-verified).
  - No `apiClient.fundWallet(userId, amount, ...)` method that bypasses payment.

---

#### Task P0-10: Fix `Login.tsx` OTP flow — fake verification

- **File:** `src/pages/Login.tsx:63-85`
- **Gap:** `handleOtpSubmit` does **not** verify the OTP — it just shows a success toast and navigates to `/customer-dashboard`. The OTP UI is also never triggered (`otpRequired` is never set to `true` in `handleSubmit`). Comment at line 68 says "In a real implementation, you'd verify OTP here."
- **Sub-tasks:**
  1. Implement server-side OTP: `POST /api/auth/otp/send` (issue OTP, store hashed with expiry, send via email/SMTP), `POST /api/auth/otp/verify` (verify and issue token).
  2. Add `apiClient.sendOtp(email)`, `apiClient.verifyOtp(email, otp)`.
  3. Wire `handleSubmit` to call `apiClient.sendOtp(email)` and set `otpRequired = true` if the server responds with `otpRequired: true` (configurable per `requireEmailVerification` setting).
  4. Wire `handleOtpSubmit` to call `apiClient.verifyOtp(email, otp)` and only navigate on success.
  5. Add "Resend code" button with 60s cooldown.
- **Acceptance criteria:**
  - OTP (when enabled) is actually sent and verified server-side.
  - Wrong OTP shows an error and does not navigate.

---

#### Task P0-11: Fix `CustomerOnboarding.tsx` — does not persist data

- **File:** `src/pages/CustomerOnboarding.tsx:79-89`
- **Gap:** `handleComplete` only `console.log`s the data and shows a toast — it never calls any API. The user's interests, address, and preferences are lost. Comment at line 80: "In production, save onboarding data to your SDK".
- **Sub-tasks:**
  1. Add `apiClient.updateProfile({ interests, address, preferences, onboardingCompleted: true })` → `PATCH /api/data/users` with `{ id: currentUser.id, … }` or a dedicated `PATCH /api/auth/profile`.
  2. Wire `handleComplete` to call this and only navigate on success.
  3. Route `/customer-onboarding` in `App.tsx` (currently orphaned).
  4. Add `ProtectedRoute requireOnboarding` redirect after login if `onboardingCompleted === false`.
- **Acceptance criteria:**
  - Onboarding data is saved to the user record.
  - `onboardingCompleted` flag is set to `true`.
  - User is redirected to onboarding on first login.

---

#### Task P0-12: Fix `AffiliateOnboarding.tsx` — incomplete submission

- **File:** `src/pages/AffiliateOnboarding.tsx:41-67`
- **Gap:** `handleComplete` calls `sdk.createAffiliate({ userId, businessName, website, commissionRate, isActive })` but **discards** `socialMedia`, `experience`, `promotionMethods`, `expectedTraffic`, `bankAccount`, `taxId`. It also calls `sdk.createAffiliate` which on `apiClient` simply calls `register({ role: 'affiliate' })` — that re-registers a new user instead of updating the current one. The `onboardingCompleted` flag is never set.
- **Sub-tasks:**
  1. Replace `sdk.createAffiliate` with `apiClient.updateProfile({ affiliateProfile: { businessName, website, socialMedia, experience, promotionMethods, expectedTraffic, bankAccount, taxId, commissionRate }, onboardingCompleted: true })`.
  2. Persist all form fields.
  3. Route `/affiliate-onboarding` in `App.tsx`.
  4. Add `ProtectedRoute allowedRoles={['affiliate']}` wrapper.
- **Acceptance criteria:**
  - All form fields are persisted.
  - `onboardingCompleted` is set.
  - User is not re-registered.

---

#### Task P0-13: Fix `SellerOnboarding.tsx` — calls non-existent `sdk.sdk.update` and `sdk.checkStoreSlugAvailability`

- **File:** `src/pages/SellerOnboarding.tsx:87, 218, 221-224`
- **Gap:** Line 87 calls `sdk.checkStoreSlugAvailability(slug)` — does not exist on `apiClient`. Line 221 calls `sdk.sdk.update('users', currentUser.id, …)` — double-`sdk` indirection that will throw `Cannot read properties of undefined`. The `handleComplete` does not set `onboardingCompleted: true` on the user.
- **Sub-tasks:**
  1. Add `apiClient.checkStoreSlugAvailability(slug)` → `GET /api/stores/check-slug?slug=…` (server-side).
  2. Add `apiClient.updateProfile(updates)` → `PATCH /api/auth/profile` or `PATCH /api/data/users` with `{ id, ...updates }`.
  3. Replace `sdk.sdk.update(...)` with `apiClient.updateProfile({ onboardingCompleted: true, storeSlug })`.
  4. Verify `sdk.createStore(storeData)` works (it calls `POST /api/data/stores`).
  5. Route `/seller-onboarding` in `App.tsx`.
- **Acceptance criteria:**
  - Slug availability check works in real time.
  - Submitting the form creates a store and marks onboarding complete.
  - No runtime errors.

---

#### Task P0-14: Fix `RefundDispute.tsx` — calls five non-existent SDK methods

- **File:** `src/pages/RefundDispute.tsx:53, 55, 100, 130`
- **Gap:** Calls `sdk.getRefundRequests(userId, 'customer')`, `sdk.getUserOrders(userId)`, `sdk.createRefundRequest(data)`, `sdk.createDispute(data)` — none exist on `apiClient`. Also `sdk.getData('disputes')` is generic but `disputes` isn't in the `TABLE_MAP` of `apps/api/src/pages/api/data/[...entity].ts` (line 6-33 — actually it IS mapped at line 24: `disputes: 'disputes'`, so `getData('disputes')` works, but `getRefundRequests` and `createRefundRequest` don't).
- **Sub-tasks:**
  1. Add `apiClient.getRefundRequests(userId?)` → `GET /api/data/refund_requests?userId=…`.
  2. Add `apiClient.createRefundRequest(data)` → `POST /api/data/refund_requests`.
  3. Add `apiClient.createDispute(data)` → `POST /api/data/disputes`.
  4. Replace `sdk.getUserOrders(userId)` with `apiClient.getOrders()` (server scopes by token).
  5. Add file upload for evidence (Cloudinary upload via `apiClient.uploadToCloudinary`).
- **Acceptance criteria:**
  - Refund request submission persists.
  - Dispute submission persists.
  - Evidence files are uploaded and URLs stored.

---

#### Task P0-15: Fix `admin/CommissionSettings.tsx` and `admin/AgreementSettings.tsx` — non-existent SDK methods and `prompt()`/`confirm()` UI

- **Files:**
  - `src/pages/admin/CommissionSettings.tsx:74, 80, 113` — calls `sdk.updatePlatformCommission`, `sdk.createPlatformCommission`, and `sdk.sdk.delete('platformCommissions', id)` (double-sdk bug).
  - `src/pages/admin/AgreementSettings.tsx:64, 87-90, 113` — calls `sdk.createSellerAgreement` (missing), uses `prompt()` for variable name/value, `confirm()` for removal.
- **Gap:** Neither page is routed in `App.tsx`. The AdminDashboard may render them inline (need to verify). The methods called don't exist on `apiClient`.
- **Sub-tasks:**
  1. Add `apiClient.createPlatformCommission(data)`, `apiClient.updatePlatformCommission(id, data)` — both hit `POST/PATCH /api/data/platform_commissions`.
  2. Add `apiClient.createSellerAgreement(data)` → `POST /api/data/seller_agreements`.
  3. Replace `sdk.sdk.delete(...)` with `apiClient.deleteOne('platform_commissions', id)`.
  4. Replace `prompt()` / `confirm()` with proper Dialog components.
  5. Either route `/admin/commission-settings` and `/admin/agreement-settings` in `App.tsx`, or wire them as tabs inside `AdminDashboard.tsx` (verify which is intended).
- **Acceptance criteria:**
  - Creating/editing/deleting commissions and agreements persists.
  - No `prompt()` / `confirm()` calls.
  - Admin can access these settings from the AdminDashboard.

---

#### Task P0-16: Fix `CommunityHub.tsx` admin moderation tab JSX-in-catch (DUPLICATE of P0-5 — same file)

(Merged into P0-5; listed separately here for the orchestrator's task tracker.)

---

#### Task P0-17: Security — implement rate limiting, CSRF, security headers, audit logging

- **Files:** `apps/api/src/middleware.ts` (current CORS-only middleware), `apps/api/src/lib/auth.ts` (no rate limit).
- **Gap:** `docs/security-audit-report.md` lists SEC-007 (rate limiting), SEC-009 (CSRF), SEC-011 (security headers), SEC-014 (audit logging) as "Requires implementation". Current middleware only sets CORS headers — no rate limit, no CSRF, no HSTS/CSP/X-Frame-Options, no audit log.
- **Sub-tasks:**
  1. Add `apps/api/src/lib/rate-limit.ts` using `lru-cache` (10 req/min for `/api/auth/*`, 100 req/min general).
  2. Apply rate limit in `middleware.ts` based on `x-forwarded-for` or IP.
  3. Add CSRF token endpoint `GET /api/auth/csrf-token` and require `X-CSRF-Token` header on all mutating requests from the SPA.
  4. Add security headers in `middleware.ts` response: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: origin-when-cross-origin`, basic `Content-Security-Policy`.
  5. Add `apps/api/src/lib/audit.ts` with `logAuditEvent({ action, userId, resourceType, resourceId, ip, userAgent, details })` and call it on login, register, payment, order status change, admin actions.
  6. Add `audit_logs` table to schema.
- **Acceptance criteria:**
  - Brute-force login returns 429 after 10 attempts.
  - Mutating requests without CSRF token return 403.
  - Response headers include all security headers.
  - Audit log records every sensitive action.

---

### P1 — High

---

#### Task P1-1: Route all orphaned pages or delete them

- **Files (orphaned — imported nowhere, no `<Route>`):**
  - `src/pages/TrackOrder.tsx` (365 lines, fully built, real data via `useRealTimeData('orders')`)
  - `src/pages/Signup.tsx` (292 lines, calls `sdk.createSeller`/`createAffiliate`/`createWallet` — non-existent on apiClient)
  - `src/pages/CustomerOnboarding.tsx` (345 lines — see P0-11)
  - `src/pages/SellerOnboarding.tsx` (652 lines — see P0-13)
  - `src/pages/AffiliateOnboarding.tsx` (277 lines — see P0-12)
  - `src/pages/HelpArticle.tsx` (76 lines — 100% hardcoded "Getting Started Guide" content, no API call, `slug` param ignored)
  - `src/pages/CategoryDetail.tsx` (267 lines — uses `sdk.getCategory` and falls back to fabricated category data; duplicates `Category.tsx` and `CategoryProducts.tsx`)
  - `src/pages/CategoryProducts.tsx` (270 lines — uses `useRealTimeData`, real data; duplicates `Category.tsx`)
  - `src/pages/NotFound.tsx` (28 lines — basic 404, not routed)
  - `src/pages/MyOrders.tsx` (349 lines — real data, duplicates `Orders.tsx` which is a stub; see P0-7)
  - `src/pages/MyWallet.tsx` (151 lines — see P0-9; duplicates `Wallet.tsx`)
  - `src/pages/CrowdCheckout.tsx` (70 lines — 100% hardcoded: "Wireless Headphones Pro", "$199.99", "75/100 people", "2d 14h", Join button does nothing)
  - `src/pages/admin/CommissionSettings.tsx` (317 lines — see P0-15)
  - `src/pages/admin/AgreementSettings.tsx` (318 lines — see P0-15)
  - `src/components/AdvancedSearch.tsx` (274 lines — voice/image search; uses `sdk.aiHelper` which returns canned responses; not rendered anywhere — SearchModal uses its own simpler search)
- **Sub-tasks:**
  1. Decide for each orphan: route it, merge it, or delete it.
  2. Recommended routing:
     - `/track-order` → TrackOrder (after fixing `useRealTimeData` to also accept an order number query).
     - `/signup` → Signup (after replacing `sdk.createSeller` etc. with `apiClient.updateProfile`).
     - `/customer-onboarding` → CustomerOnboarding (after P0-11).
     - `/seller-onboarding` → SellerOnboarding (after P0-13).
     - `/affiliate-onboarding` → AffiliateOnboarding (after P0-12).
     - `/help/:slug` → HelpArticle (after P1-2).
     - `/category/:slug` → keep `Category.tsx` (simple); delete `CategoryDetail.tsx` and `CategoryProducts.tsx` OR consolidate.
     - `/404` (catch-all) → NotFound.
     - `/crowd-checkout/:orderId` → CrowdCheckout (after P1-3).
     - `/admin/commission-settings` and `/admin/agreement-settings` (after P0-15).
  3. Delete `MyOrders.tsx` (merged into `Orders.tsx`).
  4. Delete `MyWallet.tsx` (merged into `Wallet.tsx`).
  5. Either route `AdvancedSearch` into the Search page or delete it.
- **Acceptance criteria:**
  - Every `.tsx` file in `src/pages/` is either routed or deleted.
  - No dead imports.

---

#### Task P1-2: Fix `HelpArticle.tsx` — 100% hardcoded content

- **File:** `src/pages/HelpArticle.tsx:1-76`
- **Gap:** The page ignores the `slug` URL param and always renders "Getting Started Guide" with three hardcoded steps. The ThumbsUp/ThumbsDown buttons have no `onClick`. The "Back to Help Center" link works.
- **Sub-tasks:**
  1. Fetch article by slug: `apiClient.getHelpArticles()` then `.find(a => a.slug === slug)`.
  2. Render `article.title`, `article.content` (markdown), `article.category`, `article.updatedAt`.
  3. Wire ThumbsUp/ThumbsDown → `apiClient.create('help_article_feedback', { articleId, helpful: true|false })` (add table to schema).
  4. Show related articles in the same category.
  5. Route `/help/:slug` in `App.tsx`.
  6. Update `Help.tsx` and `HelpCenter.tsx` to link to `/help/:slug` for each article (currently no links).
- **Acceptance criteria:**
  - Visiting `/help/getting-started-guide` renders the actual article from the DB.
  - Feedback is recorded.
  - Related articles are shown.

---

#### Task P1-3: Fix `CrowdCheckout.tsx` — 100% hardcoded

- **File:** `src/pages/CrowdCheckout.tsx:1-70`
- **Gap:** Everything is hardcoded: product name, price, progress (75/100), time left (2d 14h), and the "Join Group Buy" button has no `onClick`. The `orderId` param is read but unused.
- **Sub-tasks:**
  1. Add `crowd_checkouts` table to schema (target product, min quantity, current quantity, deadline, discount price).
  2. Add `apiClient.getCrowdCheckout(orderId)`, `apiClient.joinCrowdCheckout(orderId, quantity)`.
  3. Replace hardcoded values with real data.
  4. Wire "Join Group Buy" → create an order with `deliveryMethod: 'crowd'` and `status: 'pending_crowd'`; only charge when min quantity reached (or use escrow).
  5. Show real participant count and countdown timer.
  6. Route `/crowd-checkout/:orderId` in `App.tsx`.
- **Acceptance criteria:**
  - Page renders real crowd-buy data.
  - Joining creates a real order.
  - Countdown timer ticks down.

---

#### Task P1-4: Fix `LiveShopping.tsx` and `LiveStream.tsx` — placeholder images, no real video

- **Files:**
  - `src/pages/LiveShopping.tsx:41` — uses `https://picsum.photos/seed/${stream.id}/600/400` for stream thumbnails (external random images).
  - `src/pages/LiveStream.tsx:70-75` — renders a black `<div>` with text "Live Stream Video (ID: {stream.id})" instead of an actual video player. Comment: "Agora video player would be integrated here".
- **Sub-tasks:**
  1. Replace `picsum.photos` with `stream.thumbnail` field from DB (add to schema if missing).
  2. Integrate a real video player (Agora SDK, Mux, or Cloudflare Stream) — add `streamProvider`, `streamToken`, `streamId` fields.
  3. Add live chat via WebSocket or polling (currently no chat on LiveStream page).
  4. Add "Add to Cart" inside the stream (already present at line 92).
  5. Add viewer count, live status badge (present), and "End Stream" for seller.
- **Acceptance criteria:**
  - Thumbnails come from real stream data.
  - Live stream page shows actual video.
  - Chat works in real time.

---

#### Task P1-5: Fix `LiveVideoShopping.tsx` component — 100% mock data

- **File:** `src/components/LiveVideoShopping.tsx:62-126`
- **Gap:** Two hardcoded mock streams ("TechZone Store", "StyleHub") with mock products and mock chat messages. The component is not routed anywhere (LiveShopping/LiveStream pages are used instead).
- **Sub-tasks:**
  1. Replace mock with `apiClient.getLivestreams()`.
  2. Wire chat to a real-time backend (WebSocket or polling).
  3. Either route this component into a page or delete it (LiveStream.tsx already covers the single-stream view).
- **Acceptance criteria:**
  - Real streams from DB.
  - Real chat.
  - No dead component.

---

#### Task P1-6: Fix `Help.tsx` and `HelpCenter.tsx` — hardcoded categories and FAQs

- **Files:**
  - `src/pages/Help.tsx:12-17` — hardcoded `helpCategories` array with fake article counts (12, 8, 15, 6).
  - `src/pages/HelpCenter.tsx:22-42` — hardcoded `categories` array with fake counts (25, 18, 15, 12) and hardcoded `faqItems`. Search input has no `onChange`/`onSubmit`.
- **Sub-tasks:**
  1. Fetch help articles from `apiClient.getHelpArticles()` and group by category.
  2. Compute real article counts per category.
  3. Wire search input to filter articles or navigate to `/search?q=…`.
  4. Replace hardcoded FAQs with `apiClient.getHelpArticles({ category: 'faq' })` or a dedicated `faqs` table.
  5. Link each category card to `/help?category=…` or a filtered article list.
  6. Consolidate `Help.tsx` and `HelpCenter.tsx` — they are near-duplicates. Keep one (HelpCenter is richer) and delete the other, OR route them to different purposes (e.g. `/help` = categories, `/support` = contact + FAQ).
- **Acceptance criteria:**
  - Article counts reflect DB.
  - Search works.
  - No duplicate pages.

---

#### Task P1-7: Fix `ReturnsRefunds.tsx` — 100% static content

- **File:** `src/pages/ReturnsRefunds.tsx:1-234`
- **Gap:** Pure static marketing page — return steps, category policies, delivery zones all hardcoded. No API calls. No interactive elements.
- **Sub-tasks:**
  1. Either keep as static content (acceptable for a policy page) but pull policy text from `apiClient.getHelpArticles({ category: 'returns' })` so admins can edit.
  2. Or replace with a redirect to the HelpCenter returns category.
  3. Add a CTA "Start a return" that links to `/refunds-disputes` (the real RefundDispute page).
- **Acceptance criteria:**
  - Policy text is editable by admins.
  - CTA links to the real refund flow.

---

#### Task P1-8: Fix `ShippingInfo.tsx` — static content with hardcoded NGN prices

- **File:** `src/pages/ShippingInfo.tsx:1-290`
- **Gap:** Static page with hardcoded shipping options ("₦10,000", "₦2,500", "₦5,000") and Lagos/Abuja delivery zones. No currency conversion. No API.
- **Sub-tasks:**
  1. Pull shipping options from a `shipping_methods` table (or `apiClient.getHelpArticles({ category: 'shipping' })`).
  2. Render prices in the user's selected currency using `convertCurrency`.
  3. Make delivery zones data-driven.
- **Acceptance criteria:**
  - Prices reflect user currency.
  - Admin can edit shipping info.

---

#### Task P1-9: Fix `ContactUs.tsx` — form does not submit to backend

- **File:** `src/pages/ContactUs.tsx:34-39`
- **Gap:** `handleSubmit` only shows a toast: "Message sent successfully!" Comment at line 36: "In production, this would send to your backend". The form data is cleared but never persisted.
- **Sub-tasks:**
  1. Add `apiClient.createContactSubmission(data)` → `POST /api/data/contact_submissions` (add table to schema and TABLE_MAP).
  2. Wire `handleSubmit` to call this and show success only on 200.
  3. Add admin view for contact submissions in AdminDashboard.
  4. Optionally send email notification via SMTP.
- **Acceptance criteria:**
  - Form submissions are stored in DB.
  - Admin can view and respond.

---

#### Task P1-10: Fix `Profile.tsx` — no save handler, no API call

- **File:** `src/pages/Profile.tsx:12-54`
- **Gap:** Renders a form with `defaultValue={currentUser?.name}` etc. and a "Save Changes" button with **no `onClick`**. "Change Photo" button also has no handler. No `onSubmit` on the form.
- **Sub-tasks:**
  1. Add `handleSubmit` that calls `apiClient.updateProfile({ name, email, phone, avatar })`.
  2. Wire "Change Photo" → file upload via `apiClient.uploadToCloudinary`, then `updateProfile({ avatar: url })`.
  3. Add password change section (current password, new password, confirm) → `apiClient.changePassword(...)`.
  4. Add notification preferences toggle.
  5. Add address book section.
- **Acceptance criteria:**
  - Saving persists to DB.
  - Photo upload works.
  - Password change works.

---

#### Task P1-11: Fix `Category.tsx` — minimal page, no filtering

- **File:** `src/pages/Category.tsx:1-28`
- **Gap:** Renders ALL products regardless of category. The `categoryName` is derived from the slug but never used to filter. No loading state, no error state, no empty state.
- **Sub-tasks:**
  1. Filter products by category: `products.filter(p => slugify(p.category) === slug)`.
  2. Fetch category metadata via `apiClient.getCategory(slug)`.
  3. Add sorting, filtering, and pagination (modeled on `CategoryProducts.tsx`).
  4. Add loading/empty states.
  5. Consolidate with `CategoryDetail.tsx` and `CategoryProducts.tsx` — pick one canonical implementation.
- **Acceptance criteria:**
  - `/category/electronics` shows only electronics products.
  - Loading and empty states work.

---

#### Task P1-12: Fix `AdvancedSearch.tsx` — image search uses `sdk.aiHelper.chat` with truncated base64

- **File:** `src/components/AdvancedSearch.tsx:88-96`
- **Gap:** Image search converts the file to base64, then calls `sdk.aiHelper.chat('Analyze this product image… Image data: ${base64.slice(0, 100)}…')` — passing only the first 100 chars of a base64 string, which is meaningless. The `aiHelper.chat` on `apiClient` returns the canned string `AI response to: ${msg}` (see `api-client.ts:460`). Voice search works (Web Speech API). The component is not rendered anywhere.
- **Sub-tasks:**
  1. Either implement a real image-search endpoint (`POST /api/ai/image-search` with multipart upload, calls a vision model) or remove the image search button.
  2. Replace `sdk.aiHelper.enhancedSearch` (which returns canned `{ results: [], suggestions: [] }`) with a real AI search endpoint or remove the AI path and fall back to `apiClient.searchProducts`.
  3. Either route this component into the Search page or delete it.
- **Acceptance criteria:**
  - Image search either works end-to-end or is removed.
  - No canned AI responses.

---

#### Task P1-13: Fix `AIChatAssistant.tsx` — uses `sdk.aiHelper` canned responses

- **File:** `src/components/AIChatAssistant.tsx:75-99`
- **Gap:** Calls `sdk.aiHelper.buyerAssistant(input, context)` / `sellerAssistant(input, sellerData)` which on `apiClient` (line 458-459) return `AI assistance for: ${q}` / `Seller AI for: ${q}` — literally echoing the query. The fallback (line 96-98) shows a generic "basic mode" message.
- **Sub-tasks:**
  1. Implement server-side AI endpoint `POST /api/ai/chat` that calls the real Chutes AI / OpenAI / Anthropic API with the user's query + context (products, orders, seller data).
  2. Move `src/lib/ai.ts` to `apps/api/src/lib/ai.ts` (already noted in security report SEC-012).
  3. Add `apiClient.aiChat(messages, mode)` wrapper.
  4. Replace `sdk.aiHelper.buyerAssistant/sellerAssistant` with `apiClient.aiChat`.
  5. Add streaming support (SSE) for real-time responses.
  6. Delete the client-side `ChutesAI` class or keep it only for type imports.
- **Acceptance criteria:**
  - Chat returns real AI responses.
  - No API key in client bundle.
  - Context (recent products, orders) is passed to the AI.

---

#### Task P1-14: Fix `Newsletter.tsx` — UI-only, no backend persistence

- **File:** `src/components/home/Newsletter.tsx:15-37`
- **Gap:** `onSubmit` does a `setTimeout(500)` then shows a toast. No API call. Comment at line 29: "Simulate a quick async submit; the spec says UI-only with toast."
- **Sub-tasks:**
  1. Add `apiClient.subscribeNewsletter(email)` → `POST /api/data/newsletter_subscribers` (add table to schema with unique email).
  2. Wire `onSubmit` to call this.
  3. Handle duplicate email (409) gracefully.
  4. Add double opt-in via email.
- **Acceptance criteria:**
  - Subscribers are stored in DB.
  - Duplicate emails are handled.

---

#### Task P1-15: Fix `SellerDashboard` sub-pages — three are one-line stubs

- **Files:**
  - `src/pages/seller-dashboard/Analytics.tsx` (4 lines: `return <div>Analytics Page</div>;`)
  - `src/pages/seller-dashboard/Marketing.tsx` (4 lines: `return <div>Marketing Page</div>;`)
  - `src/pages/seller-dashboard/Reviews.tsx` (4 lines: `return <div>Reviews Page</div>;`)
  - `src/pages/seller-dashboard/Payments.tsx` (4 lines: `return <div>Payments Page</div>;`)
- **Gap:** All four are routed in `App.tsx` (lines 118-122) and wrapped in `MobileDashboardLayout`, but they render only a single `<div>` with the page name. Users navigating to these tabs see essentially nothing.
- **Sub-tasks:**
  1. **Analytics:** Build a real analytics dashboard — revenue chart (last 30 days), top products, conversion rate, traffic sources. Use `apiClient.getSellerAnalytics(sellerId)` (already exists at `api-client.ts:280`).
  2. **Marketing:** Build a marketing hub — create discount codes, schedule sales, email campaigns, social share. Add `discount_codes` and `marketing_campaigns` tables.
  3. **Reviews:** List all reviews on the seller's products with reply/flag actions. Use `apiClient.getStoreReviews(storeId)` (exists at line 299).
  4. **Payments:** List payout history, pending balance, withdrawal requests. Reuse the Wallet withdrawal flow but scoped to seller.
- **Acceptance criteria:**
  - Each tab renders a full, functional dashboard.
  - Data is real (from API).

---

#### Task P1-16: Fix `seller-dashboard/Orders.tsx` — minimal table, no actions

- **File:** `src/pages/seller-dashboard/Orders.tsx:1-59`
- **Gap:** Renders a basic table (Order, Date, Status, Total) with no actions — no "View", "Update Status", "Ship", "Refund" buttons. No filters, no search, no pagination.
- **Sub-tasks:**
  1. Add status update dropdown (pending → confirmed → processing → shipped → delivered).
  2. Add "View Details" link to `/order/:id`.
  3. Add filters (status, date range).
  4. Add search by order ID or customer name.
  5. Add CSV export.
- **Acceptance criteria:**
  - Seller can update order status.
  - Filters and search work.

---

#### Task P1-17: Fix `Checkout.tsx` — pure redirect stub

- **File:** `src/pages/Checkout.tsx:1-46`
- **Gap:** The entire component is a redirect to `/checkout-enhanced` with a loading spinner. The routed `/checkout` page is effectively dead.
- **Sub-tasks:**
  1. Either delete `Checkout.tsx` and route `/checkout` directly to `EnhancedCheckout`, OR merge `Checkout.tsx` and `EnhancedCheckout.tsx` into one canonical checkout.
  2. Update all `<Link to="/checkout">` references (Cart, etc.) to point to the canonical route.
- **Acceptance criteria:**
  - No redirect loop.
  - Single canonical checkout route.

---

#### Task P1-18: Fix `LiveShopping.tsx` — `picsum.photos` external dependency

- **File:** `src/pages/LiveShopping.tsx:41`
- **Gap:** Stream thumbnails use `https://picsum.photos/seed/${stream.id}/600/400` — an external random-image service. If offline or blocked, images break.
- **Sub-tasks:**
  1. Add `thumbnail` field to livestream schema and seed.
  2. Replace `picsum.photos` with `stream.thumbnail || '/placeholder.svg'`.
- **Acceptance criteria:**
  - Thumbnails load from DB or local placeholder.

---

#### Task P1-19: Fix `Home.tsx` — orphaned, duplicates `Index.tsx`

- **File:** `src/pages/Home.tsx:1-24`
- **Gap:** `Home.tsx` renders `HeroSection`, `FeaturedSection`, `CategoriesMegaMenu` — a minimal homepage. It is NOT routed (`Index.tsx` is used at `/`). It uses `HeroSection` and `FeaturedSection` (legacy components) instead of the newer `home/Hero`, `home/FeaturedProducts`, etc.
- **Sub-tasks:**
  1. Delete `Home.tsx` (superseded by `Index.tsx`).
  2. Verify `HeroSection.tsx` and `FeaturedSection.tsx` are not used elsewhere; if not, delete them too.
- **Acceptance criteria:**
  - No dead homepage component.

---

#### Task P1-20: Fix `NotFound.tsx` — not routed, basic styling

- **File:** `src/pages/NotFound.tsx:1-28`
- **Gap:** Not routed in `App.tsx`. Uses `<a href="/">` instead of `<Link to="/">`. No theme integration, no search, no suggested pages.
- **Sub-tasks:**
  1. Add a catch-all `<Route path="*">` in `App.tsx` rendering `NotFound`.
  2. Replace `<a href="/">` with `<Link to="/">`.
  3. Add search bar, popular links, and "Go Back" button.
  4. Use theme tokens instead of hardcoded `bg-gray-100`/`text-blue-500`.
- **Acceptance criteria:**
  - Unknown routes show the 404 page.
  - Page is themed and useful.

---

#### Task P1-21: Fix `EnhancedCheckout.tsx` payment method select — missing real gateways

- **File:** `src/pages/EnhancedCheckout.tsx:370-379`
- **Gap:** The payment method `<Select>` only offers `card | paypal | bank`. Paystack, Flutterwave, Razorpay, Wallet, and COD are all missing, despite being supported server-side.
- **Sub-tasks:** (covered in P0-3)

---

#### Task P1-22: Fix `OrderDetail.tsx` — fetches all products to enrich order items

- **File:** `src/pages/OrderDetail.tsx:51-62`
- **Gap:** To enrich order items with product details, the page calls `sdk.getProducts()` (fetches ALL products) and finds each by ID. This is O(N) and wasteful. The order items from the API already include `name`, `images`, `price` (see `apps/api/src/pages/api/orders/index.ts:46-59`).
- **Sub-tasks:**
  1. Remove the `sdk.getProducts()` call.
  2. Use `item.name`, `item.images`, `item.price` directly from the order.
  3. Only fetch full product details if needed for a "View Product" link.
- **Acceptance criteria:**
  - Page loads faster.
  - No unnecessary full product fetch.

---

#### Task P1-23: Fix `OnboardingFlow.tsx` — calls `sdk.createSeller` (non-existent)

- **File:** `src/components/OnboardingFlow.tsx:126`
- **Gap:** Calls `sdk.createSeller({ userId, businessName, description, isVerified: false })` — not a method on `apiClient`. The component is otherwise substantial (409 lines).
- **Sub-tasks:**
  1. Replace `sdk.createSeller` with `apiClient.create('stores', { sellerId: currentUser.id, name: businessName, description, isApproved: false, isActive: false })`.
  2. Verify the component is actually rendered anywhere (search for `<OnboardingFlow` usage).
  3. If unused, delete; if used, route appropriately.
- **Acceptance criteria:**
  - No runtime error on submit.

---

#### Task P1-24: Fix `AdminDashboard.tsx` — verify all SDK methods exist

- **File:** `src/pages/AdminDashboard.tsx` (large file)
- **Gap:** Calls many `sdk.*` methods — `getUsers`, `getProducts`, `getOrders`, `getStores`, `getHelpArticles`, `getBlogs`, etc. Most exist on `apiClient` via `getAll`. But some (e.g. `sdk.banUser`, `sdk.approveSeller`, `sdk.createHelpArticle`) may not. Need a full audit.
- **Sub-tasks:**
  1. Read the full file and list every `sdk.*` call.
  2. Cross-reference with `api-client.ts` methods.
  3. Add missing methods or replace with generic `apiClient.create/update/delete`.
  4. Verify admin-only authorization on each server endpoint.
- **Acceptance criteria:**
  - All admin actions work.
  - All endpoints enforce `requireRole(['admin'])`.

---

#### Task P1-25: Fix `EnhancedSellerDashboard.tsx` — verify SDK calls

- **File:** `src/components/EnhancedSellerDashboard.tsx` (large file)
- **Gap:** Similar to P1-24 — needs audit of every `sdk.*` call.
- **Sub-tasks:**
  1. Read the full file and list every `sdk.*` call.
  2. Verify each against `api-client.ts`.
  3. Fix any missing methods.
- **Acceptance criteria:**
  - All seller dashboard actions work.

---

#### Task P1-26: Fix `EnhancedCustomerDashboard.tsx` — verify SDK calls

- **File:** `src/components/EnhancedCustomerDashboard.tsx`
- **Gap:** Same audit needed.
- **Sub-tasks:** Same as P1-24/P1-25.
- **Acceptance criteria:** All customer dashboard actions work.

---

#### Task P1-27: Fix `Signup.tsx` — calls `sdk.createSeller`, `sdk.createAffiliate`, `sdk.createWallet`

- **File:** `src/pages/Signup.tsx:80-96`
- **Gap:** After `sdk.register`, calls `sdk.createSeller({ userId, businessName, … })` or `sdk.createAffiliate({ userId, … })` and `sdk.createWallet(user.id)` — none exist on `apiClient`. The `apiClient.register` already creates a wallet and referral code server-side (`apps/api/src/pages/api/auth/index.ts:56-57`).
- **Sub-tasks:**
  1. Remove `sdk.createWallet` call (server handles it).
  2. Replace `sdk.createSeller` with `apiClient.create('stores', { sellerId, name: businessName, isApproved: false, isActive: false })` — or defer store creation to SellerOnboarding.
  3. Replace `sdk.createAffiliate` with `apiClient.updateProfile({ affiliateProfile: { businessName, commissionRate } })` — or defer to AffiliateOnboarding.
  4. Route `/signup` to `Signup.tsx` (currently routed to `Register.tsx`).
  5. Consolidate `Signup.tsx` and `Register.tsx` — they overlap heavily.
- **Acceptance criteria:**
  - Registration completes without errors.
  - Wallet auto-created.
  - No duplicate signup pages.

---

### P2 — Medium

---

#### Task P2-1: Remove `Math.random()` usage in production paths

- **Files:**
  - `src/lib/commerce-sdk.ts:1463` — `Math.random().toString(36)` for referral codes (legacy, will be removed in P0-1).
  - `apps/api/src/pages/api/auth/index.ts:53` — `Math.floor(Math.random() * 9000)` for referral code suffix. Acceptable but could use `crypto.randomInt`.
  - `src/components/ui/sidebar.tsx:653` — `Math.floor(Math.random() * 40) + 50` for skeleton width (cosmetic, acceptable).
- **Sub-tasks:**
  1. Replace `Math.random()` in `apps/api/src/pages/api/auth/index.ts:53` with `crypto.randomInt(1000, 9999)`.
  2. Remove `commerce-sdk.ts` (P0-1).
  3. Leave sidebar.tsx (cosmetic).
- **Acceptance criteria:**
  - Referral codes are cryptographically random.

---

#### Task P2-2: Replace `prompt()` / `confirm()` / `alert()` with proper dialogs

- **Files:**
  - `src/pages/MyWallet.tsx:43` — `prompt('Enter amount to fund:')`.
  - `src/pages/admin/AgreementSettings.tsx:87, 89, 113` — `prompt()` / `confirm()`.
  - `src/pages/admin/CommissionSettings.tsx:110` — `confirm()`.
  - `src/pages/AdminDashboard.tsx:196` — `confirm()`.
  - `src/pages/seller-dashboard/EnhancedProducts.tsx:284` — `confirm()`.
  - `src/pages/seller-dashboard/Blog.tsx:127` — `confirm()`.
- **Sub-tasks:**
  1. Replace all `confirm()` with `AlertDialog` (shadcn).
  2. Replace all `prompt()` with `Dialog` containing a form.
  3. Replace any `alert()` with `toast` or `AlertDialog`.
- **Acceptance criteria:**
  - No native browser dialogs in production.

---

#### Task P2-3: Complete i18n coverage — many components render raw English

- **Gap:** `public/locales/en/translation.json` has 222 keys, but dozens of components render raw English strings without `t()`:
  - `CustomerDashboard.tsx`, `MyOrders.tsx`, `Wallet.tsx`, `AffiliateDashboard.tsx`, `AdminDashboard.tsx`, `EnhancedSellerDashboard.tsx`, `EnhancedCheckout.tsx` (partial), `RefundDispute.tsx`, `Notifications.tsx`, `HelpCenter.tsx`, `Help.tsx`, `ShippingInfo.tsx`, `ReturnsRefunds.tsx`, `ContactUs.tsx`, `CrowdCheckout.tsx`, `LiveShopping.tsx`, `LiveStream.tsx`, `CommunityHub.tsx`, `seller-dashboard/*` (all), `admin/*` (all).
- **Sub-tasks:**
  1. Audit each component for hardcoded strings.
  2. Add keys to `translation.json` for all 13 supported languages.
  3. Replace hardcoded strings with `t('key')`.
  4. Verify RTL layout for `ar`, `ur`, `fa`, `he`.
- **Acceptance criteria:**
  - All visible strings are translated.
  - RTL languages render correctly.

---

#### Task P2-4: Add missing i18n keys for notification titles

- **File:** `src/components/NotificationsModal.tsx:188, 205`
- **Gap:** Calls `t(notification.title.toLowerCase().replace(/ /g, '_'))` and `t(notification.message.toLowerCase().replace(/ /g, '_'))` — dynamically generated keys that don't exist in `translation.json`. Falls back to the raw string.
- **Sub-tasks:**
  1. Store notification `type` and `params` instead of pre-formatted title/message.
  2. Use `t(\`notification.\${type}.title\`, params)` with stable keys.
  3. Add notification keys to translation files.
- **Acceptance criteria:**
  - Notifications translate correctly.

---

#### Task P2-5: Add `prompt()` for amount in `MyWallet` (DUPLICATE of P0-9 — covered there)

---

#### Task P2-6: Consolidate duplicate wallet pages

- **Files:** `src/pages/MyWallet.tsx` (orphaned) vs `src/pages/Wallet.tsx` (routed at `/wallet`).
- **Sub-tasks:**
  1. Merge the best of both (MyWallet's funding flow + Wallet's withdrawal flow) into one `Wallet.tsx`.
  2. Delete `MyWallet.tsx`.
- **Acceptance criteria:**
  - Single wallet page with both funding and withdrawal.

---

#### Task P2-7: Consolidate duplicate orders pages

- **Files:** `src/pages/MyOrders.tsx` (orphaned) vs `src/pages/Orders.tsx` (routed, stub).
- **Sub-tasks:**
  1. Merge `MyOrders.tsx` features (filters, search, date range) into `Orders.tsx`.
  2. Delete `MyOrders.tsx`.
- **Acceptance criteria:**
  - Single orders page with full features.

---

#### Task P2-8: Consolidate duplicate category pages

- **Files:** `src/pages/Category.tsx` (routed, minimal), `src/pages/CategoryDetail.tsx` (orphaned), `src/pages/CategoryProducts.tsx` (orphaned).
- **Sub-tasks:**
  1. Pick one canonical implementation (recommend `CategoryProducts.tsx` — it's the most complete).
  2. Merge features into the canonical page.
  3. Delete the other two.
- **Acceptance criteria:**
  - Single category page with filtering, sorting, view modes.

---

#### Task P2-9: Consolidate duplicate help pages

- **Files:** `src/pages/Help.tsx` (routed at `/help`), `src/pages/HelpCenter.tsx` (routed at `/support`), `src/pages/HelpArticle.tsx` (orphaned).
- **Sub-tasks:**
  1. Decide: `/help` = article list, `/support` = contact + FAQ, `/help/:slug` = article.
  2. Make each page distinct and non-overlapping.
  3. Route `HelpArticle` at `/help/:slug`.
- **Acceptance criteria:**
  - No duplicate help pages.

---

#### Task P2-10: Consolidate duplicate onboarding pages

- **Files:** `src/components/OnboardingFlow.tsx` (332 lines, not routed), `src/pages/CustomerOnboarding.tsx`, `src/pages/SellerOnboarding.tsx`, `src/pages/AffiliateOnboarding.tsx`.
- **Sub-tasks:**
  1. Either use `OnboardingFlow` as the single onboarding component (parameterized by role) and delete the three page-specific ones, OR keep the three page-specific ones and delete `OnboardingFlow`.
  2. Route the chosen pages.
- **Acceptance criteria:**
  - Single onboarding flow per role.

---

#### Task P2-11: Add `audit_logs` table and wire into all sensitive endpoints

- **File:** `apps/api/src/lib/schema.ts`, `apps/api/src/lib/auth.ts`
- **Gap:** No audit logging exists. `docs/security-audit-report.md` SEC-014 marks this as "Requires implementation".
- **Sub-tasks:**
  1. Add `audit_logs` table to schema (timestamp, action, userId, resourceType, resourceId, ip, userAgent, details).
  2. Implement `logAuditEvent()` in `apps/api/src/lib/audit.ts`.
  3. Call it in: auth login/register/logout, payment initiation/success, order status change, admin user ban/approve, commission/agreement CRUD, withdrawal approve/reject.
  4. Add admin view in AdminDashboard.
- **Acceptance criteria:**
  - All sensitive actions are logged.
  - Admin can filter and search audit logs.

---

#### Task P2-12: Add error boundaries and generic error pages

- **Gap:** No React error boundary. A runtime error in any page crashes the whole app.
- **Sub-tasks:**
  1. Add `src/components/ErrorBoundary.tsx`.
  2. Wrap `<Routes>` in `App.tsx` with it.
  3. Add a generic `Error` page (500).
  4. Add offline detection.
- **Acceptance criteria:**
  - Runtime errors show a friendly error page, not a white screen.

---

#### Task P2-13: Sanitize server error messages

- **Gap:** `apps/api/src/pages/api/*` returns `error.message` directly in many places (e.g. `products/index.ts:36`, `orders/index.ts:87`). This can leak internal details (DB errors, file paths).
- **Sub-tasks:**
  1. Log full error server-side with `console.error` (already done in some places).
  2. Return generic message to client: `'Internal server error'` for 500s.
  3. Return specific messages only for 4xx client errors (validation, not-found, forbidden).
- **Acceptance criteria:**
  - 500 responses don't leak internals.

---

#### Task P2-14: Add `CSRF` token to all mutating SPA requests

- **Gap:** `apiClient.request` only sets `Content-Type` and `Authorization`. No CSRF token.
- **Sub-tasks:**
  1. Add `GET /api/auth/csrf-token` endpoint that sets an httpOnly cookie + returns the token.
  2. Add `apiClient.getCsrfToken()` and include `X-CSRF-Token` header on all POST/PATCH/DELETE.
  3. Verify token server-side in middleware.
- **Acceptance criteria:**
  - Mutating requests without valid CSRF token return 403.

---

#### Task P2-15: Tighten CORS — currently permissive `*`

- **File:** `apps/api/src/middleware.ts:33, 49-51`, `apps/api/src/lib/auth.ts:68`
- **Gap:** When `CORS_ORIGINS` env is unset (default), middleware sets `Access-Control-Allow-Origin: *` and `jsonResponse` hardcodes `*`. This allows any site to make authenticated requests.
- **Sub-tasks:**
  1. Remove the `*` fallback in `jsonResponse` — use the request origin if allowed, else omit the header.
  2. Default `CORS_ORIGINS` to `http://localhost:3000` in dev.
  3. Document `CORS_ORIGINS` env var.
- **Acceptance criteria:**
  - Production CORS is locked to the frontend origin.

---

#### Task P2-16: Verify `apps/api/src/pages/api/data/[...entity].ts` ownership guards

- **File:** `apps/api/src/pages/api/data/[...entity].ts:157-192`
- **Gap:** The PATCH handler has a confusing ownership check (lines 179-184) — the `if/else` logic is inverted and allows non-admins to patch any row when `SELLER_ADMIN_WRITE.has(entity) === false`. The DELETE handler (lines 194-230) is correct.
- **Sub-tasks:**
  1. Rewrite the PATCH ownership check to be explicit:
     - If `user.role !== 'admin'` AND `existing[userIdField] !== user.id` → 403.
     - If `user.role !== 'admin'` AND `SELLER_ADMIN_WRITE.has(entity)` → 403.
  2. Add tests for each combination.
- **Acceptance criteria:**
  - Non-admin users can only PATCH their own rows.
  - Seller/admin-only entities reject non-admin PATCH.

---

#### Task P2-17: Add server-side input validation to all data endpoints

- **Gap:** `apps/api/src/pages/api/data/[...entity].ts` accepts any body and inserts/updates it. No Zod schema per entity.
- **Sub-tasks:**
  1. Define Zod schemas for each entity (users, products, orders, etc.) in `apps/api/src/lib/validation.ts`.
  2. Validate POST/PATCH bodies before insert/update.
  3. Return 400 with field-level errors on validation failure.
- **Acceptance criteria:**
  - Invalid data returns 400 with clear errors.

---

#### Task P2-18: Add rate limiting per endpoint type

- **Sub-tasks:**
  1. Auth endpoints (`/api/auth/*`): 10 req/min per IP.
  2. Payment endpoints (`/api/payments/*`): 20 req/min per user.
  3. Translate endpoint (`/api/translate`): 60 req/min per IP.
  4. Generic data endpoints: 100 req/min per user.
  5. AI endpoints (`/api/ai/*`): 20 req/min per user.
- **Acceptance criteria:**
  - Rate limits enforced.
  - 429 response with `Retry-After` header.

---

#### Task P2-19: Add Cloudinary upload server-side

- **File:** `src/lib/api-client.ts:464-475`
- **Gap:** `uploadToCloudinary` runs client-side and exposes the upload preset. While unsigned presets are designed for client uploads, the API key/secret should never be client-side.
- **Sub-tasks:**
  1. Add `POST /api/upload` endpoint in `apps/api` that accepts multipart form data and uploads to Cloudinary server-side.
  2. Replace `apiClient.uploadToCloudinary` with `apiClient.uploadFile(file)` → `POST /api/upload`.
  3. Remove `VITE_CLOUDINARY_*` env vars from the client.
- **Acceptance criteria:**
  - File uploads go through the API.
  - No Cloudinary credentials in client bundle.

---

#### Task P2-20: Add email service for notifications, OTP, order confirmations

- **Gap:** No email sending exists. `src/lib/sdk.ts` had an `SMTPConfig` interface but no implementation.
- **Sub-tasks:**
  1. Add `apps/api/src/lib/email.ts` using Nodemailer + SMTP env vars.
  2. Add `POST /api/notifications/email` internal endpoint.
  3. Send emails on: registration (welcome + OTP), order placed (confirmation), order shipped (tracking), refund processed, withdrawal approved/rejected.
  4. Add email template rendering.
- **Acceptance criteria:**
  - Users receive transactional emails.

---

#### Task P2-21: Add real-time order tracking (WebSocket or SSE)

- **Gap:** `EnhancedRealTimeContext.tsx` polls every 2 seconds (line 24) for 10 polls then resets — wasteful and not truly real-time.
- **Sub-tasks:**
  1. Add WebSocket or SSE endpoint in `apps/api` for order updates, notifications, and chat.
  2. Replace polling with subscription.
  3. Fall back to polling if WS unavailable.
- **Acceptance criteria:**
  - Real-time updates without polling.

---

#### Task P2-22: Add product variations/variants support to product page

- **Gap:** `apps/api/src/lib/schema.ts` defines `variations` and `variants` fields, but `ProductDetails.tsx` and `EnhancedProducts.tsx` need verification that they render and select variants correctly.
- **Sub-tasks:**
  1. Verify variant selection on product page.
  2. Verify variant price/inventory is used in cart and checkout.
  3. Add variant management in seller product form.
- **Acceptance criteria:**
  - Variants work end-to-end.

---

#### Task P2-23: Add product bundles support

- **Gap:** `bundles` field exists in schema but no UI.
- **Sub-tasks:**
  1. Add bundle management in seller product form.
  2. Show bundles on product page with "Add bundle to cart".
  3. Apply bundle discount in cart.
- **Acceptance criteria:**
  - Bundles work end-to-end.

---

#### Task P2-24: Add referral tracking end-to-end

- **Gap:** `apps/api/src/pages/api/referral/index.ts` tracks clicks and signups, but there's no commission calculation when a referred user makes a purchase.
- **Sub-tasks:**
  1. On order completion, check if the buyer was referred.
  2. Calculate referral commission based on referrer's tier.
  3. Credit referrer's wallet.
  4. Show referral earnings in AffiliateDashboard.
- **Acceptance criteria:**
  - Referrers earn commissions on referred purchases.

---

#### Task P2-25: Add seller payout processing

- **Gap:** `Wallet.tsx` has withdrawal requests but no server-side processing.
- **Sub-tasks:**
  1. Add admin endpoint to approve/reject withdrawals.
  2. On approval, debit wallet and mark withdrawal as `completed`.
  3. Integrate with bank transfer API (Paystack transfer, etc.).
  4. Notify seller via email + notification.
- **Acceptance criteria:**
  - Withdrawals are processed end-to-end.

---

#### Task P2-26: Add dispute resolution workflow

- **Gap:** `RefundDispute.tsx` creates disputes but no admin resolution flow exists.
- **Sub-tasks:**
  1. Add admin view in AdminDashboard for disputes.
  2. Add `POST /api/disputes/:id/resolve` with status, resolution note, refund amount.
  3. On resolution, process refund to buyer's wallet/original payment method.
  4. Notify both parties.
- **Acceptance criteria:**
  - Disputes are resolved end-to-end.

---

#### Task P2-27: Add SEO meta tags and structured data

- **Gap:** Product pages, blog posts, and category pages lack `<meta>` tags and JSON-LD structured data.
- **Sub-tasks:**
  1. Add `react-helmet-async` (or similar).
  2. Set title, description, OG tags, Twitter cards per page.
  3. Add Product, Article, BreadcrumbList JSON-LD.
  4. Add `sitemap.xml` and `robots.txt` generation.
- **Acceptance criteria:**
  - Pages are SEO-optimized.

---

#### Task P2-28: Add analytics events

- **Gap:** No analytics tracking (page views, add-to-cart, checkout, purchase).
- **Sub-tasks:**
  1. Add `apps/api/src/pages/api/analytics/track.ts` endpoint.
  2. Add client-side `trackEvent(event, props)` utility.
  3. Fire events on key actions.
  4. Add admin analytics dashboard view.
- **Acceptance criteria:**
  - Analytics events are recorded.

---

#### Task P2-29: Add product reviews and ratings aggregation

- **Gap:** `ReviewsSection.tsx` exists but need to verify it submits reviews via API and updates product `rating`/`reviewCount`.
- **Sub-tasks:**
  1. Verify review submission via `apiClient.create('reviews', { productId, rating, comment })`.
  2. Server-side: on review insert, recompute product `rating` (average) and `reviewCount`.
  3. Show verified-purchase badge.
- **Acceptance criteria:**
  - Reviews update product ratings.

---

#### Task P2-30: Add follow/store subscription

- **Gap:** No "Follow Store" feature.
- **Sub-tasks:**
  1. Add `store_followers` table.
  2. Add follow/unfollow button on store pages.
  3. Notify followers on new product/blog post.
- **Acceptance criteria:**
  - Users can follow stores.

---

## Legacy Code to Remove

| File | Lines | Reason |
|------|-------|--------|
| `src/lib/commerce-sdk.ts` | 1,830 | GitHub-API-backed SDK; exposes `VITE_GITHUB_TOKEN`; plaintext passwords; no auth. Superseded by `api-client.ts`. |
| `src/lib/sdk.ts` | 488 | `UniversalSDK` against GitHub contents API; same issues. |
| `src/lib/auth.ts` | 26 | Client-side `verifyAuth` using `JWT_SECRET` and `new CommerceSDK()`. |
| `src/lib/paypal-client.ts` | 15 | Instantiates PayPal SDK with `process.env` secrets at module load. |
| `src/lib/validation.ts` | 33 | Zod schemas for legacy Vite API stubs; validation now lives in Astro API. |
| `src/lib/ai.ts` | 392 | Client-side `ChutesAI` class; would expose API key. Move to `apps/api/src/lib/ai.ts`. |
| `src/lib/index.ts` | 4 | Re-exports legacy modules; rewrite to only export `apiClient` and `utils`. |
| `src/pages/api/initiate-payment.ts` | 224 | Legacy Vite API stub; never reachable. Real flow in `apps/api`. |
| `src/pages/api/create-order.ts` | 129 | Legacy Vite API stub. |
| `src/pages/api/paypal-capture-payment.ts` | 37 | Legacy Vite API stub. |
| `src/pages/api/paystack-callback.ts` | 84 | Legacy webhook stub. |
| `src/pages/api/flutterwave-callback.ts` | 68 | Legacy callback stub. |
| `src/pages/api/razorpay-callback.ts` | 63 | Legacy webhook stub. |
| `src/pages/Checkout.tsx` | 46 | Pure redirect to `/checkout-enhanced`. Merge or delete. |
| `src/pages/Home.tsx` | 24 | Superseded by `Index.tsx`. |
| `src/pages/MyOrders.tsx` | 349 | Duplicate of `Orders.tsx` (after merge). |
| `src/pages/MyWallet.tsx` | 151 | Duplicate of `Wallet.tsx` (after merge). |
| `src/pages/CategoryDetail.tsx` | 267 | Duplicate of `Category.tsx`/`CategoryProducts.tsx` (after consolidation). |
| `src/pages/CategoryProducts.tsx` | 270 | Duplicate (after consolidation). |
| `src/components/HeroSection.tsx` | — | Used only by `Home.tsx` (deleted). |
| `src/components/FeaturedSection.tsx` | — | Used only by `Home.tsx` (deleted). |
| `src/components/LiveVideoShopping.tsx` | 402 | Mock-data component; superseded by `LiveShopping.tsx` + `LiveStream.tsx`. |

---

## Security Checklist

Based on `docs/security-audit-report.md` and current code review:

- [x] SEC-001: GitHub Token Exposed Client-Side — **Fixed** (legacy SDK no longer used by routed UI; delete in P0-1).
- [x] SEC-002: Payment Credentials in Client Bundle — **Fixed** (real payments in `apps/api/src/pages/api/payments/index.ts`; delete legacy stubs in P0-2).
- [x] SEC-003: Direct Database Access from Browser — **Fixed** (all DB via Astro API).
- [x] SEC-004: Plaintext Password Storage — **Fixed** (`apps/api/src/lib/auth.ts` uses bcrypt cost 12).
- [x] SEC-005: No Server-Side Authentication — **Fixed** (`requireAuth`, `requireRole` in Astro API).
- [x] SEC-006: JWT Secret Exposed — **Fixed** (JWT only in `apps/api`).
- [ ] SEC-007: No Rate Limiting — **Requires implementation** (P0-17).
- [ ] SEC-008: Missing Server-Side Input Validation — **Partial** (auth has Zod; data endpoints need per-entity schemas — P2-17).
- [ ] SEC-009: No CSRF Protection — **Requires implementation** (P2-14).
- [x] SEC-010: Insecure Session Management — **Fixed** (JWT in localStorage is acceptable for SPA; consider httpOnly cookie in future).
- [ ] SEC-011: Missing Security Headers — **Requires implementation** (P0-17).
- [x] SEC-012: AI API Key Exposure — **Fixed** (no AI in client yet; P1-13 moves AI server-side).
- [ ] SEC-013: Verbose Error Messages — **Requires implementation** (P2-13).
- [ ] SEC-014: Missing Audit Logging — **Requires implementation** (P2-11).
- [ ] CORS tightness — **Requires implementation** (P2-15).
- [ ] Ownership guard on PATCH `/api/data/[...entity]` — **Requires fix** (P2-16).
- [ ] Cloudinary credentials client-side — **Requires fix** (P2-19).
- [ ] `localStorage` wishlist bypassing API — **Requires fix** (P0-8).
- [ ] Wallet funding without gateway verification — **Requires fix** (P0-9).
- [ ] OTP verification fake — **Requires fix** (P0-10).
- [ ] `confirm()` / `prompt()` in production — **Requires fix** (P2-2).

---

## Orphaned Pages Summary (not routed in `App.tsx`)

| Page | Lines | Status | Recommendation |
|------|-------|--------|----------------|
| `TrackOrder.tsx` | 365 | Functional (real data) | Route at `/track-order` |
| `Signup.tsx` | 292 | Broken (calls non-existent SDK methods) | Fix P1-27, route at `/signup` OR delete (Register.tsx used) |
| `CustomerOnboarding.tsx` | 345 | Stub (no API save) | Fix P0-11, route at `/customer-onboarding` |
| `SellerOnboarding.tsx` | 652 | Broken (`sdk.sdk.update`, missing methods) | Fix P0-13, route at `/seller-onboarding` |
| `AffiliateOnboarding.tsx` | 277 | Broken (`sdk.createAffiliate` re-registers) | Fix P0-12, route at `/affiliate-onboarding` |
| `HelpArticle.tsx` | 76 | 100% hardcoded | Fix P1-2, route at `/help/:slug` |
| `CategoryDetail.tsx` | 267 | Partial (falls back to fabricated data) | Delete (consolidate P2-8) |
| `CategoryProducts.tsx` | 270 | Functional | Consolidate into canonical category page (P2-8) |
| `NotFound.tsx` | 28 | Basic | Route as catch-all `*` (P1-20) |
| `MyOrders.tsx` | 349 | Functional | Merge into Orders.tsx, delete (P0-7) |
| `MyWallet.tsx` | 151 | Broken (`prompt`, fake funding) | Merge into Wallet.tsx, delete (P0-9) |
| `CrowdCheckout.tsx` | 70 | 100% hardcoded | Fix P1-3, route at `/crowd-checkout/:orderId` |
| `admin/CommissionSettings.tsx` | 317 | Broken (missing SDK methods, `confirm()`) | Fix P0-15, route or embed in AdminDashboard |
| `admin/AgreementSettings.tsx` | 318 | Broken (missing SDK method, `prompt()`) | Fix P0-15, route or embed in AdminDashboard |
| `AdvancedSearch.tsx` (component) | 274 | Canned AI responses | Fix P1-12 or delete |
| `Home.tsx` | 24 | Duplicate of Index.tsx | Delete (P1-19) |
| `Checkout.tsx` | 46 | Pure redirect | Delete or merge (P1-17) |

---

## Stub Pages Summary (routed but minimal/non-functional)

| Page | Route | Status | Recommendation |
|------|-------|--------|----------------|
| `Orders.tsx` | `/orders` | 100% hardcoded mock | Rebuild (P0-7) |
| `seller-dashboard/Analytics.tsx` | `/seller-dashboard/analytics` | `<div>Analytics Page</div>` | Build full dashboard (P1-15) |
| `seller-dashboard/Marketing.tsx` | `/seller-dashboard/marketing` | `<div>Marketing Page</div>` | Build full dashboard (P1-15) |
| `seller-dashboard/Reviews.tsx` | `/seller-dashboard/reviews` | `<div>Reviews Page</div>` | Build full dashboard (P1-15) |
| `seller-dashboard/Payments.tsx` | `/seller-dashboard/payments` | `<div>Payments Page</div>` | Build full dashboard (P1-15) |
| `Checkout.tsx` | `/checkout` | Pure redirect | Delete/merge (P1-17) |
| `Profile.tsx` | `/profile` | Form with no submit | Wire to API (P1-10) |
| `Category.tsx` | `/category/:slug` | No filtering | Fix (P1-11) |
| `Help.tsx` | `/help` | Hardcoded categories | Fix (P1-6) |
| `HelpCenter.tsx` | `/support` | Hardcoded FAQs, no search | Fix (P1-6) |
| `ReturnsRefunds.tsx` | `/returns` | Static content | Make data-driven (P1-7) |
| `ShippingInfo.tsx` | `/shipping` | Static, NGN-only | Make data-driven (P1-8) |
| `ContactUs.tsx` | `/contact` | Form doesn't submit | Wire to API (P1-9) |
| `LiveShopping.tsx` | `/live` | picsum.photos thumbnails | Fix (P1-4, P1-18) |
| `LiveStream.tsx` | `/live/:id` | No video player | Fix (P1-4) |
| `CommunityHub.tsx` | `/community` | Broken JSX, missing methods | Fix (P0-5) |
| `EnhancedCheckout.tsx` | `/checkout-enhanced` | No real payment, missing gateways | Fix (P0-3) |

---

## Closing

Subhaana-LLAH walhamdu li-LLAH, wa laa ilaaha illa-LLAH, wa Allahu Akbar. Bi'idniLlah.

This audit is exhaustive. Every `.tsx` page, `.ts` lib, and Astro endpoint has been read. The orchestrator should prioritize P0 tasks first (security + broken core flows), then P1 (visible stubs and orphaned pages), then P2 (polish, i18n, and feature richness).
