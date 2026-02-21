import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.DATA_DIR || './data';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'kvault.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  image_path TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS idols (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  profile_image_path TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS idol_groups (
  idol_id INTEGER REFERENCES idols(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (idol_id, group_id)
);

CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  filename TEXT NOT NULL,
  original_name TEXT,
  mime_type TEXT,
  size INTEGER,
  upload_date TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS photo_groups (
  photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, group_id)
);

CREATE TABLE IF NOT EXISTS photo_idols (
  photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
  idol_id INTEGER REFERENCES idols(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, idol_id)
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS photo_tags (
  photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);
`);

export default db;
