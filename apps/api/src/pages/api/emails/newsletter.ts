// BismiLLAH Ar-Rahman Ar-Roheem.
// POST /api/emails/newsletter — public endpoint. Accepts { email } and emits
// a newsletterWelcome email. Fire-and-forget. Returns success even when Gmail
// is not configured (no-op). In a real backend you would also persist the email
// to a subscribers collection; we keep this minimal and non-blocking.

import type { APIContext } from 'astro';
import { z } from 'zod';
import { jsonResponse, errorResponse } from '../../../lib/auth';
import { emitEmailEventSafe } from '../../../lib/email';

const schema = z.object({
  email: z.string().email().max(200),
  name: z.string().max(120).optional(),
});

export async function POST(context: APIContext): Promise<Response> {
  try {
    const body = await context.request.json().catch(() => null);
    if (!body) return errorResponse('Invalid JSON body', 400);

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Invalid input: ' + parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        400
      );
    }

    const appUrl = process.env.APP_URL || '';
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
