# GoShop Security Audit Report

> **Bismillah Ar-Rahman Ar-Raheem**

This document identifies security vulnerabilities in the current GoShop implementation and provides remediation guidance. The monorepo architecture with Next.js backend addresses all critical issues.

---

## Vulnerability Summary

| ID | Severity | Issue | Status |
|----|----------|-------|--------|
| SEC-001 | 🔴 **CRITICAL** | GitHub Token Exposed Client-Side | Fixed by monorepo |
| SEC-002 | 🔴 **CRITICAL** | Payment Credentials in Client Bundle | Fixed by monorepo |
| SEC-003 | 🔴 **CRITICAL** | Direct Database Access from Browser | Fixed by monorepo |
| SEC-004 | 🔴 **CRITICAL** | Plaintext Password Storage | Requires implementation |
| SEC-005 | 🟠 **HIGH** | No Server-Side Authentication | Fixed by monorepo |
| SEC-006 | 🟠 **HIGH** | JWT Secret Exposed | Fixed by monorepo |
| SEC-007 | 🟠 **HIGH** | No Rate Limiting | Requires implementation |
| SEC-008 | 🟠 **HIGH** | Missing Input Validation Server-Side | Requires implementation |
| SEC-009 | 🟡 **MEDIUM** | No CSRF Protection | Requires implementation |
| SEC-010 | 🟡 **MEDIUM** | Insecure Session Management | Fixed by monorepo |
| SEC-011 | 🟡 **MEDIUM** | Missing Security Headers | Requires implementation |
| SEC-012 | 🟡 **MEDIUM** | AI API Key Exposure | Fixed by monorepo |
| SEC-013 | 🟢 **LOW** | Verbose Error Messages | Requires implementation |
| SEC-014 | 🟢 **LOW** | Missing Audit Logging | Requires implementation |

---

## Critical Vulnerabilities

### SEC-001: GitHub Token Exposed Client-Side

**Location**: `src/lib/commerce-sdk.ts:436`

```typescript
// VULNERABLE CODE
this.githubToken = import.meta.env.VITE_GITHUB_TOKEN || '';
```

**Risk**: Anyone can extract the GitHub token from browser DevTools → Sources → compiled JavaScript, gaining full read/write access to the database repository.

**Attack Vector**:
1. Open browser DevTools on the live site
2. Search for `VITE_GITHUB_TOKEN` in Sources
3. Extract the token value
4. Use token to: read all user data, modify orders, steal customer information, delete all data

**Fix**: Move all GitHub operations to Next.js API server. Token stored in `apps/api/.env.local` as `GITHUB_TOKEN` (no VITE_ prefix).

---

### SEC-002: Payment Credentials in Client Bundle

**Locations**:
- `src/lib/paypal-client.ts:3-4`
- `src/pages/api/initiate-payment.ts:8-11`

```typescript
// VULNERABLE (if bundled client-side)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
```

**Risk**: Payment provider credentials can be extracted and used for fraudulent transactions.

**Fix**: Ensure all payment code runs server-side only in Next.js API routes.

---

### SEC-003: Direct Database Access from Browser

**Location**: `src/lib/commerce-sdk.ts:553-588`

```typescript
// VULNERABLE: Direct GitHub API calls from browser
private async fetchData(path: string, method: string = 'GET', body: any = null) {
  const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/db/${path}.json`;
  const headers = {
    'Authorization': `Bearer ${this.githubToken}`,
    // ...
  };
