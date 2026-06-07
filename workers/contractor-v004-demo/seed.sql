-- contractor-v004-demo D1 Seed
-- Minimal site_content seed — customize via /admin after deploy
-- Run each INSERT individually

INSERT OR IGNORE INTO site_content (section, data, updated_at) VALUES
  ('services', '[]', datetime('now'));

INSERT OR IGNORE INTO site_content (section, data, updated_at) VALUES
  ('projects', '[]', datetime('now'));

INSERT OR IGNORE INTO site_content (section, data, updated_at) VALUES
  ('reviews', '[]', datetime('now'));

INSERT OR IGNORE INTO site_content (section, data, updated_at) VALUES
  ('process', '[]', datetime('now'));

INSERT OR IGNORE INTO site_content (section, data, updated_at) VALUES
  ('contact', '{"phone":"(000) 000-0000","phone_url":"tel:+10000000000","license":"License #000000","company":"Your Company Name","tagline":"Licensed, Bonded & Insured","areas":"Your Service Area","hero_title":"Your Trusted Contractor","hero_sub":"Kitchens, bathrooms, ADUs and more.","hero_image_url":"","hero_image_r2_key":"","stat1_num":"0+","stat1_label":"Projects Completed","stat2_num":"0+","stat2_label":"Years in Business","stat3_num":"100%","stat3_label":"Licensed & Insured","stat4_num":"5 Stars","stat4_label":"Client Rating"}', datetime('now'));
