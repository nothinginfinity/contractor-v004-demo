var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// contractor-v003-2-afo.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var VERSION = "0.6.0";
var WORKER = "contractor-v003-2-afo";
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
var SITE_CSS = ':root{--primary:#1a2744;--accent:#c8a84b;--bg:#f8f7f5;--dark:#0f1a2e;--text:#1c1c1e;--muted:#666;--border:#e4e4e4;--r:8px;--shadow:0 2px 12px rgba(0,0,0,.08)}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:"Inter",system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.65;-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:"Oswald",sans-serif;letter-spacing:.02em}a{color:inherit;text-decoration:none}img{display:block;width:100%;height:auto}.container{max-width:1100px;margin:0 auto;padding:0 1.5rem}.section{padding:5rem 0}.section-alt{background:#fff}.section-dark{background:var(--primary)}.section-darker{background:var(--dark)}.section-head{margin-bottom:3rem}.section-head h2{font-size:2.2rem;color:var(--primary);margin-bottom:.4rem}.section-dark .section-head h2,.section-darker .section-head h2{color:#fff}.section-sub{color:var(--muted);font-size:.97rem}.section-dark .section-sub,.section-darker .section-sub{color:rgba(255,255,255,.65)}nav{position:sticky;top:0;z-index:200;background:var(--primary);border-bottom:3px solid var(--accent)}.nav-inner{display:flex;align-items:center;justify-content:space-between;padding:.8rem 1.5rem}.logo{font-family:"Oswald",sans-serif;color:#fff;font-size:1.4rem;letter-spacing:.06em}.logo span{color:var(--accent)}.nav-menu{display:flex;align-items:center;gap:1.5rem}.nav-menu a{color:rgba(255,255,255,.8);font-size:.84rem;transition:color .15s}.nav-menu a:hover{color:var(--accent)}.nav-phone{color:var(--accent)!important;font-weight:600!important}.nav-cta{background:var(--accent);color:#fff!important;padding:.38rem .9rem;border-radius:3px;font-weight:600!important}.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px}.hamburger span{display:block;width:22px;height:2px;background:#fff;border-radius:2px}.mobile-menu{display:none;flex-direction:column;background:var(--primary);border-top:1px solid rgba(255,255,255,.1)}.mobile-menu a{padding:.85rem 1.5rem;color:rgba(255,255,255,.85);font-size:.92rem;border-bottom:1px solid rgba(255,255,255,.07)}.trust-bar{background:var(--dark);padding:.55rem 0}.trust-inner{display:flex;flex-wrap:wrap;gap:.6rem 2rem;align-items:center;justify-content:center}.trust-item{color:rgba(255,255,255,.75);font-size:.78rem}.trust-item a{color:var(--accent);font-weight:700}.btn{display:inline-block;padding:.72rem 1.6rem;border-radius:3px;font-weight:600;cursor:pointer;border:none;font-size:.93rem;font-family:"Inter",sans-serif;transition:opacity .15s,transform .1s;text-align:center}.btn:hover{opacity:.88;transform:translateY(-1px)}.btn-primary{background:var(--accent);color:#fff}.btn-ghost{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.55)}.hero{position:relative;min-height:92vh;display:flex;align-items:center;overflow:hidden}.hero-bg{position:absolute;inset:0}.hero-bg img{width:100%;height:100%;object-fit:cover}.hero-grad{position:absolute;inset:0;background:linear-gradient(115deg,rgba(15,26,46,.96) 40%,rgba(15,26,46,.5) 75%,rgba(15,26,46,.2) 100%)}.hero-content{position:relative;z-index:2;padding:2rem 2rem 2rem 2.5rem;max-width:660px;color:#fff}.hero-eyebrow{display:inline-flex;gap:.6rem;align-items:center;background:rgba(200,168,75,.18);border:1px solid rgba(200,168,75,.4);color:var(--accent);font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;padding:.35rem .85rem;border-radius:20px;margin-bottom:1.2rem;font-weight:500}.hero h1{font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1.06;margin-bottom:1.1rem}.hero h1 span{color:var(--accent)}.hero-sub{font-size:clamp(.95rem,1.8vw,1.1rem);opacity:.85;margin-bottom:2rem;line-height:1.65;font-weight:300;max-width:520px}.hero-ctas{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.75rem}.hero-stats{display:flex;gap:2rem;flex-wrap:wrap;margin-top:2.5rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,.15)}.stat-num{font-family:"Oswald",sans-serif;font-size:2rem;color:var(--accent);line-height:1}.stat-label{font-size:.75rem;color:rgba(255,255,255,.6);margin-top:.2rem}.svc-tabs{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem;border-bottom:2px solid var(--border);padding-bottom:.5rem}.svc-tab{background:transparent;border:none;font-family:"Inter",sans-serif;font-size:.85rem;font-weight:500;color:var(--muted);cursor:pointer;padding:.5rem .9rem;border-radius:4px 4px 0 0;transition:all .2s;white-space:nowrap}.svc-tab.active{color:var(--accent);border-bottom:2px solid var(--accent);margin-bottom:-2px;font-weight:600}.svc-panel{display:none}.svc-panel.active{display:block}.svc-panel-inner{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start}.svc-img-wrap{border-radius:var(--r);overflow:hidden;aspect-ratio:4/3;box-shadow:var(--shadow)}.svc-img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}.svc-img-wrap:hover .svc-img{transform:scale(1.04)}.svc-panel-body h3{font-size:1.6rem;color:var(--primary);margin-bottom:.75rem}.svc-desc{color:#555;font-size:.94rem;line-height:1.7;margin-bottom:1.25rem}.svc-hi{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:.35rem .75rem;margin-bottom:1.5rem}.svc-hi li{font-size:.85rem;color:#444;padding-left:1.1rem;position:relative;line-height:1.45}.svc-hi li::before{content:"\\2713";position:absolute;left:0;color:var(--accent);font-weight:700}.proj-filter{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem}.proj-filter-btn{background:transparent;border:1px solid var(--border);color:var(--muted);font-family:"Inter",sans-serif;font-size:.82rem;padding:.38rem .85rem;border-radius:20px;cursor:pointer;transition:all .2s}.proj-filter-btn.active{background:var(--accent);border-color:var(--accent);color:#fff}.proj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}.proj-card{border-radius:var(--r);overflow:hidden;background:#fff;box-shadow:var(--shadow);cursor:pointer;transition:transform .2s,box-shadow .2s}.proj-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.13)}.proj-img-wrap{position:relative;aspect-ratio:4/3;overflow:hidden}.proj-img{width:100%;height:100%;object-fit:cover;transition:transform .35s}.proj-card:hover .proj-img{transform:scale(1.06)}.proj-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(15,26,46,.85) 30%,transparent 70%);display:flex;align-items:flex-end;padding:1rem}.proj-type{font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);background:rgba(0,0,0,.4);padding:.25rem .6rem;border-radius:10px}.proj-body{padding:1.1rem 1.25rem 1.25rem}.proj-body h3{font-size:1rem;color:var(--primary);margin-bottom:.25rem}.proj-loc{font-size:.78rem;color:var(--muted);margin-bottom:.4rem}.proj-desc{font-size:.82rem;color:#555;line-height:1.55;margin-bottom:.6rem}.proj-more{font-size:.82rem;color:var(--accent);font-weight:600}.rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}.rev-card{background:#fff;border-radius:var(--r);padding:1.5rem;box-shadow:var(--shadow);border-top:3px solid var(--accent)}.rev-stars{color:var(--accent);font-size:1.05rem;margin-bottom:.6rem}.rev-text{color:#444;font-size:.88rem;line-height:1.65;font-style:italic;margin-bottom:.85rem}.rev-footer{display:flex;justify-content:space-between;align-items:center}.rev-name{font-size:.82rem;font-weight:600;color:var(--primary)}.rev-proj{font-size:.75rem;color:var(--muted)}.proc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.1rem}.proc-step{background:rgba(255,255,255,.07);border-radius:var(--r);padding:1.5rem;border-left:3px solid var(--accent)}.proc-num{font-family:"Oswald",sans-serif;font-size:2.2rem;color:var(--accent);line-height:1;margin-bottom:.6rem}.proc-step h3{font-size:.97rem;color:#fff;margin-bottom:.35rem}.proc-step p{font-size:.83rem;color:rgba(255,255,255,.65);line-height:1.55}.art-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}.art-card{display:block;border-radius:var(--r);overflow:hidden;background:#fff;box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s;color:inherit;text-decoration:none}.art-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.13)}.art-body{padding:1.1rem 1.25rem 1.25rem}.art-body h3{font-size:1rem;color:var(--primary);margin-bottom:.4rem;line-height:1.3}.art-body p{font-size:.82rem;color:#555;line-height:1.55;margin-bottom:.6rem}.art-more{font-size:.82rem;color:var(--accent);font-weight:600}.leads-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}.leads-input,.leads-select,.leads-textarea{width:100%;padding:.72rem .9rem;border:1px solid var(--border);border-radius:var(--r);font-family:"Inter",sans-serif;font-size:16px;background:#fff;color:var(--text);outline:none;-webkit-appearance:none}.leads-input:focus,.leads-select:focus,.leads-textarea:focus{border-color:var(--accent)}.leads-textarea{resize:vertical;min-height:90px;grid-column:1/-1}.leads-select-half{grid-column:span 1}.lfr{margin-top:1rem;font-size:.88rem;padding:.6rem .9rem;border-radius:var(--r);display:none}.lfr.ok{background:#dcfce7;color:#15803d}.lfr.err{background:#fee2e2;color:#b91c1c}.cb-widget{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:2rem;margin-top:2.5rem}.cb-widget h3{font-family:"Oswald",sans-serif;font-size:1.3rem;color:#fff;margin-bottom:.4rem}.cb-widget p{font-size:.86rem;color:rgba(255,255,255,.6);margin-bottom:1.25rem}.cb-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}.cb-input,.cb-select{width:100%;padding:.7rem .9rem;border:1px solid rgba(255,255,255,.15);border-radius:var(--r);font-family:"Inter",sans-serif;font-size:16px;background:rgba(255,255,255,.07);color:#fff;outline:none;-webkit-appearance:none}.cb-input:focus,.cb-select:focus{border-color:var(--accent)}.cb-input::placeholder{color:rgba(255,255,255,.35)}.cb-select option{background:#1a2744;color:#fff}footer{background:#060d18;color:rgba(255,255,255,.42);padding:2rem 0;font-size:.81rem;text-align:center}#chatFab{position:fixed;bottom:1.5rem;right:1.5rem;z-index:500;background:var(--accent);color:#fff;font-family:"Oswald",sans-serif;font-size:.95rem;font-weight:600;letter-spacing:.06em;padding:.75rem 1.35rem;border-radius:50px;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(200,168,75,.45);display:flex;align-items:center;gap:.5rem;transition:transform .2s}#chatFab:hover{transform:translateY(-2px)}#chatDrawer{position:fixed;bottom:0;right:0;width:100%;max-width:420px;z-index:600;transform:translateY(110%);transition:transform .3s cubic-bezier(.4,0,.2,1);border-radius:16px 16px 0 0;overflow:hidden;box-shadow:0 -8px 40px rgba(0,0,0,.25)}#chatDrawer.open{transform:translateY(0)}.chat-phone-bar{background:var(--dark);padding:.65rem 1.25rem;display:flex;align-items:center;justify-content:space-between}.chat-phone-bar a{color:var(--accent);font-family:"Oswald",sans-serif;font-size:1rem;font-weight:600;letter-spacing:.04em;display:flex;align-items:center;gap:.5rem}.chat-close-btn{background:transparent;border:none;color:rgba(255,255,255,.5);cursor:pointer;font-size:1.3rem;line-height:1}.chat-header{background:var(--primary);padding:1rem 1.25rem;display:flex;align-items:center;gap:.75rem;border-bottom:1px solid rgba(255,255,255,.08)}.chat-avatar{width:36px;height:36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem}.chat-title{color:#fff;font-family:"Oswald",sans-serif;font-size:1rem;letter-spacing:.04em}.chat-sub{color:rgba(255,255,255,.5);font-size:.75rem;margin-top:.1rem}.chat-msgs{background:#fff;height:320px;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.75rem}.cmsg{max-width:88%}.cmsg.user{align-self:flex-end}.cmsg.user .bubble{background:var(--primary);color:#fff;border-radius:16px 16px 3px 16px}.cmsg.bot .bubble{background:#f1f1f1;color:var(--text);border-radius:16px 16px 16px 3px}.bubble{padding:.6rem 1rem;font-size:.88rem;line-height:1.55}.actions{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.4rem}.chip{font-size:.78rem;padding:.28rem .7rem;border:1.5px solid var(--accent);color:var(--accent);border-radius:10px;cursor:pointer;background:transparent;font-family:"Inter",sans-serif;text-decoration:none;display:inline-block;transition:all .15s}.chip:hover,.chip.call{background:var(--accent);color:#fff;border-color:var(--accent)}.chat-input-row{background:#f8f7f5;border-top:1px solid var(--border);display:flex;align-items:center;gap:.5rem;padding:.75rem 1rem}.chat-text{flex:1;border:1.5px solid var(--border);border-radius:20px;padding:.55rem 1rem;font-size:16px;font-family:"Inter",sans-serif;outline:none;background:#fff;-webkit-appearance:none}.chat-text:focus{border-color:var(--accent)}.chat-send{background:var(--accent);color:#fff;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}.upload-area{padding:.75rem 1rem;background:#f8f7f5;border-top:1px solid var(--border)}.upload-label{display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.83rem;color:var(--accent);font-weight:600;padding:.5rem .9rem;border:1.5px dashed var(--accent);border-radius:var(--r);justify-content:center}.upload-label input{display:none}@media(max-width:768px){.nav-menu{display:none}.hamburger{display:flex}.svc-panel-inner,.proj-grid,.rev-grid,.proc-grid,.leads-grid,.cb-grid,.art-grid{grid-template-columns:1fr}.svc-hi{grid-template-columns:1fr}#chatDrawer{max-width:100%;border-radius:16px 16px 0 0}}';
function renderPublicHTML(content, articles) {
  const ct = content.contact || {};
  const services = content.services || [];
  const projects = content.projects || [];
  const reviews = content.reviews || [];
  const process = content.process || [];
  const PH = ct.phone || "(818) 624-7212";
  const PHU = ct.phone_url || "tel:+18186247212";
  const LIC = ct.license || "CSLB #890991";
  const CO = ct.company || "CCS Services Group";
  const HERO_IMG = (ct.image_r2_key ? "/media/serve/" + encodeURIComponent(ct.image_r2_key) : ct.hero_image_url) || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&auto=format&fit=crop";
  const svcTabs = services.map((s, i) => '<button class="svc-tab' + (i === 0 ? " active" : "") + '" data-svc="' + esc(s.id) + '">' + esc(s.tab) + "</button>").join("");
  const svcPanels = services.map((s, i) => {
    const hi = (s.highlights || []).map((h2) => "<li>" + esc(h2) + "</li>").join("");
    const src = imgSrc(s);
    return '<div class="svc-panel' + (i === 0 ? " active" : "") + '" data-panel="' + esc(s.id) + '"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="' + src + '" alt="' + esc(s.title) + '"/></div><div class="svc-panel-body"><h3>' + esc(s.title) + '</h3><p class="svc-desc">' + esc(s.desc) + '</p><ul class="svc-hi">' + hi + `</ul><button class="btn btn-primary" onclick="openChat('estimate_start','services_` + esc(s.id) + `')">Get Free Estimate</button></div></div></div>`;
  }).join("");
  const projTypes = [...new Set(projects.map((p) => p.type))];
  const filterBtns = '<button class="proj-filter-btn active" data-filter="all">All</button>' + projTypes.map((t) => '<button class="proj-filter-btn" data-filter="' + esc(t) + '">' + esc(t) + "</button>").join("");
  const projCards = projects.map((p) => {
    const src = imgSrc(p);
    return '<div class="proj-card" data-type="' + esc(p.type) + `" onclick="openChat('estimate_start','portfolio_` + esc(p.id) + `')"><div class="proj-img-wrap"><img class="proj-img" src="` + src + '" alt="' + esc(p.title) + '" loading="lazy"/><div class="proj-overlay"><span class="proj-type">' + esc(p.type) + '</span></div></div><div class="proj-body"><h3>' + esc(p.title) + '</h3><div class="proj-loc">' + esc(p.location) + '</div><p class="proj-desc">' + esc(p.desc) + '</p><span class="proj-more">Get a similar estimate &rarr;</span></div></div>';
  }).join("");
  const procSteps = process.map((s) => '<div class="proc-step"><div class="proc-num">' + esc(s.num) + "</div><h3>" + esc(s.title) + "</h3><p>" + esc(s.desc) + "</p></div>").join("");
  const revCards = reviews.map((r) => '<div class="rev-card"><div class="rev-stars">' + "&#9733;".repeat(r.stars || 5) + '</div><p class="rev-text">&ldquo;' + esc(r.text) + '&rdquo;</p><div class="rev-footer"><span class="rev-name">' + esc(r.name) + '</span><span class="rev-proj">' + esc(r.project) + "</span></div></div>").join("");
  let artSection = "";
  if (articles && articles.length) {
    const artCards = articles.slice(0, 3).map((a) => {
      const img = a.hero_image_r2_key ? '<img src="/media/serve/' + encodeURIComponent(a.hero_image_r2_key) + '" alt="' + esc(a.title) + '" style="width:100%;height:160px;object-fit:cover;display:block"/>' : '<div style="height:160px;background:linear-gradient(135deg,#1a2744,#0f1a2e);display:flex;align-items:center;justify-content:center;font-size:2.5rem">&#128215;</div>';
      return '<a href="/articles/' + a.slug + '" class="art-card">' + img + '<div class="art-body"><h3>' + esc(a.title) + "</h3><p>" + esc((a.summary || "").slice(0, 120)) + (a.summary && a.summary.length > 120 ? "..." : "") + '</p><span class="art-more">Read &rarr;</span></div></a>';
    }).join("");
    artSection = '<section class="section section-alt" id="articles"><div class="container"><div class="section-head"><h2>Resources &amp; Guides</h2><p class="section-sub">Expert advice from our licensed contractors</p></div><div class="art-grid">' + artCards + '</div><div style="text-align:center;margin-top:2rem"><a href="/articles" class="btn btn-primary" style="display:inline-block">View All Articles</a></div></div></section>';
  }
  const svcOptions = services.map((s) => "<option>" + esc(s.title) + "</option>").join("");
  const CHAT_JS = `var chatState="init";var leadSection="";function openChat(a,s){leadSection=s||"";document.getElementById("chatDrawer").classList.add("open");document.getElementById("chatFab").style.display="none";document.body.style.overflow="hidden";var m=document.getElementById("chatMsgs");if(!m.children.length){sendChatMsg(a==="estimate_start"?"estimate_start":"",true);}else if(a==="estimate_start"&&chatState==="init"){sendChatMsg("estimate_start",true);}}function closeChat(){document.getElementById("chatDrawer").classList.remove("open");document.getElementById("chatFab").style.display="flex";document.body.style.overflow="";}function addBotMsg(text,actions){var msgs=document.getElementById("chatMsgs");var div=document.createElement("div");div.className="cmsg bot";var safe=text.replace(/\\*\\*(.+?)\\*\\*/g,"<strong>$1</strong>").replace(/\\n/g,"<br>");var html="<div class='bubble'>"+safe+"</div>";if(actions&&actions.length){html+="<div class='actions'>";actions.forEach(function(a){if(a.type==="call"){html+="<a class='chip call' href='"+a.url+"'>"+a.label+"</a>";}else if(a.type==="upload"){html+="<button class='chip' onclick='showUpload()'>"+a.label+"</button>";}else if(a.type==="state"){html+="<button class='chip' onclick='sendQuick(\\""+a.value+"\\")'>"+a.label+"</button>";}else if(a.type==="quick"){var q=a.label.replace(/[^a-zA-Z0-9 ]/g,"");html+="<button class='chip' onclick='sendQuick(\\""+q+"\\")'>"+a.label+"</button>";}});html+="</div>";}div.innerHTML=html;msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;}function addUserMsg(t){var m=document.getElementById("chatMsgs");var d=document.createElement("div");d.className="cmsg user";d.innerHTML="<div class='bubble'>"+t+"</div>";m.appendChild(d);m.scrollTop=m.scrollHeight;}function addThinking(){var m=document.getElementById("chatMsgs");var d=document.createElement("div");d.id="think";d.className="cmsg bot";d.innerHTML="<div class='bubble' style='color:#aaa'>Typing...</div>";m.appendChild(d);m.scrollTop=m.scrollHeight;}function removeThinking(){var t=document.getElementById("think");if(t)t.remove();}function sendQuick(v){sendChatMsg(v,true);}function showUpload(){document.getElementById("uploadArea").style.display="block";}async function sendChatMsg(text,isQuick){var input=document.getElementById("chatInput");var msg=isQuick?text:(input?input.value.trim():"");if(!msg&&chatState!=="init")return;if(!isQuick&&msg){addUserMsg(msg);if(input)input.value="";}else if(msg&&msg!=="estimate_start"&&msg!=="qa"){addUserMsg(msg);}var btn=document.getElementById("chatSend");if(btn)btn.disabled=true;addThinking();try{var res=await fetch("/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg,state:chatState,section:leadSection})});var data=await res.json();removeThinking();chatState=data.state||chatState;addBotMsg(data.answer||"Sorry, something went wrong.",data.suggested_actions);if(chatState==="estimate_upload")showUpload();}catch(e){removeThinking();addBotMsg("Connection issue \u2014 please call us.",[{type:"call",label:"Call Now",url:"tel:+18186247212"}]);}if(btn)btn.disabled=false;}function toggleMenu(){var m=document.getElementById("mobileMenu");m.style.display=m.style.display==="flex"?"none":"flex";}function submitCallback(){var name=(document.getElementById("cbName").value||"").trim();var phone=(document.getElementById("cbPhone").value||"").trim();var time=document.getElementById("cbTime").value;var note=(document.getElementById("cbNote").value||"").trim();var res=document.getElementById("cbResult");if(!name||!phone){res.textContent="Name and phone are required.";res.className="lfr err";res.style.display="block";return;}res.textContent="Submitting...";res.className="lfr";res.style.display="block";fetch("/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name,phone:phone,preferred_time:time,notes:note,lead_section:"callback_widget",source:"web"})}).then(function(r){return r.json();}).then(function(d){res.textContent=d.message||"We will call you soon!";res.className="lfr "+(d.ok?"ok":"err");res.style.display="block";if(d.ok){["cbName","cbPhone","cbNote"].forEach(function(id){var el=document.getElementById(id);if(el)el.value="";});document.getElementById("cbTime").selectedIndex=0;}}).catch(function(){res.textContent="Failed. Please call us.";res.className="lfr err";res.style.display="block";});}(function(){document.querySelectorAll(".svc-tab").forEach(function(tab){tab.addEventListener("click",function(){document.querySelectorAll(".svc-tab").forEach(function(t){t.classList.remove("active");});document.querySelectorAll(".svc-panel").forEach(function(p){p.classList.remove("active");});tab.classList.add("active");var panel=document.querySelector("[data-panel=\\""+tab.dataset.svc+"\\"]");if(panel)panel.classList.add("active");});});document.querySelectorAll(".proj-filter-btn").forEach(function(btn){btn.addEventListener("click",function(){document.querySelectorAll(".proj-filter-btn").forEach(function(b){b.classList.remove("active");});btn.classList.add("active");var f=btn.dataset.filter;document.querySelectorAll(".proj-card").forEach(function(c){c.style.display=(f==="all"||c.dataset.type===f)?"":"none";});});});var lfBtn=document.getElementById("lfBtn");if(lfBtn)lfBtn.addEventListener("click",function(){var name=(document.getElementById("lfName").value||"").trim();var email=(document.getElementById("lfEmail").value||"").trim();var res=document.getElementById("lfResult");if(!name||!email){res.textContent="Name and email are required.";res.className="lfr err";res.style.display="block";return;}res.textContent="Submitting...";res.className="lfr";res.style.display="block";fetch("/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name,email:email,phone:document.getElementById("lfPhone").value,service:document.getElementById("lfIntent").value,budget_range:document.getElementById("lfBudget").value,timeline:document.getElementById("lfTimeline").value,message:document.getElementById("lfMsg").value,lead_section:"lead_form",source:"web"})}).then(function(r){return r.json();}).then(function(d){res.textContent=d.message||"Thank you!";res.className="lfr "+(d.ok?"ok":"err");res.style.display="block";if(d.ok){["lfName","lfEmail","lfPhone","lfMsg"].forEach(function(id){var el=document.getElementById(id);if(el)el.value="";})}}).catch(function(){res.textContent="Failed.";res.className="lfr err";res.style.display="block";});});var sendBtn=document.getElementById("chatSend");if(sendBtn)sendBtn.addEventListener("click",function(){sendChatMsg("",false);});var chatInput=document.getElementById("chatInput");if(chatInput)chatInput.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChatMsg("",false);}});var fileInput=document.getElementById("chatFileInput");if(fileInput)fileInput.addEventListener("change",async function(){var files=Array.from(this.files);if(!files.length)return;var prog=document.getElementById("uploadProg");if(prog)prog.textContent="Uploading...";var ok=0;for(var i=0;i<files.length;i++){var fd=new FormData();fd.append("file",files[i]);try{var r=await fetch("/upload",{method:"POST",body:fd});var d=await r.json();if(d.ok)ok++;}catch(e){}}if(prog)prog.textContent="";document.getElementById("uploadArea").style.display="none";addUserMsg("Uploaded "+ok+" file(s)");chatState="estimate_upload";await sendChatMsg("I uploaded "+ok+" photo(s) of my project.",true);});}());`;
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>' + esc(CO) + ' &mdash; Licensed Construction | Los Angeles</title><meta name="description" content="' + esc(CO) + " &mdash; LA kitchen, bathroom, ADU & new construction. " + esc(LIC) + ". Call " + esc(PH) + '."><link rel="preconnect" href="https://fonts.googleapis.com"/><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/><style>' + SITE_CSS + '</style></head><body><nav><div class="nav-inner"><a href="/" class="logo">CCS<span>.</span></a><div class="nav-menu"><a href="#services">Services</a><a href="#projects">Projects</a><a href="#process">Process</a><a href="#reviews">Reviews</a><a href="/articles">Articles</a><a href="#contact">Contact</a><a href="' + PHU + '" class="nav-phone">' + esc(PH) + `</a><a href="#contact" class="nav-cta" onclick="leadSection='nav_cta'">Free Estimate</a></div><div class="hamburger" onclick="toggleMenu()"><span></span><span></span><span></span></div></div><div class="mobile-menu" id="mobileMenu"><a href="#services">Services</a><a href="#projects">Projects</a><a href="#process">Process</a><a href="#reviews">Reviews</a><a href="/articles">Articles</a><a href="#contact">Contact</a><a href="` + PHU + '" style="color:var(--accent);font-weight:600">' + esc(PH) + '</a></div></nav><div class="trust-bar"><div class="trust-inner container"><span class="trust-item">&#10003; ' + esc(LIC) + '</span><span class="trust-item">&#10003; ' + esc(ct.tagline || "Licensed, Bonded & Insured") + '</span><span class="trust-item">&#10003; ' + esc(ct.areas || "Los Angeles County") + '</span><span class="trust-item">&#10003; Free Estimates</span><span class="trust-item"><a href="' + PHU + '">' + esc(PH) + '</a></span></div></div><div class="hero"><div class="hero-bg"><img src="' + HERO_IMG + '" alt="' + esc(CO) + '" loading="eager"/><div class="hero-grad"></div></div><div class="hero-content container"><div class="hero-eyebrow">&#10003; Licensed &nbsp;|&nbsp; &#10003; Bonded &nbsp;|&nbsp; &#10003; Insured</div><h1>' + esc(ct.hero_title || "LAs Trusted General Contractor") + '</h1><p class="hero-sub">' + esc(ct.hero_sub || "Full-service licensed contractor in Los Angeles.") + `</p><div class="hero-ctas"><button class="btn btn-primary" onclick="openChat('estimate_start','hero_chat')">Estimate / Chat</button><a href="` + PHU + '" class="btn btn-ghost">Call ' + esc(PH) + '</a></div><div class="hero-stats"><div class="stat"><div class="stat-num">' + esc(ct.stat1_num || "500+") + '</div><div class="stat-label">' + esc(ct.stat1_label || "Projects Completed") + '</div></div><div class="stat"><div class="stat-num">' + esc(ct.stat2_num || "15+") + '</div><div class="stat-label">' + esc(ct.stat2_label || "Years in LA") + '</div></div><div class="stat"><div class="stat-num">' + esc(ct.stat3_num || "100%") + '</div><div class="stat-label">' + esc(ct.stat3_label || "Licensed & Insured") + '</div></div><div class="stat"><div class="stat-num">' + esc(ct.stat4_num || "5 Stars") + '</div><div class="stat-label">' + esc(ct.stat4_label || "Client Rating") + '</div></div></div></div></div><section class="section section-alt" id="services"><div class="container"><div class="section-head"><h2>Our Services</h2><p class="section-sub">Full-scope residential construction throughout Los Angeles County</p></div><div class="svc-tabs">' + svcTabs + "</div>" + svcPanels + '</div></section><section class="section" id="projects"><div class="container"><div class="section-head"><h2>Recent Projects</h2><p class="section-sub">A selection of completed work across Los Angeles County</p></div><div class="proj-filter">' + filterBtns + '</div><div class="proj-grid">' + projCards + '</div></div></section><section class="section section-dark" id="process"><div class="container"><div class="section-head"><h2>Our Process</h2><p class="section-sub">Straightforward from first call to final walkthrough</p></div><div class="proc-grid">' + procSteps + '</div></div></section><section class="section section-alt" id="reviews"><div class="container"><div class="section-head"><h2>What Clients Say</h2><p class="section-sub">Real feedback from LA homeowners</p></div><div class="rev-grid">' + revCards + "</div></div></section>" + artSection + '<section class="section section-darker" id="contact"><div class="container" style="max-width:680px"><div class="section-head"><h2>Get Your Free Estimate</h2><p class="section-sub">Tell us about your project and we&rsquo;ll follow up within one business day</p></div><div class="leads-grid"><input class="leads-input" id="lfName" placeholder="Full Name *"/><input class="leads-input" id="lfEmail" type="email" placeholder="Email Address *"/><input class="leads-input" id="lfPhone" placeholder="Phone Number"/><select class="leads-select" id="lfIntent"><option value="">Project Type</option>' + svcOptions + `<option>Other</option></select><select class="leads-select leads-select-half" id="lfBudget"><option value="">Budget Range</option><option>Under $25k</option><option>$25k\u2013$50k</option><option>$50k\u2013$100k</option><option>$100k\u2013$250k</option><option>$250k+</option><option>Not sure yet</option></select><select class="leads-select leads-select-half" id="lfTimeline"><option value="">Timeline</option><option>ASAP</option><option>1\u20133 months</option><option>3\u20136 months</option><option>6\u201312 months</option><option>Just exploring</option></select><textarea class="leads-textarea" id="lfMsg" placeholder="Tell us about your project..."></textarea></div><button class="btn btn-primary" id="lfBtn">Send My Project Details</button><div id="lfResult" class="lfr"></div><div class="cb-widget"><h3>Prefer a Call Back?</h3><p>Leave your number and we&rsquo;ll reach out at your preferred time.</p><div class="cb-grid"><input class="cb-input" id="cbName" placeholder="Your Name *"/><input class="cb-input" id="cbPhone" placeholder="Phone Number *"/><select class="cb-select" id="cbTime"><option value="">Best time to call</option><option value="morning">Morning (8am\u201312pm)</option><option value="afternoon">Afternoon (12pm\u20135pm)</option><option value="evening">Evening (5pm\u20137pm)</option><option value="anytime">Anytime</option></select><input class="cb-input" id="cbNote" placeholder="Optional note"/></div><button class="btn btn-ghost" onclick="submitCallback()">Request a Call Back</button><div id="cbResult" class="lfr"></div></div></div></section><footer><div class="container"><p style="margin-bottom:.4rem"><strong style="color:rgba(255,255,255,.7);font-family:'Oswald',sans-serif;letter-spacing:.04em">` + esc(CO) + "</strong></p><p>" + esc(LIC) + ' &nbsp;&bull;&nbsp; <a href="' + PHU + '" style="color:var(--accent)">' + esc(PH) + "</a> &nbsp;&bull;&nbsp; " + esc(ct.areas || "Los Angeles County") + ', CA</p><p style="margin-top:.5rem;font-size:.72rem;color:rgba(255,255,255,.25)">v' + VERSION + '</p></div></footer><button id="chatFab" onclick="openChat()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:18px;height:18px;flex-shrink:0"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> Estimate / Chat</button><div id="chatDrawer"><div class="chat-phone-bar"><a href="' + PHU + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:16px;height:16px"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.87 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>' + esc(PH) + ' &mdash; Tap to Call</a><button class="chat-close-btn" onclick="closeChat()">&#10005;</button></div><div class="chat-header"><div class="chat-avatar">&#127968;</div><div><div class="chat-title">' + esc(CO) + '</div><div class="chat-sub">Licensed General Contractor &bull; Free Estimates</div></div></div><div class="chat-msgs" id="chatMsgs"></div><div class="upload-area" id="uploadArea" style="display:none"><label class="upload-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>Attach photos or video<input type="file" id="chatFileInput" accept="image/*,video/*,.pdf" multiple/></label><div id="uploadProg" style="font-size:.78rem;color:var(--muted);margin-top:.4rem;text-align:center"></div></div><div class="chat-input-row"><input class="chat-text" id="chatInput" placeholder="Type a message..." autocomplete="off"/><button class="chat-send" id="chatSend"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div></div><script>' + CHAT_JS + "<\/script></body></html>";
}
__name(renderPublicHTML, "renderPublicHTML");
__name2(renderPublicHTML, "renderPublicHTML");
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
__name2(handlePublish, "handlePublish");
async function handleHome(env) {
  const snap = await dbFirst(env, "SELECT html FROM site_snapshot LIMIT 1");
  if (snap && snap.html) return h(snap.html);
  const content = await loadContent(env);
  const articles = await dbAll(env, "SELECT slug,title,summary,hero_image_r2_key,created_at FROM articles WHERE published=1 ORDER BY id DESC LIMIT 3");
  return h(renderPublicHTML(content, articles));
}
__name(handleHome, "handleHome");
__name2(handleHome, "handleHome");
async function handleArticlesIndex(env) {
  const articles = await dbAll(env, "SELECT slug,title,summary,hero_image_r2_key,created_at FROM articles WHERE published=1 ORDER BY id DESC LIMIT 50");
  const ctRow = await dbFirst(env, "SELECT data FROM site_content WHERE section='contact'");
  const c = ctRow ? JSON.parse(ctRow.data) : {};
  const PH = c.phone || "(818) 624-7212";
  const CO = c.company || "CCS Services Group";
  const LIC = c.license || "CSLB #890991";
  const cards = articles.map((a) => {
    const img = a.hero_image_r2_key ? '<img src="/media/serve/' + encodeURIComponent(a.hero_image_r2_key) + '" alt="' + esc(a.title) + '" style="width:100%;height:200px;object-fit:cover;display:block;border-radius:8px 8px 0 0"/>' : '<div style="height:200px;background:linear-gradient(135deg,#1a2744,#0f1a2e);display:flex;align-items:center;justify-content:center;font-size:3rem;border-radius:8px 8px 0 0">&#128215;</div>';
    return '<a href="/articles/' + a.slug + '" style="display:block;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);transition:transform .2s;text-decoration:none;color:inherit">' + img + '<div style="padding:1.25rem"><h2 style="font-family:Oswald,sans-serif;font-size:1.15rem;color:#1a2744;margin-bottom:.4rem;line-height:1.25">' + esc(a.title) + '</h2><p style="font-size:.84rem;color:#555;line-height:1.55;margin-bottom:.6rem">' + esc((a.summary || "").slice(0, 160)) + '</p><span style="font-size:.82rem;color:#c8a84b;font-weight:600">Read article &rarr;</span></div></a>';
  }).join("");
  return h('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Articles &amp; Guides | ' + esc(CO) + '</title><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif;background:#f8f7f5;color:#1c1c1e;line-height:1.65}nav{background:#1a2744;border-bottom:3px solid #c8a84b;padding:.8rem 1.5rem;display:flex;align-items:center;justify-content:space-between}a.logo{font-family:Oswald,sans-serif;color:#fff;font-size:1.3rem;text-decoration:none}a.logo span{color:#c8a84b}a.np{color:#c8a84b;font-weight:600;font-size:.9rem;text-decoration:none}.wrap{max-width:1100px;margin:0 auto;padding:3rem 1.5rem}h1{font-family:Oswald,sans-serif;font-size:2.2rem;color:#1a2744;margin-bottom:.5rem}.sub{color:#666;font-size:.97rem;margin-bottom:2.5rem}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}footer{background:#060d18;color:rgba(255,255,255,.4);text-align:center;padding:1.5rem;font-size:.8rem;margin-top:4rem}@media(max-width:768px){.grid{grid-template-columns:1fr}}</style></head><body><nav><a href="/" class="logo">CCS<span>.</span></a><a href="tel:+18186247212" class="np">' + esc(PH) + '</a></nav><div class="wrap"><h1>Resources &amp; Guides</h1><p class="sub">Expert advice from ' + esc(CO) + " &mdash; LA&rsquo;s licensed general contractor</p>" + (articles.length ? '<div class="grid">' + cards + "</div>" : '<p style="color:#888">No articles published yet.</p>') + "</div><footer>" + esc(CO) + " &nbsp;&bull;&nbsp; " + esc(LIC) + " &nbsp;&bull;&nbsp; " + esc(PH) + "</footer></body></html>");
}
__name(handleArticlesIndex, "handleArticlesIndex");
__name2(handleArticlesIndex, "handleArticlesIndex");
async function handlePublicArticlePage(slug, env) {
  const row = await dbFirst(env, "SELECT * FROM articles WHERE slug=? AND published=1", [slug]);
  if (!row) return new Response("Article not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const ctRow = await dbFirst(env, "SELECT data FROM site_content WHERE section='contact'");
  const c = ctRow ? JSON.parse(ctRow.data) : {};
  const PH = c.phone || "(818) 624-7212";
  const CO = c.company || "CCS Services Group";
  const LIC = c.license || "CSLB #890991";
  const heroImg = row.hero_image_r2_key ? '<img src="/media/serve/' + encodeURIComponent(row.hero_image_r2_key) + '" alt="' + esc(row.title) + '" style="width:100%;max-height:420px;object-fit:cover;border-radius:8px;margin-bottom:2rem;display:block"/>' : "";
  return h('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>' + esc(row.title) + " | " + esc(CO) + '</title><meta name="description" content="' + esc((row.summary || "").slice(0, 160)) + '"><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Inter",sans-serif;background:#f8f7f5;color:#1c1c1e;line-height:1.7}nav{background:#1a2744;border-bottom:3px solid #c8a84b;padding:.8rem 1.5rem;display:flex;align-items:center;justify-content:space-between}a.logo{font-family:"Oswald",sans-serif;color:#fff;font-size:1.3rem;text-decoration:none}a.logo span{color:#c8a84b}a.np{color:#c8a84b;font-weight:600;font-size:.9rem;text-decoration:none}.container{max-width:780px;margin:0 auto;padding:3rem 1.5rem}h1{font-family:"Oswald",sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);color:#1a2744;line-height:1.1;margin-bottom:1rem}.meta{color:#888;font-size:.82rem;margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid #e4e4e4}.summary{font-size:1.1rem;color:#444;font-style:italic;margin-bottom:2rem;padding:1rem 1.5rem;border-left:4px solid #c8a84b;background:#fff}.body{font-size:.97rem;color:#333;line-height:1.8}.cta-box{margin-top:3rem;background:#1a2744;border-radius:10px;padding:2rem;text-align:center}.cta-box h3{font-family:"Oswald",sans-serif;color:#fff;font-size:1.4rem;margin-bottom:.5rem}.cta-box p{color:rgba(255,255,255,.7);font-size:.9rem;margin-bottom:1.25rem}.btn{display:inline-block;background:#c8a84b;color:#fff;padding:.75rem 1.75rem;border-radius:4px;font-weight:600;text-decoration:none;font-family:"Oswald",sans-serif}footer{background:#060d18;color:rgba(255,255,255,.4);text-align:center;padding:1.5rem;font-size:.8rem;margin-top:4rem}</style></head><body><nav><a href="/" class="logo">CCS<span>.</span></a><a href="tel:+18186247212" class="np">' + esc(PH) + '</a></nav><div class="container">' + heroImg + "<h1>" + esc(row.title) + '</h1><div class="meta">Published ' + (row.created_at || "").slice(0, 10) + " &nbsp;&bull;&nbsp; " + esc(CO) + " &nbsp;&bull;&nbsp; " + esc(LIC) + "</div>" + (row.summary ? '<div class="summary">' + esc(row.summary) + "</div>" : "") + '<div class="body">' + esc(row.body || "").replace(/\n/g, "<br>") + '</div><div class="cta-box"><h3>Ready to Start Your Project?</h3><p>' + esc(CO) + ' serves Los Angeles County. Free estimates, licensed &amp; insured.</p><a href="/#contact" class="btn">Get a Free Estimate</a></div></div><footer>' + esc(CO) + " &nbsp;&bull;&nbsp; " + esc(LIC) + " &nbsp;&bull;&nbsp; " + esc(PH) + "</footer></body></html>");
}
__name(handlePublicArticlePage, "handlePublicArticlePage");
__name2(handlePublicArticlePage, "handlePublicArticlePage");
async function handleStatus(env) {
  let db = false, vec = false, r2 = false, leads = 0, articles = 0, callbacks = 0, has_snapshot = false;
  try {
    const r = await dbFirst(env, "SELECT COUNT(*) as c FROM leads");
    leads = r?.c || 0;
    db = true;
  } catch {
  }
  try {
    const r = await dbFirst(env, "SELECT COUNT(*) as c FROM articles");
    articles = r?.c || 0;
  } catch {
  }
  try {
    const r = await dbFirst(env, "SELECT COUNT(*) as c FROM callbacks");
    callbacks = r?.c || 0;
  } catch {
  }
  try {
    const r = await dbFirst(env, "SELECT published_at FROM site_snapshot LIMIT 1");
    has_snapshot = !!r;
  } catch {
  }
  try {
    const v = await embed(env, "test");
    vec = v.length === 768;
  } catch {
  }
  try {
    await env.V003_2_R2.list({ prefix: R2_PREFIX, limit: 1 });
    r2 = true;
  } catch {
  }
  return j({ ok: true, worker: WORKER, version: VERSION, company: COMPANY, db, vectorize: vec, r2, ai: true, embedding_model: EMBED_MODEL, leads, articles, callbacks, has_snapshot, timestamp: now() });
}
__name(handleStatus, "handleStatus");
__name2(handleStatus, "handleStatus");
async function handleContentGet(section, env) {
  const row = await dbFirst(env, "SELECT data FROM site_content WHERE section=?", [section]);
  if (!row) return j({ ok: false, error: "not found" }, 404);
  try {
    return j({ ok: true, section, data: JSON.parse(row.data) });
  } catch (e) {
    return j({ ok: false, error: "parse error" }, 500);
  }
}
__name(handleContentGet, "handleContentGet");
__name2(handleContentGet, "handleContentGet");
async function handleContentSave(req, section, env) {
  const b = await body(req);
  if (b.data === void 0) return j({ ok: false, error: "data required" }, 400);
  await dbRun(env, "INSERT OR REPLACE INTO site_content (section,data,updated_at) VALUES (?,?,?)", [section, JSON.stringify(b.data), now()]);
  return j({ ok: true, section, updated_at: now() });
}
__name(handleContentSave, "handleContentSave");
__name2(handleContentSave, "handleContentSave");
async function handleLeads(req, env) {
  const b = await body(req);
  const { name, email, phone, service, project_type, message, lead_section, section, budget_range, budget, timeline, source = "web" } = b;
  if (!name) return j({ ok: false, error: "name required" }, 400);
  await dbRun(env, "INSERT INTO leads (name,email,phone,service,message,source,created_at,lead_section,status,budget_range,timeline) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [name, email || "", phone || "", service || project_type || "", message || "", source, now(), lead_section || section || "lead_form", "new", budget_range || budget || "", timeline || ""]);
  const cc = await getContactConstants(env);
  return j({ ok: true, lead_id: uid(), message: "Thank you! " + cc.company + " will follow up within one business day. You can also call " + cc.phone + " directly." });
}
__name(handleLeads, "handleLeads");
__name2(handleLeads, "handleLeads");
async function handleCallback(req, env) {
  const b = await body(req);
  const { name, phone, preferred_time, preferred_date, project_type, notes, lead_section, section, source = "web" } = b;
  if (!name || !phone) return j({ ok: false, error: "name and phone required" }, 400);
  await dbRun(env, "INSERT INTO callbacks (name,phone,preferred_time,service,message,source,created_at,lead_section,status) VALUES (?,?,?,?,?,?,?,?,?)", [name, phone, preferred_time || "", project_type || "", [preferred_time, preferred_date, notes].filter(Boolean).join(" | "), source, now(), lead_section || section || "callback_widget", "pending"]).catch(async () => {
    await dbRun(env, "INSERT INTO callbacks (name,phone,created_at) VALUES (?,?,?)", [name, phone, now()]);
  });
  const cc2 = await getContactConstants(env);
  return j({ ok: true, callback_id: uid(), message: "Got it! We will call you " + (preferred_time ? "in the " + preferred_time : "soon") + ". You can also reach us at " + cc2.phone + "." });
}
__name(handleCallback, "handleCallback");
__name2(handleCallback, "handleCallback");
async function handleChat(req, env) {
  const b = await body(req);
  const message = (b.message || "").trim();
  const state = b.state || "init";
  const section = b.section || "";
  if (!message && state === "init") return j({ ok: true, state: "init", answer: "Hi! Welcome to CCS Services Group. Are you looking for a free estimate, or do you have a question about our services?", suggested_actions: [{ type: "state", label: "Free Estimate", value: "estimate_start" }, { type: "state", label: "Ask a Question", value: "qa" }] });
  if (state === "init" && (message.toLowerCase().includes("estimate") || message === "estimate_start")) return j({ ok: true, state: "estimate_project", answer: "Great! What kind of project are you thinking about?", suggested_actions: [{ type: "quick", label: "Kitchen" }, { type: "quick", label: "Bathroom" }, { type: "quick", label: "ADU" }, { type: "quick", label: "Addition" }, { type: "quick", label: "New Construction" }, { type: "quick", label: "Other" }] });
  if (state === "estimate_project") return j({ ok: true, state: "estimate_location", answer: "Got it. Where is the property located?", suggested_actions: [{ type: "quick", label: "Silver Lake" }, { type: "quick", label: "Burbank" }, { type: "quick", label: "Glendale" }, { type: "quick", label: "Pasadena" }] });
  if (state === "estimate_location") return j({ ok: true, state: "estimate_contact", answer: "Perfect. How would you like to connect for your free estimate?", suggested_actions: [{ type: "call", label: "Call us now \u2014 " + PHONE, url: PHONE_URL }, { type: "state", label: "Request a Callback", value: "callback_start" }, { type: "upload", label: "Upload photos \u2014 we will call you" }] });
  if (state === "estimate_contact" || message === "callback_start") return j({ ok: true, state: "callback_name", answer: "Happy to arrange a callback. What is your name?" });
  if (state === "callback_name") return j({ ok: true, state: "callback_phone", answer: "Got it, " + message + ". What is the best number to reach you?" });
  if (state === "callback_phone") return j({ ok: true, state: "callback_time", answer: "And any preference for time of day?", suggested_actions: [{ type: "quick", label: "Morning" }, { type: "quick", label: "Afternoon" }, { type: "quick", label: "Evening" }, { type: "quick", label: "Anytime" }] });
  if (state === "callback_time") {
    try {
      await dbRun(env, "INSERT INTO callbacks (name,phone,preferred_time,service,message,source,created_at,lead_section,status) VALUES (?,?,?,?,?,?,?,?,?)", ["Chat lead", "", message, "", "Preferred: " + message, "chat_estimate", now(), section || "chat_estimate", "pending"]);
    } catch (e) {
    }
    return j({ ok: true, state: "done", answer: "Perfect \u2014 we will call you " + message.toLowerCase() + ". You can also reach us anytime at " + PHONE + ".", suggested_actions: [{ type: "call", label: "Call " + PHONE + " now", url: PHONE_URL }] });
  }
  if (state === "estimate_upload") {
    try {
      await dbRun(env, "INSERT INTO leads (name,email,phone,service,message,source,created_at,lead_section,status,budget_range,timeline) VALUES (?,?,?,?,?,?,?,?,?,?,?)", ["Chat lead", "", "", "via chat", message, "chat_estimate", now(), section || "chat_estimate", "new", "", ""]);
    } catch (e) {
    }
    return j({ ok: true, state: "done", answer: "Thank you! We have your info and will follow up within one business day. Call us anytime at " + PHONE + ".", suggested_actions: [{ type: "call", label: "Call " + PHONE, url: PHONE_URL }] });
  }
  let matches = [];
  try {
    matches = await vecSearch(env, message, 5);
  } catch (e) {
  }
  const context = matches.map((m, i) => "[" + (i + 1) + "] " + (m.metadata?.title || m.id) + ": " + (m.metadata?.summary || "")).join("\n");
  let answer = "";
  try {
    const sys = "You are a helpful assistant for CCS Services Group, a licensed general contractor in Los Angeles (" + LICENSE + ", phone " + PHONE + "). Answer using the context below. Be concise and warm. Always mention the free estimate offer.\n\nContext:\n" + context;
    const r = await env.AI.run(CHAT_MODEL, { messages: [{ role: "system", content: sys }, { role: "user", content: message }], max_tokens: 400 });
    answer = r.response || r.choices?.[0]?.message?.content || "";
  } catch (e) {
    answer = matches.length > 0 ? (matches[0].metadata?.summary || "") + " Call us at " + PHONE + " for details." : "CCS Services Group handles kitchens, bathrooms, ADUs, additions, and new construction in LA. Call " + PHONE + " for a free estimate.";
  }
  answer += "\n\nWant a free estimate? Call " + PHONE + " or let us know your project below.";
  try {
    await dbRun(env, "INSERT INTO chats (message,response,created_at) VALUES (?,?,?)", [message, answer, now()]);
  } catch (e) {
  }
  return j({ ok: true, state: "qa", answer, matches: matches.slice(0, 5).map((m) => ({ title: m.metadata?.title || m.id, slug: m.metadata?.slug || "", summary: m.metadata?.summary || "", score: m.score })), suggested_actions: [{ type: "call", label: "Call " + PHONE, url: PHONE_URL }, { type: "state", label: "Get Free Estimate", value: "estimate_start" }] });
}
__name(handleChat, "handleChat");
__name2(handleChat, "handleChat");
async function handleSeed(env) {
  const rows = await dbAll(env, "SELECT * FROM articles");
  let embedded = 0;
  for (const row of rows) {
    try {
      const text = [row.title, row.summary, row.body].filter(Boolean).join(" ");
      const vec = await embed(env, text);
      await env.V003_2_VECTORIZE.upsert([{ id: "article-" + row.slug, values: vec, metadata: { title: row.title, summary: row.summary || "", slug: row.slug } }]);
      embedded++;
    } catch (e) {
    }
  }
  return j({ ok: true, embedded, total: rows.length });
}
__name(handleSeed, "handleSeed");
__name2(handleSeed, "handleSeed");
async function handleUpload(req, env) {
  try {
    const fd = await req.formData();
    const file = fd.get("file");
    if (!file) return j({ ok: false, error: "no file" }, 400);
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "heic", "pdf"].includes(ext)) return j({ ok: false, error: "file type not allowed" }, 400);
    const key = R2_PREFIX + "uploads/" + Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const buf = await file.arrayBuffer();
    await env.V003_2_R2.put(key, buf, { httpMetadata: { contentType: file.type } });
    return j({ ok: true, r2_key: key });
  } catch (e) {
    return j({ ok: false, error: e.message }, 500);
  }
}
__name(handleUpload, "handleUpload");
__name2(handleUpload, "handleUpload");
async function handleAdminLeads(req, env) {
  if (req.method === "PATCH") {
    const b = await body(req);
    const status = String(b.status || "").toLowerCase();
    if (!validLeadStatus(status)) return j({ ok: false, error: "invalid status" }, 400);
    if (!b.id) return j({ ok: false, error: "id required" }, 400);
    await dbRun(env, "UPDATE leads SET status=? WHERE id=?", [status, b.id]);
    return j({ ok: true, id: b.id, status });
  }
  const url = new URL(req.url);
  if (url.searchParams.get("format") === "csv") {
    const rows = await dbAll(env, "SELECT id,name,email,phone,service,message,source,lead_section,status,budget_range,timeline,created_at FROM leads ORDER BY id DESC LIMIT 1000");
    const headers = ["id", "name", "email", "phone", "service", "message", "source", "lead_section", "status", "budget_range", "timeline", "created_at"];
    return csvRes("leads.csv", [headers.join(","), ...rows.map((r) => headers.map((hk) => csvCell(r[hk])).join(","))].join("\n"));
  }
  return j({ ok: true, leads: await dbAll(env, "SELECT * FROM leads ORDER BY id DESC LIMIT 100") });
}
__name(handleAdminLeads, "handleAdminLeads");
__name2(handleAdminLeads, "handleAdminLeads");
async function handleAdminLeadById(req, env, id) {
  if (req.method !== "PATCH") return j({ ok: false, error: "method not allowed" }, 405);
  const b = await body(req);
  const status = String(b.status || "").toLowerCase();
  if (!validLeadStatus(status)) return j({ ok: false, error: "invalid status" }, 400);
  await dbRun(env, "UPDATE leads SET status=? WHERE id=?", [status, id]);
  return j({ ok: true, id, status });
}
__name(handleAdminLeadById, "handleAdminLeadById");
__name2(handleAdminLeadById, "handleAdminLeadById");
async function handleAdminCallbacks(req, env) {
  if (req.method === "PATCH") {
    const b = await body(req);
    const status = String(b.status || "").toLowerCase();
    if (!validCallbackStatus(status)) return j({ ok: false, error: "invalid status" }, 400);
    if (!b.id) return j({ ok: false, error: "id required" }, 400);
    await dbRun(env, "UPDATE callbacks SET status=? WHERE id=?", [status, b.id]);
    return j({ ok: true, id: b.id, status });
  }
  const url = new URL(req.url);
  if (url.searchParams.get("format") === "csv") {
    const rows = await dbAll(env, "SELECT id,name,phone,preferred_time,service,message,lead_section,status,created_at FROM callbacks ORDER BY id DESC LIMIT 1000");
    const headers = ["id", "name", "phone", "preferred_time", "service", "message", "lead_section", "status", "created_at"];
    return csvRes("callbacks.csv", [headers.join(","), ...rows.map((r) => headers.map((hk) => csvCell(r[hk])).join(","))].join("\n"));
  }
  return j({ ok: true, callbacks: await dbAll(env, "SELECT * FROM callbacks ORDER BY id DESC LIMIT 100") });
}
__name(handleAdminCallbacks, "handleAdminCallbacks");
__name2(handleAdminCallbacks, "handleAdminCallbacks");
async function handleAdminCallbackById(req, env, id) {
  if (req.method !== "PATCH") return j({ ok: false, error: "method not allowed" }, 405);
  const b = await body(req);
  const status = String(b.status || "").toLowerCase();
  if (!validCallbackStatus(status)) return j({ ok: false, error: "invalid status" }, 400);
  await dbRun(env, "UPDATE callbacks SET status=? WHERE id=?", [status, id]);
  return j({ ok: true, id, status });
}
__name(handleAdminCallbackById, "handleAdminCallbackById");
__name2(handleAdminCallbackById, "handleAdminCallbackById");
async function handleMediaUpload(req, env) {
  try {
    const fd = await req.formData();
    const file = fd.get("file");
    const category = fd.get("category") || "other";
    const alt_text = fd.get("alt_text") || "";
    if (!file) return j({ ok: false, error: "no file" }, 400);
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "heic", "pdf", "mp3", "m4a", "wav", "ogg"].includes(ext)) return j({ ok: false, error: "file type not allowed" }, 400);
    const id = uid();
    const key = R2_PREFIX + "media/" + category + "/" + id + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const buf = await file.arrayBuffer();
    await env.V003_2_R2.put(key, buf, { httpMetadata: { contentType: file.type } });
    await dbRun(env, "INSERT INTO media_library (id,r2_key,filename,content_type,file_size,alt_text,category,uploaded_at) VALUES (?,?,?,?,?,?,?,?)", [id, key, file.name, file.type, buf.byteLength, alt_text, category, now()]);
    return j({ ok: true, id, r2_key: key, filename: file.name, content_type: file.type, category });
  } catch (e) {
    return j({ ok: false, error: e.message }, 500);
  }
}
__name(handleMediaUpload, "handleMediaUpload");
__name2(handleMediaUpload, "handleMediaUpload");
async function handleMediaList(env) {
  return j({ ok: true, media: await dbAll(env, "SELECT * FROM media_library ORDER BY uploaded_at DESC LIMIT 200") });
}
__name(handleMediaList, "handleMediaList");
__name2(handleMediaList, "handleMediaList");
async function handleMediaDelete(req, env, id) {
  const row = await dbFirst(env, "SELECT r2_key FROM media_library WHERE id=?", [id]);
  if (!row) return j({ ok: false, error: "not found" }, 404);
  try {
    await env.V003_2_R2.delete(row.r2_key);
  } catch (e) {
  }
  await dbRun(env, "DELETE FROM media_library WHERE id=?", [id]);
  return j({ ok: true, id });
}
__name(handleMediaDelete, "handleMediaDelete");
__name2(handleMediaDelete, "handleMediaDelete");
async function handleMediaAltText(req, env, id) {
  const b = await body(req);
  await dbRun(env, "UPDATE media_library SET alt_text=? WHERE id=?", [b.alt_text || "", id]);
  return j({ ok: true, id });
}
__name(handleMediaAltText, "handleMediaAltText");
__name2(handleMediaAltText, "handleMediaAltText");
async function handleMediaServe(env, r2_key_encoded) {
  const key = decodeURIComponent(r2_key_encoded);
  try {
    const obj = await env.V003_2_R2.get(key);
    if (!obj) return j({ ok: false, error: "not found" }, 404);
    return new Response(obj.body, { headers: { "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream", "Cache-Control": "public,max-age=86400" } });
  } catch (e) {
    return j({ ok: false, error: e.message }, 500);
  }
}
__name(handleMediaServe, "handleMediaServe");
__name2(handleMediaServe, "handleMediaServe");
async function handleAdminArticles(req, env) {
  return j({ ok: true, articles: await dbAll(env, "SELECT id,slug,title,summary,published,hero_image_r2_key,created_at FROM articles ORDER BY id DESC") });
}
__name(handleAdminArticles, "handleAdminArticles");
__name2(handleAdminArticles, "handleAdminArticles");
async function handleAdminArticleGet(env, id) {
  const row = await dbFirst(env, "SELECT * FROM articles WHERE id=?", [id]);
  return row ? j({ ok: true, article: row }) : j({ ok: false, error: "not found" }, 404);
}
__name(handleAdminArticleGet, "handleAdminArticleGet");
__name2(handleAdminArticleGet, "handleAdminArticleGet");
async function handleAdminArticleSave(req, env, id) {
  const b = await body(req);
  if (id === "new") {
    const slug = (b.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
    await dbRun(env, "INSERT INTO articles (slug,title,summary,body,published,hero_image_r2_key,created_at) VALUES (?,?,?,?,?,?,?)", [slug, b.title || "", b.summary || "", b.body || "", b.published ? 1 : 0, b.hero_image_r2_key || "", now()]);
    const row = await dbFirst(env, "SELECT * FROM articles WHERE slug=?", [slug]);
    if (b.published && row) {
      try {
        const vec = await embed(env, [row.title, row.summary, row.body].filter(Boolean).join(" "));
        await env.V003_2_VECTORIZE.upsert([{ id: "article-" + slug, values: vec, metadata: { title: row.title, summary: row.summary || "", slug } }]);
      } catch (e) {
      }
    }
    return j({ ok: true, article: row });
  } else {
    await dbRun(env, "UPDATE articles SET title=?,summary=?,body=?,published=?,hero_image_r2_key=? WHERE id=?", [b.title || "", b.summary || "", b.body || "", b.published ? 1 : 0, b.hero_image_r2_key || "", id]);
    const row = await dbFirst(env, "SELECT * FROM articles WHERE id=?", [id]);
    if (row) {
      try {
        const vec = await embed(env, [row.title, row.summary, row.body].filter(Boolean).join(" "));
        await env.V003_2_VECTORIZE.upsert([{ id: "article-" + row.slug, values: vec, metadata: { title: row.title, summary: row.summary || "", slug: row.slug } }]);
      } catch (e) {
      }
    }
    return j({ ok: true, article: row });
  }
}
__name(handleAdminArticleSave, "handleAdminArticleSave");
__name2(handleAdminArticleSave, "handleAdminArticleSave");
async function handleAdminArticleToggle(req, env, id) {
  const row = await dbFirst(env, "SELECT published FROM articles WHERE id=?", [id]);
  if (!row) return j({ ok: false, error: "not found" }, 404);
  const newVal = row.published ? 0 : 1;
  await dbRun(env, "UPDATE articles SET published=? WHERE id=?", [newVal, id]);
  return j({ ok: true, id, published: newVal });
}
__name(handleAdminArticleToggle, "handleAdminArticleToggle");
__name2(handleAdminArticleToggle, "handleAdminArticleToggle");
async function handleAdminArticleDelete(env, id) {
  await dbRun(env, "DELETE FROM articles WHERE id=?", [id]);
  return j({ ok: true, id });
}
__name(handleAdminArticleDelete, "handleAdminArticleDelete");
__name2(handleAdminArticleDelete, "handleAdminArticleDelete");
async function handleKnowledgeList(env) {
  return j({ ok: true, seeds: await dbAll(env, "SELECT id,title,body,category,embedded,created_at FROM knowledge_seeds ORDER BY created_at DESC") });
}
__name(handleKnowledgeList, "handleKnowledgeList");
__name2(handleKnowledgeList, "handleKnowledgeList");
async function handleKnowledgeSave(req, env, id) {
  const b = await body(req);
  if (!b.title || !b.body) return j({ ok: false, error: "title and body required" }, 400);
  const seedId = id === "new" ? uid() : id;
  const ts = now();
  if (id === "new") {
    await dbRun(env, "INSERT INTO knowledge_seeds (id,title,body,category,embedded,created_at,updated_at) VALUES (?,?,?,?,0,?,?)", [seedId, b.title, b.body, b.category || "general", ts, ts]);
  } else {
    await dbRun(env, "UPDATE knowledge_seeds SET title=?,body=?,category=?,updated_at=?,embedded=0 WHERE id=?", [b.title, b.body, b.category || "general", ts, id]);
  }
  try {
    const vec = await embed(env, b.title + " " + b.body);
    await env.V003_2_VECTORIZE.upsert([{ id: "seed-" + seedId, values: vec, metadata: { title: b.title, summary: b.body.slice(0, 300), slug: "seed-" + seedId } }]);
    await dbRun(env, "UPDATE knowledge_seeds SET embedded=1 WHERE id=?", [seedId]);
  } catch (e) {
  }
  return j({ ok: true, seed: await dbFirst(env, "SELECT * FROM knowledge_seeds WHERE id=?", [seedId]) });
}
__name(handleKnowledgeSave, "handleKnowledgeSave");
__name2(handleKnowledgeSave, "handleKnowledgeSave");
async function handleKnowledgeDelete(env, id) {
  try {
    await env.V003_2_VECTORIZE.deleteByIds(["seed-" + id]);
  } catch (e) {
  }
  await dbRun(env, "DELETE FROM knowledge_seeds WHERE id=?", [id]);
  return j({ ok: true, id });
}
__name(handleKnowledgeDelete, "handleKnowledgeDelete");
__name2(handleKnowledgeDelete, "handleKnowledgeDelete");
function buildAdmin() {
  const ADMIN_CSS = '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}:root{--p:#1a2744;--a:#c8a84b;--bg:#0f1a2e;--card:#1a2744;--border:#2a3a5c;--text:#e8eaf0;--muted:#8899aa;--r:8px}body{font-family:"Inter",sans-serif;background:var(--bg);color:var(--text);min-height:100vh}#lock{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:100}.lbox{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:3rem 2.5rem;max-width:380px;width:90%;text-align:center}.ltitle{font-family:"Oswald",sans-serif;font-size:1.6rem;color:#fff;letter-spacing:.06em;margin-bottom:.25rem}.ltitle span{color:var(--a)}.lsub{color:var(--muted);font-size:.85rem;margin-bottom:2rem}.linput{width:100%;background:rgba(255,255,255,.06);border:1.5px solid var(--border);border-radius:var(--r);padding:.8rem 1rem;font-size:1rem;color:#fff;outline:none;text-align:center;letter-spacing:.2em;margin-bottom:1rem}.linput:focus{border-color:var(--a)}.lbtn{width:100%;background:var(--a);color:#fff;font-family:"Oswald",sans-serif;font-size:1rem;font-weight:600;letter-spacing:.08em;border:none;border-radius:var(--r);padding:.85rem;cursor:pointer}.lerr{color:#f87171;font-size:.82rem;margin-top:.5rem;display:none}#app{display:none}.anav{background:var(--p);border-bottom:3px solid var(--a);padding:.75rem 2rem;display:flex;align-items:center;justify-content:space-between}.alogo{font-family:"Oswald",sans-serif;color:#fff;font-size:1.25rem;letter-spacing:.06em}.alogo span{color:var(--a)}.atag{background:rgba(200,168,75,.2);color:var(--a);font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:.25rem .7rem;border-radius:10px}.lout{background:transparent;border:1px solid var(--border);color:var(--muted);font-size:.8rem;padding:.35rem .85rem;border-radius:var(--r);cursor:pointer}.lout:hover{border-color:var(--a);color:var(--a)}.atabs{display:flex;gap:.35rem;flex-wrap:wrap;padding:.75rem 2rem;background:var(--p);border-bottom:1px solid var(--border)}.atab{background:transparent;border:none;color:var(--muted);font-family:"Inter",sans-serif;font-size:.8rem;font-weight:500;padding:.45rem .9rem;border-radius:var(--r);cursor:pointer;transition:all .15s;white-space:nowrap}.atab:hover{color:#fff;background:rgba(255,255,255,.07)}.atab.active{background:var(--a);color:#fff;font-weight:600}.abody{max-width:1100px;margin:0 auto;padding:2rem 1.5rem}.acard{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:1.5rem}.acard-head{padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}.acard-head h2{font-family:"Oswald",sans-serif;font-size:1.1rem;color:#fff;letter-spacing:.06em}.acard-body{padding:1.5rem}.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem}.stat-box{background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem}.stat-box h4{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:.4rem}.stat-val{font-size:1.2rem;font-weight:700;color:#fff}.ok{color:#4ade80}.err{color:#f87171}.btn{display:inline-block;padding:.55rem 1.1rem;border-radius:var(--r);font-weight:600;font-size:.82rem;cursor:pointer;border:none;transition:opacity .15s;font-family:"Inter",sans-serif;text-decoration:none}.btn:hover{opacity:.85}.btn-gold{background:var(--a);color:#fff}.btn-outline{background:transparent;border:1px solid var(--border);color:var(--muted)}.btn-outline:hover{border-color:var(--a);color:var(--a)}.btn-sm{padding:.35rem .75rem;font-size:.75rem}table{width:100%;border-collapse:collapse;font-size:.82rem}thead th{text-align:left;padding:.5rem .75rem;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);border-bottom:1px solid var(--border)}tbody tr:hover{background:rgba(255,255,255,.03)}td{padding:.6rem .75rem;border-bottom:1px solid rgba(255,255,255,.04);color:var(--text);vertical-align:top}.log{background:rgba(0,0,0,.3);border-radius:var(--r);padding:1rem;font-size:.78rem;font-family:monospace;color:#94a3b8;white-space:pre-wrap;max-height:200px;overflow:auto;display:none;margin-top:1rem}.sinput{background:rgba(255,255,255,.06);border:1.5px solid var(--border);border-radius:var(--r);padding:.6rem 1rem;font-size:.88rem;color:#fff;outline:none;flex:1}.sinput:focus{border-color:var(--a)}.spin{display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:4px}@keyframes spin{to{transform:rotate(360deg)}}.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:300;display:none;align-items:center;justify-content:center;padding:1rem}.modal{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:2rem;width:100%;max-width:640px;max-height:90vh;overflow-y:auto}.modal h3{font-family:"Oswald",sans-serif;color:#fff;font-size:1.2rem;margin-bottom:1.25rem}.finput,.ftextarea,.fselect{width:100%;background:rgba(255,255,255,.06);border:1.5px solid var(--border);border-radius:var(--r);padding:.7rem .9rem;font-size:.88rem;color:#fff;outline:none;font-family:"Inter",sans-serif;margin-bottom:.85rem}.finput:focus,.ftextarea:focus,.fselect:focus{border-color:var(--a)}.ftextarea{min-height:120px;resize:vertical}.fselect option{background:#1a2744}.flabel{font-size:.78rem;color:var(--muted);margin-bottom:.3rem;display:block}.frow{display:flex;gap:.75rem;align-items:center;margin-bottom:.5rem}';
  const jsLines = [
    'var PASS="' + ADMIN_PASS + '";',
    'var activeTab="dashboard";',
    'function unlock(){document.getElementById("lock").style.display="none";document.getElementById("app").style.display="block";loadAll();}',
    'function tryLogin(){var pw=document.getElementById("pw").value;if(pw===PASS){sessionStorage.setItem("ccs_admin_v2","1");unlock();}else{document.getElementById("pwErr").style.display="block";document.getElementById("pw").value="";}}',
    // IIFE — script is at bottom of body, DOM is ready
    "(function(){",
    '  var authed=sessionStorage.getItem("ccs_admin_v2")==="1";',
    '  document.getElementById("pwBtn").addEventListener("click",tryLogin);',
    '  document.getElementById("pw").addEventListener("keydown",function(e){if(e.key==="Enter")tryLogin();});',
    '  document.getElementById("logoutBtn").addEventListener("click",function(){sessionStorage.removeItem("ccs_admin_v2");document.getElementById("app").style.display="none";document.getElementById("lock").style.display="flex";document.getElementById("pw").value="";});',
    '  document.getElementById("seedBtn").addEventListener("click",async function(){var log=document.getElementById("seedLog");log.style.display="block";log.textContent="Re-embedding...\\n";try{var r=await fetch("/api/seed",{method:"POST"});var d=await r.json();log.textContent+="Done: "+d.embedded+"/"+d.total+" articles\\n";}catch(e){log.textContent+="Error: "+e.message+"\\n";}});',
    `  document.getElementById("searchBtn").addEventListener("click",async function(){var q=document.getElementById("searchQ").value.trim();if(!q)return;var el=document.getElementById("searchResults");el.innerHTML="<span class='spin'></span> Searching...";try{var r=await fetch("/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q,state:"qa"})});var d=await r.json();if(!d.matches||!d.matches.length){el.innerHTML="<p style='color:var(--muted)'>No matches.</p>";return;}el.innerHTML=d.matches.map(function(m){return"<div style='background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1rem;margin-bottom:.75rem'><div style='font-size:.72rem;color:var(--a);font-weight:600;margin-bottom:.3rem'>"+(m.score*100).toFixed(1)+"%</div><div style='font-size:.9rem;font-weight:600;color:#fff;margin-bottom:.25rem'>"+m.title+"</div><div style='font-size:.78rem;color:var(--muted)'>"+m.summary+"</div></div>";}).join("");}catch(e){el.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}});`,
    '  document.getElementById("searchQ").addEventListener("keydown",function(e){if(e.key==="Enter")document.getElementById("searchBtn").click();});',
    '  document.getElementById("publishBtn").addEventListener("click",async function(){var btn=this;btn.disabled=true;btn.textContent="Publishing...";try{var r=await fetch("/api/publish",{method:"POST"});var d=await r.json();if(d.ok){btn.textContent="Published!";btn.style.background="#22c55e";setTimeout(function(){btn.textContent="Publish Site Live";btn.style.background="";btn.disabled=false;},3000);loadStatus();}else{btn.textContent="Error: "+(d.error||"unknown");btn.disabled=false;}}catch(e){btn.textContent="Error: "+e.message;btn.disabled=false;}});',
    "  if(authed)unlock();",
    "})();",
    // Tab system
    'function showTab(t){activeTab=t;document.querySelectorAll(".atab").forEach(function(el){el.classList.toggle("active",el.dataset.tab===t);});document.querySelectorAll(".apanel").forEach(function(el){el.style.display=el.dataset.panel===t?"block":"none";});if(t==="dashboard")loadStatus();else if(t==="leads")loadLeads();else if(t==="callbacks")loadCallbacks();else if(t==="articles")loadArticles();else if(t==="media")loadMedia();else if(t==="knowledge")loadKnowledge();else if(t==="members")loadMembers();else if(t==="submissions")loadSubmissions();else if(["services","projects","reviews","process","contact"].includes(t))loadSection(t);}',
    "function loadAll(){loadStatus();}",
    // Status
    `async function loadStatus(){try{var r=await fetch("/api/status");var d=await r.json();var snap=d.has_snapshot?"<span style='color:#22c55e'>Yes</span>":"<span style='color:#f59e0b'>No \u2014 click Publish</span>";var items=[["Worker",d.worker,false],["Version",d.version,false],["D1",d.db,true],["Vectorize",d.vectorize,true],["R2",d.r2,true],["Leads",d.leads,false],["Callbacks",d.callbacks,false],["Articles",d.articles,false],["Site Live",snap,false]];document.getElementById("statusGrid").innerHTML=items.map(function(x){var v=x[2]?(x[1]?"Yes":"No"):String(x[1]!=null?x[1]:"--");var c=x[2]?(x[1]?"ok":"err"):"";return"<div class='stat-box'><h4>"+x[0]+"</h4><div class='stat-val "+c+"'>" +v+"</div></div>";}).join("");}catch(e){document.getElementById("statusGrid").innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}}`,
    // Status badges
    `function leadStatusBadge(s){var map={"new":"#3b82f6","contacted":"#f59e0b","quoted":"#8b5cf6","won":"#22c55e","lost":"#ef4444"};var c=map[s]||"#6b7280";return"<span style='background:"+c+";color:#fff;font-size:.68rem;font-weight:600;padding:.15rem .55rem;border-radius:10px;text-transform:uppercase'>"+s+"</span>";}`,
    `function cbStatusBadge(s){var map={"pending":"#f59e0b","called":"#22c55e","no_answer":"#ef4444","scheduled":"#8b5cf6"};var c=map[s]||"#6b7280";return"<span style='background:"+c+";color:#fff;font-size:.68rem;font-weight:600;padding:.15rem .55rem;border-radius:10px;text-transform:uppercase'>"+s+"</span>";}`,
    // Leads
    `async function loadLeads(){var el=document.getElementById("leadsTable");try{var r=await fetch("/api/admin/leads");var d=await r.json();if(!d.ok||!d.leads||!d.leads.length){el.innerHTML="<p style='color:var(--muted)'>No leads yet.</p>";return;}var html="<div style='margin-bottom:.75rem'><a href='/api/admin/leads?format=csv' class='btn btn-outline btn-sm' download>Export CSV</a></div><div style='overflow-x:auto'><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Service</th><th>Budget</th><th>Timeline</th><th>Section</th><th>Status</th><th>Date</th></tr></thead><tbody>";d.leads.forEach(function(l){html+="<tr><td>"+l.name+"</td><td>"+l.email+"</td><td>"+l.phone+"</td><td>"+(l.service||"")+"</td><td>"+(l.budget_range||"")+"</td><td>"+(l.timeline||"")+"</td><td style='font-size:.75rem;color:var(--a)'>"+(l.lead_section||"")+"</td><td>"+leadStatusBadge(l.status||"new")+"<br><select onchange='updateLeadStatus("+l.id+",this.value)' style='margin-top:.3rem;background:rgba(255,255,255,.08);border:1px solid var(--border);color:#fff;font-size:.72rem;padding:.2rem .4rem;border-radius:4px;outline:none'><option value='new'"+(l.status==="new"?" selected":"")+">new</option><option value='contacted'"+(l.status==="contacted"?" selected":"")+">contacted</option><option value='quoted'"+(l.status==="quoted"?" selected":"")+">quoted</option><option value='won'"+(l.status==="won"?" selected":"")+">won</option><option value='lost'"+(l.status==="lost"?" selected":"")+">lost</option></select></td><td>"+(l.created_at||"").slice(0,16)+"</td></tr>";});html+="</tbody></table></div>";el.innerHTML=html;}catch(e){el.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}}`,
    'async function updateLeadStatus(id,status){try{await fetch("/api/admin/leads/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:status})});}catch(e){alert(e.message);}}',
    // Callbacks
    `async function loadCallbacks(){var el=document.getElementById("callbacksTable");try{var r=await fetch("/api/admin/callbacks");var d=await r.json();if(!d.ok||!d.callbacks||!d.callbacks.length){el.innerHTML="<p style='color:var(--muted)'>No callbacks yet.</p>";return;}var html="<div style='margin-bottom:.75rem'><a href='/api/admin/callbacks?format=csv' class='btn btn-outline btn-sm' download>Export CSV</a></div><div style='overflow-x:auto'><table><thead><tr><th>Name</th><th>Phone</th><th>Time</th><th>Service</th><th>Section</th><th>Status</th><th>Date</th></tr></thead><tbody>";d.callbacks.forEach(function(c){html+="<tr><td>"+c.name+"</td><td>"+c.phone+"</td><td>"+(c.preferred_time||"")+"</td><td>"+(c.service||"")+"</td><td style='font-size:.75rem;color:var(--a)'>"+(c.lead_section||"")+"</td><td>"+cbStatusBadge(c.status||"pending")+"<br><select onchange='updateCallbackStatus("+c.id+",this.value)' style='margin-top:.3rem;background:rgba(255,255,255,.08);border:1px solid var(--border);color:#fff;font-size:.72rem;padding:.2rem .4rem;border-radius:4px;outline:none'><option value='pending'"+(c.status==="pending"?" selected":"")+">pending</option><option value='called'"+(c.status==="called"?" selected":"")+">called</option><option value='no_answer'"+(c.status==="no_answer"?" selected":"")+">no_answer</option><option value='scheduled'"+(c.status==="scheduled"?" selected":"")+">scheduled</option></select></td><td>"+(c.created_at||"").slice(0,16)+"</td></tr>";});html+="</tbody></table></div>";el.innerHTML=html;}catch(e){el.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}}`,
    'async function updateCallbackStatus(id,status){try{await fetch("/api/admin/callbacks/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:status})});}catch(e){alert(e.message);}}',
    // Articles
    "var editingArticleId=null;",
    `async function loadArticles(){var el=document.getElementById("articlesPanel");try{var r=await fetch("/api/admin/articles");var d=await r.json();var html="<div style='margin-bottom:1rem;display:flex;gap:.75rem;align-items:center'><button class='btn btn-gold btn-sm' onclick='openArticleEditor(null)'>+ New Article</button><span style='font-size:.8rem;color:var(--muted)'>"+(d.articles?d.articles.length:0)+" articles</span></div>";if(!d.articles||!d.articles.length){el.innerHTML=html+"<p style='color:var(--muted)'>No articles yet.</p>";return;}html+="<div style='overflow-x:auto'><table><thead><tr><th>Title</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>";d.articles.forEach(function(a){var pub=a.published?"<span style='color:#22c55e;font-size:.75rem;font-weight:600'>LIVE</span>":"<span style='color:#f59e0b;font-size:.75rem;font-weight:600'>DRAFT</span>";html+="<tr><td style='font-weight:500'>"+(a.title||"")+"</td><td>"+pub+"</td><td>"+(a.created_at||"").slice(0,10)+"</td><td style='white-space:nowrap'><button class='btn btn-outline btn-sm' onclick='openArticleEditor("+a.id+")' style='margin-right:.35rem'>Edit</button><button class='btn btn-sm' style='background:"+(a.published?"#ef4444":"#22c55e")+";color:#fff;margin-right:.35rem' onclick='toggleArticle("+a.id+")'>"+(a.published?"Unpublish":"Publish")+"</button>"+(a.published?"<a href='/articles/"+a.slug+"' target='_blank' class='btn btn-outline btn-sm' style='margin-right:.35rem'>View</a>":"")+"<button class='btn btn-sm' style='background:#374151;color:#fff' onclick='deleteArticle("+a.id+")'>Del</button></td></tr>";});html+="</tbody></table></div>";el.innerHTML=html;}catch(e){el.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}}`,
    'async function openArticleEditor(id){editingArticleId=id;document.getElementById("articleOverlay").style.display="flex";if(!id){["artTitle","artSummary","artBody","artHeroKey"].forEach(function(x){document.getElementById(x).value="";});document.getElementById("artPublished").checked=false;document.getElementById("artHeroPreview").innerHTML="";document.getElementById("artEditorTitle").textContent="New Article";return;}try{var r=await fetch("/api/admin/articles/"+id);var d=await r.json();var a=d.article;document.getElementById("artTitle").value=a.title||"";document.getElementById("artSummary").value=a.summary||"";document.getElementById("artBody").value=a.body||"";document.getElementById("artPublished").checked=!!a.published;document.getElementById("artHeroKey").value=a.hero_image_r2_key||"";document.getElementById("artEditorTitle").textContent="Edit Article";updateHeroPreview();}catch(e){alert("Load error: "+e.message);}}',
    'function closeArticleEditor(){document.getElementById("articleOverlay").style.display="none";editingArticleId=null;}',
    `function updateHeroPreview(){var k=document.getElementById("artHeroKey").value.trim();var p=document.getElementById("artHeroPreview");p.innerHTML=k?"<img src='/media/serve/"+encodeURIComponent(k)+"' style='max-height:120px;border-radius:6px;margin-top:.5rem;display:block'>":"";}`,
    'async function saveArticle(){var payload={title:document.getElementById("artTitle").value.trim(),summary:document.getElementById("artSummary").value.trim(),body:document.getElementById("artBody").value.trim(),published:document.getElementById("artPublished").checked,hero_image_r2_key:document.getElementById("artHeroKey").value.trim()};if(!payload.title){alert("Title required");return;}try{var r=await fetch("/api/admin/articles/"+(editingArticleId||"new"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});var d=await r.json();if(!d.ok){alert("Save error: "+(d.error||"unknown"));return;}closeArticleEditor();loadArticles();}catch(e){alert("Error: "+e.message);}}',
    'async function toggleArticle(id){try{var r=await fetch("/api/admin/articles/"+id+"/toggle",{method:"POST"});var d=await r.json();if(d.ok)loadArticles();}catch(e){alert(e.message);}}',
    'async function deleteArticle(id){if(!confirm("Delete this article?"))return;try{var r=await fetch("/api/admin/articles/"+id,{method:"DELETE"});var d=await r.json();if(d.ok)loadArticles();}catch(e){alert(e.message);}}',
    // Media
    `async function loadMedia(){var el=document.getElementById("mediaPanel");try{var r=await fetch("/api/media");var d=await r.json();var html="<div style='margin-bottom:1.25rem'><div style='background:rgba(255,255,255,.04);border:2px dashed var(--border);border-radius:var(--r);padding:1.5rem;text-align:center;margin-bottom:1rem'><div style='color:var(--muted);margin-bottom:.75rem;font-size:.85rem'>Choose files to upload</div><select id='mediaCategory' style='background:rgba(255,255,255,.08);border:1px solid var(--border);color:#fff;padding:.4rem .75rem;border-radius:var(--r);font-size:.82rem;margin-right:.5rem'><option value='article'>Article Image</option><option value='hero'>Hero Image</option><option value='project'>Project Photo</option><option value='audio'>Voice Note / Audio</option><option value='other'>Other</option></select><label style='background:var(--a);color:#fff;padding:.45rem 1rem;border-radius:var(--r);cursor:pointer;font-size:.82rem;font-weight:600'>Upload File<input type='file' id='mediaFileInput' accept='image/*,video/*,audio/*,.pdf' style='display:none' onchange='uploadMedia()'/></label><div id='mediaUploadProgress' style='margin-top:.5rem;font-size:.78rem;color:var(--muted)'></div></div>";if(!d.media||!d.media.length){el.innerHTML=html+"<p style='color:var(--muted)'>No files uploaded yet.</p>";return;}html+="<div style='display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1rem'>";d.media.forEach(function(m){var isImg=/^image/.test(m.content_type);var isAudio=/^audio/.test(m.content_type);var thumb=isImg?"<img src='/media/serve/"+encodeURIComponent(m.r2_key)+"' style='width:100%;height:110px;object-fit:cover;border-radius:6px 6px 0 0;display:block'/>":"";if(isAudio)thumb="<div style='height:60px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;background:rgba(200,168,75,.15);border-radius:6px 6px 0 0'>&#127908;</div>";if(!thumb&&!isAudio)thumb="<div style='height:60px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;background:rgba(255,255,255,.05);border-radius:6px 6px 0 0'>&#128196;</div>";html+="<div style='background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden'>"+thumb+"<div style='padding:.6rem'><div style='font-size:.72rem;color:var(--muted);margin-bottom:.3rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'>"+m.filename+"</div><div style='font-size:.68rem;color:var(--a);margin-bottom:.5rem'>"+(m.category||"other")+"</div>"+(isAudio?"<audio controls style='width:100%;margin-bottom:.5rem'><source src='/media/serve/"+encodeURIComponent(m.r2_key)+"' type='"+m.content_type+"'></audio>":"")+"<div style='display:flex;gap:.35rem;flex-wrap:wrap'><button class='btn btn-sm' style='background:rgba(255,255,255,.08);color:#fff;font-size:.68rem' onclick='copyMediaKey(\\""+m.r2_key+"\\")'>Copy R2 Key</button><button class='btn btn-sm' style='background:#ef4444;color:#fff;font-size:.68rem' onclick='deleteMedia(\\""+m.id+"\\")'>Del</button></div></div></div>";});html+="</div>";el.innerHTML=html;}catch(e){el.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}}`,
    'async function uploadMedia(){var fi=document.getElementById("mediaFileInput");var cat=document.getElementById("mediaCategory")?document.getElementById("mediaCategory").value:"other";var prog=document.getElementById("mediaUploadProgress");if(!fi||!fi.files.length)return;var file=fi.files[0];if(prog)prog.textContent="Uploading "+file.name+"...";var fd=new FormData();fd.append("file",file);fd.append("category",cat);try{var r=await fetch("/api/media/upload",{method:"POST",body:fd});var d=await r.json();if(prog)prog.textContent=d.ok?"Uploaded!":"Error: "+(d.error||"unknown");if(d.ok)setTimeout(function(){loadMedia();},800);}catch(e){if(prog)prog.textContent="Error: "+e.message;}}',
    'function copyMediaKey(key){navigator.clipboard?navigator.clipboard.writeText(key):prompt("Copy R2 key:",key);alert("Copied! Paste into image field.");}',
    'async function deleteMedia(id){if(!confirm("Delete this file?"))return;try{var r=await fetch("/api/media/"+id,{method:"DELETE"});var d=await r.json();if(d.ok)loadMedia();}catch(e){alert(e.message);}}',
    // Knowledge
    "var editingSeedId=null;",
    `async function loadKnowledge(){var el=document.getElementById("knowledgePanel");try{var r=await fetch("/api/knowledge");var d=await r.json();var html="<div style='margin-bottom:1rem;display:flex;gap:.75rem;align-items:center'><button class='btn btn-gold btn-sm' onclick='openSeedEditor(null)'>+ Add Knowledge</button><span style='font-size:.8rem;color:var(--muted)'>"+(d.seeds?d.seeds.length:0)+" entries</span></div>";if(!d.seeds||!d.seeds.length){el.innerHTML=html+"<p style='color:var(--muted)'>No knowledge seeds yet.</p>";return;}html+="<div style='display:grid;gap:.75rem'>";d.seeds.forEach(function(s){var emb=s.embedded?"<span style='color:#22c55e;font-size:.72rem'>Embedded</span>":"<span style='color:#f59e0b;font-size:.72rem'>Pending</span>";html+="<div style='background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1rem'><div style='display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:.4rem'><div style='font-weight:600;color:#fff;font-size:.9rem'>"+s.title+"</div><div style='display:flex;gap:.35rem;flex-shrink:0'>"+emb+" <button class='btn btn-outline btn-sm' onclick='openSeedEditor(\\""+s.id+"\\")'> Edit</button><button class='btn btn-sm' style='background:#ef4444;color:#fff' onclick='deleteSeed(\\""+s.id+"\\")'> Del</button></div></div><div style='font-size:.78rem;color:var(--muted)'>"+s.body.slice(0,150)+(s.body.length>150?"...":"")+"</div><div style='font-size:.72rem;color:var(--a);margin-top:.35rem'>"+(s.category||"general")+"</div></div>";});html+="</div>";el.innerHTML=html;}catch(e){el.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}}`,
    'function openSeedEditor(id){editingSeedId=id;document.getElementById("seedOverlay").style.display="flex";if(!id){["seedTitle","seedBody"].forEach(function(x){document.getElementById(x).value="";});document.getElementById("seedCategory").value="general";document.getElementById("seedEditorTitle").textContent="Add Knowledge";return;}fetch("/api/knowledge").then(function(r){return r.json();}).then(function(d){var s=(d.seeds||[]).find(function(x){return x.id===id;});if(!s)return;document.getElementById("seedTitle").value=s.title||"";document.getElementById("seedBody").value=s.body||"";document.getElementById("seedCategory").value=s.category||"general";document.getElementById("seedEditorTitle").textContent="Edit Knowledge";});}',
    'function closeSeedEditor(){document.getElementById("seedOverlay").style.display="none";editingSeedId=null;}',
    'async function saveSeed(){var payload={title:document.getElementById("seedTitle").value.trim(),body:document.getElementById("seedBody").value.trim(),category:document.getElementById("seedCategory").value};if(!payload.title||!payload.body){alert("Title and content required");return;}try{var r=await fetch("/api/knowledge/"+(editingSeedId||"new"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});var d=await r.json();if(!d.ok){alert("Save error: "+(d.error||"unknown"));return;}closeSeedEditor();loadKnowledge();}catch(e){alert("Error: "+e.message);}}',
    'async function deleteSeed(id){if(!confirm("Delete this knowledge entry?"))return;try{var r=await fetch("/api/knowledge/"+id,{method:"DELETE"});var d=await r.json();if(d.ok)loadKnowledge();}catch(e){alert(e.message);}}',
    // ── CMS section editor ────────────────────────────────────────────────────
    "var cmsData={};",
    `async function loadSection(section){var el=document.getElementById("cmsPanel_"+section);if(!el)return;el.innerHTML="<span class='spin'></span> Loading...";try{var r=await fetch("/api/content/"+section);var d=await r.json();cmsData[section]=d.data;renderCmsPanel(section,d.data);}catch(e){el.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}}`,
    `function renderCmsPanel(section,data){var el=document.getElementById("cmsPanel_"+section);if(!el)return;if(section==="contact"){renderContactPanel(el,data);return;}var html="<div style='margin-bottom:1rem;display:flex;gap:.75rem;align-items:center;flex-wrap:wrap'><button class='btn btn-gold btn-sm' onclick='addCmsItem(\\""+section+"\\")'>+ Add Item</button><button class='btn btn-outline btn-sm' onclick='saveCmsSection(\\""+section+"\\")'>Save Draft</button><button class='btn btn-sm' style='background:#22c55e;color:#fff' onclick='saveAndPublish(\\""+section+"\\")'>Save + Publish Live</button></div>";if(!data||!data.length){el.innerHTML=html+"<p style='color:var(--muted)'>No items yet.</p>";return;}data.forEach(function(item,i){html+="<div id='cmsItem_"+section+"_"+i+"' style='background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem;margin-bottom:.75rem'><div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem'><strong style='color:#fff'>"+(item.title||item.tab||item.name||item.num||"Item#"+(i+1))+"</strong><div style='display:flex;gap:.35rem'>"+(i>0?"<button class='btn btn-outline btn-sm' onclick='moveCmsItem(\\""+section+"\\","+i+",-1)'>&#8593;</button>":"")+(i<data.length-1?"<button class='btn btn-outline btn-sm' onclick='moveCmsItem(\\""+section+"\\","+i+",1)'>&#8595;</button>":"")+"<button class='btn btn-sm' style='background:#ef4444;color:#fff' onclick='deleteCmsItem(\\""+section+"\\","+i+")'>Del</button></div></div>"+renderCmsFields(section,item,i)+"</div>";});el.innerHTML=html;}`,
    `function imgFieldHtml(prefix,key,val){var preview=val&&val.startsWith("contractor-")?"<img src='/media/serve/"+encodeURIComponent(val)+"' style='height:40px;width:60px;object-fit:cover;border-radius:4px'>":val&&val.startsWith("http")?"<img src='"+val+"' style='height:40px;width:60px;object-fit:cover;border-radius:4px'>":"";return"<label class='flabel'>Image (R2 Key from Media Library, or URL)</label><div style='display:flex;gap:.5rem;align-items:center;margin-bottom:.85rem'><input class='finput' id='"+prefix+key+"' value='"+val+"' placeholder='contractor-v003-2/media/...' style='margin-bottom:0'/>"+preview+"</div>";}`,
    `function renderCmsFields(section,item,i){var html="";var p="cms_"+section+"_"+i+"_";function f(k,lbl,type){var val=(item[k]||"").toString().replace(/"/g,"&quot;");if(type==="img")return imgFieldHtml(p,k,item[k]||"");if(type==="ta")return"<label class='flabel'>"+lbl+"</label><textarea class='ftextarea' id='"+p+k+"' style='min-height:80px'>"+val+"</textarea>";return"<label class='flabel'>"+lbl+"</label><input class='finput' id='"+p+k+"' value='"+val+"' placeholder='"+lbl+"' style='margin-bottom:.65rem'/>";}if(section==="services"){html+=f("tab","Tab Label");html+=f("title","Title");html+=f("desc","Description","ta");html+="<label class='flabel'>Highlights (one per line)</label><textarea class='ftextarea' id='"+p+"highlights' style='min-height:80px'>"+(item.highlights||[]).join("\\n")+"</textarea>";html+=imgFieldHtml(p,"image_r2_key",item.image_r2_key||item.image_url||"");}else if(section==="projects"){html+=f("title","Project Title");html+=f("location","Location");html+=f("type","Type (for filter)");html+=f("desc","Description","ta");html+=imgFieldHtml(p,"image_r2_key",item.image_r2_key||item.image_url||"");}else if(section==="reviews"){html+=f("name","Reviewer Name");html+=f("project","Project & Location");html+=f("text","Review Text","ta");html+="<label class='flabel'>Stars (1-5)</label><input class='finput' id='"+p+"stars' type='number' min='1' max='5' value='"+(item.stars||5)+"' style='max-width:100px;margin-bottom:.65rem'/>";}else if(section==="process"){html+=f("num","Step Number (e.g. 01)");html+=f("title","Step Title");html+=f("desc","Step Description","ta");}return html;}`,
    `function renderContactPanel(el,data){var html="<div style='display:flex;gap:.75rem;margin-bottom:1.25rem'><button class='btn btn-outline btn-sm' onclick='saveCmsSection(\\"contact\\")'>Save Draft</button><button class='btn btn-sm' style='background:#22c55e;color:#fff' onclick='saveAndPublish(\\"contact\\")'>Save + Publish Live</button></div>";function f(k,lbl,type){var val=(data[k]||"").toString().replace(/"/g,"&quot;");if(type==="img")return imgFieldHtml("ct_","temp",data[k]||"").replace("ct_temp",k.replace(/([^a-z])/g,""));if(type==="ta")return"<label class='flabel'>"+lbl+"</label><textarea class='ftextarea' id='ct_"+k+"' style='min-height:70px'>"+val+"</textarea>";return"<label class='flabel'>"+lbl+"</label><input class='finput' id='ct_"+k+"' value='"+val+"' placeholder='"+lbl+"'/>";}html+="<div style='display:grid;grid-template-columns:1fr 1fr;gap:1rem'>";html+=f("company","Company Name")+f("phone","Phone Number")+f("phone_url","Phone URL (tel:+1...)")+f("license","License Number")+f("tagline","Trust Bar Tagline")+f("areas","Service Areas");html+="</div>";html+=f("hero_title","Hero Headline")+f("hero_sub","Hero Subheading","ta");html+="<label class='flabel'>Hero Background Image (R2 key or URL)</label><div style='display:flex;gap:.5rem;align-items:center;margin-bottom:.85rem'><input class='finput' id='ct_hero_image_r2_key' value='"+(data.hero_image_r2_key||data.hero_image_url||"")+"' placeholder='contractor-v003-2/media/...' style='margin-bottom:0'/>"+(data.hero_image_r2_key?"<img src='/media/serve/"+encodeURIComponent(data.hero_image_r2_key)+"' style='height:40px;width:60px;object-fit:cover;border-radius:4px'>":data.hero_image_url?"<img src='"+data.hero_image_url+"' style='height:40px;width:60px;object-fit:cover;border-radius:4px'>":"")+"</div>";html+="<div style='display:grid;grid-template-columns:1fr 1fr;gap:1rem'>";html+=f("stat1_num","Stat 1 Number")+f("stat1_label","Stat 1 Label")+f("stat2_num","Stat 2 Number")+f("stat2_label","Stat 2 Label")+f("stat3_num","Stat 3 Number")+f("stat3_label","Stat 3 Label")+f("stat4_num","Stat 4 Number")+f("stat4_label","Stat 4 Label");html+="</div>";el.innerHTML=html;}`,
    'function readCmsItem(section,item,i){var p="cms_"+section+"_"+i+"_";function v(k){var el=document.getElementById(p+k);return el?el.value.trim():"";}var out=Object.assign({},item);if(section==="services"){out.tab=v("tab");out.title=v("title");out.desc=v("desc");var hiEl=document.getElementById(p+"highlights");out.highlights=hiEl?hiEl.value.trim().split("\\n").map(function(h){return h.trim();}).filter(Boolean):item.highlights||[];out.image_r2_key=v("image_r2_key");}else if(section==="projects"){out.title=v("title");out.location=v("location");out.type=v("type");out.desc=v("desc");out.image_r2_key=v("image_r2_key");}else if(section==="reviews"){out.name=v("name");out.project=v("project");out.text=v("text");out.stars=parseInt(v("stars"))||5;}else if(section==="process"){out.num=v("num");out.title=v("title");out.desc=v("desc");}return out;}',
    'function readContactData(){function v(k){var el=document.getElementById("ct_"+k);return el?el.value.trim():"";}return{company:v("company"),phone:v("phone"),phone_url:v("phone_url"),license:v("license"),tagline:v("tagline"),areas:v("areas"),hero_title:v("hero_title"),hero_sub:v("hero_sub"),hero_image_r2_key:v("hero_image_r2_key"),stat1_num:v("stat1_num"),stat1_label:v("stat1_label"),stat2_num:v("stat2_num"),stat2_label:v("stat2_label"),stat3_num:v("stat3_num"),stat3_label:v("stat3_label"),stat4_num:v("stat4_num"),stat4_label:v("stat4_label")};}',
    'function getCurrentCmsData(section){if(section==="contact")return readContactData();var data=cmsData[section]||[];return data.map(function(item,i){return readCmsItem(section,item,i);});}',
    'function addCmsItem(section){var data=getCurrentCmsData(section);var id=Date.now().toString(36);var newItem={id:id,sort:data.length+1};if(section==="services")newItem=Object.assign(newItem,{tab:"New Service",title:"",desc:"",highlights:[],image_url:"",image_r2_key:""});else if(section==="projects")newItem=Object.assign(newItem,{title:"New Project",location:"",type:"",desc:"",image_url:"",image_r2_key:""});else if(section==="reviews")newItem=Object.assign(newItem,{name:"",project:"",text:"",stars:5});else if(section==="process")newItem=Object.assign(newItem,{num:"0"+(data.length+1),title:"",desc:""});data.push(newItem);cmsData[section]=data;renderCmsPanel(section,data);}',
    "function deleteCmsItem(section,i){var data=getCurrentCmsData(section);data.splice(i,1);cmsData[section]=data;renderCmsPanel(section,data);}",
    "function moveCmsItem(section,i,dir){var data=getCurrentCmsData(section);var j2=i+dir;if(j2<0||j2>=data.length)return;var tmp=data[i];data[i]=data[j2];data[j2]=tmp;cmsData[section]=data;renderCmsPanel(section,data);}",
    'async function saveCmsSection(section){var data=getCurrentCmsData(section);try{var r=await fetch("/api/content/"+section,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:data})});var d=await r.json();if(d.ok){alert("Saved as draft. Click Publish Site Live on Dashboard to push live.");}else alert("Save error: "+(d.error||"unknown"));}catch(e){alert("Error: "+e.message);}}',
    'async function saveAndPublish(section){var data=getCurrentCmsData(section);try{var r1=await fetch("/api/content/"+section,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:data})});var d1=await r1.json();if(!d1.ok){alert("Save error: "+(d1.error||"unknown"));return;}var r2=await fetch("/api/publish",{method:"POST"});var d2=await r2.json();if(d2.ok)alert("Saved and published live! Refresh the public site to see changes.");else alert("Saved but publish failed: "+(d2.error||"unknown"));}catch(e){alert("Error: "+e.message);}}',
    'function copyToClipboard(text){navigator.clipboard?navigator.clipboard.writeText(text).catch(function(){}):prompt("Copy:",text);alert("Copied!");}',
    `async function loadMembers(){var el=document.getElementById("cmsPanel_members");if(!el)return;el.innerHTML="<span class='spin'></span> Loading...";try{var r=await fetch("/api/admin/members");var d=await r.json();var html="<div style='margin-bottom:1rem'><p style='font-size:.82rem;color:var(--muted);margin-bottom:1rem'>Share the portal URL with your team. They bookmark it and use it to submit content.</p><div style='background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem;margin-bottom:1rem'><label class='flabel'>New Member</label><div style='display:flex;gap:.5rem;flex-wrap:wrap'><input class='sinput' id='newMemberName' placeholder='Full name' style='max-width:200px'/><select id='newMemberRole' style='background:rgba(255,255,255,.08);border:1px solid var(--border);color:#fff;padding:.6rem .9rem;border-radius:var(--r);font-size:.85rem'><option value='contributor'>Contributor</option><option value='editor'>Editor</option></select><button class='btn btn-gold btn-sm' onclick='addMember()'>+ Add Member</button></div><div id='newMemberResult' style='margin-top:.75rem'></div></div>";if(!d.members||!d.members.length){el.innerHTML=html+"<p style='color:var(--muted)'>No members yet.</p>";return;}html+="<div style='overflow-x:auto'><table><thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Portal URL</th><th>Created</th><th></th></tr></thead><tbody>";d.members.forEach(function(m){var purl=m.portal_url;html+="<tr><td style='font-weight:600'>"+m.name+"</td><td>"+m.role+"</td><td>"+(m.active?"<span style='color:#4ade80'>Active</span>":"<span style='color:#f87171'>Inactive</span>")+"</td><td style='max-width:240px'><div style='display:flex;gap:.35rem;align-items:center'><span style='font-size:.72rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px'>"+purl+"</span><button class='btn btn-sm' style='background:rgba(255,255,255,.1);color:#fff;font-size:.68rem;flex-shrink:0' data-url='"+purl+"' onclick='copyToClipboard(this.dataset.url)'>Copy</button></div></td><td>"+(m.created_at||"").slice(0,10)+"</td><td>"+(m.active?"<button class='btn btn-sm' style='background:#ef4444;color:#fff' onclick='deactivateMember(""+m.id+"")'>Deactivate</button>":"")+"</td></tr>";});html+="</tbody></table></div>";el.innerHTML=html;}catch(e){el.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}}`,
    `async function addMember(){var name=document.getElementById("newMemberName").value.trim();var role=document.getElementById("newMemberRole").value;var res=document.getElementById("newMemberResult");if(!name){res.innerHTML="<p style='color:#f87171'>Name required.</p>";return;}res.innerHTML="Creating...";try{var r=await fetch("/api/admin/members",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name,role:role})});var d=await r.json();if(d.ok){var purl=d.portal_url;res.innerHTML="<div style='background:rgba(74,222,128,.1);border:1px solid #4ade80;border-radius:var(--r);padding:.75rem;font-size:.82rem'><strong style='color:#4ade80'>Member created!</strong><br>Portal URL: <span style='color:#fff'>"+purl+"</span><br><button class='btn btn-sm' style='background:var(--a);color:#fff;font-size:.7rem;margin-top:.5rem' data-url='"+purl+"' onclick='copyToClipboard(this.dataset.url)'>Copy Portal Link</button></div>";document.getElementById("newMemberName").value="";loadMembers();}else{res.innerHTML="<p style='color:#f87171'>"+(d.error||"Error")+"</p>";}}catch(e){res.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}}`,
    'async function deactivateMember(id){if(!confirm("Deactivate this member? They will lose portal access."))return;try{await fetch("/api/admin/members/"+id,{method:"DELETE"});loadMembers();}catch(e){alert(e.message);}}',
    `async function loadSubmissions(){var el=document.getElementById("cmsPanel_submissions");if(!el)return;el.innerHTML="<span class='spin'></span> Loading...";var showAll=el.dataset.showAll==="1";try{var url="/api/admin/submissions"+(showAll?"?status=all":"");var r=await fetch(url);var d=await r.json();var filterBar="<div style='margin-bottom:1rem;display:flex;gap:.5rem'><button class='btn btn-sm' style='background:"+(showAll?"rgba(255,255,255,.1)":"var(--a)")+";color:#fff' onclick='setSubFilter(0)'>Pending</button><button class='btn btn-sm' style='background:"+(showAll?"var(--a)":"rgba(255,255,255,.1)")+";color:#fff' onclick='setSubFilter(1)'>All</button></div>";if(!d.submissions||!d.submissions.length){el.innerHTML=filterBar+"<p style='color:var(--muted)'>No submissions"+(showAll?"":" pending")+".</p>";return;}var html=filterBar+"<div style='display:grid;gap:.75rem'>";d.submissions.forEach(function(s){var icon=s.type==="article"?"&#128215;":s.type==="photo"?"&#128247;":s.type==="video"?"&#127916;":"&#128172;";var label=s.title||s.filename||s.type;var statusColor=s.status==="published"?"#4ade80":s.status==="rejected"?"#f87171":"#f59e0b";var thumb=s.r2_key&&new RegExp("^image").test(s.content_type||"")?"<img src='/media/serve/"+encodeURIComponent(s.r2_key)+"' style='width:80px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0'>":"";html+="<div style='background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1rem'><div style='display:flex;gap:.75rem;align-items:flex-start'>"+(thumb||"<div style='width:80px;height:60px;background:rgba(255,255,255,.06);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0'>"+icon+"</div>")+"<div style='flex:1;min-width:0'><div style='display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.3rem'><strong style='color:#fff;font-size:.9rem'>"+label+"</strong><span style='background:"+statusColor+";color:#000;font-size:.65rem;font-weight:700;padding:.1rem .45rem;border-radius:8px;text-transform:uppercase'>"+s.status+"</span></div><div style='font-size:.75rem;color:var(--muted);margin-bottom:.5rem'>"+(s.member_name||"Unknown")+" &bull; "+s.type+" &bull; "+(s.created_at||"").slice(0,10)+"</div>"+(s.summary||s.caption?"<div style='font-size:.78rem;color:var(--muted);margin-bottom:.5rem'>"+(s.summary||s.caption)+"</div>":"")+(s.status==="pending"?"<div style='display:flex;gap:.5rem;flex-wrap:wrap;align-items:center'><button class='btn btn-sm' style='background:#22c55e;color:#fff' onclick='approveSubmission(""+s.id+"")'>Approve</button><button class='btn btn-sm' style='background:#ef4444;color:#fff' onclick='rejectSubmission(""+s.id+"")'>Reject</button><span id='rejectForm_"+s.id+"' style='display:none'><input id='rejectNote_"+s.id+"' class='sinput' placeholder='Reason (optional)' style='max-width:200px'/><button class='btn btn-sm' style='background:#ef4444;color:#fff' onclick='confirmReject(""+s.id+"")'>Send</button></span></div>":"")+"</div></div></div>";});html+="</div>";el.innerHTML=html;}catch(e){el.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}}`,
    'function setSubFilter(all){var el=document.getElementById("cmsPanel_submissions");if(el)el.dataset.showAll=all?"1":"0";loadSubmissions();}',
    'async function approveSubmission(id){try{var r=await fetch("/api/admin/submissions/"+id+"/approve",{method:"POST"});var d=await r.json();if(d.ok){alert(d.message);loadSubmissions();}else alert(d.error||"Error");}catch(e){alert(e.message);}}',
    'function rejectSubmission(id){var el=document.getElementById("rejectForm_"+id);if(el)el.style.display=el.style.display==="inline-flex"?"none":"inline-flex";}',
    'async function confirmReject(id){var note=(document.getElementById("rejectNote_"+id)||{}).value||"";try{var r=await fetch("/api/admin/submissions/"+id+"/reject",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({note:note})});var d=await r.json();if(d.ok)loadSubmissions();else alert(d.error||"Error");}catch(e){alert(e.message);}}'
  ];
  const adminJS = jsLines.join("\n");
  function cmsp(section, label) {
    return '<div class="apanel" data-panel="' + section + '" style="display:none"><div class="acard"><div class="acard-head"><h2>' + label + `</h2><button class="btn btn-outline btn-sm" onclick="loadSection('` + section + `')">Refresh</button></div><div class="acard-body"><div id="cmsPanel_` + section + '"><div style="color:var(--muted);font-size:.85rem"><span class="spin"></span> Loading...</div></div></div></div></div>';
  }
  __name(cmsp, "cmsp");
  __name2(cmsp, "cmsp");
  const TABS = [
    ["dashboard", "Dashboard"],
    ["leads", "Leads"],
    ["callbacks", "Callbacks"],
    ["articles", "Articles"],
    ["media", "Media"],
    ["knowledge", "Knowledge"],
    ["services", "Services"],
    ["projects", "Projects"],
    ["reviews", "Reviews"],
    ["process", "Process"],
    ["contact", "Contact"],
    ["members", "Members"],
    ["submissions", "Submissions"],
    ["rag", "RAG Tester"]
  ];
  const tabBtns = TABS.map(([t, l]) => '<button class="atab" data-tab="' + t + `" onclick="showTab('` + t + `')">` + l + "</button>").join("");
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>CCS Admin v2</title><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>' + ADMIN_CSS + '</style></head><body><div id="lock"><div class="lbox"><div class="ltitle">CCS<span>.</span>Admin</div><div class="lsub">' + WORKER + " &middot; v" + VERSION + '</div><input class="linput" type="password" id="pw" placeholder="Password" autocomplete="off"/><button class="lbtn" id="pwBtn">Enter</button><div class="lerr" id="pwErr">Incorrect password</div></div></div><div id="app"><div class="anav"><div class="alogo">CCS<span> Admin</span></div><div style="display:flex;align-items:center;gap:1rem"><span class="atag">v' + VERSION + '</span><button class="lout" id="logoutBtn">Log out</button></div></div><div class="atabs">' + tabBtns + '</div><div class="abody"><div class="apanel" data-panel="dashboard"><div class="acard"><div class="acard-head"><h2>System Status</h2><button class="btn btn-outline btn-sm" onclick="loadStatus()">Refresh</button></div><div class="acard-body"><div class="stat-grid" id="statusGrid"><div class="stat-box"><h4>Loading</h4><div class="stat-val"><span class="spin"></span></div></div></div></div></div><div class="acard"><div class="acard-head"><h2>&#128640; Publish Site</h2></div><div class="acard-body"><p style="font-size:.85rem;color:var(--muted);margin-bottom:1rem">Edit content in any tab and save as draft. When ready, click below to render and push the full site live instantly.</p><button class="btn btn-gold" id="publishBtn" style="font-size:1rem;padding:.8rem 2rem">Publish Site Live</button></div></div><div class="acard"><div class="acard-head"><h2>Re-embed Articles</h2></div><div class="acard-body"><p style="font-size:.85rem;color:var(--muted);margin-bottom:1rem">Re-embed all articles into Vectorize for the RAG chat.</p><button class="btn btn-outline btn-sm" id="seedBtn">Re-embed All</button><div class="log" id="seedLog"></div></div></div></div><div class="apanel" data-panel="leads" style="display:none"><div class="acard"><div class="acard-head"><h2>Leads</h2><button class="btn btn-outline btn-sm" onclick="loadLeads()">Refresh</button></div><div class="acard-body"><div id="leadsTable"><span class="spin"></span></div></div></div></div><div class="apanel" data-panel="callbacks" style="display:none"><div class="acard"><div class="acard-head"><h2>Callbacks</h2><button class="btn btn-outline btn-sm" onclick="loadCallbacks()">Refresh</button></div><div class="acard-body"><div id="callbacksTable"><span class="spin"></span></div></div></div></div><div class="apanel" data-panel="articles" style="display:none"><div class="acard"><div class="acard-head"><h2>Article Manager</h2><button class="btn btn-outline btn-sm" onclick="loadArticles()">Refresh</button></div><div class="acard-body"><div id="articlesPanel"><span class="spin"></span></div></div></div></div><div class="apanel" data-panel="media" style="display:none"><div class="acard"><div class="acard-head"><h2>Media Library</h2><button class="btn btn-outline btn-sm" onclick="loadMedia()">Refresh</button></div><div class="acard-body"><div id="mediaPanel"><span class="spin"></span></div></div></div></div><div class="apanel" data-panel="knowledge" style="display:none"><div class="acard"><div class="acard-head"><h2>Knowledge Base</h2><button class="btn btn-outline btn-sm" onclick="loadKnowledge()">Refresh</button></div><div class="acard-body"><div id="knowledgePanel"><span class="spin"></span></div></div></div></div>' + cmsp("services", "Services") + cmsp("projects", "Projects") + cmsp("reviews", "Reviews") + cmsp("process", "Process Steps") + cmsp("contact", "Contact & Branding") + cmsp("members", "Member Manager") + cmsp("submissions", "Submission Queue") + '<div class="apanel" data-panel="rag" style="display:none"><div class="acard"><div class="acard-head"><h2>RAG Search Tester</h2></div><div class="acard-body"><div style="display:flex;gap:.75rem;margin-bottom:1rem"><input class="sinput" id="searchQ" placeholder="e.g. ADU permits Los Angeles"/><button class="btn btn-gold btn-sm" id="searchBtn">Search</button></div><div id="searchResults"></div></div></div></div></div></div><div class="overlay" id="articleOverlay"><div class="modal"><h3 id="artEditorTitle">Article Editor</h3><label class="flabel">Title *</label><input class="finput" id="artTitle" placeholder="Article title"/><label class="flabel">Summary</label><textarea class="ftextarea" id="artSummary" style="min-height:70px" placeholder="Short summary..."></textarea><label class="flabel">Body</label><textarea class="ftextarea" id="artBody" placeholder="Full article content..."></textarea><label class="flabel">Hero Image \u2014 paste R2 key from Media Library</label><input class="finput" id="artHeroKey" placeholder="contractor-v003-2/media/..." oninput="updateHeroPreview()"/><div id="artHeroPreview"></div><div class="frow"><input type="checkbox" id="artPublished" style="width:16px;height:16px;margin-right:.5rem"/><label for="artPublished" style="color:var(--muted);font-size:.85rem">Publish immediately (live + embeds to Vectorize)</label></div><div style="display:flex;gap:.75rem;margin-top:.75rem"><button class="btn btn-gold" onclick="saveArticle()">Save</button><button class="btn btn-outline" onclick="closeArticleEditor()">Cancel</button></div></div></div><div class="overlay" id="seedOverlay"><div class="modal"><h3 id="seedEditorTitle">Knowledge Entry</h3><label class="flabel">Title</label><input class="finput" id="seedTitle" placeholder="e.g. ADU Permit Process in LA"/><label class="flabel">Category</label><select class="fselect" id="seedCategory"><option value="general">General</option><option value="faq">FAQ</option><option value="service">Service</option><option value="area">Service Area</option><option value="process">Process</option></select><label class="flabel">Content (embedded into Vectorize \u2014 be detailed)</label><textarea class="ftextarea" id="seedBody" placeholder="Write everything about this topic..."></textarea><div style="display:flex;gap:.75rem;margin-top:.75rem"><button class="btn btn-gold" onclick="saveSeed()">Save &amp; Embed</button><button class="btn btn-outline" onclick="closeSeedEditor()">Cancel</button></div></div></div><script>\n' + adminJS + "\n<\/script></body></html>";
}
__name(buildAdmin, "buildAdmin");
__name2(buildAdmin, "buildAdmin");
async function handleMemberMe(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (!token) return j({ ok: false, error: "token required" }, 400);
  const member = await dbFirst(env, "SELECT id,name,role FROM members WHERE token=? AND active=1", [token]);
  if (!member) return j({ ok: false, error: "invalid token" }, 403);
  return j({ ok: true, member });
}
__name(handleMemberMe, "handleMemberMe");
__name2(handleMemberMe, "handleMemberMe");
async function handleMemberSubmit(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  let token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const ct = request.headers.get("Content-Type") || "";
  let b = {}, file = null;
  if (ct.includes("multipart/form-data")) {
    const fd = await request.formData();
    if (!token) token = fd.get("token") || "";
    b.type = fd.get("type") || "photo";
    b.caption = fd.get("caption") || "";
    b.project_tag = fd.get("project_tag") || "";
    b.title = fd.get("title") || "";
    file = fd.get("file");
  } else {
    b = await body(request);
    if (!token) token = b.token || "";
  }
  if (!token) return j({ ok: false, error: "token required" }, 400);
  const member = await dbFirst(env, "SELECT id,name FROM members WHERE token=? AND active=1", [token]);
  if (!member) return j({ ok: false, error: "invalid token" }, 403);
  const id = uid();
  const ts = now();
  if (b.type === "photo" || b.type === "video") {
    if (!file) return j({ ok: false, error: "file required" }, 400);
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const allowed = ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "heic", "pdf", "mp3", "m4a", "wav", "ogg"];
    if (!allowed.includes(ext)) return j({ ok: false, error: "file type not allowed" }, 400);
    const key = R2_PREFIX + "contributions/" + id + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const buf = await file.arrayBuffer();
    await env.V003_2_R2.put(key, buf, { httpMetadata: { contentType: file.type } });
    await dbRun(
      env,
      "INSERT INTO submissions (id,member_id,member_name,type,title,caption,project_tag,r2_key,filename,content_type,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      [id, member.id, member.name, b.type, b.title || file.name, b.caption, b.project_tag, key, file.name, file.type, "pending", ts]
    );
  } else {
    await dbRun(
      env,
      "INSERT INTO submissions (id,member_id,member_name,type,title,body,summary,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
      [id, member.id, member.name, b.type || "article", b.title || "", b.body || "", b.summary || "", "pending", ts]
    );
  }
  return j({ ok: true, submission_id: id, status: "pending", message: "Submitted! Admin will review soon." });
}
__name(handleMemberSubmit, "handleMemberSubmit");
__name2(handleMemberSubmit, "handleMemberSubmit");
async function handleMemberSubmissions(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (!token) return j({ ok: false, error: "token required" }, 400);
  const member = await dbFirst(env, "SELECT id FROM members WHERE token=? AND active=1", [token]);
  if (!member) return j({ ok: false, error: "invalid token" }, 403);
  const rows = await dbAll(env, "SELECT id,type,title,caption,filename,status,admin_note,created_at FROM submissions WHERE member_id=? ORDER BY created_at DESC LIMIT 50", [member.id]);
  return j({ ok: true, submissions: rows });
}
__name(handleMemberSubmissions, "handleMemberSubmissions");
__name2(handleMemberSubmissions, "handleMemberSubmissions");
async function handleAdminMembers(request, env) {
  if (request.method === "DELETE") {
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const mid = parts[parts.length - 1];
    await dbRun(env, "UPDATE members SET active=0 WHERE id=?", [mid]);
    return j({ ok: true, id: mid });
  }
  if (request.method === "POST") {
    const b = await body(request);
    if (!b.name) return j({ ok: false, error: "name required" }, 400);
    const id = uid();
    const token = uid() + uid();
    const ts = now();
    await dbRun(
      env,
      "INSERT INTO members (id,name,role,token,active,created_at) VALUES (?,?,?,?,1,?)",
      [id, b.name, b.role || "contributor", token, ts]
    );
    const baseUrl2 = new URL(request.url).origin;
    return j({ ok: true, member: { id, name: b.name, role: b.role || "contributor", token, created_at: ts }, portal_url: baseUrl2 + "/contribute?token=" + token });
  }
  const members = await dbAll(env, "SELECT id,name,role,token,active,created_at FROM members ORDER BY created_at DESC");
  const baseUrl = new URL(request.url).origin;
  const withUrls = members.map(function(m) {
    return Object.assign({}, m, { portal_url: baseUrl + "/contribute?token=" + m.token });
  });
  return j({ ok: true, members: withUrls });
}
__name(handleAdminMembers, "handleAdminMembers");
__name2(handleAdminMembers, "handleAdminMembers");
async function handleAdminSubmissions(request, env) {
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") === "all" ? null : "pending";
  const rows = statusFilter ? await dbAll(env, "SELECT * FROM submissions WHERE status=? ORDER BY created_at DESC LIMIT 100", [statusFilter]) : await dbAll(env, "SELECT * FROM submissions ORDER BY created_at DESC LIMIT 200");
  return j({ ok: true, submissions: rows });
}
__name(handleAdminSubmissions, "handleAdminSubmissions");
__name2(handleAdminSubmissions, "handleAdminSubmissions");
async function handleAdminSubmissionApprove(request, env, id) {
  const sub = await dbFirst(env, "SELECT * FROM submissions WHERE id=?", [id]);
  if (!sub) return j({ ok: false, error: "not found" }, 404);
  const ts = now();
  let target = "";
  if (sub.type === "article" || sub.type === "note") {
    const slug = (sub.title || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
    await dbRun(
      env,
      "INSERT INTO articles (slug,title,summary,body,published,hero_image_r2_key,created_at) VALUES (?,?,?,?,0,?,?)",
      [slug, sub.title || "", sub.summary || "", sub.body || "", sub.r2_key || "", ts]
    );
    target = "articles";
  } else {
    const b = await body(request).catch(() => ({}));
    await dbRun(
      env,
      "INSERT INTO media_library (id,r2_key,filename,content_type,file_size,alt_text,category,uploaded_at) VALUES (?,?,?,?,?,?,?,?)",
      [uid(), sub.r2_key, sub.filename, sub.content_type, 0, sub.caption || "", "project", ts]
    );
    target = "media";
  }
  await dbRun(env, "UPDATE submissions SET status='published',reviewed_at=?,reviewed_by='admin' WHERE id=?", [ts, id]);
  return j({ ok: true, message: "Approved and moved to " + target });
}
__name(handleAdminSubmissionApprove, "handleAdminSubmissionApprove");
__name2(handleAdminSubmissionApprove, "handleAdminSubmissionApprove");
async function handleAdminSubmissionReject(request, env, id) {
  const b = await body(request);
  const ts = now();
  await dbRun(env, "UPDATE submissions SET status='rejected',admin_note=?,reviewed_at=?,reviewed_by='admin' WHERE id=?", [b.note || "", ts, id]);
  return j({ ok: true });
}
__name(handleAdminSubmissionReject, "handleAdminSubmissionReject");
__name2(handleAdminSubmissionReject, "handleAdminSubmissionReject");
function handleContributorPortal(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const PORTAL_CSS = '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:"Inter",system-ui,sans-serif;background:#f8f7f5;color:#1c1c1e;min-height:100vh}.pnav{background:#1a2744;border-bottom:3px solid #c8a84b;padding:.8rem 1.5rem;display:flex;align-items:center;justify-content:space-between}.plogo{font-family:"Oswald",sans-serif;color:#fff;font-size:1.3rem;letter-spacing:.06em}.plogo span{color:#c8a84b}.pwelcome{color:rgba(255,255,255,.7);font-size:.85rem}.pwrap{max-width:640px;margin:0 auto;padding:2rem 1.25rem}.pcard{background:#fff;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,.08);padding:1.5rem;margin-bottom:1.25rem}.pcard h2{font-family:"Oswald",sans-serif;font-size:1.1rem;color:#1a2744;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}.pbtn{width:100%;background:#c8a84b;color:#fff;font-family:"Oswald",sans-serif;font-size:1rem;font-weight:600;letter-spacing:.06em;border:none;border-radius:6px;padding:.85rem;cursor:pointer;margin-bottom:.75rem;display:flex;align-items:center;justify-content:center;gap:.5rem;transition:opacity .15s}.pbtn:hover{opacity:.88}.pbtn.outline{background:transparent;border:2px solid #1a2744;color:#1a2744}.pinput,.ptextarea,.pselect{width:100%;padding:.7rem .9rem;border:1.5px solid #e4e4e4;border-radius:6px;font-family:"Inter",sans-serif;font-size:16px;outline:none;background:#fff;color:#1c1c1e;margin-bottom:.75rem}.pinput:focus,.ptextarea:focus,.pselect:focus{border-color:#c8a84b}.ptextarea{min-height:100px;resize:vertical}.plabel{font-size:.78rem;color:#666;margin-bottom:.3rem;display:block}.pform{display:none;margin-top:.75rem;border-top:1px solid #e4e4e4;padding-top:.75rem}.pmsg{padding:.75rem 1rem;border-radius:6px;font-size:.88rem;margin-top:.5rem;display:none}.pmsg.ok{background:#dcfce7;color:#15803d}.pmsg.err{background:#fee2e2;color:#b91c1c}.sbadge{display:inline-block;font-size:.68rem;font-weight:600;padding:.15rem .55rem;border-radius:10px;text-transform:uppercase}.sbadge.pending{background:#fef3c7;color:#92400e}.sbadge.published{background:#dcfce7;color:#166534}.sbadge.rejected{background:#fee2e2;color:#991b1b}.sitem{padding:.75rem 0;border-bottom:1px solid #f0f0f0;display:flex;align-items:flex-start;gap:.75rem}.sicon{font-size:1.4rem;flex-shrink:0}.smeta{flex:1;min-width:0}.stitle{font-size:.88rem;font-weight:600;color:#1a2744;margin-bottom:.2rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sdate{font-size:.72rem;color:#888}.snote{font-size:.78rem;color:#ef4444;margin-top:.2rem}';
  if (!token) {
    return h('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Contributor Portal</title><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>' + PORTAL_CSS + '</style></head><body><div class="pnav"><div class="plogo">CCS<span>.</span></div></div><div class="pwrap"><div class="pcard" style="text-align:center;padding:3rem 2rem"><div style="font-size:3rem;margin-bottom:1rem">&#128274;</div><h2 style="justify-content:center;margin-bottom:.5rem">Invite Required</h2><p style="color:#666;font-size:.9rem">Ask your admin for a contributor invite link.</p></div></div></body></html>');
  }
  const PORTAL_JS = [
    'var TOKEN="' + token.replace(/"/g, "") + '";',
    "var memberData=null;",
    "async function init(){",
    "  try{",
    '    var r=await fetch("/api/member/me?token="+TOKEN);',
    "    var d=await r.json();",
    `    if(!d.ok){document.body.innerHTML="<div style='padding:3rem;text-align:center'><h2>Invalid or expired invite link.</h2></div>";return;}`,
    "    memberData=d.member;",
    '    document.getElementById("welcomeName").textContent="Welcome, "+d.member.name+"!";',
    "    loadMySubmissions();",
    `  }catch(e){document.body.innerHTML="<div style='padding:3rem;text-align:center'><h2>Error loading portal.</h2></div>";}`,
    "}",
    "function toggleForm(id){",
    '  var forms=document.querySelectorAll(".pform");',
    '  forms.forEach(function(f){if(f.id!==id)f.style.display="none";});',
    "  var el=document.getElementById(id);",
    '  el.style.display=el.style.display==="block"?"none":"block";',
    "}",
    "async function submitPhoto(){",
    '  var fi=document.getElementById("photoFile");',
    '  if(!fi.files.length){showMsg("photoMsg","Please choose a file.","err");return;}',
    "  var fd=new FormData();",
    '  fd.append("file",fi.files[0]);',
    '  fd.append("type","photo");',
    '  fd.append("caption",document.getElementById("photoCaption").value);',
    '  fd.append("project_tag",document.getElementById("photoTag").value);',
    '  fd.append("token",TOKEN);',
    '  showMsg("photoMsg","Uploading...","");',
    "  try{",
    '    var r=await fetch("/api/member/submit",{method:"POST",body:fd});',
    "    var d=await r.json();",
    '    if(d.ok){showMsg("photoMsg",d.message,"ok");fi.value="";document.getElementById("photoCaption").value="";document.getElementById("photoTag").value="";loadMySubmissions();}',
    '    else showMsg("photoMsg",d.error||"Error","err");',
    '  }catch(e){showMsg("photoMsg","Upload failed.","err");}',
    "}",
    "async function submitArticle(){",
    '  var title=document.getElementById("artTitle").value.trim();',
    '  var body=document.getElementById("artBody").value.trim();',
    '  if(!title||!body){showMsg("artMsg","Title and content are required.","err");return;}',
    '  showMsg("artMsg","Submitting...","");',
    "  try{",
    '    var r=await fetch("/api/member/submit",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+TOKEN},body:JSON.stringify({type:"article",title:title,summary:document.getElementById("artSummary").value.trim(),body:body})});',
    "    var d=await r.json();",
    '    if(d.ok){showMsg("artMsg",d.message,"ok");document.getElementById("artTitle").value="";document.getElementById("artSummary").value="";document.getElementById("artBody").value="";loadMySubmissions();}',
    '    else showMsg("artMsg",d.error||"Error","err");',
    '  }catch(e){showMsg("artMsg","Submit failed.","err");}',
    "}",
    "async function submitNote(){",
    '  var body=document.getElementById("noteBody").value.trim();',
    '  if(!body){showMsg("noteMsg","Note cannot be empty.","err");return;}',
    '  showMsg("noteMsg","Submitting...","");',
    "  try{",
    '    var r=await fetch("/api/member/submit",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+TOKEN},body:JSON.stringify({type:"note",title:"Note",body:body})});',
    "    var d=await r.json();",
    '    if(d.ok){showMsg("noteMsg",d.message,"ok");document.getElementById("noteBody").value="";loadMySubmissions();}',
    '    else showMsg("noteMsg",d.error||"Error","err");',
    '  }catch(e){showMsg("noteMsg","Submit failed.","err");}',
    "}",
    "async function loadMySubmissions(){",
    '  var el=document.getElementById("mySubmissions");',
    "  try{",
    '    var r=await fetch("/api/member/submissions?token="+TOKEN);',
    "    var d=await r.json();",
    `    if(!d.ok||!d.submissions.length){el.innerHTML="<p style='color:#888;font-size:.85rem'>No submissions yet.</p>";return;}`,
    "    el.innerHTML=d.submissions.map(function(s){",
    '      var icon=s.type==="article"?"&#128215;":s.type==="photo"?"&#128247;":s.type==="video"?"&#127916;":"&#128172;";',
    "      var label=s.title||s.filename||s.type;",
    '      var badge=s.status==="published"?"published":s.status==="rejected"?"rejected":"pending";',
    `      var note=s.status==="rejected"&&s.admin_note?"<div class='snote'>Note: "+s.admin_note+"</div>":"";`,
    `      return"<div class='sitem'><div class='sicon'>"+icon+"</div><div class='smeta'><div class='stitle'>"+label+"</div><div class='sdate'>"+(s.created_at||"").slice(0,10)+" &nbsp;<span class='sbadge "+badge+"'>"+s.status+"</span></div>"+note+"</div></div>";`,
    '    }).join("");',
    `  }catch(e){el.innerHTML="<p style='color:#f87171'>Error loading submissions.</p>";}`,
    "}",
    'function showMsg(id,msg,type){var el=document.getElementById(id);el.textContent=msg;el.className="pmsg"+(type?" "+type:"");el.style.display="block";}',
    "init();"
  ].join("\n");
  return h('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Contributor Portal</title><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>' + PORTAL_CSS + `</style></head><body><div class="pnav"><div class="plogo">CCS<span>.</span></div><div class="pwelcome" id="welcomeName">Loading...</div></div><div class="pwrap"><div class="pcard"><h2>&#128247; Upload Photos / Video</h2><button class="pbtn" onclick="toggleForm('photoForm')">Choose File to Upload</button><div class="pform" id="photoForm"><label class="plabel">Photo or Video File</label><input type="file" class="pinput" id="photoFile" accept="image/*,video/*"/><label class="plabel">Caption</label><input class="pinput" id="photoCaption" placeholder="Describe the photo..."/><label class="plabel">Project Tag</label><input class="pinput" id="photoTag" placeholder="e.g. Kitchen Remodel, Burbank"/><button class="pbtn" onclick="submitPhoto()">Submit Photo</button><div class="pmsg" id="photoMsg"></div></div></div><div class="pcard"><h2>&#128215; Submit an Article</h2><button class="pbtn outline" onclick="toggleForm('artForm')">Write an Article</button><div class="pform" id="artForm"><label class="plabel">Title *</label><input class="pinput" id="artTitle" placeholder="Article title..."/><label class="plabel">Summary (short)</label><input class="pinput" id="artSummary" placeholder="One-sentence summary..."/><label class="plabel">Content *</label><textarea class="ptextarea" id="artBody" placeholder="Write your article here..."></textarea><button class="pbtn" onclick="submitArticle()">Submit Article</button><div class="pmsg" id="artMsg"></div></div></div><div class="pcard"><h2>&#128172; Add a Note</h2><button class="pbtn outline" onclick="toggleForm('noteForm')">Write a Note</button><div class="pform" id="noteForm"><label class="plabel">Your note</label><textarea class="ptextarea" id="noteBody" placeholder="Quick note or update for the team..."></textarea><button class="pbtn" onclick="submitNote()">Send Note</button><div class="pmsg" id="noteMsg"></div></div></div><div class="pcard"><h2>&#128203; My Recent Submissions</h2><div id="mySubmissions"><span style="color:#888;font-size:.85rem">Loading...</span></div></div></div><script>` + PORTAL_JS + "<\/script></body></html>");
}
__name(handleContributorPortal, "handleContributorPortal");
__name2(handleContributorPortal, "handleContributorPortal");
var contractor_v003_2_afo_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const method = request.method;
    if (method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Allow-Headers": "*" } });
    if (path === "/" && method === "GET") return handleHome(env);
    if (path === "/admin" && method === "GET") return h(buildAdmin());
    if (path === "/chat" && method === "POST") return handleChat(request, env);
    if (path === "/leads" && method === "POST") return handleLeads(request, env);
    if (path === "/callback" && method === "POST") return handleCallback(request, env);
    if (path === "/upload" && method === "POST") return handleUpload(request, env);
    if (path === "/articles" && method === "GET") return handleArticlesIndex(env);
    if (path.startsWith("/articles/") && method === "GET") return handlePublicArticlePage(path.slice(10), env);
    if (path === "/api/status") return handleStatus(env);
    if (path === "/api/publish" && method === "POST") return handlePublish(env);
    if (path === "/api/seed" && method === "POST") return handleSeed(env);
    const contentMatch = path.match(/^\/api\/content\/([a-z]+)$/);
    if (contentMatch && method === "GET") return handleContentGet(contentMatch[1], env);
    if (contentMatch && method === "POST") return handleContentSave(request, contentMatch[1], env);
    if (path === "/api/admin/leads") return handleAdminLeads(request, env);
    if (path === "/api/admin/callbacks") return handleAdminCallbacks(request, env);
    const leadMatch = path.match(/^\/api\/admin\/leads\/(\d+)$/);
    if (leadMatch) return handleAdminLeadById(request, env, leadMatch[1]);
    const cbMatch = path.match(/^\/api\/admin\/callbacks\/(\d+)$/);
    if (cbMatch) return handleAdminCallbackById(request, env, cbMatch[1]);
    if (path === "/api/media/upload" && method === "POST") return handleMediaUpload(request, env);
    if (path === "/api/media" && method === "GET") return handleMediaList(env);
    const mediaMatch = path.match(/^\/api\/media\/([^/]+)$/);
    if (mediaMatch && method === "DELETE") return handleMediaDelete(request, env, mediaMatch[1]);
    if (mediaMatch && method === "PATCH") return handleMediaAltText(request, env, mediaMatch[1]);
    if (path.startsWith("/media/serve/")) return handleMediaServe(env, path.slice(13));
    if (path === "/api/admin/articles" && method === "GET") return handleAdminArticles(request, env);
    const artMatch = path.match(/^\/api\/admin\/articles\/([^/]+)$/);
    if (artMatch && method === "GET") return handleAdminArticleGet(env, artMatch[1]);
    if (artMatch && (method === "POST" || method === "PUT")) return handleAdminArticleSave(request, env, artMatch[1]);
    if (artMatch && method === "DELETE") return handleAdminArticleDelete(env, artMatch[1]);
    const artToggle = path.match(/^\/api\/admin\/articles\/([^/]+)\/toggle$/);
    if (artToggle && method === "POST") return handleAdminArticleToggle(request, env, artToggle[1]);
    if (path === "/api/knowledge" && method === "GET") return handleKnowledgeList(env);
    const seedMatch = path.match(/^\/api\/knowledge\/([^/]+)$/);
    if (seedMatch && (method === "POST" || method === "PUT")) return handleKnowledgeSave(request, env, seedMatch[1]);
    if (seedMatch && method === "DELETE") return handleKnowledgeDelete(env, seedMatch[1]);
    if (path === "/contribute" && method === "GET") return handleContributorPortal(request, env);
    if (path === "/api/member/me" && method === "GET") return handleMemberMe(request, env);
    if (path === "/api/member/submit" && method === "POST") return handleMemberSubmit(request, env);
    if (path === "/api/member/submissions" && method === "GET") return handleMemberSubmissions(request, env);
    if (path === "/api/admin/members" && method === "GET") return handleAdminMembers(request, env);
    if (path === "/api/admin/members" && method === "POST") return handleAdminMembers(request, env);
    const memberDelMatch = path.match(/^\/api\/admin\/members\/([^/]+)$/);
    if (memberDelMatch && method === "DELETE") return handleAdminMembers(request, env);
    if (path === "/api/admin/submissions" && method === "GET") return handleAdminSubmissions(request, env);
    const subApproveMatch = path.match(/^\/api\/admin\/submissions\/([^/]+)\/approve$/);
    if (subApproveMatch && method === "POST") return handleAdminSubmissionApprove(request, env, subApproveMatch[1]);
    const subRejectMatch = path.match(/^\/api\/admin\/submissions\/([^/]+)\/reject$/);
    if (subRejectMatch && method === "POST") return handleAdminSubmissionReject(request, env, subRejectMatch[1]);
    return j({ ok: false, error: "not_found", path }, 404);
  }
};
export {
  contractor_v003_2_afo_default as default
};
//# sourceMappingURL=contractor-v003-2-afo.js.map
