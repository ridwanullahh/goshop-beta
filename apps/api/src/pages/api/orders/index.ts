// BismiLLAH Ar-Rahman Ar-Roheem.
// Astro endpoint — thin wrapper around the platform-agnostic orders handler.

import type { APIContext } from 'astro';
import { ordersHandler } from '../../../handlers/orders';

export async function GET(context: APIContext): Promise<Response> {
  return ordersHandler(context.request);
}

export async function POST(context: APIContext): Promise<Response> {
  return ordersHandler(context.request);
}

export async function PATCH(context: APIContext): Promise<Response> {
  return ordersHandler(context.request);
}
