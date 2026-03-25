import type { Context, Next } from 'hono';

const JWT_SECRET = process.env['JWT_SECRET'] || 'fate0-dev-secret-change-in-production';

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function base64UrlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString();
}

async function hmacSign(data: string): Promise<string> {
  const { createHmac } = await import('crypto');
  return createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
}

export async function createToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({
    sub: userId,
    iat: now,
    exp: now + 60 * 60 * 24 * 30, // 30 days
  }));
  const signature = await hmacSign(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expected = await hmacSign(`${header}.${payload}`);
  if (signature !== expected) return null;

  const decoded: JwtPayload = JSON.parse(base64UrlDecode(payload!));
  if (decoded.exp < Math.floor(Date.now() / 1000)) return null;

  return decoded;
}

export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  c.set('userId', payload.sub);
  await next();
}
