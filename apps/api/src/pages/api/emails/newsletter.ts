// BismiLLAH Ar-Rahman Ar-Roheem.
// Astro endpoint — thin wrapper around the platform-agnostic newsletter email
// handler at src/handlers/emails.ts.

import type { APIContext } from 'astro';
import { emailsHandler } from '../../../handlers/emails';

export async function POST(context: APIContext): Promise<Response> {
  return emailsHandler(context.request, 'newsletter');
}
