// BismiLLAH Ar-Rahman Ar-Roheem.
// Astro endpoint — thin wrapper around the platform-agnostic products handler.

import type { APIContext } from 'astro';
import { productsHandler } from '../../../handlers/products';

export async function GET(context: APIContext): Promise<Response> {
  return productsHandler(context.request);
}

export async function POST(context: APIContext): Promise<Response> {
  return productsHandler(context.request);
}

export async function PATCH(context: APIContext): Promise<Response> {
  return productsHandler(context.request);
}

export async function DELETE(context: APIContext): Promise<Response> {
  return productsHandler(context.request);
}
