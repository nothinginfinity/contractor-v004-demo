import app from "./contractor-v004-demo.js";

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

async function fastStatus(env) {
  const started = Date.now();
  const out = {
    ok: true,
    worker: "contractor-v004-demo",
    status_mode: "fast-wrapper-v1",
    db: false,
    r2: false,
    vectorize: "skipped",
    ai: "skipped",
    leads: 0,
    articles: 0,
    callbacks: 0,
    has_snapshot: false,
    timestamp: new Date().toISOString()
  };

  try {
    const row = await env.V003_2_DB.prepare("SELECT COUNT(*) AS c FROM leads").first();
    out.leads = row?.c || 0;
    out.db = true;
  } catch (e) {
    out.db_error = String(e?.message || e);
  }

  try {
    const row = await env.V003_2_DB.prepare("SELECT COUNT(*) AS c FROM articles").first();
    out.articles = row?.c || 0;
  } catch (e) {
    out.articles_error = String(e?.message || e);
  }

  try {
    const row = await env.V003_2_DB.prepare("SELECT COUNT(*) AS c FROM callbacks").first();
    out.callbacks = row?.c || 0;
  } catch (e) {
    out.callbacks_error = String(e?.message || e);
  }

  try {
    const row = await env.V003_2_DB.prepare("SELECT published_at FROM site_snapshot LIMIT 1").first();
    out.has_snapshot = !!row;
  } catch (e) {
    out.snapshot_error = String(e?.message || e);
  }

  try {
    await env.V003_2_R2.list({ prefix: "contractor-v003-2/", limit: 1 });
    out.r2 = true;
  } catch (e) {
    out.r2_error = String(e?.message || e);
  }

  out.ms = Date.now() - started;
  return json(out);
}

function bypassAdminPassword(html) {
  const css = `<style id="admin-password-bypass-css">
#lock{display:none!important;visibility:hidden!important;pointer-events:none!important;}
#app{display:block!important;visibility:visible!important;}
</style>`;

  const script = `<script id="admin-password-bypass-script">
(function(){
  function unlockOnce(){
    try{sessionStorage.setItem("ccs_admin_v2","1");}catch(e){}
    var lock=document.getElementById("lock");
    var app=document.getElementById("app");
    if(lock){lock.style.display="none";lock.style.visibility="hidden";lock.style.pointerEvents="none";}
    if(app){app.style.display="block";app.style.visibility="visible";}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",unlockOnce,{once:true});
  else unlockOnce();
})();
</script>`;

  let out = html;
  if (out.includes("</head>")) out = out.replace("</head>", css + "</head>");
  else out = css + out;
  if (out.includes("</body>")) out = out.replace("</body>", script + "</body>");
  else out += script;
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization"
        }
      });
    }

    if (request.method === "GET" && (path === "/status" || path === "/admin/status" || path === "/api/status")) {
      return fastStatus(env);
    }

    if (request.method === "GET" && path === "/admin") {
      const response = await app.fetch(request, env, ctx);
      const html = await response.text();
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "text/html;charset=UTF-8");
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("X-Contractor-Demo-Admin", "password-bypass-fast-status-v1");
      return new Response(bypassAdminPassword(html), { status: response.status, headers });
    }

    return app.fetch(request, env, ctx);
  }
};
