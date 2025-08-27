import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const dbPath = process.env.DB_PATH || './data/pg.db';
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const db = new Database(dbPath);

// Create table if not exists
export function ensureSchema() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      room TEXT,
      join_date TEXT,
      fee_due INTEGER DEFAULT 0,
      notes TEXT
    )
  `).run();
}
