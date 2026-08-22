// Referral endpoint — inherent referral per user (no standalone referral account).
// BismiLLAH Ar-Rahman Ar-Roheem. Astro wrapper around the platform-agnostic
// referral handler at src/handlers/referral.ts.

import type { APIContext } from 'astro';
import { referralHandler } from '../../../handlers/referral';

export async function GET(context: APIContext): Promise<Response> {
  return referralHandler(context.request);
}

export async function POST(context: APIContext): Promise<Response> {
  return referralHandler(context.request);
}