```

**Risk**: All database operations are visible in Network tab. Attackers can:
- Modify request payloads to bypass client-side validation
- Submit arbitrary data directly to the database
- Manipulate prices, order totals, wallet balances

**Fix**: All database operations must go through Next.js API with proper server-side validation.

---

### SEC-004: Plaintext Password Storage

**Location**: `src/lib/sdk.ts:231-232`

```typescript
// VULNERABLE: Passwords stored without hashing
password: userData.password, // In production, hash this password
```

**Risk**: Database breach exposes all user passwords in readable form.

**Required Fix in Next.js API**:
```typescript
// apps/api/src/lib/auth.ts
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // Cost factor 12
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// In registration:
const passwordHash = await hashPassword(userData.password);
// Store passwordHash, NEVER store password
```

---

## High Severity Vulnerabilities

### SEC-005: No Server-Side Authentication

**Location**: `src/lib/commerce-sdk.ts:799-809`

```typescript
// VULNERABLE: Login only checks client-side
async login(credentials: { email: string; password: string }): Promise<User> {
  const users = await this.getUsers();
  const user = users.find(user => user.email === credentials.email);
  // No password verification!
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
}
```

**Risks**:
1. Password is not even checked (anyone can login as any user)
2. Session stored in localStorage (accessible to XSS attacks)
3. No token expiration

**Required Fix**:
```typescript
// apps/api/src/app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  const users = await db.get('users');
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // Verify password hash
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // Issue JWT token with expiration
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  
  return NextResponse.json({ user: sanitizeUser(user), token });
}
```

---

### SEC-006: JWT Secret Exposed

**Location**: `src/lib/auth.ts:4`

```typescript
// If this runs client-side, JWT_SECRET is exposed
const JWT_SECRET = process.env.JWT_SECRET!;
```

**Fix**: JWT operations must only run in Next.js API. Secret in `apps/api/.env.local`.

---

### SEC-007: No Rate Limiting

**Risk**: API endpoints vulnerable to:
- Brute force login attempts
- DoS attacks
- Enumeration attacks (user email discovery)

**Required Implementation**:
```typescript
// apps/api/src/lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const rateLimit = new LRUCache<string, number[]>({
  max: 10000,
  ttl: 60 * 1000, // 1 minute
});

export function checkRateLimit(ip: string, limit: number = 10): boolean {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  const recentRequests = requests.filter(t => now - t < 60000);
  
  if (recentRequests.length >= limit) {
    return false; // Rate limited
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
}

// Usage in middleware or route handlers
export function withRateLimit(handler: Function, limit = 10) {
  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip, limit)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    return handler(request);
  };
}
```

---

### SEC-008: Missing Server-Side Input Validation

**Location**: Various routes accept user input without validation

**Required Implementation**:
```typescript
// packages/shared/src/validation/schemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100)
    .regex(/[A-Z]/, 'Password must contain uppercase')
    .regex(/[a-z]/, 'Password must contain lowercase')
    .regex(/[0-9]/, 'Password must contain number'),
  name: z.string().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/),
});

export const productSchema = z.object({
  name: z.string().min(3).max(200),
  price: z.number().positive().max(1000000),
  description: z.string().max(10000).optional(),
  inventory: z.number().int().min(0),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive().max(100),
  })).min(1).max(50),
  shippingAddress: z.object({
    street: z.string().min(5).max(200),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().length(2),
  }),
});
```

**Usage in routes**:
```typescript
const body = await request.json();
const result = registerSchema.safeParse(body);

if (!result.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: result.error.flatten() },
    { status: 400 }
  );
}

const validData = result.data; // Type-safe validated data
```

---

## Medium Severity Vulnerabilities

### SEC-009: No CSRF Protection

**Required Implementation**:
```typescript
// apps/api/src/lib/csrf.ts
import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return token === storedToken;
}

// In routes that modify data:
const csrfToken = request.headers.get('X-CSRF-Token');
const sessionCSRF = await getSessionCSRF(request);

if (!validateCSRFToken(csrfToken, sessionCSRF)) {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
}
```

---

### SEC-010: Insecure Session Management

**Current Issue**: `localStorage.setItem('currentUser', JSON.stringify(user))`

**Risks**:
- XSS can steal session
- No server-side session invalidation
- No session timeout

**Fix**: Use HTTP-only cookies for tokens:
```typescript
// apps/api/src/app/api/auth/login/route.ts
const response = NextResponse.json({ user: sanitizeUser(user) });

response.cookies.set('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/',
});

return response;
```

---

### SEC-011: Missing Security Headers

**Required Implementation** in `apps/api/next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

### SEC-012: AI API Key Exposure

**Location**: `src/lib/ai.ts` instantiates `ChutesAI` with API key that would be exposed client-side.

**Fix**: AI operations moved to server-side in `apps/api/src/lib/ai.ts`.

---

## Low Severity Vulnerabilities

