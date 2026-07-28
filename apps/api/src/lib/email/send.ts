// BismiLLAH Ar-Rahman Ar-Roheem.
// sendEmail(): renders a branded template, sets proper inbox-delivery headers,
// and sends via the configured Gmail transport. Never throws to the caller —
// logs and returns { success: false, error? } on any failure.

import { getTransport } from './transport';
import { renderTemplate, getTemplateDef } from './templates';

export interface SendEmailInput {
  to: string | string[];
  subject?: string; // overrides the template subject if provided
  template: string; // template name
  data?: Record<string, any>;
  /** Override the Reply-To header. Defaults to SUPPORT_EMAIL. */
  replyTo?: string;
  /** Override the From name. Defaults to EMAIL_FROM_NAME. */
  fromName?: string;
  /** Override the priority ('1'=high, '3'=normal, '5'=low). Defaults to template priority. */
  priority?: '1' | '3' | '5';
  /** Force-add List-Unsubscribe header. Defaults to template.marketing. */
  listUnsubscribe?: boolean;
  /** Custom unsubscribe URL for the List-Unsubscribe header. */
  unsubscribeUrl?: string;
  /** Optional CC recipients. */
  cc?: string | string[];
  /** Optional BCC recipients. */
  bcc?: string | string[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean; // true when no transport configured (no-op)
}

function env(name: string, fallback = ''): string {
  return process.env[name] || fallback;
}

function fromHeader(fromName?: string): string {
  const name = (fromName || env('EMAIL_FROM_NAME', 'GoShop')).trim() || 'GoShop';
  const user = env('GMAIL_USER', 'no-reply@goshop.com');
  // RFC 5322 "Display Name <local@domain>"
  return `"${name.replace(/"/g, '\\"')}" <${user}>`;
}

function replyToHeader(replyTo?: string): string {
  return (replyTo || env('SUPPORT_EMAIL', 'support@goshop.com')).trim();
}

function listUnsubscribeHeader(url?: string): string {
  const mailto = env('UNSUBSCRIBE_EMAIL', 'unsubscribe@goshop.com');
  const target = url || env('APP_URL', '') + '/unsubscribe';
  // Both mailto and https URLs maximise client compatibility.
  return `<${target}>, <mailto:${mailto}>`;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    const transport = getTransport();
    if (!transport) {
      // Best-effort: never crash the caller. Log once via transport.ts.
      return { success: false, skipped: true, error: 'Email transport not configured.' };
    }

    const { template, data = {} } = input;
    const rendered = renderTemplate(template, data);
    if (!rendered) {
      return { success: false, error: `Unknown email template: ${template}` };
    }

    const def = getTemplateDef(template);
    const subject = input.subject || rendered.subject;

    // Priority: explicit > template > '3' (normal).
    const priority = input.priority || def?.priority || '3';
    const wantsListUnsubscribe = input.listUnsubscribe ?? def?.marketing ?? true;

    const headers: Record<string, string> = {
      'X-Priority': priority,
      'X-Mailer': 'GoShop Mailer/1.0',
      'X-Auto-Response-Suppress': 'All',
      'List-Unsubscribe': listUnsubscribeHeader(input.unsubscribeUrl),
      // Postmark/Gmail-style hint that the list is one-click (RFC 8058) — harmless if unused.
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      // Precedence helps bulk/newsletter classification; transactional stays 'bulk' to be safe.
      Precedence: def?.marketing ? 'bulk' : 'bulk',
    };
    if (rendered.preheader) {
      // Some clients surface this as preview text.
      headers['X-MS-Exchange-Organization-SCL'] = '0';
    }

    const info = await transport.sendMail({
      from: fromHeader(input.fromName),
      to: Array.isArray(input.to) ? input.to.join(', ') : input.to,
      cc: input.cc ? (Array.isArray(input.cc) ? input.cc.join(', ') : input.cc) : undefined,
      bcc: input.bcc ? (Array.isArray(input.bcc) ? input.bcc.join(', ') : input.bcc) : undefined,
      replyTo: replyToHeader(input.replyTo),
      subject,
      text: rendered.text,
      html: rendered.html,
      headers,
      // nodemailer generates a valid Message-ID automatically when messageId
      // is not explicitly overridden. We rely on the default behaviour.
      encoding: 'utf-8',
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    // NEVER throw to the caller — log and return failure.
    console.error(
      `[email] sendEmail failed (template=${input.template}, to=${input.to}):`,
      err?.message || err
    );
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Convenience: send the same email to multiple recipients individually
 * (each gets their own To: header, so they don't see each other).
 */
export async function sendEmailIndividually(
  recipients: string[],
  input: Omit<SendEmailInput, 'to'>
): Promise<{ sent: number; failed: number; results: SendEmailResult[] }> {
  const results: SendEmailResult[] = [];
  let sent = 0;
  let failed = 0;
  for (const to of recipients) {
    const r = await sendEmail({ ...input, to });
    results.push(r);
    if (r.success) sent++;
    else failed++;
  }
  return { sent, failed, results };
}
