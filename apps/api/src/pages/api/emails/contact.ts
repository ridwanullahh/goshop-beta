// BismiLLAH Ar-Rahman Ar-Roheem.
// POST /api/emails/contact — public endpoint. Accepts { name, email, message }
// and emits a contactForm email to the admin/support inbox. Fire-and-forget.
// Returns success even when Gmail is not configured (no-op).

import type { APIContext } from 'astro';
import { z } from 'zod';
import { jsonResponse, errorResponse } from '../../../lib/auth';
import { emitEmailEventSafe } from '../../../lib/email';

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  message: z.string().min(1).max(5000),
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

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || 'support@goshop.com';

    // Fire-and-forget. The endpoint responds immediately; the email send happens in the background.
    emitEmailEventSafe({
      event: 'contactForm',
      to: adminEmail,
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
      },
      overrides: {
        replyTo: parsed.data.email, // support can reply directly to the submitter
        subject: `Contact form: ${parsed.data.name}`,
      },
    });

    return jsonResponse({ success: true, message: 'Your message has been received. We will get back to you soon.' });
  } catch (error: any) {
    console.error('[emails/contact] error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
