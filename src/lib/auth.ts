import CommerceSDK from './commerce-sdk';
import jwt from 'jsonwebtoken';
import { User } from './commerce-sdk';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function verifyAuth(req: Request): Promise<User> {
  const sdk = new CommerceSDK();
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    throw new Error('Unauthorized: No token provided.');
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await sdk.getUser(decoded.id);

    if (!user) {
      throw new Error('Unauthorized: Invalid user.');
    }

    return user;
  } catch (error) {
    throw new Error('Unauthorized: Invalid token.');
  }
}