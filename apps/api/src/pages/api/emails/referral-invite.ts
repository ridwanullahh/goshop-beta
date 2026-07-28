// BismiLLAH Ar-Rahman Ar-Roheem.
// POST /api/emails/referral-invite — authenticated. Accepts { toEmail } and
// emits a referralInvite email using the current user's referral code/link.
// Fire-and-forget. Returns success even when Gmail is not configured (no-op).

import type { APIContext } from 'astro';
import { z } from 'zod';
import { jsonResponse, errorResponse, requireAuth } from '../../../lib/auth';
import { emitEmailEventSafe } from '../../../lib/email';

const schema = z.object({
  toEmail: z.string().email().max(200),
  rewardDescription: z.string().max(280).optional(),
});

export async function POST(context: APIContext): Promise<Response> {
  try {
    const user = await requireAuth(context);

    const body = await context.request.json().catch(() => null);
    if (!body) return errorResponse('Invalid JSON body', 400);

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Invalid input: ' + parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        400
      );
    }

    // Prevent self-invites (no reward gaming).
    if (user.email && user.email.toLowerCase() === parsed.data.toEmail.toLowerCase()) {
      return errorResponse('You cannot send a referral invite to your own email address.', 400);
    }

    const referralCode = user.referralCode || '';
    const appUrl = process.env.APP_URL || '';
    const referralLink = referralCode
      ? `${appUrl.replace(/\/$/, '')}/?ref=${encodeURIComponent(referralCode)}`
      : appUrl || '/';

    emitEmailEventSafe({
      event: 'referralInvite',
      to: parsed.data.toEmail,
      data: {
        inviterName: user.name || user.firstName || 'A GoShop member',
        referralLink,
        rewardDescription: parsed.data.rewardDescription || 'Earn rewards when your friends shop on GoShop.',
      },
      overrides: {
        subject: `${user.name || 'Your friend'} invited you to GoShop`,
        listUnsubscribe: true,
      },
    });

    return jsonResponse({ success: true, message: 'Invitation sent.' });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('[emails/referral-invite] error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
