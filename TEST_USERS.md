# GoShop Beta — Test User Credentials

> BismiLLAH Ar-Rahman Ar-Roheem. These credentials are for development/testing only.
> All accounts are seeded into the Lightbase database via `npm run db:push` (or `npm run db:seed`).

## How to log in

1. Start the dev server: `npm run dev`
2. Open the app (Preview Panel or `http://localhost:3000`)
3. Click **Login** (top-right)
4. Enter the email and password below

---

## Platform Admin

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@goshop.com`     |
| Password | `Admin@123`            |
| Role     | admin                  |
| Access   | `/admin-dashboard`     |

The admin can view all users, products, orders, stores, blogs, help articles, and platform analytics.

---

## Sellers

| Field    | Seller 1                       | Seller 2                       | Seller 3                       |
|----------|--------------------------------|--------------------------------|--------------------------------|
| Email    | `seller1@goshop.com`           | `seller2@goshop.com`           | `seller3@goshop.com`           |
| Password | `Seller@123`                   | `Seller@123`                   | `Seller@123`                   |
| Name     | Ahmad Electronics              | Fatima Fashion House           | TechMart Nigeria               |
| Store    | Ahmad Electronics Store        | Fatima Fashion House           | TechMart Nigeria               |
| Store slug | `ahmad-electronics`          | `fatima-fashion`               | `techmart-ng`                  |
| Access   | `/seller-dashboard`            | `/seller-dashboard`            | `/seller-dashboard`            |

Sellers can manage their products, view orders, analytics, reviews, payments, blog, and settings.

---

## Customers

| Field    | Customer 1                   | Customer 2                     | Customer 3                     |
|----------|------------------------------|--------------------------------|--------------------------------|
| Email    | `customer@goshop.com`        | `customer2@goshop.com`         | `customer3@goshop.com`         |
| Password | `Customer@123`               | `Customer@123`                 | `Customer@123`                 |
| Name     | John Doe                     | Aisha Mohammed                 | David Okafor                   |
| Wallet   | $250.00                      | $100.00                        | $75.00                         |
| Access   | `/customer-dashboard`        | `/customer-dashboard`          | `/customer-dashboard`          |

Customer 3 (David Okafor) was referred by Customer 1 (John Doe) — this demonstrates the inherent per-user referral system.

Customers can browse products, manage cart/wishlist, place orders, track orders, manage wallet, view notifications, and use the referral system.

---

## Affiliate

| Field    | Value                        |
|----------|------------------------------|
| Email    | `affiliate@goshop.com`       |
| Password | `Affiliate@123`              |
| Name     | Marketing Pro                |
| Wallet   | $800.00                      |
| Access   | `/affiliate-dashboard`       |

The affiliate can manage affiliate links, collections, view earnings, and withdraw funds. Note: with the inherent referral system, every user type (including affiliates) also has a referral code — the standalone affiliate account is retained for backward compatibility but referral is now built into all user types.

---

## Inherent Referral System

Every user (admin, seller, customer, affiliate) automatically receives a unique referral code upon registration. View your code, link, and stats in the customer dashboard's **Refer & Earn** card, or via `GET /api/referral` (authenticated).

To test the referral flow:
1. Log in as any user and note their referral code (visible in the dashboard).
2. Log out and open `http://localhost:3000/signup?ref=<CODE>`.
3. Register a new account — the new user will be linked to the referrer.

---

## Notes

- All passwords use bcrypt hashing (cost factor 12).
- JWT tokens expire after 7 days.
- Wallet balances are seeded for testing payment flows (wallet payment method).
- The database is idempotent: re-running `npm run db:push` will not duplicate data if users already exist.

BaarakaLLAHu Feek.
