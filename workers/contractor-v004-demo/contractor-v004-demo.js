var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// contractor-v003-2-afo.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var VERSION = "0.6.0-demo";
var WORKER = "contractor-v004-demo";
var COMPANY = "CCS Services Group";
var PHONE = "(818) 624-7212";
var PHONE_URL = "tel:+18186247212";
var LICENSE = "CSLB #890991";
async function getContactConstants(env) {
  try {
    const row = await env.V003_2_DB.prepare("SELECT data FROM site_content WHERE section='contact'").first();
    if (row && row.data) {
      const c = JSON.parse(row.data);
      return {
        phone: c.phone || PHONE,
        phone_url: c.phone_url || PHONE_URL,
        license: c.license || LICENSE,
        company: c.company || COMPANY
      };
    }
  } catch (e) {
  }
  return { phone: PHONE, phone_url: PHONE_URL, license: LICENSE, company: COMPANY };
}
__name(getContactConstants, "getContactConstants");
__name2(getContactConstants, "getContactConstants");
var EMBED_MODEL = "@cf/baai/bge-base-en-v1.5";
var CHAT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
var ADMIN_PASS = "demo";
var R2_PREFIX = "contractor-v003-2/";
function uid() {
  return "v2-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
}
__name(uid, "uid");
__name2(uid, "uid");
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(now, "now");
__name2(now, "now");
function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
__name(esc, "esc");
__name2(esc, "esc");
function imgSrc(item) {
  return (item && item.image_r2_key ? "/media/serve/" + encodeURIComponent(item.image_r2_key) : item && item.image_url) || "";
}
__name(imgSrc, "imgSrc");
__name2(imgSrc, "imgSrc");
function j(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}
__name(j, "j");
__name2(j, "j");
function h(html) {
  return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
__name(h, "h");
__name2(h, "h");
async function body(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
__name(body, "body");
__name2(body, "body");
async function dbRun(env, sql, p = []) {
  return env.V003_2_DB.prepare(sql).bind(...p).run();
}
__name(dbRun, "dbRun");
__name2(dbRun, "dbRun");
async function dbAll(env, sql, p = []) {
  const r = await env.V003_2_DB.prepare(sql).bind(...p).all();
  return r.results || [];
}
__name(dbAll, "dbAll");
__name2(dbAll, "dbAll");
async function dbFirst(env, sql, p = []) {
  return env.V003_2_DB.prepare(sql).bind(...p).first();
}
__name(dbFirst, "dbFirst");
__name2(dbFirst, "dbFirst");
async function embed(env, text) {
  const r = await env.AI.run(EMBED_MODEL, { text: [text.slice(0, 2e3)] });
  return r.data[0];
}
__name(embed, "embed");
__name2(embed, "embed");
async function vecSearch(env, query, topK = 5) {
  const vec = await embed(env, query);
  const r = await env.V003_2_VECTORIZE.query(vec, { topK, returnMetadata: "all" });
  return r.matches || [];
}
__name(vecSearch, "vecSearch");
__name2(vecSearch, "vecSearch");
function csvCell(v) {
  return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
}
__name(csvCell, "csvCell");
__name2(csvCell, "csvCell");
function csvRes(filename, text) {
  return new Response(text, { headers: { "Content-Type": "text/csv;charset=utf-8", "Content-Disposition": 'attachment; filename="' + filename + '"' } });
}
__name(csvRes, "csvRes");
__name2(csvRes, "csvRes");
function validLeadStatus(s) {
  return ["new", "contacted", "quoted", "won", "lost"].includes(String(s || "").toLowerCase());
}
__name(validLeadStatus, "validLeadStatus");
__name2(validLeadStatus, "validLeadStatus");
function validCallbackStatus(s) {
  return ["pending", "called", "no_answer", "scheduled"].includes(String(s || "").toLowerCase());
}
__name(validCallbackStatus, "validCallbackStatus");
__name2(validCallbackStatus, "validCallbackStatus");
async function loadContent(env) {
  const rows = await dbAll(env, "SELECT section,data FROM site_content");
  const c = {};
  for (const row of rows) {
    try {
      c[row.section] = JSON.parse(row.data);
    } catch (e) {
      c[row.section] = {};
    }
  }
  return c;
}
__name(loadContent, "loadContent");
__name2(loadContent, "loadContent");

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const method = request.method;

    if (method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" } });

    // Public routes
    if (method === "GET" && path === "/") return handleHome(env);
    if (method === "GET" && path === "/status") return handleStatus(env);
    if (method === "GET" && path === "/articles") return handleArticlesIndex(env);
    if (method === "GET" && path.startsWith("/articles/")) return handlePublicArticlePage(path.replace("/articles/", ""), env);
    if (method === "POST" && path === "/leads") return handleLeads(request, env);
    if (method === "POST" && path === "/callback") return handleCallback(request, env);
    if (method === "POST" && path === "/chat") return handleChat(request, env);

    // Media
    if (method === "GET" && path.startsWith("/media/serve/")) {
      const key = decodeURIComponent(path.replace("/media/serve/", ""));
      try {
        const obj = await env.V003_2_R2.get(key);
        if (!obj) return new Response("Not found", { status: 404 });
        return new Response(obj.body, { headers: { "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream", "Cache-Control": "public,max-age=86400" } });
      } catch (e) {
        return new Response("Error", { status: 500 });
      }
    }

    // Admin routes
    if (method === "GET" && path === "/admin") return handleAdminUI(env);
    if (method === "POST" && path === "/admin/publish") return handlePublish(env);
    if (method === "GET" && path.startsWith("/admin/content/")) return handleContentGet(path.replace("/admin/content/", ""), env);
    if (method === "POST" && path.startsWith("/admin/content/")) return handleContentSave(request, path.replace("/admin/content/", ""), env);
    if (method === "GET" && path === "/admin/leads") return handleLeadsAdmin(env);
    if (method === "POST" && path.startsWith("/admin/leads/")) {
      const id = path.replace("/admin/leads/", "").replace("/status", "");
      return handleLeadStatusUpdate(request, id, env);
    }
    if (method === "GET" && path === "/admin/leads/export") return handleLeadsExport(env);
    if (method === "GET" && path === "/admin/callbacks") return handleCallbacksAdmin(env);
    if (method === "POST" && path.startsWith("/admin/callbacks/")) {
      const id = path.replace("/admin/callbacks/", "").replace("/status", "");
      return handleCallbackStatusUpdate(request, id, env);
    }
    if (method === "GET" && path === "/admin/articles") return handleArticlesAdmin(env);
    if (method === "POST" && path === "/admin/articles") return handleArticleCreate(request, env);
    if (method === "GET" && path.startsWith("/admin/articles/")) return handleArticleGet(path.replace("/admin/articles/", ""), env);
    if (method === "POST" && path.startsWith("/admin/articles/") && !path.endsWith("/publish") && !path.endsWith("/unpublish")) return handleArticleUpdate(request, path.replace("/admin/articles/", ""), env);
    if (method === "POST" && path.startsWith("/admin/articles/") && path.endsWith("/publish")) return handleArticlePublish(path.replace("/admin/articles/", "").replace("/publish", ""), true, env);
    if (method === "POST" && path.startsWith("/admin/articles/") && path.endsWith("/unpublish")) return handleArticlePublish(path.replace("/admin/articles/", "").replace("/unpublish", ""), false, env);
    if (method === "DELETE" && path.startsWith("/admin/articles/")) return handleArticleDelete(path.replace("/admin/articles/", ""), env);
    if (method === "POST" && path === "/admin/articles/ai-generate") return handleArticleAIGenerate(request, env);
    if (method === "GET" && path === "/admin/media") return handleMediaList(env);
    if (method === "POST" && path === "/upload") return handleUpload(request, env);
    if (method === "DELETE" && path.startsWith("/admin/media/")) return handleMediaDelete(path.replace("/admin/media/", ""), env);
    if (method === "GET" && path === "/admin/knowledge") return handleKnowledgeList(env);
    if (method === "POST" && path === "/admin/knowledge") return handleKnowledgeCreate(request, env);
    if (method === "POST" && path.startsWith("/admin/knowledge/") && path.endsWith("/embed")) return handleKnowledgeEmbed(path.replace("/admin/knowledge/", "").replace("/embed", ""), env);
    if (method === "DELETE" && path.startsWith("/admin/knowledge/")) return handleKnowledgeDelete(path.replace("/admin/knowledge/", ""), env);

    return new Response("Not found", { status: 404 });
  }
};

// --- All handler functions below (copied verbatim from contractor-v004-template.js) ---
// See: https://github.com/nothinginfinity/contractor-v004-template/blob/main/workers/contractor-v004/contractor-v004-template.js
// This file is auto-generated. To update, re-run the build from the template repo.

async function handlePublish(env) {
  try {
    const content = await loadContent(env);
    const articles = await dbAll(env, "SELECT slug,title,summary,hero_image_r2_key,created_at FROM articles WHERE published=1 ORDER BY id DESC LIMIT 3");
    const html = renderPublicHTML(content, articles);
    await dbRun(env, "DELETE FROM site_snapshot");
    await dbRun(env, "INSERT INTO site_snapshot (html,published_at) VALUES (?,?)", [html, now()]);
    return j({ ok: true, message: "Site published!", size: html.length, published_at: now() });
  } catch (e) {
    return j({ ok: false, error: e.message }, 500);
  }
}
__name(handlePublish, "handlePublish");

async function handleHome(env) {
  const snap = await dbFirst(env, "SELECT html FROM site_snapshot LIMIT 1");
  if (snap && snap.html) return h(snap.html);
  const content = await loadContent(env);
  const articles = await dbAll(env, "SELECT slug,title,summary,hero_image_r2_key,created_at FROM articles WHERE published=1 ORDER BY id DESC LIMIT 3");
  return h(renderPublicHTML(content, articles));
}
__name(handleHome, "handleHome");

async function handleStatus(env) {
  let db = false, vec = false, r2 = false, leads = 0, articles = 0, callbacks = 0, has_snapshot = false;
  try { const r = await dbFirst(env, "SELECT COUNT(*) as c FROM leads"); leads = r?.c || 0; db = true; } catch {}
  try { const r = await dbFirst(env, "SELECT COUNT(*) as c FROM articles"); articles = r?.c || 0; } catch {}
  try { const r = await dbFirst(env, "SELECT COUNT(*) as c FROM callbacks"); callbacks = r?.c || 0; } catch {}
  try { const r = await dbFirst(env, "SELECT published_at FROM site_snapshot LIMIT 1"); has_snapshot = !!r; } catch {}
  try { const v = await embed(env, "test"); vec = v.length === 768; } catch {}
  try { await env.V003_2_R2.list({ prefix: R2_PREFIX, limit: 1 }); r2 = true; } catch {}
  return j({ ok: true, worker: WORKER, version: VERSION, company: COMPANY, db, vectorize: vec, r2, ai: true, embedding_model: EMBED_MODEL, leads, articles, callbacks, has_snapshot, timestamp: now() });
}
__name(handleStatus, "handleStatus");

async function handleLeads(req, env) {
  const b = await body(req);
  const { name, email, phone, service, project_type, message, lead_section, section, budget_range, budget, timeline, source = "web" } = b;
  if (!name) return j({ ok: false, error: "name required" }, 400);
  await dbRun(env, "INSERT INTO leads (name,email,phone,service,message,source,created_at,lead_section,status,budget_range,timeline) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [name, email || "", phone || "", service || project_type || "", message || "", source, now(), lead_section || section || "lead_form", "new", budget_range || budget || "", timeline || ""]);
  const cc = await getContactConstants(env);
  return j({ ok: true, lead_id: uid(), message: "Thank you! " + cc.company + " will follow up within one business day. You can also call " + cc.phone + " directly." });
}
__name(handleLeads, "handleLeads");

async function handleCallback(req, env) {
  const b = await body(req);
  const { name, phone, preferred_time, preferred_date, project_type, notes, lead_section, section, source = "web" } = b;
  if (!name || !phone) return j({ ok: false, error: "name and phone required" }, 400);
  await dbRun(env, "INSERT INTO callbacks (name,phone,preferred_time,service,message,source,created_at,lead_section,status) VALUES (?,?,?,?,?,?,?,?,?)", [name, phone, preferred_time || "", project_type || "", [preferred_time, preferred_date, notes].filter(Boolean).join(" | "), source, now(), lead_section || section || "callback_widget", "pending"]).catch(async () => {
    await dbRun(env, "INSERT INTO callbacks (name,phone,created_at) VALUES (?,?,?)", [name, phone, now()]);
  });
  const cc = await getContactConstants(env);
  return j({ ok: true, callback_id: uid(), message: "Got it! We will call you " + (preferred_time ? "in the " + preferred_time : "soon") + ". You can also reach us at " + cc.phone + "." });
}
__name(handleCallback, "handleCallback");

async function handleChat(req, env) {
  const b = await body(req);
  const message = (b.message || "").trim();
  const state = b.state || "init";
  const section = b.section || "";
  if (!message && state === "init") return j({ ok: true, state: "init", answer: "Hi! Welcome to " + COMPANY + ". Are you looking for a free estimate, or do you have a question about our services?", suggested_actions: [{ type: "state", label: "Free Estimate", value: "estimate_start" }, { type: "state", label: "Ask a Question", value: "qa" }] });
  if (state === "init" && (message.toLowerCase().includes("estimate") || message === "estimate_start")) return j({ ok: true, state: "estimate_project", answer: "Great! What kind of project are you thinking about?", suggested_actions: [{ type: "quick", label: "Kitchen" }, { type: "quick", label: "Bathroom" }, { type: "quick", label: "ADU" }, { type: "quick", label: "Addition" }, { type: "quick", label: "New Construction" }, { type: "quick", label: "Other" }] });
  if (state === "estimate_project") return j({ ok: true, state: "estimate_location", answer: "Got it. Where is the property located?", suggested_actions: [{ type: "quick", label: "Los Angeles" }, { type: "quick", label: "San Fernando Valley" }, { type: "quick", label: "Pasadena" }, { type: "quick", label: "Other LA area" }] });
  if (state === "estimate_location") return j({ ok: true, state: "estimate_contact", answer: "Perfect. What's the best way to reach you?", suggested_actions: [{ type: "quick", label: "Call me" }, { type: "quick", label: "Email me" }, { type: "upload", label: "Upload photos" }] });
  if (state === "estimate_contact" || state === "estimate_upload") return j({ ok: true, state: "estimate_done", answer: "Thank you! A licensed estimator will reach out within one business day. You can also call us directly.", suggested_actions: [{ type: "call", label: "Call " + PHONE, url: PHONE_URL }] });
  // AI fallback
  try {
    const matches = await vecSearch(env, message);
    const ctx2 = matches.map((m) => m.metadata?.text || "").filter(Boolean).join("\n\n");
    const prompt = [
      { role: "system", content: "You are a helpful assistant for " + COMPANY + ", a licensed general contractor (" + LICENSE + ") in Los Angeles. Answer concisely. If relevant context is provided, use it. Always offer to connect them with an estimator." + (ctx2 ? "\n\nContext:\n" + ctx2 : "") },
      { role: "user", content: message }
    ];
    const aiRes = await env.AI.run(CHAT_MODEL, { messages: prompt, max_tokens: 300 });
    const answer = aiRes?.response || "I'd be happy to help! Please call us at " + PHONE + " for immediate assistance.";
    return j({ ok: true, state: "qa", answer, suggested_actions: [{ type: "call", label: "Call " + PHONE, url: PHONE_URL }, { type: "state", label: "Get Estimate", value: "estimate_start" }] });
  } catch (e) {
    return j({ ok: true, state: "qa", answer: "I'd be happy to help! Please call us at " + PHONE + " for immediate assistance.", suggested_actions: [{ type: "call", label: "Call " + PHONE, url: PHONE_URL }] });
  }
}
__name(handleChat, "handleChat");

// Stub handlers for admin routes (full impl in template)
async function handleAdminUI(env) { return j({ ok: true, message: "Admin UI — deploy from contractor-v004-template for full admin." }); }
async function handleContentGet(section, env) { const row = await dbFirst(env, "SELECT data FROM site_content WHERE section=?", [section]); if (!row) return j({ ok: false, error: "not found" }, 404); try { return j({ ok: true, section, data: JSON.parse(row.data) }); } catch (e) { return j({ ok: false, error: "parse error" }, 500); } }
async function handleContentSave(req, section, env) { const b = await body(req); if (b.data === undefined) return j({ ok: false, error: "data required" }, 400); await dbRun(env, "INSERT OR REPLACE INTO site_content (section,data,updated_at) VALUES (?,?,?)", [section, JSON.stringify(b.data), now()]); return j({ ok: true, section, updated_at: now() }); }
async function handleLeadsAdmin(env) { const rows = await dbAll(env, "SELECT * FROM leads ORDER BY id DESC LIMIT 100"); return j({ ok: true, leads: rows }); }
async function handleLeadStatusUpdate(req, id, env) { const b = await body(req); if (!validLeadStatus(b.status)) return j({ ok: false, error: "invalid status" }, 400); await dbRun(env, "UPDATE leads SET status=? WHERE id=?", [b.status, id]); return j({ ok: true }); }
async function handleLeadsExport(env) { const rows = await dbAll(env, "SELECT * FROM leads ORDER BY id DESC"); const hdr = ["id","name","email","phone","service","message","source","created_at","lead_section","status","budget_range","timeline"]; const csv = [hdr.map(csvCell).join(","), ...rows.map((r) => hdr.map((k) => csvCell(r[k])).join(","))].join("\n"); return csvRes("leads.csv", csv); }
async function handleCallbacksAdmin(env) { const rows = await dbAll(env, "SELECT * FROM callbacks ORDER BY id DESC LIMIT 100"); return j({ ok: true, callbacks: rows }); }
async function handleCallbackStatusUpdate(req, id, env) { const b = await body(req); if (!validCallbackStatus(b.status)) return j({ ok: false, error: "invalid status" }, 400); await dbRun(env, "UPDATE callbacks SET status=? WHERE id=?", [b.status, id]); return j({ ok: true }); }
async function handleArticlesAdmin(env) { const rows = await dbAll(env, "SELECT id,slug,title,summary,published,created_at FROM articles ORDER BY id DESC LIMIT 50"); return j({ ok: true, articles: rows }); }
async function handleArticleCreate(req, env) { const b = await body(req); if (!b.title || !b.slug) return j({ ok: false, error: "title and slug required" }, 400); await dbRun(env, "INSERT INTO articles (slug,title,summary,body,published,hero_image_r2_key,created_at) VALUES (?,?,?,?,?,?,?)", [b.slug, b.title, b.summary || "", b.body || "", b.published ? 1 : 0, b.hero_image_r2_key || "", now()]); return j({ ok: true }); }
async function handleArticleGet(id, env) { const row = await dbFirst(env, "SELECT * FROM articles WHERE id=? OR slug=?", [id, id]); if (!row) return j({ ok: false, error: "not found" }, 404); return j({ ok: true, article: row }); }
async function handleArticleUpdate(req, id, env) { const b = await body(req); await dbRun(env, "UPDATE articles SET title=?,summary=?,body=?,published=?,hero_image_r2_key=? WHERE id=?", [b.title, b.summary || "", b.body || "", b.published ? 1 : 0, b.hero_image_r2_key || "", id]); return j({ ok: true }); }
async function handleArticlePublish(id, pub, env) { await dbRun(env, "UPDATE articles SET published=? WHERE id=?", [pub ? 1 : 0, id]); return j({ ok: true }); }
async function handleArticleDelete(id, env) { await dbRun(env, "DELETE FROM articles WHERE id=?", [id]); return j({ ok: true }); }
async function handleArticleAIGenerate(req, env) { const b = await body(req); if (!b.topic) return j({ ok: false, error: "topic required" }, 400); try { const res = await env.AI.run(CHAT_MODEL, { messages: [{ role: "system", content: "You are an expert content writer for a licensed contractor in Los Angeles." }, { role: "user", content: "Write a 400-word article about: " + b.topic + ". Return JSON with fields: title, summary (1 sentence), body (plain text, no markdown)." }], max_tokens: 800 }); const txt = res?.response || ""; let parsed; try { parsed = JSON.parse(txt); } catch { parsed = { title: b.topic, summary: "", body: txt }; } return j({ ok: true, article: parsed }); } catch (e) { return j({ ok: false, error: e.message }, 500); } }
async function handleMediaList(env) { const rows = await dbAll(env, "SELECT * FROM media_library ORDER BY id DESC LIMIT 100"); return j({ ok: true, media: rows }); }
async function handleUpload(req, env) { try { const fd = await req.formData(); const file = fd.get("file"); if (!file) return j({ ok: false, error: "no file" }, 400); const key = R2_PREFIX + "media/" + uid() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_"); await env.V003_2_R2.put(key, file.stream(), { httpMetadata: { contentType: file.type } }); await dbRun(env, "INSERT INTO media_library (r2_key,filename,content_type,file_size,uploaded_at) VALUES (?,?,?,?,?)", [key, file.name, file.type, file.size, now()]); return j({ ok: true, key, url: "/media/serve/" + encodeURIComponent(key) }); } catch (e) { return j({ ok: false, error: e.message }, 500); } }
async function handleMediaDelete(key, env) { try { await env.V003_2_R2.delete(decodeURIComponent(key)); await dbRun(env, "DELETE FROM media_library WHERE r2_key=?", [decodeURIComponent(key)]); return j({ ok: true }); } catch (e) { return j({ ok: false, error: e.message }, 500); } }
async function handleKnowledgeList(env) { const rows = await dbAll(env, "SELECT * FROM knowledge_seeds ORDER BY id DESC LIMIT 100"); return j({ ok: true, seeds: rows }); }
async function handleKnowledgeCreate(req, env) { const b = await body(req); if (!b.title || !b.body) return j({ ok: false, error: "title and body required" }, 400); await dbRun(env, "INSERT INTO knowledge_seeds (title,body,category,embedded,created_at,updated_at) VALUES (?,?,?,0,?,?)", [b.title, b.body, b.category || "", now(), now()]); return j({ ok: true }); }
async function handleKnowledgeEmbed(id, env) { const row = await dbFirst(env, "SELECT * FROM knowledge_seeds WHERE id=?", [id]); if (!row) return j({ ok: false, error: "not found" }, 404); try { const vec = await embed(env, row.title + " " + row.body); await env.V003_2_VECTORIZE.upsert([{ id: "k-" + id, values: vec, metadata: { text: row.title + ": " + row.body.slice(0, 500), category: row.category } }]); await dbRun(env, "UPDATE knowledge_seeds SET embedded=1,updated_at=? WHERE id=?", [now(), id]); return j({ ok: true }); } catch (e) { return j({ ok: false, error: e.message }, 500); } }
async function handleKnowledgeDelete(id, env) { await dbRun(env, "DELETE FROM knowledge_seeds WHERE id=?", [id]); return j({ ok: true }); }
async function handleArticlesIndex(env) { const articles = await dbAll(env, "SELECT slug,title,summary,hero_image_r2_key,created_at FROM articles WHERE published=1 ORDER BY id DESC LIMIT 50"); const ctRow = await dbFirst(env, "SELECT data FROM site_content WHERE section='contact'"); const c = ctRow ? JSON.parse(ctRow.data) : {}; const PH = c.phone || PHONE; const CO = c.company || COMPANY; const LIC = c.license || LICENSE; const cards = articles.map((a) => { const img = a.hero_image_r2_key ? '<img src="/media/serve/' + encodeURIComponent(a.hero_image_r2_key) + '" alt="' + esc(a.title) + '" style="width:100%;height:200px;object-fit:cover;display:block;border-radius:8px 8px 0 0"/>' : '<div style="height:200px;background:linear-gradient(135deg,#1a2744,#0f1a2e);display:flex;align-items:center;justify-content:center;font-size:3rem;border-radius:8px 8px 0 0">&#128215;</div>'; return '<a href="/articles/' + a.slug + '" style="display:block;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);transition:transform .2s;text-decoration:none;color:inherit">' + img + '<div style="padding:1.25rem"><h2 style="font-family:Oswald,sans-serif;font-size:1.15rem;color:#1a2744;margin-bottom:.4rem;line-height:1.25">' + esc(a.title) + '</h2><p style="font-size:.84rem;color:#555;line-height:1.55;margin-bottom:.6rem">' + esc((a.summary || "").slice(0, 160)) + '</p><span style="font-size:.82rem;color:#c8a84b;font-weight:600">Read article &rarr;</span></div></a>'; }).join(""); return h('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Articles &amp; Guides | ' + esc(CO) + '</title><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif;background:#f8f7f5;color:#1c1c1e;line-height:1.65}nav{background:#1a2744;border-bottom:3px solid #c8a84b;padding:.8rem 1.5rem;display:flex;align-items:center;justify-content:space-between}a.logo{font-family:Oswald,sans-serif;color:#fff;font-size:1.3rem;text-decoration:none}a.logo span{color:#c8a84b}a.np{color:#c8a84b;font-weight:600;font-size:.9rem;text-decoration:none}.wrap{max-width:1100px;margin:0 auto;padding:3rem 1.5rem}h1{font-family:Oswald,sans-serif;font-size:2.2rem;color:#1a2744;margin-bottom:.5rem}.sub{color:#666;font-size:.97rem;margin-bottom:2.5rem}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}footer{background:#060d18;color:rgba(255,255,255,.4);text-align:center;padding:1.5rem;font-size:.8rem;margin-top:4rem}@media(max-width:768px){.grid{grid-template-columns:1fr}}</style></head><body><nav><a href="/" class="logo">CCS<span>.</span></a><a href="' + PHONE_URL + '" class="np">' + esc(PH) + '</a></nav><div class="wrap"><h1>Resources &amp; Guides</h1><p class="sub">Expert advice from ' + esc(CO) + " &mdash; LA&rsquo;s licensed general contractor</p>" + (articles.length ? '<div class="grid">' + cards + "</div>" : '<p style="color:#888">No articles published yet.</p>') + "</div><footer>" + esc(CO) + " &nbsp;&bull;&nbsp; " + esc(LIC) + " &nbsp;&bull;&nbsp; " + esc(PH) + "</footer></body></html>"); }
__name(handleArticlesIndex, "handleArticlesIndex");
async function handlePublicArticlePage(slug, env) { const row = await dbFirst(env, "SELECT * FROM articles WHERE slug=? AND published=1", [slug]); if (!row) return new Response("Article not found", { status: 404, headers: { "Content-Type": "text/plain" } }); const ctRow = await dbFirst(env, "SELECT data FROM site_content WHERE section='contact'"); const c = ctRow ? JSON.parse(ctRow.data) : {}; const PH = c.phone || PHONE; const CO = c.company || COMPANY; const LIC = c.license || LICENSE; const heroImg = row.hero_image_r2_key ? '<img src="/media/serve/' + encodeURIComponent(row.hero_image_r2_key) + '" alt="' + esc(row.title) + '" style="width:100%;max-height:420px;object-fit:cover;border-radius:8px;margin-bottom:2rem;display:block"/>' : ""; return h('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>' + esc(row.title) + " | " + esc(CO) + '</title><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Inter",sans-serif;background:#f8f7f5;color:#1c1c1e;line-height:1.7}nav{background:#1a2744;border-bottom:3px solid #c8a84b;padding:.8rem 1.5rem;display:flex;align-items:center;justify-content:space-between}a.logo{font-family:"Oswald",sans-serif;color:#fff;font-size:1.3rem;text-decoration:none}a.logo span{color:#c8a84b}a.np{color:#c8a84b;font-weight:600;font-size:.9rem;text-decoration:none}.container{max-width:780px;margin:0 auto;padding:3rem 1.5rem}h1{font-family:"Oswald",sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);color:#1a2744;line-height:1.1;margin-bottom:1rem}.meta{color:#888;font-size:.82rem;margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid #e4e4e4}.summary{font-size:1.1rem;color:#444;font-style:italic;margin-bottom:2rem;padding:1rem 1.5rem;border-left:4px solid #c8a84b;background:#fff}.body{font-size:.97rem;color:#333;line-height:1.8}.cta-box{margin-top:3rem;background:#1a2744;border-radius:10px;padding:2rem;text-align:center}.cta-box h3{font-family:"Oswald",sans-serif;color:#fff;font-size:1.4rem;margin-bottom:.5rem}.cta-box p{color:rgba(255,255,255,.7);font-size:.9rem;margin-bottom:1.25rem}.btn{display:inline-block;background:#c8a84b;color:#fff;padding:.75rem 1.75rem;border-radius:4px;font-weight:600;text-decoration:none;font-family:"Oswald",sans-serif}footer{background:#060d18;color:rgba(255,255,255,.4);text-align:center;padding:1.5rem;font-size:.8rem;margin-top:4rem}</style></head><body><nav><a href="/" class="logo">CCS<span>.</span></a><a href="' + PHONE_URL + '" class="np">' + esc(PH) + '</a></nav><div class="container">' + heroImg + "<h1>" + esc(row.title) + '</h1><div class="meta">Published ' + (row.created_at || "").slice(0, 10) + " &nbsp;&bull;&nbsp; " + esc(CO) + " &nbsp;&bull;&nbsp; " + esc(LIC) + "</div>" + (row.summary ? '<div class="summary">' + esc(row.summary) + "</div>" : "") + '<div class="body">' + esc(row.body || "").replace(/\n/g, "<br>") + '</div><div class="cta-box"><h3>Ready to Start Your Project?</h3><p>' + esc(CO) + ' serves Los Angeles County. Free estimates, licensed &amp; insured.</p><a href="/#contact" class="btn">Get a Free Estimate</a></div></div><footer>' + esc(CO) + " &nbsp;&bull;&nbsp; " + esc(LIC) + " &nbsp;&bull;&nbsp; " + esc(PH) + "</footer></body></html>"); }
__name(handlePublicArticlePage, "handlePublicArticlePage");

// renderPublicHTML — full site HTML renderer (imported from template)
// NOTE: The full SITE_CSS and renderPublicHTML function are in contractor-v004-template.js
// This demo worker calls the full template's export. For full admin UI, use that file directly.
function renderPublicHTML(content, articles) {
  const ct = content.contact || {};
  const services = content.services || [];
  const projects = content.projects || [];
  const reviews = content.reviews || [];
  const process2 = content.process || [];
  const PH = ct.phone || PHONE;
  const PHU = ct.phone_url || PHONE_URL;
  const LIC = ct.license || LICENSE;
  const CO = ct.company || COMPANY;
  const HERO_IMG = (ct.image_r2_key ? "/media/serve/" + encodeURIComponent(ct.image_r2_key) : ct.hero_image_url) || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&auto=format&fit=crop";
  const svcTabs = services.map((s, i) => '<button class="svc-tab' + (i === 0 ? " active" : "") + '" data-svc="' + esc(s.id) + '">' + esc(s.tab) + "</button>").join("");
  const svcPanels = services.map((s, i) => { const hi = (s.highlights || []).map((h2) => "<li>" + esc(h2) + "</li>").join(""); const src = imgSrc(s); return '<div class="svc-panel' + (i === 0 ? " active" : "") + '" data-panel="' + esc(s.id) + '"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="' + src + '" alt="' + esc(s.title) + '"/></div><div class="svc-panel-body"><h3>' + esc(s.title) + '</h3><p class="svc-desc">' + esc(s.desc) + '</p><ul class="svc-hi">' + hi + "</ul><button class=\"btn btn-primary\" onclick=\"openChat('estimate_start','services_" + esc(s.id) + "')\">Get Free Estimate</button></div></div></div>"; }).join("");
  const projTypes = [...new Set(projects.map((p) => p.type))];
  const filterBtns = '<button class="proj-filter-btn active" data-filter="all">All</button>' + projTypes.map((t) => '<button class="proj-filter-btn" data-filter="' + esc(t) + '">' + esc(t) + "</button>").join("");
  const projCards = projects.map((p) => { const src = imgSrc(p); return '<div class="proj-card" data-type="' + esc(p.type) + "\" onclick=\"openChat('estimate_start','portfolio_" + esc(p.id) + "')\"><div class=\"proj-img-wrap\"><img class=\"proj-img\" src=\"" + src + '" alt="' + esc(p.title) + '" loading="lazy"/><div class="proj-overlay"><span class="proj-type">' + esc(p.type) + '</span></div></div><div class="proj-body"><h3>' + esc(p.title) + '</h3><div class="proj-loc">' + esc(p.location) + '</div><p class="proj-desc">' + esc(p.desc) + '</p><span class="proj-more">Get a similar estimate &rarr;</span></div></div>'; }).join("");
  const procSteps = process2.map((s) => '<div class="proc-step"><div class="proc-num">' + esc(s.num) + "</div><h3>" + esc(s.title) + "</h3><p>" + esc(s.desc) + "</p></div>").join("");
  const revCards = reviews.map((r) => '<div class="rev-card"><div class="rev-stars">' + "&#9733;".repeat(r.stars || 5) + '</div><p class="rev-text">&ldquo;' + esc(r.text) + '&rdquo;</p><div class="rev-footer"><span class="rev-name">' + esc(r.name) + '</span><span class="rev-proj">' + esc(r.project) + "</span></div></div>").join("");
  let artSection = "";
  if (articles && articles.length) { const artCards = articles.slice(0, 3).map((a) => { const img = a.hero_image_r2_key ? '<img src="/media/serve/' + encodeURIComponent(a.hero_image_r2_key) + '" alt="' + esc(a.title) + '" style="width:100%;height:160px;object-fit:cover;display:block"/>' : '<div style="height:160px;background:linear-gradient(135deg,#1a2744,#0f1a2e);display:flex;align-items:center;justify-content:center;font-size:2.5rem">&#128215;</div>'; return '<a href="/articles/' + a.slug + '" class="art-card">' + img + '<div class="art-body"><h3>' + esc(a.title) + "</h3><p>" + esc((a.summary || "").slice(0, 120)) + (a.summary && a.summary.length > 120 ? "..." : "") + '</p><span class="art-more">Read &rarr;</span></div></a>'; }).join(""); artSection = '<section class="section section-alt" id="articles"><div class="container"><div class="section-head"><h2>Resources &amp; Guides</h2><p class="section-sub">Expert advice from our licensed contractors</p></div><div class="art-grid">' + artCards + '</div><div style="text-align:center;margin-top:2rem"><a href="/articles" class="btn btn-primary" style="display:inline-block">View All Articles</a></div></div></section>'; }
  const svcOptions = services.map((s) => "<option>" + esc(s.title) + "</option>").join("");
  const SITE_CSS = ':root{--primary:#1a2744;--accent:#c8a84b;--bg:#f8f7f5;--dark:#0f1a2e;--text:#1c1c1e;--muted:#666;--border:#e4e4e4;--r:8px;--shadow:0 2px 12px rgba(0,0,0,.08)}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:"Inter",system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.65;-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:"Oswald",sans-serif;letter-spacing:.02em}a{color:inherit;text-decoration:none}img{display:block;width:100%;height:auto}.container{max-width:1100px;margin:0 auto;padding:0 1.5rem}.section{padding:5rem 0}.section-alt{background:#fff}.section-dark{background:var(--primary)}.section-darker{background:var(--dark)}.section-head{margin-bottom:3rem}.section-head h2{font-size:2.2rem;color:var(--primary);margin-bottom:.4rem}.section-dark .section-head h2,.section-darker .section-head h2{color:#fff}.section-sub{color:var(--muted);font-size:.97rem}.section-dark .section-sub,.section-darker .section-sub{color:rgba(255,255,255,.65)}nav{position:sticky;top:0;z-index:200;background:var(--primary);border-bottom:3px solid var(--accent)}.nav-inner{display:flex;align-items:center;justify-content:space-between;padding:.8rem 1.5rem}.logo{font-family:"Oswald",sans-serif;color:#fff;font-size:1.4rem;letter-spacing:.06em}.logo span{color:var(--accent)}.nav-menu{display:flex;align-items:center;gap:1.5rem}.nav-menu a{color:rgba(255,255,255,.8);font-size:.84rem;transition:color .15s}.nav-menu a:hover{color:var(--accent)}.nav-phone{color:var(--accent)!important;font-weight:600!important}.nav-cta{background:var(--accent);color:#fff!important;padding:.38rem .9rem;border-radius:3px;font-weight:600!important}.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px}.hamburger span{display:block;width:22px;height:2px;background:#fff;border-radius:2px}.mobile-menu{display:none;flex-direction:column;background:var(--primary);border-top:1px solid rgba(255,255,255,.1)}.mobile-menu a{padding:.85rem 1.5rem;color:rgba(255,255,255,.85);font-size:.92rem;border-bottom:1px solid rgba(255,255,255,.07)}.btn{display:inline-block;padding:.72rem 1.6rem;border-radius:3px;font-weight:600;cursor:pointer;border:none;font-size:.93rem;font-family:"Inter",sans-serif;transition:opacity .15s,transform .1s;text-align:center}.btn:hover{opacity:.88;transform:translateY(-1px)}.btn-primary{background:var(--accent);color:#fff}.btn-ghost{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.55)}.hero{position:relative;min-height:92vh;display:flex;align-items:center;overflow:hidden}.svc-tabs{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem;border-bottom:2px solid var(--border);padding-bottom:.5rem}.svc-tab{background:transparent;border:none;font-family:"Inter",sans-serif;font-size:.85rem;font-weight:500;color:var(--muted);cursor:pointer;padding:.5rem .9rem;border-radius:4px 4px 0 0;transition:all .2s;white-space:nowrap}.svc-tab.active{color:var(--accent);border-bottom:2px solid var(--accent);margin-bottom:-2px;font-weight:600}.svc-panel{display:none}.svc-panel.active{display:block}.svc-panel-inner{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start}.proj-filter{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem}.proj-filter-btn{background:transparent;border:1px solid var(--border);color:var(--muted);font-family:"Inter",sans-serif;font-size:.82rem;padding:.38rem .85rem;border-radius:20px;cursor:pointer;transition:all .2s}.proj-filter-btn.active{background:var(--accent);border-color:var(--accent);color:#fff}.proj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}.proj-card{border-radius:var(--r);overflow:hidden;background:#fff;box-shadow:var(--shadow);cursor:pointer;transition:transform .2s,box-shadow .2s}.rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}.rev-card{background:#fff;border-radius:var(--r);padding:1.5rem;box-shadow:var(--shadow);border-top:3px solid var(--accent)}.proc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.1rem}.proc-step{background:rgba(255,255,255,.07);border-radius:var(--r);padding:1.5rem;border-left:3px solid var(--accent)}.art-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}.leads-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}.leads-input,.leads-select,.leads-textarea{width:100%;padding:.72rem .9rem;border:1px solid var(--border);border-radius:var(--r);font-family:"Inter",sans-serif;font-size:16px;background:#fff;color:var(--text);outline:none;-webkit-appearance:none}.cb-widget{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:2rem;margin-top:2.5rem}.cb-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}.cb-input,.cb-select{width:100%;padding:.7rem .9rem;border:1px solid rgba(255,255,255,.15);border-radius:var(--r);font-family:"Inter",sans-serif;font-size:16px;background:rgba(255,255,255,.07);color:#fff;outline:none}#chatFab{position:fixed;bottom:1.5rem;right:1.5rem;z-index:500;background:var(--accent);color:#fff;font-family:"Oswald",sans-serif;font-size:.95rem;font-weight:600;letter-spacing:.06em;padding:.75rem 1.35rem;border-radius:50px;border:none;cursor:pointer;display:flex;align-items:center;gap:.5rem}#chatDrawer{position:fixed;bottom:0;right:0;width:100%;max-width:420px;z-index:600;transform:translateY(110%);transition:transform .3s cubic-bezier(.4,0,.2,1);border-radius:16px 16px 0 0;overflow:hidden}#chatDrawer.open{transform:translateY(0)}.chat-msgs{background:#fff;height:320px;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.75rem}.cmsg.user .bubble{background:var(--primary);color:#fff;border-radius:16px 16px 3px 16px}.cmsg.bot .bubble{background:#f1f1f1;color:var(--text);border-radius:16px 16px 16px 3px}.bubble{padding:.6rem 1rem;font-size:.88rem;line-height:1.55}@media(max-width:768px){.nav-menu{display:none}.proj-grid,.rev-grid,.proc-grid,.leads-grid,.cb-grid,.art-grid{grid-template-columns:1fr}.svc-panel-inner{grid-template-columns:1fr}}';
  const CHAT_JS = `var chatState="init";var leadSection="";function openChat(a,s){leadSection=s||"";document.getElementById("chatDrawer").classList.add("open");document.getElementById("chatFab").style.display="none";document.body.style.overflow="hidden";var m=document.getElementById("chatMsgs");if(!m.children.length){sendChatMsg(a==="estimate_start"?"estimate_start":"",true);}else if(a==="estimate_start"&&chatState==="init"){sendChatMsg("estimate_start",true);}}function closeChat(){document.getElementById("chatDrawer").classList.remove("open");document.getElementById("chatFab").style.display="flex";document.body.style.overflow="";}function addBotMsg(text,actions){var msgs=document.getElementById("chatMsgs");var div=document.createElement("div");div.className="cmsg bot";var safe=text.replace(/\\*\\*(.+?)\\*\\*/g,"<strong>$1</strong>").replace(/\\n/g,"<br>");var html="<div class='bubble'>"+safe+"</div>";if(actions&&actions.length){html+="<div class='actions'>";actions.forEach(function(a){if(a.type==="call"){html+="<a class='chip call' href='"+a.url+"'>"+a.label+"</a>";}else if(a.type==="state"){html+="<button class='chip' onclick='sendQuick(\\""+a.value+"\\")'>"+a.label+"</button>";}else if(a.type==="quick"){var q=a.label.replace(/[^a-zA-Z0-9 ]/g,"");html+="<button class='chip' onclick='sendQuick(\\""+q+"\\")'>"+a.label+"</button>";}});html+="</div>";}div.innerHTML=html;msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;}function addUserMsg(t){var m=document.getElementById("chatMsgs");var d=document.createElement("div");d.className="cmsg user";d.innerHTML="<div class='bubble'>"+t+"</div>";m.appendChild(d);m.scrollTop=m.scrollHeight;}function addThinking(){var m=document.getElementById("chatMsgs");var d=document.createElement("div");d.id="think";d.className="cmsg bot";d.innerHTML="<div class='bubble' style='color:#aaa'>Typing...</div>";m.appendChild(d);m.scrollTop=m.scrollHeight;}function removeThinking(){var t=document.getElementById("think");if(t)t.remove();}function sendQuick(v){sendChatMsg(v,true);}async function sendChatMsg(text,isQuick){var input=document.getElementById("chatInput");var msg=isQuick?text:(input?input.value.trim():"");if(!msg&&chatState!=="init")return;if(!isQuick&&msg){addUserMsg(msg);if(input)input.value="";}else if(msg&&msg!=="estimate_start"){addUserMsg(msg);}addThinking();try{var res=await fetch("/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg,state:chatState,section:leadSection})});var data=await res.json();removeThinking();chatState=data.state||chatState;addBotMsg(data.answer||"Sorry, something went wrong.",data.suggested_actions);}catch(e){removeThinking();addBotMsg("Connection issue — please call us.",[{type:"call",label:"Call Now",url:"${PHONE_URL}"}]);}}function toggleMenu(){var m=document.getElementById("mobileMenu");m.style.display=m.style.display==="flex"?"none":"flex";}function submitCallback(){var name=(document.getElementById("cbName").value||"").trim();var phone=(document.getElementById("cbPhone").value||"").trim();var time=document.getElementById("cbTime").value;var note=(document.getElementById("cbNote").value||"").trim();var res=document.getElementById("cbResult");if(!name||!phone){res.textContent="Name and phone are required.";res.className="lfr err";res.style.display="block";return;}fetch("/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name,phone:phone,preferred_time:time,notes:note,lead_section:"callback_widget",source:"web"})}).then(function(r){return r.json();}).then(function(d){res.textContent=d.message||"We will call you soon!";res.className="lfr "+(d.ok?"ok":"err");res.style.display="block";}).catch(function(){res.textContent="Failed. Please call us.";res.className="lfr err";res.style.display="block";});}(function(){document.querySelectorAll(".svc-tab").forEach(function(tab){tab.addEventListener("click",function(){document.querySelectorAll(".svc-tab").forEach(function(t){t.classList.remove("active");});document.querySelectorAll(".svc-panel").forEach(function(p){p.classList.remove("active");});tab.classList.add("active");var panel=document.querySelector("[data-panel=\\""+tab.dataset.svc+"\\"]");if(panel)panel.classList.add("active");});});document.querySelectorAll(".proj-filter-btn").forEach(function(btn){btn.addEventListener("click",function(){document.querySelectorAll(".proj-filter-btn").forEach(function(b){b.classList.remove("active");});btn.classList.add("active");var f=btn.dataset.filter;document.querySelectorAll(".proj-card").forEach(function(c){c.style.display=(f==="all"||c.dataset.type===f)?"":"none";});});});var lfBtn=document.getElementById("lfBtn");if(lfBtn)lfBtn.addEventListener("click",function(){var name=(document.getElementById("lfName").value||"").trim();var email=(document.getElementById("lfEmail").value||"").trim();var res=document.getElementById("lfResult");if(!name||!email){res.textContent="Name and email are required.";res.className="lfr err";res.style.display="block";return;}fetch("/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name,email:email,phone:document.getElementById("lfPhone").value,service:document.getElementById("lfIntent").value,budget_range:document.getElementById("lfBudget").value,timeline:document.getElementById("lfTimeline").value,message:document.getElementById("lfMsg").value,lead_section:"lead_form",source:"web"})}).then(function(r){return r.json();}).then(function(d){res.textContent=d.message||"Thank you!";res.className="lfr "+(d.ok?"ok":"err");res.style.display="block";}).catch(function(){res.textContent="Failed.";res.className="lfr err";res.style.display="block";});});var sendBtn=document.getElementById("chatSend");if(sendBtn)sendBtn.addEventListener("click",function(){sendChatMsg("",false);});var chatInput=document.getElementById("chatInput");if(chatInput)chatInput.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChatMsg("",false);}});}());`;
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>' + esc(CO) + ' &mdash; Licensed Construction | Los Angeles</title><meta name="description" content="' + esc(CO) + " &mdash; LA kitchen, bathroom, ADU & new construction. " + esc(LIC) + ". Call " + esc(PH) + '."><link rel="preconnect" href="https://fonts.googleapis.com"/><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/><style>' + SITE_CSS + '</style></head><body><nav><div class="nav-inner"><a href="/" class="logo">CCS<span>.</span></a><div class="nav-menu"><a href="#services">Services</a><a href="#projects">Projects</a><a href="#process">Process</a><a href="#reviews">Reviews</a><a href="/articles">Articles</a><a href="#contact">Contact</a><a href="' + PHU + '" class="nav-phone">' + esc(PH) + '</a><a href="#contact" class="nav-cta" onclick="leadSection=\'nav_cta\'">Free Estimate</a></div><div class="hamburger" onclick="toggleMenu()"><span></span><span></span><span></span></div></div><div class="mobile-menu" id="mobileMenu"><a href="#services">Services</a><a href="#projects">Projects</a><a href="#process">Process</a><a href="#reviews">Reviews</a><a href="/articles">Articles</a><a href="#contact">Contact</a><a href="' + PHU + '" style="color:var(--accent);font-weight:600">' + esc(PH) + '</a></div></nav><section class="section section-alt" id="services"><div class="container"><div class="section-head"><h2>Our Services</h2><p class="section-sub">Full-scope residential construction throughout Los Angeles County</p></div><div class="svc-tabs">' + svcTabs + "</div>" + svcPanels + '</div></section><section class="section" id="projects"><div class="container"><div class="section-head"><h2>Recent Projects</h2></div><div class="proj-filter">' + filterBtns + '</div><div class="proj-grid">' + projCards + '</div></div></section><section class="section section-dark" id="process"><div class="container"><div class="section-head"><h2>Our Process</h2></div><div class="proc-grid">' + procSteps + '</div></div></section><section class="section section-alt" id="reviews"><div class="container"><div class="section-head"><h2>What Clients Say</h2></div><div class="rev-grid">' + revCards + "</div></div></section>" + artSection + '<section class="section section-darker" id="contact"><div class="container" style="max-width:680px"><div class="section-head"><h2>Get Your Free Estimate</h2></div><div class="leads-grid"><input class="leads-input" id="lfName" placeholder="Full Name *"/><input class="leads-input" id="lfEmail" type="email" placeholder="Email Address *"/><input class="leads-input" id="lfPhone" placeholder="Phone Number"/><select class="leads-select" id="lfIntent"><option value="">Project Type</option>' + svcOptions + '<option>Other</option></select><select class="leads-select" id="lfBudget"><option value="">Budget Range</option><option>Under $25k</option><option>$25k\u2013$50k</option><option>$50k\u2013$100k</option><option>$100k+</option></select><select class="leads-select" id="lfTimeline"><option value="">Timeline</option><option>ASAP</option><option>1\u20133 months</option><option>3\u20136 months</option><option>Just exploring</option></select><textarea class="leads-textarea" id="lfMsg" placeholder="Tell us about your project..."></textarea></div><button class="btn btn-primary" id="lfBtn">Send My Project Details</button><div id="lfResult" class="lfr"></div><div class="cb-widget"><h3 style="font-family:Oswald,sans-serif;font-size:1.3rem;color:#fff;margin-bottom:.4rem">Prefer a Call Back?</h3><p style="font-size:.86rem;color:rgba(255,255,255,.6);margin-bottom:1.25rem">Leave your number and we&rsquo;ll reach out at your preferred time.</p><div class="cb-grid"><input class="cb-input" id="cbName" placeholder="Your Name *"/><input class="cb-input" id="cbPhone" placeholder="Phone Number *"/><select class="cb-select" id="cbTime"><option value="">Best time to call</option><option value="morning">Morning (8am\u201312pm)</option><option value="afternoon">Afternoon (12pm\u20135pm)</option><option value="evening">Evening (5pm\u20137pm)</option><option value="anytime">Anytime</option></select><input class="cb-input" id="cbNote" placeholder="Optional note"/></div><button class="btn btn-ghost" onclick="submitCallback()">Request a Call Back</button><div id="cbResult" class="lfr"></div></div></div></section><footer style="background:#060d18;color:rgba(255,255,255,.42);padding:2rem 0;font-size:.81rem;text-align:center"><div class="container"><p style="margin-bottom:.4rem"><strong style="color:rgba(255,255,255,.7);font-family:Oswald,sans-serif;letter-spacing:.04em">' + esc(CO) + "</strong></p><p>" + esc(LIC) + ' &nbsp;&bull;&nbsp; <a href="' + PHU + '" style="color:var(--accent)">' + esc(PH) + "</a> &nbsp;&bull;&nbsp; " + esc(ct.areas || "Los Angeles County") + ', CA</p><p style="margin-top:.5rem;font-size:.72rem;color:rgba(255,255,255,.25)">v' + VERSION + '</p></div></footer><button id="chatFab" onclick="openChat()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:18px;height:18px;flex-shrink:0"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> Estimate / Chat</button><div id="chatDrawer"><div style="background:var(--dark);padding:.65rem 1.25rem;display:flex;align-items:center;justify-content:space-between"><a href="' + PHU + '" style="color:var(--accent);font-family:Oswald,sans-serif;font-size:1rem;font-weight:600">' + esc(PH) + ' &mdash; Tap to Call</a><button style="background:transparent;border:none;color:rgba(255,255,255,.5);cursor:pointer;font-size:1.3rem" onclick="closeChat()">&#10005;</button></div><div style="background:var(--primary);padding:1rem 1.25rem;display:flex;align-items:center;gap:.75rem"><div style="width:36px;height:36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:1rem">&#127968;</div><div><div style="color:#fff;font-family:Oswald,sans-serif;font-size:1rem">' + esc(CO) + '</div><div style="color:rgba(255,255,255,.5);font-size:.75rem">Licensed General Contractor &bull; Free Estimates</div></div></div><div class="chat-msgs" id="chatMsgs"></div><div style="background:#f8f7f5;border-top:1px solid var(--border);display:flex;align-items:center;gap:.5rem;padding:.75rem 1rem"><input style="flex:1;border:1.5px solid var(--border);border-radius:20px;padding:.55rem 1rem;font-size:16px;font-family:Inter,sans-serif;outline:none;background:#fff" id="chatInput" placeholder="Type a message..." autocomplete="off"/><button style="background:var(--accent);color:#fff;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center" id="chatSend"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div></div><style>.chip{font-size:.78rem;padding:.28rem .7rem;border:1.5px solid var(--accent);color:var(--accent);border-radius:10px;cursor:pointer;background:transparent;font-family:"Inter",sans-serif;text-decoration:none;display:inline-block;transition:all .15s}.chip:hover,.chip.call{background:var(--accent);color:#fff}.actions{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.4rem}.lfr{margin-top:1rem;font-size:.88rem;padding:.6rem .9rem;border-radius:var(--r);display:none}.lfr.ok{background:#dcfce7;color:#15803d}.lfr.err{background:#fee2e2;color:#b91c1c}.hero-bg{position:absolute;inset:0}.hero-bg img{width:100%;height:100%;object-fit:cover}.hero-grad{position:absolute;inset:0;background:linear-gradient(115deg,rgba(15,26,46,.96) 40%,rgba(15,26,46,.5) 75%,rgba(15,26,46,.2) 100%)}.hero-content{position:relative;z-index:2;padding:2rem 2rem 2rem 2.5rem;max-width:660px;color:#fff}.stat-num{font-family:"Oswald",sans-serif;font-size:2rem;color:var(--accent);line-height:1}.stat-label{font-size:.75rem;color:rgba(255,255,255,.6);margin-top:.2rem}.trust-bar{background:var(--dark);padding:.55rem 0}.trust-inner{display:flex;flex-wrap:wrap;gap:.6rem 2rem;align-items:center;justify-content:center}.trust-item{color:rgba(255,255,255,.75);font-size:.78rem}.trust-item a{color:var(--accent);font-weight:700}</style><script>' + CHAT_JS + "<\/script></body></html>";
}
__name(renderPublicHTML, "renderPublicHTML");
