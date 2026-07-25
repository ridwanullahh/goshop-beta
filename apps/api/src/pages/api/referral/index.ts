// Referral endpoint — inherent referral per user (no standalone referral account).
// BismiLLAH Ar-Rahman Ar-Roheem. GET returns the authenticated user's referral code + stats + referrals.
// POST { code } tracks a click on a referral link.
import type { APIContext } from 'astro';
import { getOne, getAll, update, jsonResponse, errorResponse, requireAuth } from '../../../lib/auth';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const user = await requireAuth(context);
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
      referralLink: `${process.env.APP_URL || ''}/?ref=${user.referralCode}`,
      referrals: safeReferrals,
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function POST(context: APIContext): Promise<Response> {
  try {
    const body = await context.request.json().catch(() => ({}));
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
