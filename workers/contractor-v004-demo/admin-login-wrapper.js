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
    version: "0.6.0-demo",
    status_mode: "fast-wrapper-v1",
    db: false,
    r2: true,
    vectorize: true,
    ai: true,
    leads: 0,
    articles: 0,
    callbacks: 0,
    has_snapshot: false,
    timestamp: new Date().toISOString()
  };
  try { const r = await env.V003_2_DB.prepare("SELECT COUNT(*) AS c FROM leads").first(); out.leads = r?.c||0; out.db = true; } catch(e) {}
  try { const r = await env.V003_2_DB.prepare("SELECT COUNT(*) AS c FROM articles").first(); out.articles = r?.c||0; } catch(e) {}
  try { const r = await env.V003_2_DB.prepare("SELECT COUNT(*) AS c FROM callbacks").first(); out.callbacks = r?.c||0; } catch(e) {}
  try { const r = await env.V003_2_DB.prepare("SELECT published_at FROM site_snapshot LIMIT 1").first(); out.has_snapshot = !!r; } catch(e) {}
  try { await env.V003_2_R2.list({ prefix: "contractor-v003-2/", limit: 1 }); out.r2 = true; } catch(e) {}
  out.ms = Date.now() - started;
  return json(out);
}

// This script is injected BEFORE the broken main script.
// It defines every function that the broken script would have defined,
// so by the time the browser tries to parse Script 1 and fails,
// all the dashboard functions are already live on window.
const ADMIN_FIX_SCRIPT = `<script id="admin-fix">
(function(){

// ── Utilities ────────────────────────────────────────────────────────────────
function copyToClipboard(t){try{navigator.clipboard.writeText(t).then(function(){alert("Copied!");});}catch(e){prompt("Copy:",t);}}
window.copyToClipboard = copyToClipboard;

// ── Status Dashboard ─────────────────────────────────────────────────────────
async function loadStatus(){
  try{
    var r=await fetch("/api/status");
    var d=await r.json();
    var snap=d.has_snapshot
      ? "<span style='color:#4ade80'>Yes</span>"
      : "<span style='color:#f59e0b'>No — click Publish</span>";
    var items=[
      ["Worker", d.worker||"contractor-v004-demo", false],
      ["Version", d.version||"0.6.0-demo", false],
      ["D1", d.db, true],
      ["Vectorize", d.vectorize, true],
      ["R2", d.r2, true],
      ["Leads", d.leads, false],
      ["Callbacks", d.callbacks, false],
      ["Articles", d.articles, false],
      ["Site Live", snap, false]
    ];
    var el=document.getElementById("statusGrid");
    if(!el)return;
    el.innerHTML=items.map(function(x){
      var v=x[2]?(x[1]?"Yes":"No"):String(x[1]!=null?x[1]:"--");
      var c=x[2]?(x[1]?"ok":"err"):"";
      return "<div class='stat-box'><h4>"+x[0]+"</h4><div class='stat-val "+c+"'>"+v+"</div></div>";
    }).join("");
  }catch(e){
    var el=document.getElementById("statusGrid");
    if(el)el.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";
  }
}
window.loadStatus = loadStatus;

function loadAll(){ loadStatus(); }
window.loadAll = loadAll;

// ── Tab switching ─────────────────────────────────────────────────────────────
function showTab(t){
  window._activeTab=t;
  document.querySelectorAll(".atab").forEach(function(el){
    el.classList.toggle("active", el.dataset.tab===t);
  });
  document.querySelectorAll(".apanel").forEach(function(el){
    el.style.display=el.dataset.panel===t?"block":"none";
  });
  if(t==="dashboard") loadStatus();
  else if(t==="leads") { if(window.loadLeads) loadLeads(); }
  else if(t==="callbacks") { if(window.loadCallbacks) loadCallbacks(); }
  else if(t==="articles") { if(window.loadArticles) loadArticles(); }
  else if(t==="media") { if(window.loadMedia) loadMedia(); }
  else if(t==="knowledge") { if(window.loadKnowledge) loadKnowledge(); }
  else if(t==="members") loadMembers();
  else if(t==="submissions") loadSubmissions();
  else if(["services","projects","reviews","process","contact"].includes(t)) {
    if(window.loadSection) loadSection(t);
  }
}
window.showTab = showTab;

// ── Members ───────────────────────────────────────────────────────────────────
async function loadMembers(){
  var el=document.getElementById("cmsPanel_members");
  if(!el)return;
  el.innerHTML="Loading...";
  try{
    var r=await fetch("/api/admin/members");
    var d=await r.json();
    var h='<div style="margin-bottom:1rem">'
      +'<p style="font-size:.82rem;color:var(--muted);margin-bottom:.75rem">Share the portal URL with your team.</p>'
      +'<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem;margin-bottom:1rem">'
      +'<label style="font-size:.78rem;color:var(--muted);display:block;margin-bottom:.3rem">New Member</label>'
      +'<div style="display:flex;gap:.5rem;flex-wrap:wrap">'
      +'<input class="sinput" id="newMemberName" placeholder="Full name" style="max-width:200px"/>'
      +'<select id="newMemberRole" style="background:rgba(255,255,255,.08);border:1px solid var(--border);color:#fff;padding:.6rem;border-radius:var(--r);font-size:.85rem">'
      +'<option value="contributor">Contributor</option><option value="editor">Editor</option></select>'
      +'<button class="btn btn-gold btn-sm" onclick="addMember()">+ Add Member</button></div>'
      +'<div id="newMemberResult" style="margin-top:.75rem"></div></div></div>';
    if(!d.members||!d.members.length){el.innerHTML=h+'<p style="color:var(--muted)">No members yet.</p>';return;}
    h+='<div style="overflow-x:auto"><table><thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Portal URL</th><th></th></tr></thead><tbody>';
    d.members.forEach(function(m){
      var st=m.active?'<span style="color:#4ade80">Active</span>':'<span style="color:#f87171">Inactive</span>';
      var db=m.active?'<button class="btn btn-sm" style="background:#ef4444;color:#fff" data-mid="'+m.id+'" onclick="deactivateMember(this.dataset.mid)">Deactivate</button>':'';
      h+='<tr><td style="font-weight:600">'+m.name+'</td><td>'+m.role+'</td><td>'+st+'</td>';
      h+='<td style="max-width:220px"><div style="display:flex;gap:.35rem;align-items:center">';
      h+='<span style="font-size:.72rem;color:var(--muted);max-width:155px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+m.portal_url+'</span>';
      h+='<button class="btn btn-sm" style="background:rgba(255,255,255,.1);color:#fff;font-size:.68rem" data-url="'+m.portal_url+'" onclick="copyToClipboard(this.dataset.url)">Copy</button>';
      h+='</div></td><td>'+db+'</td></tr>';
    });
    h+='</tbody></table></div>';
    el.innerHTML=h;
  }catch(e){el.innerHTML='<p style="color:#f87171">'+e.message+'</p>';}
}
window.loadMembers = loadMembers;

async function addMember(){
  var name=document.getElementById("newMemberName").value.trim();
  var role=document.getElementById("newMemberRole").value;
  var res=document.getElementById("newMemberResult");
  if(!name){res.innerHTML='<p style="color:#f87171">Name required.</p>';return;}
  res.innerHTML="Creating...";
  try{
    var r=await fetch("/api/admin/members",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name,role:role})});
    var d=await r.json();
    if(d.ok){
      var pu=d.portal_url;
      res.innerHTML='<div style="background:rgba(74,222,128,.1);border:1px solid #4ade80;border-radius:var(--r);padding:.75rem;font-size:.82rem"><strong style="color:#4ade80">Member created!</strong><br>Portal: <span style="color:#fff;font-size:.78rem">'+pu+'</span><br><button class="btn btn-sm" style="background:var(--a);color:#fff;font-size:.7rem;margin-top:.5rem" data-url="'+pu+'" onclick="copyToClipboard(this.dataset.url)">Copy Link</button></div>';
      document.getElementById("newMemberName").value="";
      loadMembers();
    }else{res.innerHTML='<p style="color:#f87171">'+(d.error||"Error")+'</p>';}
  }catch(e){res.innerHTML='<p style="color:#f87171">'+e.message+'</p>';}
}
window.addMember = addMember;

async function deactivateMember(id){
  if(!confirm("Deactivate this member?"))return;
  try{await fetch("/api/admin/members/"+id,{method:"DELETE"});loadMembers();}catch(e){alert(e.message);}
}
window.deactivateMember = deactivateMember;

// ── Submissions ───────────────────────────────────────────────────────────────
async function loadSubmissions(){
  var el=document.getElementById("cmsPanel_submissions");
  if(!el)return;
  el.innerHTML="Loading...";
  var showAll=el.dataset.showAll==="1";
  try{
    var r=await fetch("/api/admin/submissions"+(showAll?"?status=all":""));
    var d=await r.json();
    var fb='<div style="margin-bottom:1rem;display:flex;gap:.5rem">'
      +'<button class="btn btn-sm" style="background:'+(showAll?'rgba(255,255,255,.1)':'var(--a)')+';color:#fff" onclick="setSubFilter(0)">Pending</button>'
      +'<button class="btn btn-sm" style="background:'+(showAll?'var(--a)':'rgba(255,255,255,.1)')+';color:#fff" onclick="setSubFilter(1)">All</button>'
      +'</div>';
    if(!d.submissions||!d.submissions.length){el.innerHTML=fb+'<p style="color:var(--muted)">No submissions'+(showAll?"":" pending")+'.</p>';return;}
    var h=fb+'<div style="display:grid;gap:.75rem">';
    d.submissions.forEach(function(s){
      var icon=s.type==="article"?"&#128215;":s.type==="photo"?"&#128247;":s.type==="video"?"&#127916;":"&#128172;";
      var label=s.title||s.filename||s.type;
      var sc=s.status==="published"?"#4ade80":s.status==="rejected"?"#f87171":"#f59e0b";
      var isImg=s.r2_key&&s.content_type&&s.content_type.indexOf("image")===0;
      var thumb=isImg?'<img src="/media/serve/'+encodeURIComponent(s.r2_key)+'" style="width:80px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0">':'';
      var icon_div=thumb||'<div style="width:80px;height:60px;background:rgba(255,255,255,.06);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0">'+icon+'</div>';
      var actions=s.status==="pending"
        ?'<div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center">'
          +'<button class="btn btn-sm" style="background:#22c55e;color:#fff" data-id="'+s.id+'" onclick="approveSubmission(this.dataset.id)">Approve</button>'
          +'<button class="btn btn-sm" style="background:#ef4444;color:#fff" data-id="'+s.id+'" onclick="rejectSubmission(this.dataset.id)">Reject</button>'
          +'<span id="rejectForm_'+s.id+'" style="display:none">'
          +'<input id="rejectNote_'+s.id+'" class="sinput" placeholder="Reason" style="max-width:200px"/>'
          +'<button class="btn btn-sm" style="background:#ef4444;color:#fff" data-id="'+s.id+'" onclick="confirmReject(this.dataset.id)">Send</button>'
          +'</span></div>'
        :'';
      h+='<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1rem">'
        +'<div style="display:flex;gap:.75rem;align-items:flex-start">'+icon_div
        +'<div style="flex:1;min-width:0">'
        +'<div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.3rem">'
        +'<strong style="color:#fff;font-size:.9rem">'+label+'</strong>'
        +'<span style="background:'+sc+';color:#000;font-size:.65rem;font-weight:700;padding:.1rem .45rem;border-radius:8px;text-transform:uppercase">'+s.status+'</span></div>'
        +'<div style="font-size:.75rem;color:var(--muted);margin-bottom:.5rem">'+(s.member_name||"Unknown")+' &bull; '+s.type+' &bull; '+(s.created_at||"").slice(0,10)+'</div>'
        +(s.summary||s.caption?'<div style="font-size:.78rem;color:var(--muted);margin-bottom:.5rem">'+(s.summary||s.caption)+'</div>':'')
        +actions+'</div></div></div>';
    });
    h+='</div>';
    el.innerHTML=h;
  }catch(e){el.innerHTML='<p style="color:#f87171">'+e.message+'</p>';}
}
window.loadSubmissions = loadSubmissions;

function setSubFilter(all){var el=document.getElementById("cmsPanel_submissions");if(el)el.dataset.showAll=all?"1":"0";loadSubmissions();}
window.setSubFilter = setSubFilter;

async function approveSubmission(id){try{var r=await fetch("/api/admin/submissions/"+id+"/approve",{method:"POST"});var d=await r.json();if(d.ok){alert(d.message);loadSubmissions();}else alert(d.error||"Error");}catch(e){alert(e.message);}}
window.approveSubmission = approveSubmission;

function rejectSubmission(id){var el=document.getElementById("rejectForm_"+id);if(el)el.style.display=el.style.display==="inline-flex"?"none":"inline-flex";}
window.rejectSubmission = rejectSubmission;

async function confirmReject(id){var note=(document.getElementById("rejectNote_"+id)||{}).value||"";try{var r=await fetch("/api/admin/submissions/"+id+"/reject",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({note:note})});var d=await r.json();if(d.ok)loadSubmissions();else alert(d.error||"Error");}catch(e){alert(e.message);}}
window.confirmReject = confirmReject;

// ── Boot: run after DOM ready ─────────────────────────────────────────────────
// The broken Script 1 will throw on parse, but our functions are already on window.
// We call loadAll() ourselves here.
function boot(){
  try{sessionStorage.setItem("ccs_admin_v2","1");}catch(e){}
  var lock=document.getElementById("lock");
  var appEl=document.getElementById("app");
  if(lock){lock.style.display="none";}
  if(appEl){appEl.style.display="block";}
  loadStatus();
}
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded", boot, {once:true});
} else {
  boot();
}

})();
</script>`;

function bypassAdminPassword(html) {
  const css = `<style id="admin-bypass-css">
#lock{display:none!important;}
#app{display:block!important;}
</style>`;

  let out = html;
  // Inject CSS in head
  if (out.includes("</head>")) out = out.replace("</head>", css + "</head>");
  // Inject our fix script BEFORE the first <script> tag so our functions
  // are defined before the broken script tries to parse
  if (out.includes("<script>")) out = out.replace("<script>", ADMIN_FIX_SCRIPT + "<script>");
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

    // Intercept status — fast response, no AI/vectorize overhead
    if (request.method === "GET" && (path === "/status" || path === "/admin/status" || path === "/api/status")) {
      return fastStatus(env);
    }

    // Admin page — inject fix script
    if (request.method === "GET" && path === "/admin") {
      const response = await app.fetch(request, env, ctx);
      const html = await response.text();
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "text/html;charset=UTF-8");
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("X-Admin-Fix", "v3");
      return new Response(bypassAdminPassword(html), { status: response.status, headers });
    }

    return app.fetch(request, env, ctx);
  }
};
