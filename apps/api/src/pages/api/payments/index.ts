// BismiLLAH Ar-Rahman Ar-Roheem.
// Astro endpoint — thin wrapper around the platform-agnostic payments handler.

import type { APIContext } from 'astro';
import { paymentsHandler } from '../../../handlers/payments';

export async function POST(context: APIContext): Promise<Response> {
  return paymentsHandler(context.request);
}
