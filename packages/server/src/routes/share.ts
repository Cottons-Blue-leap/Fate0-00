import { Hono } from 'hono';
import { getDb, saveDb } from '../db/schema.ts';
import { authMiddleware } from '../middleware/auth.ts';

const share = new Hono();

share.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;
  const body = await c.req.json<{
    type: string;
    data: unknown;
  }>();

  if (!body.type || !body.data) {
    return c.json({ error: 'Type and data are required' }, 400);
  }

  const id = crypto.randomUUID().slice(0, 8);
  const db = await getDb();

  db.run(
    "INSERT INTO shared_readings (id, user_id, type, data, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+30 days'))",
    [id, userId, body.type, JSON.stringify(body.data)],
  );

  saveDb();
  return c.json({ id, url: `/share/${id}` }, 201);
});

share.get('/:id', async (c) => {
  const { id } = c.req.param();
  const db = await getDb();

  const result = db.exec(
    "SELECT type, data, created_at FROM shared_readings WHERE id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))",
    [id],
  );

  if (result.length === 0 || result[0]!.values.length === 0) {
    return c.json({ error: 'Reading not found or expired' }, 404);
  }

  const [type, data, createdAt] = result[0]!.values[0]!;

  return c.json({
    type,
    data: JSON.parse(data as string),
    createdAt,
  });
});

export default share;
