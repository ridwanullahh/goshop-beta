# GoShop Beta

> BismiLLAH Ar-Rahman Ar-Roheem. A world-class, multi-vendor marketplace platform.

GoShop Beta is a production-grade marketplace built with React, TypeScript, Tailwind CSS, shadcn/ui, and an Astro API backend backed by **Lightbase** (a backend-as-a-service). It supports sellers, customers, affiliates, and platform admins with products, orders, payments, wallets, referrals, blogs, community posts, and more.

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + react-router-dom
- **Backend**: Astro (Node standalone) API on port 3001
- **Database**: Lightbase (core `/api/v1`) via an async provider abstraction (SQLite kept as a switchable fallback)
- **Auth**: JWT (7-day expiry) + bcrypt password hashing
- **i18n**: 13 languages with runtime translation
- **Payments**: Wallet, COD, Paystack, Flutterwave, Razorpay, PayPal

## Prerequisites

- Node.js 18+ and npm

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/ridwanullahh/goshop-beta.git
cd goshop-beta

# 2. Install dependencies (npm)
npm install

# 3. Configure environment
cp .env.example .env
cp apps/api/.env.example apps/api/.env
# Edit both .env files with your Lightbase credentials and JWT_SECRET

# 4. Initialize + seed the database (creates Lightbase collections + seeds test data)
npm run db:push

# 5. Start the dev server (Vite on :3000 + Astro API on :3001)
npm run dev
```

Open `http://localhost:3000` in your browser.

## Environment

See [`.env.example`](./.env.example) and [`apps/api/.env.example`](./apps/api/.env.example) for all configuration options. The `.env` files (with real secrets) are gitignored; the `.env.example` templates are committed.

Key variables:
- `DB_PROVIDER` — `lightbase` (default) or `sqlite`
- `LIGHTBASE_BASE_URL`, `LIGHTBASE_API_KEY`, `LIGHTBASE_PROJECT_ID` — Lightbase credentials
- `JWT_SECRET` — JWT signing secret (change in production)

## Test Accounts

See [`TEST_USERS.md`](./TEST_USERS.md) for all seeded test credentials (admin, sellers, customers, affiliate).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite (frontend) + Astro (API) concurrently |
| `npm run dev:web` | Start only the Vite frontend |
| `npm run dev:api` | Start only the Astro API |
| `npm run build` | Build the frontend + API |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Initialize Lightbase collections + seed data |
| `npm run db:seed` | Alias for db:push |

## Project Structure

```
goshop-beta/
├── apps/api/                 # Astro API backend (port 3001)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── provider/     # DataProvider abstraction (Lightbase + SQLite)
│   │   │   ├── lightbase-client.ts  # Lightbase /api/v1 HTTP client
│   │   │   ├── schema.ts     # Collection schema definitions
│   │   │   ├── auth.ts       # JWT + bcrypt + async DB helpers
│   │   │   ├── seed.ts       # Comprehensive async seed
│   │   │   └── database.ts   # Legacy better-sqlite3 (kept for switch-back)
│   │   ├── pages/api/        # API endpoints
│   │   └── middleware.ts     # Init + seed + CORS
│   └── scripts/              # Setup/seed scripts
├── src/                      # Vite + React SPA (port 3000)
│   ├── components/           # Reusable components (ProductCard, home/*, etc.)
│   ├── pages/                # Route pages
│   ├── context/              # CommerceContext, RealTimeContext, etc.
│   ├── lib/                  # api-client, utils
│   └── i18n.ts               # i18next config
├── public/                   # Static assets + locale translations
├── Core_Working_Protocol.md  # Authoritative working protocol
├── TEST_USERS.md             # Test credentials
└── .env.example              # Environment template
```

## Database Provider

The backend uses an async `DataProvider` interface with two implementations:

- **LightbaseProvider** (default) — uses the Lightbase core `/api/v1` documents/collections/query API.
- **SqliteProvider** — wraps better-sqlite3 directly (kept intact for manual switch-back).

Switch via the `DB_PROVIDER` env var. The SQLite provider is lazy-loaded so the Lightbase path never requires the native better-sqlite3 module.

## License

Private. All rights reserved.

BaarakaLLAHu Feek.
