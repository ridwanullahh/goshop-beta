// BismiLLAH Ar-Rahman Ar-Roheem.
// Event-driven email dispatcher: maps domain events to email sends.
// Fire-and-forget — never blocks the request, never throws to the caller.

import { sendEmail, type SendEmailInput } from './send';
import { getTransport } from './transport';

export type EmailEventName =
  | 'welcome'
  | 'sellerAgreement'
  | 'loginAlert'
  | 'passwordReset'
  | 'orderConfirmation'
  | 'orderStatusUpdate'
  | 'orderShipped'
  | 'orderDelivered'
  | 'newOrder'
  | 'paymentSuccess'
  | 'paymentFailed'
  | 'refundProcessed'
  | 'walletCredited'
  | 'walletDebited'
  | 'withdrawalRequested'
  | 'withdrawalApproved'
  | 'withdrawalRejected'
  | 'storeApproved'
  | 'storeRejected'
  | 'lowStockAlert'
  | 'referralInvite'
  | 'referralSignup'
  | 'referralReward'
  | 'storeApprovalRequest'
  | 'withdrawalRequest'
  | 'disputeOpened'
  | 'contactForm'
  | 'newsletterWelcome';

export interface EmitEmailEventInput {
  /** The email template / event name. */
  event: EmailEventName;
  /** Recipient email address(es). */
  to: string | string[];
  /** Template payload. */
  data?: Record<string, any>;
  /** Optional overrides forwarded to sendEmail. */
  overrides?: Partial<SendEmailInput>;
}

export interface EmitEmailEventResult {
  event: EmailEventName;
  to: string | string[];
  success: boolean;
  skipped?: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Fire-and-forget: schedules the email send without blocking the caller.
 * Returns a promise that the caller MAY await, but is not required to.
 * Internally: if no transport is configured, returns immediately (no-op).
 */
export function emitEmailEvent(input: EmitEmailEventInput): Promise<EmitEmailEventResult> {
  const transport = getTransport();
  if (!transport) {
    // Best-effort: no-op silently. Log nothing here (transport.ts already warned once).
    return Promise.resolve({
      event: input.event,
      to: input.to,
      success: false,
      skipped: true,
      error: 'Email transport not configured.',
    });
  }
  // Defer the actual send so the caller's request path is not blocked.
  return sendEmailInternal(input).catch((err: any) => ({
    event: input.event,
    to: input.to,
    success: false,
    error: err?.message || String(err),
  }));
}

async function sendEmailInternal(input: EmitEmailEventInput): Promise<EmitEmailEventResult> {
  const result = await sendEmail({
    to: input.to,
    template: input.event,
    data: input.data || {},
    ...input.overrides,
  });
  return {
    event: input.event,
    to: input.to,
    success: result.success,
    skipped: result.skipped,
    error: result.error,
    messageId: result.messageId,
  };
}

/**
 * Convenience wrapper for integration points that want to fire-and-forget
 * WITHOUT awaiting. Logs errors but never throws.
 */
export function emitEmailEventSafe(input: EmitEmailEventInput): void {
  emitEmailEvent(input).then((r) => {
    if (!r.success && !r.skipped) {
      console.error(`[email] event "${r.event}" to ${r.to} failed:`, r.error);
    }
  });
}
