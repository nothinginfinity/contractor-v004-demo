import app from "./contractor-v004-demo.js";

function openAdminForTesting(html) {
  const css = `<style id="admin-open-for-testing-css">
#lock{display:none!important;visibility:hidden!important;pointer-events:none!important;}
#app{display:block!important;}
</style>`;
  const script = `<script id="admin-open-for-testing-script">
(function(){
  function byId(id){return document.getElementById(id);}
  function openAdmin(){
    var lock=byId("lock");
    var app=byId("app");
    if(lock){lock.style.display="none";lock.style.visibility="hidden";lock.style.pointerEvents="none";}
    if(app){app.style.display="block";}
    try{sessionStorage.setItem("ccs_admin_v2","1");}catch(e){}
    try{if(typeof loadAll==="function")loadAll();else if(typeof loadStatus==="function")loadStatus();}catch(e){console.error("Admin load failed",e);}
  }
  window.tryLogin=openAdmin;
  window.unlock=openAdmin;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",openAdmin);else openAdmin();
  setTimeout(openAdmin,50);
  setTimeout(openAdmin,250);
  setTimeout(openAdmin,1000);
})();
</script>`;
  let out = html;
  if (out.includes("</head>")) out = out.replace("</head>", css + "</head>");
  else out = css + out;
  if (out.includes("</body>")) out = out.replace("</body>", script + "</body>");
  else out += script;
  return out;
}

function fallbackAdminHTML() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Contractor Admin</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e5e7eb;margin:0;padding:24px;}
    main{max-width:980px;margin:0 auto;}
    .card{background:#111827;border:1px solid #334155;border-radius:16px;padding:18px;margin:16px 0;}
    button{background:#2563eb;color:white;border:0;border-radius:10px;padding:10px 14px;font-weight:700;}
    pre{white-space:pre-wrap;background:#020617;border-radius:12px;padding:14px;overflow:auto;}
    a{color:#93c5fd;}
  </style>
</head>
<body>
  <main>
    <h1>Contractor Admin</h1>
    <p>Demo admin shell is live for <strong>contractor-v004-demo</strong>.</p>
    <div class="card">
      <button onclick="loadStatus()">Load Status</button>
      <button onclick="publishSite()">Publish Site</button>
      <p><a href="/" target="_blank">Open public site</a></p>
    </div>
    <div class="card"><h2>Status</h2><pre id="status">Click Load Status…</pre></div>
    <div class="card"><h2>Leads</h2><pre id="leads">Loading…</pre></div>
    <div class="card"><h2>Callbacks</h2><pre id="callbacks">Loading…</pre></div>
    <div class="card"><h2>Articles</h2><pre id="articles">Loading…</pre></div>
  </main>
  <script>
    async function getJSON(path){const r=await fetch(path,{cache:'no-store'});return await r.json();}
    async function postJSON(path, data){const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data||{})});return await r.json();}
    async function loadStatus(){document.getElementById('status').textContent=JSON.stringify(await getJSON('/status'),null,2);}
    async function publishSite(){document.getElementById('status').textContent=JSON.stringify(await postJSON('/admin/publish',{}),null,2);}
    async function loadAll(){
      await loadStatus();
      for (const key of ['leads','callbacks','articles']) {
        try { document.getElementById(key).textContent=JSON.stringify(await getJSON('/admin/'+key),null,2); }
        catch(e){ document.getElementById(key).textContent=String(e); }
      }
    }
    loadAll();
  </script>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "GET" && path === "/admin") {
      let response;
      try {
        response = await app.fetch(request, env, ctx);
      } catch (e) {
        response = new Response(fallbackAdminHTML(), { status: 200, headers: { "Content-Type": "text/html;charset=UTF-8" } });
      }

      const contentType = response.headers.get("Content-Type") || "";
      let html = await response.text();
      if (!contentType.includes("text/html") || html.trim().startsWith("{")) {
        html = fallbackAdminHTML();
      }
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "text/html;charset=UTF-8");
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("X-Contractor-Demo-Admin", "forced-wrapper-v2");
      return new Response(openAdminForTesting(html), { status: 200, headers });
    }

    return app.fetch(request, env, ctx);
  }
};
