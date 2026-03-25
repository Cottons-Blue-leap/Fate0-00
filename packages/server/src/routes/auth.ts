import { Hono } from 'hono';
import { getDb, saveDb } from '../db/schema.ts';
import { createToken } from '../middleware/auth.ts';
import { hashPassword, verifyPassword } from '../middleware/crypto.ts';

const auth = new Hono();

function generateId(): string {
  return crypto.randomUUID();
}

auth.post('/register', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }
  if (password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400);
  }

  const db = await getDb();
  const existing = db.exec('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0 && existing[0]!.values.length > 0) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  const id = generateId();
  const passwordHash = await hashPassword(password);

  db.run('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [id, email, passwordHash]);
  saveDb();

  const token = await createToken(id);
  return c.json({ token, userId: id }, 201);
});

auth.post('/login', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  const db = await getDb();
  const result = db.exec('SELECT id, password_hash FROM users WHERE email = ?', [email]);

  if (result.length === 0 || result[0]!.values.length === 0) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const [userId, passwordHash] = result[0]!.values[0]! as [string, string];
  const valid = await verifyPassword(password, passwordHash);
  if (!valid) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const token = await createToken(userId);
  return c.json({ token, userId });
});

auth.post('/device', async (c) => {
  const body = await c.req.json<{ deviceId: string }>();
  const { deviceId } = body;

  if (!deviceId) {
    return c.json({ error: 'Device ID required' }, 400);
  }

  const db = await getDb();
  const result = db.exec('SELECT id FROM users WHERE device_id = ?', [deviceId]);

  let userId: string;
  if (result.length === 0 || result[0]!.values.length === 0) {
    userId = generateId();
    db.run('INSERT INTO users (id, device_id, password_hash) VALUES (?, ?, ?)', [userId, deviceId, '']);
    saveDb();
  } else {
    userId = result[0]!.values[0]![0] as string;
  }

  const token = await createToken(userId);
  return c.json({ token, userId });
});

export default auth;
