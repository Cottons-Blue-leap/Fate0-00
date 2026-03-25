import initSqlJs, { type Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.resolve(DATA_DIR, 'fate0.db');

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  return db;
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export async function initDb(): Promise<void> {
  const db = await getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      device_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      name TEXT NOT NULL,
      birth_year INTEGER,
      birth_month INTEGER,
      birth_day INTEGER,
      birth_hour INTEGER,
      is_lunar INTEGER DEFAULT 0,
      gender TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      summary TEXT,
      data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_history_user ON history(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_history_date ON history(created_at)');

  db.run(`
    CREATE TABLE IF NOT EXISTS shared_readings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS daily_limits (
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      used_date TEXT NOT NULL,
      PRIMARY KEY (user_id, type, used_date)
    )
  `);

  saveDb();
}
