-- contractor-v004-demo D1 Schema
-- Run each statement individually (D1 does not support multi-statement batches)

CREATE TABLE IF NOT EXISTS site_content (
  section TEXT PRIMARY KEY,
  data TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS site_snapshot (
  id INTEGER PRIMARY KEY,
  html TEXT,
  published_at TEXT
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, email TEXT, phone TEXT, service TEXT, message TEXT,
  source TEXT, created_at TEXT, lead_section TEXT,
  status TEXT DEFAULT 'new',
  budget_range TEXT, timeline TEXT
);

CREATE TABLE IF NOT EXISTS callbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, phone TEXT, preferred_time TEXT, service TEXT, message TEXT,
  source TEXT, created_at TEXT, lead_section TEXT,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT, response TEXT, created_at TEXT
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE, title TEXT, summary TEXT, body TEXT,
  published INTEGER DEFAULT 0,
  hero_image_r2_key TEXT DEFAULT '',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS media_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  r2_key TEXT, filename TEXT, content_type TEXT, file_size INTEGER,
  alt_text TEXT, category TEXT, uploaded_at TEXT
);

CREATE TABLE IF NOT EXISTS knowledge_seeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT, body TEXT, category TEXT,
  embedded INTEGER DEFAULT 0,
  created_at TEXT, updated_at TEXT
);
