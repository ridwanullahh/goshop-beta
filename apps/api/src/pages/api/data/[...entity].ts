// BismiLLAH Ar-Rahman Ar-Roheem.
// Astro endpoint — thin wrapper around the platform-agnostic data CRUD handler
// at src/handlers/data.ts. The handler parses the entity from the URL path
// (works identically on Astro and Cloudflare Workers).

import type { APIContext } from 'astro';
import { dataHandler } from '../../../handlers/data';

export async function GET(context: APIContext): Promise<Response> {
  return dataHandler(context.request);
}

export async function POST(context: APIContext): Promise<Response> {
  return dataHandler(context.request);
}

export async function PATCH(context: APIContext): Promise<Response> {
  return dataHandler(context.request);
}

export async function DELETE(context: APIContext): Promise<Response> {
  return dataHandler(context.request);
}
