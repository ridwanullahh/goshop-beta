import { initializeSchema } from './lib/database.js';
import { seedDatabase } from './lib/seed.js';

let initialized = false;

export const onRequest = async (context: any, next: () => Promise<Response>): Promise<Response> => {
  if (!initialized) {
    try {
      initializeSchema();
      seedDatabase();
      initialized = true;
    } catch (err) {
      console.error('Init error:', err);
    }
  }

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': context.request.headers.get('origin') || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  const response = await next();

  const origin = context.request.headers.get('origin');
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:8080,http://localhost:4173').split(',');

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
};
