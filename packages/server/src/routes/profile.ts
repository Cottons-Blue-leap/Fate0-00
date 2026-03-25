import { Hono } from 'hono';
import { getDb, saveDb } from '../db/schema.ts';
import { authMiddleware } from '../middleware/auth.ts';

const profile = new Hono();
profile.use('*', authMiddleware);

profile.get('/', async (c) => {
  const userId = c.get('userId') as string;
  const db = await getDb();

  const result = db.exec(
    'SELECT name, birth_year, birth_month, birth_day, birth_hour, is_lunar, gender FROM profiles WHERE user_id = ?',
    [userId],
  );

  if (result.length === 0 || result[0]!.values.length === 0) {
    return c.json({ profile: null });
  }

  const [name, birthYear, birthMonth, birthDay, birthHour, isLunar, gender] = result[0]!.values[0]!;

  return c.json({
    profile: {
      name,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      isLunar: Boolean(isLunar),
      gender,
    },
  });
});

profile.put('/', async (c) => {
  const userId = c.get('userId') as string;
  const body = await c.req.json<{
    name: string;
    birthYear?: number;
    birthMonth?: number;
    birthDay?: number;
    birthHour?: number;
    isLunar?: boolean;
    gender?: string;
  }>();

  if (!body.name) {
    return c.json({ error: 'Name is required' }, 400);
  }

  const db = await getDb();

  // Check if profile exists
  const existing = db.exec('SELECT 1 FROM profiles WHERE user_id = ?', [userId]);

  if (existing.length > 0 && existing[0]!.values.length > 0) {
    db.run(
      `UPDATE profiles SET name=?, birth_year=?, birth_month=?, birth_day=?, birth_hour=?, is_lunar=?, gender=?, updated_at=datetime('now') WHERE user_id=?`,
      [
        body.name,
        body.birthYear ?? null,
        body.birthMonth ?? null,
        body.birthDay ?? null,
        body.birthHour ?? null,
        body.isLunar ? 1 : 0,
        body.gender ?? null,
        userId,
      ],
    );
  } else {
    db.run(
      `INSERT INTO profiles (user_id, name, birth_year, birth_month, birth_day, birth_hour, is_lunar, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        body.name,
        body.birthYear ?? null,
        body.birthMonth ?? null,
        body.birthDay ?? null,
        body.birthHour ?? null,
        body.isLunar ? 1 : 0,
        body.gender ?? null,
      ],
    );
  }

  saveDb();
  return c.json({ ok: true });
});

export default profile;
