// BismiLLAH Ar-Rahman Ar-Roheem.
// Platform-agnostic email endpoints handler. Mirrors the three Astro endpoints:
//   POST /api/emails/contact         — public contact form
//   POST /api/emails/newsletter       — public newsletter signup
//   POST /api/emails/referral-invite  — authenticated referral invite
// All three emit fire-and-forget email events. On Cloudflare Workers the
// transport is null (nodemailer requires TCP sockets), so emitEmailEventSafe
// short-circuits to a no-op and the endpoints still return success.

import { z } from 'zod';
import { jsonResponse, errorResponse, requireAuth } from '../lib/auth';
import { emitEmailEventSafe } from '../lib/email';
import { getEnv } from '../lib/env';

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  message: z.string().min(1).max(5000),
});

const newsletterSchema = z.object({
  email: z.string().email().max(200),
  name: z.string().max(120).optional(),
});

const referralInviteSchema = z.object({
  toEmail: z.string().email().max(200),
  rewardDescription: z.string().max(280).optional(),
});

async function contact(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return errorResponse('Invalid JSON body', 400);

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Invalid input: ' + parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        400
      );
    }

    const adminEmail = getEnv('ADMIN_EMAIL') || getEnv('SUPPORT_EMAIL') || 'support@goshop.com';

    emitEmailEventSafe({
      event: 'contactForm',
      to: adminEmail,
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
      },
      overrides: {
        replyTo: parsed.data.email,
        subject: `Contact form: ${parsed.data.name}`,
      },
    });

    return jsonResponse({ success: true, message: 'Your message has been received. We will get back to you soon.' });
  } catch (error: any) {
    console.error('[emails/contact] error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

async function newsletter(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return errorResponse('Invalid JSON body', 400);

    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Invalid input: ' + parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        400
      );
    }

    const appUrl = getEnv('APP_URL') || '';
    const unsubscribeLink = appUrl ? `${appUrl}/unsubscribe?email=${encodeURIComponent(parsed.data.email)}` : '/unsubscribe';

    emitEmailEventSafe({
      event: 'newsletterWelcome',
      to: parsed.data.email,
      data: {
        email: parsed.data.email,
        name: parsed.data.name || '',
        unsubscribeLink,
      },
      overrides: {
        subject: 'Welcome to the GoShop newsletter',
        listUnsubscribe: true,
      },
    });

    return jsonResponse({ success: true, message: 'You are subscribed. Check your inbox for a welcome email.' });
  } catch (error: any) {
    console.error('[emails/newsletter] error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

async function referralInvite(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);

    const body = await request.json().catch(() => null);
    if (!body) return errorResponse('Invalid JSON body', 400);

    const parsed = referralInviteSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Invalid input: ' + parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        400
      );
    }

    if (user.email && user.email.toLowerCase() === parsed.data.toEmail.toLowerCase()) {
      return errorResponse('You cannot send a referral invite to your own email address.', 400);
    }

    const referralCode = user.referralCode || '';
    const appUrl = getEnv('APP_URL') || '';
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

export async function emailsHandler(request: Request, sub: string): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method Not Allowed', 405);
  }
  switch (sub) {
    case 'contact': return contact(request);
    case 'newsletter': return newsletter(request);
    case 'referral-invite': return referralInvite(request);
    default:
      return errorResponse('Email endpoint not found', 404);
  }
}
