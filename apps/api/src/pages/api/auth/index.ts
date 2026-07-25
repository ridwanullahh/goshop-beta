import type { APIContext } from 'astro';
import { z } from 'zod';
import {
  hashPassword, verifyPassword, generateToken,
  getAll, getOne, getById, insert, update,
  jsonResponse, errorResponse
} from '../../lib/auth.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().optional().default('customer'),
  roles: z.array(z.string()).optional(),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  onboardingCompleted: z.boolean().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(context: APIContext): Promise<Response> {
  try {
    const body = await context.request.json();
    const { action, ...data } = body;

    if (action === 'register') {
      const parsed = registerSchema.parse(data);
      const existing = getOne('users', { email: parsed.email });
      if (existing) {
        return errorResponse('User already exists with this email', 409);
      }

      const passwordHash = await hashPassword(parsed.password);
      const user = insert('users', {
        email: parsed.email,
        passwordHash,
        name: parsed.name,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        role: parsed.role,
        roles: JSON.stringify(parsed.roles || [parsed.role]),
        businessName: parsed.businessName,
        phone: parsed.phone,
        onboardingCompleted: parsed.onboardingCompleted ? 1 : 0
      });

      const token = generateToken(user.id);
      const { passwordHash: _, ...safeUser } = user;

      return jsonResponse({ user: safeUser, token }, 201);
    }

    if (action === 'login') {
      const parsed = loginSchema.parse(data);
      const user = getOne<any>('users', { email: parsed.email });

      if (!user || !user.passwordHash) {
        return errorResponse('Invalid credentials', 401);
      }

      const isValid = await verifyPassword(parsed.password, user.passwordHash);
      if (!isValid) {
        return errorResponse('Invalid credentials', 401);
      }

      const token = generateToken(user.id);
      const { passwordHash: _, ...safeUser } = user;

      return jsonResponse({ user: safeUser, token });
    }

    if (action === 'logout') {
      return jsonResponse({ success: true });
    }

    return errorResponse('Invalid action. Use register, login, or logout.', 400);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid input: ' + error.errors.map(e => e.message).join(', '), 400);
    }
    console.error('Auth error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

export async function GET(context: APIContext): Promise<Response> {
  try {
    const authHeader = context.request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('No token provided', 401);
    }

    const { verifyToken } = await import('../../lib/auth.js');
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse('Invalid token', 401);
    }

    const user = getById<any>('users', decoded.userId);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const { passwordHash, ...safeUser } = user;
    return jsonResponse(safeUser);
  } catch (error: any) {
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
