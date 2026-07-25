// Auth + shared response helpers + async DB helper re-exports.
// BismiLLAH Ar-Rahman Ar-Roheem. Uses the provider abstraction (Lightbase by default, SQLite via DB_PROVIDER).

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './provider/index';
import type { APIContext } from 'astro';

const JWT_SECRET = process.env.JWT_SECRET || 'goshop_jwt_secret_change_in_production_2024';
const TOKEN_EXPIRY = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(context: APIContext): Promise<any | null> {
  const authHeader = context.request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await db.getById<any>('users', decoded.userId);
  if (!user) return null;

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function requireAuth(context: APIContext): Promise<any> {
  const user = await getCurrentUser(context);
  if (!user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  return user;
}

export function requireRole(user: any, roles: string[]): void {
  const userRoles = user.roles || [user.role];
  const arr = Array.isArray(userRoles) ? userRoles : [userRoles];
  if (!roles.some((r) => arr.includes(r))) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
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
