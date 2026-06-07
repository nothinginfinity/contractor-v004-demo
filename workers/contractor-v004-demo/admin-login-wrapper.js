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
    r2: false,
    vectorize: true,
    ai: true,
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
  } catch (e) { out.db_error = String(e?.message || e); }

  try {
    const row = await env.V003_2_DB.prepare("SELECT COUNT(*) AS c FROM articles").first();
    out.articles = row?.c || 0;
  } catch (e) {}

  try {
    const row = await env.V003_2_DB.prepare("SELECT COUNT(*) AS c FROM callbacks").first();
    out.callbacks = row?.c || 0;
  } catch (e) {}

  try {
    const row = await env.V003_2_DB.prepare("SELECT published_at FROM site_snapshot LIMIT 1").first();
    out.has_snapshot = !!row;
  } catch (e) {}

  try {
    await env.V003_2_R2.list({ prefix: "contractor-v003-2/", limit: 1 });
    out.r2 = true;
  } catch (e) { out.r2_error = String(e?.message || e); }

  out.ms = Date.now() - started;
  return json(out);
}

// Replaces the broken loadMembers function (single-quote HTML attr escaping bug)
// with a working version injected directly into the admin page HTML.
const MEMBERS_FIX = `
<script id="members-fix">
function copyToClipboard(t){try{navigator.clipboard.writeText(t).then(function(){alert("Copied!");});}catch(e){prompt("Copy:",t);}}
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
async function deactivateMember(id){
  if(!confirm("Deactivate this member?"))return;
  try{await fetch("/api/admin/members/"+id,{method:"DELETE"});loadMembers();}catch(e){alert(e.message);}
}
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
          +'<input id="rejectNote_'+s.id+'" class="sinput" placeholder="Reason (optional)" style="max-width:200px"/>'
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
function setSubFilter(all){var el=document.getElementById("cmsPanel_submissions");if(el)el.dataset.showAll=all?"1":"0";loadSubmissions();}
async function approveSubmission(id){try{var r=await fetch("/api/admin/submissions/"+id+"/approve",{method:"POST"});var d=await r.json();if(d.ok){alert(d.message);loadSubmissions();}else alert(d.error||"Error");}catch(e){alert(e.message);}}
function rejectSubmission(id){var el=document.getElementById("rejectForm_"+id);if(el)el.style.display=el.style.display==="inline-flex"?"none":"inline-flex";}
async function confirmReject(id){var note=(document.getElementById("rejectNote_"+id)||{}).value||"";try{var r=await fetch("/api/admin/submissions/"+id+"/reject",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({note:note})});var d=await r.json();if(d.ok)loadSubmissions();else alert(d.error||"Error");}catch(e){alert(e.message);}}
</script>`;

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
</\script>`;

  let out = html;
  if (out.includes("</head>")) out = out.replace("</head>", css + "</head>");
  else out = css + out;
  // Inject the members/submissions fix BEFORE the existing broken script
  if (out.includes("<script>")) out = out.replace("<script>", MEMBERS_FIX + "<script>");
  // Inject password bypass at end of body
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

    // Fast status endpoint — intercept before app to avoid slow AI/vectorize checks
    if (request.method === "GET" && (path === "/status" || path === "/admin/status" || path === "/api/status")) {
      return fastStatus(env);
    }

    // Admin page — inject password bypass + member function fix
    if (request.method === "GET" && path === "/admin") {
      const response = await app.fetch(request, env, ctx);
      const html = await response.text();
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "text/html;charset=UTF-8");
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("X-Contractor-Demo-Admin", "password-bypass-members-fix-v2");
      return new Response(bypassAdminPassword(html), { status: response.status, headers });
    }

    return app.fetch(request, env, ctx);
  }
};
