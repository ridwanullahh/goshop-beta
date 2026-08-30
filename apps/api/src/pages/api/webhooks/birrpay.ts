// BismiLLAH Ar-Rahman Ar-Roheem.
// Astro endpoint — thin wrapper around the shared BirrPay webhook handler
// (same code path as the Cloudflare Pages Functions router).
import type { APIContext } from 'astro';
import { birrpayWebhookHandler } from '../../../handlers/birrpay-webhook';

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  return birrpayWebhookHandler(context.request);
}
