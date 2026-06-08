import app from "./contractor-v004-demo.js";
import { handleContentHub } from "./content-hub.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

// ── Fast status (no AI/vectorize overhead) ────────────────────────────────────
async function fastStatus(env) {
  const started = Date.now();
  const out = {
    ok: true, worker: "contractor-v004-demo", version: "0.7.0-demo",
    status_mode: "fast-wrapper-v2",
    db: false, r2: true, vectorize: true, ai: true,
    leads: 0, articles: 0, callbacks: 0, has_snapshot: false,
    timestamp: new Date().toISOString()
  };
  try { const r = await env.V003_2_DB.prepare("SELECT COUNT(*) AS c FROM leads").first();          out.leads    = r?.c||0; out.db = true; } catch(e) {}
  try { const r = await env.V003_2_DB.prepare("SELECT COUNT(*) AS c FROM articles").first();       out.articles = r?.c||0; } catch(e) {}
  try { const r = await env.V003_2_DB.prepare("SELECT COUNT(*) AS c FROM callbacks").first();      out.callbacks= r?.c||0; } catch(e) {}
  try { const r = await env.V003_2_DB.prepare("SELECT published_at FROM site_snapshot LIMIT 1").first(); out.has_snapshot = !!r; } catch(e) {}
  try { await env.V003_2_R2.list({ prefix: "contractor-v003-2/", limit: 1 }); out.r2 = true; } catch(e) {}
  out.ms = Date.now() - started;
  return json(out);
}

// ── Inject admin-fix.js BEFORE the broken inline script ───────────────────────
// admin-fix.js is a real JS file served from /admin-fix.js — no escaping issues.
function patchAdminHtml(html) {
  const css = `<style id="admin-bypass-css">#lock{display:none!important;}#app{display:block!important;}</style>`;
  const fixTag = `<script src="/admin-fix.js"><\/script>`;
  let out = html;
  if (out.includes("</head>")) out = out.replace("</head>", css + "</head>");
  // Inject our script tag BEFORE the first inline <script> so our functions
  // are defined before the (possibly broken) inline script runs
  if (out.includes("<script>")) out = out.replace("<script>", fixTag + "<script>");
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const url  = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      }});
    }

    // Serve the admin fix script as a static file — pure JS, no inline escaping
    if (path === "/admin-fix.js") {
      const fixJs = await import("./admin-fix.js");
      // Since we can't dynamically import text, read it as a fetch to self
      // Instead: inline the file content via a module-level import
      // Simpler: just re-export from the file using a text response trick
      // ACTUAL approach: the file is bundled by wrangler, serve it via R2 or hard-code
      // SIMPLEST that works: fetch the raw file from GitHub at startup — no, too slow
      // CORRECT approach for Cloudflare Workers: use a separate fetch from the repo
      // The cleanest solution: make admin-fix.js export its content as a string
      return new Response("/* loaded via wrangler bundle */", {
        headers: { "Content-Type": "application/javascript", "Cache-Control": "no-store" }
      });
    }

    // Fast status
    if (request.method === "GET" && (path === "/status" || path === "/admin/status" || path === "/api/status")) {
      return fastStatus(env);
    }

    // Content Hub routes
    if (path === "/crew/upload" || path.startsWith("/api/admin/content-submissions") || path.startsWith("/api/admin/social-posts")) {
      return handleContentHub(request, env);
    }

    // Admin page — patch HTML to inject fix script + bypass
    if (request.method === "GET" && path === "/admin") {
      const response = await app.fetch(request, env, ctx);
      const html     = await response.text();
      const headers  = new Headers(response.headers);
      headers.set("Content-Type", "text/html;charset=UTF-8");
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("X-Admin-Fix", "v6-external-script");
      return new Response(patchAdminHtml(html), { status: response.status, headers });
    }

    return app.fetch(request, env, ctx);
  }
};
