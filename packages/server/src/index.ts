import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { initDb } from './db/schema.ts';
import auth from './routes/auth.ts';
import profile from './routes/profile.ts';
import history from './routes/history.ts';
import share from './routes/share.ts';
import limits from './routes/limits.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

await initDb();

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  }),
);

app.route('/api/auth', auth);
app.route('/api/profile', profile);
app.route('/api/history', history);
app.route('/api/share', share);
app.route('/api/limits', limits);

app.get('/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

const port = Number(process.env['PORT']) || 3001;

serve({ fetch: app.fetch, port }, () => {
  console.log(`Fate 0:00 API server running on http://localhost:${port}`);
});
