import { Hono } from 'hono';
import { getDb, saveDb } from '../db/schema.ts';
import { authMiddleware } from '../middleware/auth.ts';

const history = new Hono();
history.use('*', authMiddleware);

history.get('/', async (c) => {
  const userId = c.get('userId') as string;
  const limit = Number(c.req.query('limit')) || 50;
  const db = await getDb();

  const result = db.exec(
    'SELECT id, type, summary, data, created_at FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit],
  );

  const rows = result.length > 0 ? result[0]!.values : [];

  return c.json({
    history: rows.map(([id, type, summary, data, createdAt]) => ({
      id,
      type,
      summary,
      data: data ? JSON.parse(data as string) : null,
      createdAt,
    })),
  });
});

history.post('/', async (c) => {
  const userId = c.get('userId') as string;
  const body = await c.req.json<{
    id?: string;
    type: string;
    summary?: string;
    data?: unknown;
  }>();

  if (!body.type) {
    return c.json({ error: 'Type is required' }, 400);
  }

  const id = body.id || crypto.randomUUID();
  const db = await getDb();

  db.run('INSERT OR IGNORE INTO history (id, user_id, type, summary, data) VALUES (?, ?, ?, ?, ?)', [
    id,
    userId,
    body.type,
    body.summary ?? null,
    body.data ? JSON.stringify(body.data) : null,
  ]);

  saveDb();
  return c.json({ id }, 201);
});

history.post('/sync', async (c) => {
  const userId = c.get('userId') as string;
  const body = await c.req.json<{
    entries: Array<{
      id: string;
      type: string;
      summary?: string;
      data?: unknown;
      createdAt: string;
    }>;
  }>();

  const db = await getDb();

  for (const entry of body.entries) {
    db.run(
      'INSERT OR IGNORE INTO history (id, user_id, type, summary, data, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [entry.id, userId, entry.type, entry.summary ?? null, entry.data ? JSON.stringify(entry.data) : null, entry.createdAt],
    );
  }

  saveDb();
  return c.json({ synced: body.entries.length });
});

history.delete('/', async (c) => {
  const userId = c.get('userId') as string;
  const db = await getDb();
  db.run('DELETE FROM history WHERE user_id = ?', [userId]);
  saveDb();
  return c.json({ ok: true });
});

export default history;
