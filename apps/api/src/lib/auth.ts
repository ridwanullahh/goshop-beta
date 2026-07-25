import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getAll, getOne, getById, insert, update, remove, removeWhere, getDb, initializeSchema } from './database.js';
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

  const user = getById<any>('users', decoded.userId);
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
  if (!roles.some(r => userRoles.includes(r))) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
}

export function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

export { getAll, getOne, getById, insert, update, remove, removeWhere, getDb, initializeSchema };
