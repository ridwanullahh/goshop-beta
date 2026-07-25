# GoShop PRD Gaps Audit & Implementation Plan

Bismillah Ar-Rahman Ar-Roheem

## Executive Summary

This document audits the GoShop platform against enterprise/production requirements and provides a comprehensive implementation plan to address all gaps.

---

## Current State Analysis

### Architecture Issues (CRITICAL)
| Gap | Severity | Status |
|-----|----------|--------|
| All DB operations execute client-side via GitHub API | CRITICAL | TO FIX |
| GitHub token exposed in client bundle (VITE_GITHUB_TOKEN) | CRITICAL | TO FIX |
| No password hashing - stored plaintext | CRITICAL | TO FIX |
| Payment credentials accessible in browser | CRITICAL | TO FIX |
| JWT secret in client-side code | HIGH | TO FIX |
| No server-side validation of prices/totals | CRITICAL | TO FIX |
| No rate limiting or CSRF protection | HIGH | TO FIX |

### Database Issues
| Gap | Severity | Status |
|-----|----------|--------|
| GitHub-based DB (JSON files) - not scalable | HIGH | TO FIX |
| No relational integrity | HIGH | TO FIX |
| No transactions/atomicity | HIGH | TO FIX |
| No indexes for search performance | MEDIUM | TO FIX |
| Race conditions on concurrent writes | HIGH | TO FIX |

### Navigation & Layout Issues
| Gap | Severity | Status |
|-----|----------|--------|
| Seller dashboard sub-pages lack MobileDashboardLayout wrapper | HIGH | TO FIX |
| Dashboard routes not consistently protected | HIGH | TO FIX |
| Missing sidebar navigation for seller sub-pages | HIGH | TO FIX |
| Admin dashboard has minimal functionality | MEDIUM | TO FIX |
| Customer dashboard navigation incomplete | MEDIUM | TO FIX |
| BottomNavigation shows on all pages (should hide on some) | LOW | TO FIX |

### Authentication Issues
| Gap | Severity | Status |
|-----|----------|--------|
| Login stores user in localStorage (insecure) | HIGH | TO FIX |
| No password hashing | CRITICAL | TO FIX |
| No token refresh mechanism | MEDIUM | TO FIX |
| No session expiry | MEDIUM | TO FIX |
| Register doesn't hash passwords | CRITICAL | TO FIX |
| getCurrentUser reads from localStorage only | HIGH | TO FIX |

### Feature Gaps
| Feature | Status | Priority |
|---------|--------|----------|
| SQLite database layer | MISSING | P0 |
| Astro API backend | MISSING | P0 |
| Runtime multilingual (auto-translate) | MISSING | P0 |
| Proper currency selector with conversion | PARTIAL | P1 |
| Production checkout with real payment flows | PARTIAL | P1 |
| Database seeding with production data | MISSING | P1 |
| Cloud backup support for SQLite | MISSING | P1 |
| API rate limiting | MISSING | P2 |
| CSRF protection | MISSING | P2 |

### Multilingual Issues
| Gap | Severity | Status |
|-----|----------|--------|
| i18n using HTTP backend with no actual translation files | HIGH | TO FIX |
| No runtime auto-translation | HIGH | TO FIX |
| No RTL support | MEDIUM | TO FIX |
| LanguageSelector component exists but limited | LOW | TO FIX |

### Checkout & Payment Issues
| Gap | Severity | Status |
|-----|----------|--------|
| Checkout redirects to enhanced but original still exists | LOW | TO FIX |
| Payment API routes designed for server but run client-side | CRITICAL | TO FIX |
| Wallet funding accepts direct credit without gateway verification | CRITICAL | TO FIX |
| No payment verification webhooks | HIGH | TO FIX |

---

## Implementation Plan

### Phase 1: Foundation (Monorepo + SQLite + Backend)
**Tasks:**
1. [x] Create monorepo structure with npm workspaces
2. [x] Set up Astro backend in `apps/api`
3. [x] Implement SQLite database with better-sqlite3
4. [x] Create DB schema with all tables
5. [x] Implement DB adapter pattern (switchable between SQLite and GitHub)
6. [x] Create all API routes on Astro backend
7. [x] Move all sensitive operations to server-side

### Phase 2: Security & Auth
**Tasks:**
1. [x] Implement bcrypt password hashing
2. [x] JWT auth with proper token management
3. [x] Server-side price validation
4. [x] CORS configuration
5. [x] Rate limiting middleware
6. [x] Input validation with Zod

### Phase 3: Frontend Integration
**Tasks:**
1. [x] Create API client for frontend
2. [x] Update CommerceContext to use API calls
3. [x] Fix authentication flow
4. [x] Update all SDK calls to use HTTP API

### Phase 4: Navigation & Layouts
**Tasks:**
1. [x] Wrap all seller dashboard pages with MobileDashboardLayout
2. [x] Add proper sidebar navigation to all dashboard areas
3. [x] Ensure consistent ProtectedRoute usage
4. [x] Fix bottom navigation visibility

### Phase 5: Multilingual & Multicurrency
**Tasks:**
1. [x] Replace i18n HTTP backend with runtime translation
2. [x] Implement google-translate-api-x via Astro API
3. [x] Add auto-translate provider
4. [x] Add RTL support
5. [x] Improve currency selector UX

### Phase 6: Checkout & Payments
**Tasks:**
1. [x] Secure checkout with server-side validation
2. [x] Proper payment gateway integration
3. [x] Wallet security fixes

### Phase 7: Data & Testing
**Tasks:**
1. [x] Seed database with production data
2. [x] Build and test all features
3. [x] Verify no secrets in client bundle

---

الحمد لله رب العالمين
