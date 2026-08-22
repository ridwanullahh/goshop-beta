// Auth + shared response helpers + async DB helper re-exports.
// BismiLLAH Ar-Rahman Ar-Roheem. Platform-agnostic: getCurrentUser/requireAuth
// accept a standard Request (Astro passes context.request, CF Pages Function
// passes the Workers request). Uses getEnv() for JWT_SECRET so the same code
// runs on Node/Astro (process.env) and Cloudflare Workers (env binding).

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './provider/index';
import { getEnv } from './env';

function jwtSecret(): string {
  return getEnv('JWT_SECRET') || 'goshop_jwt_secret_change_in_production_2024';
}
const TOKEN_EXPIRY = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, jwtSecret(), { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, jwtSecret()) as { userId: string };
  } catch {
    return null;
  }
}

/**
 * Resolve the authenticated user from the Authorization: Bearer <token> header
 * on a standard Request. Works on both Astro (pass context.request) and the
 * Cloudflare Workers runtime (pass the Workers request).
 */
export async function getCurrentUser(request: Request): Promise<any | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await db.getById<any>('users', decoded.userId);
  if (!user) return null;

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Require a valid Bearer token; throws a 401 Response if absent/invalid.
 * Callers should catch `Response` throws and return them directly.
 */
export async function requireAuth(request: Request): Promise<any> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return user;
}

export function requireRole(user: any, roles: string[]): void {
  const userRoles = user.roles || [user.role];
  const arr = Array.isArray(userRoles) ? userRoles : [userRoles];
  if (!roles.some((r) => arr.includes(r))) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

// ---- Async DB helper re-exports (backed by the active provider) ----
export const initializeSchema = (): Promise<void> => db.initializeSchema();
export const getAll = <T = any>(table: string, where?: Record<string, any>): Promise<T[]> =>
  db.getAll<T>(table, where);
export const getOne = <T = any>(table: string, where: Record<string, any>): Promise<T | undefined> =>
  db.getOne<T>(table, where);
export const getById = <T = any>(table: string, id: string): Promise<T | undefined> =>
  db.getById<T>(table, id);
export const insert = <T = any>(table: string, data: Record<string, any>): Promise<T> =>
  db.insert<T>(table, data);
export const update = <T = any>(table: string, id: string, data: Record<string, any>): Promise<T | undefined> =>
  db.update<T>(table, id, data);
export const remove = (table: string, id: string): Promise<boolean> => db.remove(table, id);
export const removeWhere = (table: string, where: Record<string, any>): Promise<number> =>
  db.removeWhere(table, where);
export const count = (table: string, where?: Record<string, any>): Promise<number> =>
  db.count(table, where);
export const searchProducts = (q: string, filters?: Record<string, any>): Promise<any[]> =>
  db.searchProducts(q, filters || {});
export { db };
