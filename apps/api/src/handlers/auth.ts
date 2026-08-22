// BismiLLAH Ar-Rahman Ar-Roheem.
// Platform-agnostic auth handler. Same logic as the Astro endpoint, but
// accepts a standard Request instead of an Astro APIContext — so the same
// code runs on Astro (pass context.request) and Cloudflare Workers (pass the
// Workers request). The Astro endpoint at src/pages/api/auth/index.ts is now
// a one-line wrapper that delegates here; the CF Pages Function routes here
// via src/router.ts.

import { z } from 'zod';
import {
  hashPassword, verifyPassword, generateToken, verifyToken,
  getAll, getOne, getById, insert, update,
  jsonResponse, errorResponse,
} from '../lib/auth';
import { emitEmailEventSafe } from '../lib/email';
import { getEnv } from '../lib/env';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().optional().default('customer'),
  roles: z.array(z.string()).optional(),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  onboardingCompleted: z.boolean().optional(),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function post(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'register') {
      const parsed = registerSchema.parse(data);
      const existing = await getOne('users', { email: parsed.email.toLowerCase() });
      if (existing) {
        return errorResponse('User already exists with this email', 409);
      }

      const passwordHash = await hashPassword(parsed.password);
      const user = await insert('users', {
        email: parsed.email.toLowerCase(),
        passwordHash,
        name: parsed.name,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        role: parsed.role,
        roles: parsed.roles || [parsed.role],
        businessName: parsed.businessName,
        phone: parsed.phone,
        onboardingCompleted: !!parsed.onboardingCompleted,
        verified: false,
        referralCode: `${(parsed.name || 'USER').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)}${Math.floor(1000 + Math.random() * 9000)}`,
      });
      // Ensure the new user has a wallet and an inherent referral code record.
      try { await insert('wallets', { userId: user.id, balance: 0 }); } catch {}
      try { await insert('referral_codes', { userId: user.id, code: user.referralCode, userType: parsed.role, isActive: true }); } catch {}

      // Apply inherent referral: if a referral code was supplied, link the new user to the referrer.
      if (parsed.referralCode) {
        try {
          const referrer = await getOne<any>('users', { referralCode: parsed.referralCode });
          if (referrer && referrer.id !== user.id) {
            await update('users', user.id, { referredBy: referrer.id });
            await update('users', referrer.id, { referralCount: (referrer.referralCount || 0) + 1 });
            const rc = await getOne<any>('referral_codes', { userId: referrer.id });
            if (rc) await update('referral_codes', rc.id, { signups: (rc.signups || 0) + 1 });
          }
        } catch (err) {
          console.error('[auth] referral application failed:', err);
        }
      }

      const token = generateToken(user.id);
      const { passwordHash: _, ...safeUser } = user;

      // [Task 25 — email integration] Welcome email (+ seller agreement if role=seller).
      // Fire-and-forget; never blocks the response or breaks registration.
      try {
        const appUrl = getEnv('APP_URL') || '';
        const dashboardLink = appUrl ? `${appUrl.replace(/\/$/, '')}/dashboard` : '/dashboard';
        emitEmailEventSafe({
          event: 'welcome',
          to: user.email,
          data: {
            name: user.name || user.firstName || '',
            role: parsed.role,
            dashboardLink,
          },
        });
        if (parsed.role === 'seller') {
          emitEmailEventSafe({
            event: 'sellerAgreement',
            to: user.email,
            data: {
              name: user.name || user.firstName || '',
              commissionRate: 5,
              agreementContent:
                'As a GoShop seller, you agree to: (1) list only authentic products, ' +
                '(2) ship orders within the stated handling time, (3) honor refunds per our return policy, ' +
                '(4) pay the platform commission on each completed sale, and (5) maintain honest communication ' +
                'with buyers. Violations may result in store suspension.',
            },
          });
        }
      } catch (emailErr) {
        console.error('[auth/register] welcome email emit failed:', emailErr);
      }

      return jsonResponse({ user: safeUser, token }, 201);
    }

    if (action === 'login') {
      const parsed = loginSchema.parse(data);
      const user = await getOne<any>('users', { email: parsed.email.toLowerCase() });

      if (!user || !user.passwordHash) {
        return errorResponse('Invalid credentials', 401);
      }

      const isValid = await verifyPassword(parsed.password, user.passwordHash);
      if (!isValid) {
        return errorResponse('Invalid credentials', 401);
      }

      const token = generateToken(user.id);
      const { passwordHash: _, ...safeUser } = user;

      return jsonResponse({ user: safeUser, token });
    }

    if (action === 'logout') {
      return jsonResponse({ success: true });
    }

    return errorResponse('Invalid action. Use register, login, or logout.', 400);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid input: ' + error.errors.map(e => e.message).join(', '), 400);
    }
    console.error('Auth error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

async function get(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('No token provided', 401);
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse('Invalid token', 401);
    }

    const user = await getById<any>('users', decoded.userId);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const { passwordHash, ...safeUser } = user;
    return jsonResponse(safeUser);
  } catch (error: any) {
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function authHandler(request: Request): Promise<Response> {
  switch (request.method) {
    case 'POST': return post(request);
    case 'GET': return get(request);
    default:
      return errorResponse('Method Not Allowed', 405);
  }
}