### SEC-013: Verbose Error Messages

**Issue**: Detailed error messages leak implementation details.

```typescript
// VULNERABLE
throw new Error(`Failed to get SHA for ${path}. Status: ${response.status}`);
```

**Fix**: Log detailed errors server-side, return generic messages to client:
```typescript
// Server-side logging
console.error(`Database error: ${error.message}`, { path, userId });

// Client response
return NextResponse.json(
  { error: 'An error occurred processing your request' },
  { status: 500 }
);
```

---

### SEC-014: Missing Audit Logging

**Required Implementation**:
```typescript
// apps/api/src/lib/audit.ts
interface AuditLogEntry {
  timestamp: string;
  action: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  ip: string;
  userAgent: string;
  details?: any;
}

export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>) {
  const fullEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };
  
  // Store in database
  await db.insert('audit_logs', fullEntry);
  
  // Also log to server
  console.log('[AUDIT]', JSON.stringify(fullEntry));
}

// Usage in routes:
await logAuditEvent({
  action: 'user.login',
  userId: user.id,
  resourceType: 'user',
  resourceId: user.id,
  ip: request.headers.get('x-forwarded-for') || 'unknown',
  userAgent: request.headers.get('user-agent') || 'unknown',
});
```

---

## Security Checklist for Implementation

### Authentication & Authorization
- [ ] Hash all passwords with bcrypt (cost 12+)
- [ ] Migrate existing plaintext passwords on first login
- [ ] Implement JWT with proper expiration (7 days max)
- [ ] Store tokens in HTTP-only cookies
- [ ] Implement role-based access control (RBAC)
- [ ] Validate user permissions on every protected route
- [ ] Implement account lockout after 5 failed attempts

### API Security
- [ ] Implement rate limiting (10 req/min for auth, 100 req/min general)
- [ ] Validate all input with Zod schemas
- [ ] Sanitize output (remove passwordHash, sensitive fields)
- [ ] Add CSRF protection for state-changing operations
- [ ] Configure CORS to only allow frontend origin

### Data Protection
- [ ] Encrypt sensitive data at rest (wallets, payment info)
- [ ] Implement audit logging for all sensitive operations
- [ ] Add data retention policies
- [ ] Implement user data export/deletion (GDPR)

### Infrastructure
- [ ] Configure security headers in Next.js
- [ ] Enable HTTPS only in production
- [ ] Set secure cookie attributes
- [ ] Implement request logging
- [ ] Set up error monitoring (without exposing details)

### Payment Security
- [ ] Verify all payment callbacks with provider signatures
- [ ] Validate payment amounts server-side
- [ ] Never trust client-provided prices
- [ ] Log all payment events for reconciliation

### Environment Variables
- [ ] Remove all VITE_ sensitive secrets
- [ ] React app: only `VITE_API_URL`
- [ ] Next.js: all secrets without VITE_ prefix
- [ ] Rotate compromised tokens immediately

---

## Post-Migration Verification

Run these checks after implementing the monorepo:

```bash
# 1. Check for exposed secrets in React build
cd apps/web
pnpm build
grep -rE "(GITHUB_TOKEN|PAYPAL|SECRET|API_KEY)" dist/
# Expected: No matches

# 2. Verify API authentication
curl -X GET http://localhost:3001/api/orders
# Expected: 401 Unauthorized

# 3. Test rate limiting
for i in {1..15}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Expected: 429 Too Many Requests after limit

# 4. Verify CORS
curl -X OPTIONS http://localhost:3001/api/products \
  -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: GET"
# Expected: No Access-Control-Allow-Origin header for malicious origin
```

---

## Emergency Response Plan

If current token is compromised:

1. **Immediately revoke GitHub token** at https://github.com/settings/tokens
2. Generate new token with minimal required permissions
3. Update `apps/api/.env.local` with new token
4. Redeploy API server
5. Review audit logs for unauthorized access
6. Notify affected users if data breach occurred

---

**Ash-hadu an la ilaha illallah wa ash-hadu anna Muhammadan rasulullah. La hawla wala quwwata illa billah. Hasbiyallahu la ilaha illa huwa, alayhi tawakkaltu.**
