import { Hono } from 'hono';
import { getDb, saveDb } from '../db/schema.ts';
import { authMiddleware } from '../middleware/auth.ts';

const limits = new Hono();
limits.use('*', authMiddleware);

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

limits.get('/', async (c) => {
  const userId = c.get('userId') as string;
  const today = todayUTC();
  const db = await getDb();

  const result = db.exec('SELECT type FROM daily_limits WHERE user_id = ? AND used_date = ?', [userId, today]);

  const usedTypes = result.length > 0 ? result[0]!.values.map(([t]) => t as string) : [];
  return c.json({ date: today, usedTypes });
});

limits.post('/use', async (c) => {
  const userId = c.get('userId') as string;
  const body = await c.req.json<{ type: string }>();

  if (!body.type) {
    return c.json({ error: 'Type is required' }, 400);
  }

  const today = todayUTC();
  const db = await getDb();

  const existing = db.exec(
    'SELECT 1 FROM daily_limits WHERE user_id = ? AND type = ? AND used_date = ?',
    [userId, body.type, today],
  );

  if (existing.length > 0 && existing[0]!.values.length > 0) {
    return c.json({ error: 'Already used today' }, 429);
  }

  db.run('INSERT INTO daily_limits (user_id, type, used_date) VALUES (?, ?, ?)', [userId, body.type, today]);
  saveDb();

  return c.json({ ok: true });
});

export default limits;
