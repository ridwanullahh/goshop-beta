// BismiLLAH Ar-Rahman Ar-Roheem.
// Platform-agnostic referral handler. Mirrors src/pages/api/referral/index.ts.
// GET returns the authenticated user's referral code + stats + referrals.
// POST { code } tracks a click on a referral link.

import { getOne, getAll, update, jsonResponse, errorResponse, requireAuth } from '../lib/auth';
import { getEnv } from '../lib/env';

async function get(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const rc = await getOne<any>('referral_codes', { userId: user.id });
    const referrals = await getAll<any>('users', { referredBy: user.id });
    const safeReferrals = referrals.map((u: any) => {
      const { passwordHash, ...rest } = u;
      return rest;
    });
    return jsonResponse({
      code: user.referralCode,
      clicks: rc?.clicks || 0,
      signups: rc?.signups || 0,
      earnings: rc?.earnings || user.referralEarnings || 0,
      referralCount: user.referralCount || 0,
      referralLink: `${getEnv('APP_URL') || ''}/?ref=${user.referralCode}`,
      referrals: safeReferrals,
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

async function post(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({}));
    const code = body?.code;
    if (!code) return errorResponse('Referral code required', 400);
    const referrer = await getOne<any>('users', { referralCode: code });
    if (!referrer) return errorResponse('Invalid referral code', 404);
    const rc = await getOne<any>('referral_codes', { userId: referrer.id });
    if (rc) {
      await update('referral_codes', rc.id, { clicks: (rc.clicks || 0) + 1 });
    }
    return jsonResponse({ success: true });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function referralHandler(request: Request): Promise<Response> {
  switch (request.method) {
    case 'GET': return get(request);
    case 'POST': return post(request);
    default:
      return errorResponse('Method Not Allowed', 405);
  }
}
