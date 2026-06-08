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

-- ============================================================
-- Content Gathering Hub — added 2026-06-07
-- ============================================================

-- Crew member media submissions (raw uploads awaiting admin curation)
CREATE TABLE IF NOT EXISTS content_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submitted_by TEXT,              -- crew member name or user ID
  raw_note TEXT,                  -- crew's quick caption note
  r2_key TEXT,                    -- R2 object key for uploaded media
  content_type TEXT,              -- image/* or video/*
  status TEXT DEFAULT 'pending',  -- pending | approved | rejected | posted
  ai_captions TEXT,               -- JSON array of 3 AI-suggested captions
  selected_caption TEXT,          -- caption chosen by admin at approval
  target_platforms TEXT,          -- JSON array: ["bluesky","instagram","tiktok","mastodon"]
  created_at TEXT,
  reviewed_at TEXT
);

-- Social post dispatch log (direct posts + guided preflight records)
CREATE TABLE IF NOT EXISTS social_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER,          -- FK → content_submissions.id
  platform TEXT,                  -- bluesky | mastodon | instagram_guided | tiktok_guided
  status TEXT,                    -- posted | guided_dispatched | failed
  post_url TEXT,                  -- returned permalink (Bluesky/Mastodon direct posts)
  caption_used TEXT,
  error_message TEXT,             -- populated on failure
  posted_at TEXT,
  FOREIGN KEY (submission_id) REFERENCES content_submissions(id)
);
