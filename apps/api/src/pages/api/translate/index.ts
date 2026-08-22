// BismiLLAH Ar-Rahman Ar-Roheem.
// Astro endpoint — thin wrapper around the platform-agnostic translate handler.

import type { APIContext } from 'astro';
import { translateHandler } from '../../../handlers/translate';

export async function POST(context: APIContext): Promise<Response> {
  return translateHandler(context.request);
}
