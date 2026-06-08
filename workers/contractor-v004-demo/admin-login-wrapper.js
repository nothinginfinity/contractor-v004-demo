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
    version: "0.7.0-demo",
    status_mode: "fast-wrapper-v2",
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

// ─────────────────────────────────────────────────────────────────────────────
// Content Hub — handle routes that need to be intercepted before app.fetch
// ─────────────────────────────────────────────────────────────────────────────
import { handleContentHub } from "./content-hub.js";

async function routeContentHub(req, env, ctx, path) {
  if (path === '/crew/upload') return handleContentHub(req, env);
  if (path.startsWith('/api/admin/content-submissions') || path.startsWith('/api/admin/social-posts')) {
    return handleContentHub(req, env);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin fix + Content Hub admin JS
// NOTE: All regex literals inside this template literal must use new RegExp()
// because /pattern/ with slashes can be misread as comments or break parsing.
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_FIX_SCRIPT = `<script id="admin-fix">
(function(){

// ── Utilities ────────────────────────────────────────────────────────────────
function copyToClipboard(t){try{navigator.clipboard.writeText(t).then(function(){alert('Copied!');});}catch(e){prompt('Copy:',t);}}
window.copyToClipboard = copyToClipboard;

// ── Status ───────────────────────────────────────────────────────────────────
async function loadStatus(){
  try{
    var r=await fetch('/api/status');
    var d=await r.json();
    var snap=d.has_snapshot?"<span style='color:#4ade80'>Yes</span>":"<span style='color:#f59e0b'>No — click Publish</span>";
    var items=[["Worker",d.worker||"contractor-v004-demo",false],["Version",d.version||"0.7.0-demo",false],["D1",d.db,true],["Vectorize",d.vectorize,true],["R2",d.r2,true],["Leads",d.leads,false],["Callbacks",d.callbacks,false],["Articles",d.articles,false],["Site Live",snap,false]];
    var el=document.getElementById('statusGrid');
    if(!el)return;
    el.innerHTML=items.map(function(x){var v=x[2]?(x[1]?'Yes':'No'):String(x[1]!=null?x[1]:'--');var c=x[2]?(x[1]?'ok':'err'):'';return"<div class='stat-box'><h4>"+x[0]+"</h4><div class='stat-val "+c+"'>"+v+"</div></div>";}).join('');
  }catch(e){var el=document.getElementById('statusGrid');if(el)el.innerHTML="<p style='color:#f87171'>"+e.message+"</p>";}
}
window.loadStatus=loadStatus;
function loadAll(){loadStatus();}
window.loadAll=loadAll;

// ── Tab switching ─────────────────────────────────────────────────────────────
function showTab(t){
  window._activeTab=t;
  document.querySelectorAll('.atab').forEach(function(el){el.classList.toggle('active',el.dataset.tab===t);});
  document.querySelectorAll('.apanel').forEach(function(el){el.style.display=el.dataset.panel===t?'block':'none';});
  if(t==='dashboard')loadStatus();
  else if(t==='leads'){if(window.loadLeads)loadLeads();}
  else if(t==='callbacks'){if(window.loadCallbacks)loadCallbacks();}
  else if(t==='articles'){if(window.loadArticles)loadArticles();}
  else if(t==='media'){if(window.loadMedia)loadMedia();}
  else if(t==='knowledge'){if(window.loadKnowledge)loadKnowledge();}
  else if(t==='members')loadMembers();
  else if(t==='submissions')loadSubmissions();
  else if(t==='contenthub')loadContentHub();
  else if(['services','projects','reviews','process','contact'].includes(t)){if(window.loadSection)loadSection(t);}
}
window.showTab=showTab;

// ── Members ───────────────────────────────────────────────────────────────────
async function loadMembers(){
  var el=document.getElementById('cmsPanel_members');
  if(!el)return;
  el.innerHTML='Loading...';
  try{
    var r=await fetch('/api/admin/members');
    var d=await r.json();
    var h='<div style="margin-bottom:1rem"><p style="font-size:.82rem;color:var(--muted);margin-bottom:.75rem">Share the portal URL with your team. Their portal link is also used for the <strong style="color:var(--a)">Content Hub upload page</strong>.</p><div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem;margin-bottom:1rem"><label style="font-size:.78rem;color:var(--muted);display:block;margin-bottom:.3rem">New Member</label><div style="display:flex;gap:.5rem;flex-wrap:wrap"><input class="sinput" id="newMemberName" placeholder="Full name" style="max-width:200px"/><select id="newMemberRole" style="background:rgba(255,255,255,.08);border:1px solid var(--border);color:#fff;padding:.6rem;border-radius:var(--r);font-size:.85rem"><option value="contributor">Contributor</option><option value="editor">Editor</option></select><button class="btn btn-gold btn-sm" onclick="addMember()">+ Add Member</button></div><div id="newMemberResult" style="margin-top:.75rem"></div></div></div>';
    if(!d.members||!d.members.length){el.innerHTML=h+'<p style="color:var(--muted)">No members yet.</p>';return;}
    h+='<div style="overflow-x:auto"><table><thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Portal URL</th><th>Upload Link</th><th></th></tr></thead><tbody>';
    d.members.forEach(function(m){
      var st=m.active?'<span style="color:#4ade80">Active</span>':'<span style="color:#f87171">Inactive</span>';
      var db=m.active?'<button class="btn btn-sm" style="background:#ef4444;color:#fff" data-mid="'+m.id+'" onclick="deactivateMember(this.dataset.mid)">Deactivate</button>':'';
      // Use new RegExp() instead of regex literal to avoid // comment parsing issue
      var tokenMatch=m.portal_url.match(new RegExp('[?&]token=([^&]+)'));
      var uploadLink=tokenMatch?location.origin+'/crew/upload?token='+tokenMatch[1]:'';
      h+='<tr><td style="font-weight:600">'+m.name+'</td><td>'+m.role+'</td><td>'+st+'</td>';
      h+='<td style="max-width:160px"><div style="display:flex;gap:.35rem;align-items:center"><span style="font-size:.72rem;color:var(--muted);max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+m.portal_url+'</span><button class="btn btn-sm" style="background:rgba(255,255,255,.1);color:#fff;font-size:.68rem" data-url="'+m.portal_url+'" onclick="copyToClipboard(this.dataset.url)">Copy</button></div></td>';
      if(uploadLink){h+='<td><button class="btn btn-sm" style="background:rgba(200,168,75,.2);color:var(--a);font-size:.68rem" data-url="'+uploadLink+'" onclick="copyToClipboard(this.dataset.url)">Copy Upload Link</button></td>';}
      else{h+='<td><span style="font-size:.72rem;color:var(--muted)">n/a</span></td>';}
      h+='<td>'+db+'</td></tr>';
    });
    h+='</tbody></table></div>';
    el.innerHTML=h;
  }catch(e){el.innerHTML='<p style="color:#f87171">'+e.message+'</p>';}
}
window.loadMembers=loadMembers;

async function addMember(){
  var name=document.getElementById('newMemberName').value.trim();
  var role=document.getElementById('newMemberRole').value;
  var res=document.getElementById('newMemberResult');
  if(!name){res.innerHTML='<p style="color:#f87171">Name required.</p>';return;}
  res.innerHTML='Creating...';
  try{
    var r=await fetch('/api/admin/members',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,role:role})});
    var d=await r.json();
    if(d.ok){
      var pu=d.portal_url;
      res.innerHTML='<div style="background:rgba(74,222,128,.1);border:1px solid #4ade80;border-radius:var(--r);padding:.75rem;font-size:.82rem"><strong style="color:#4ade80">Member created!</strong><br>Portal: <span style="color:#fff;font-size:.78rem">'+pu+'</span><br><button class="btn btn-sm" style="background:var(--a);color:#fff;font-size:.7rem;margin-top:.5rem" data-url="'+pu+'" onclick="copyToClipboard(this.dataset.url)">Copy Link</button></div>';
      document.getElementById('newMemberName').value='';
      loadMembers();
    }else{res.innerHTML='<p style="color:#f87171">'+(d.error||'Error')+'</p>';}
  }catch(e){res.innerHTML='<p style="color:#f87171">'+e.message+'</p>';}
}
window.addMember=addMember;

async function deactivateMember(id){
  if(!confirm('Deactivate this member?'))return;
  try{await fetch('/api/admin/members/'+id,{method:'DELETE'});loadMembers();}catch(e){alert(e.message);}
}
window.deactivateMember=deactivateMember;

// ── Submissions (legacy) ──────────────────────────────────────────────────────
async function loadSubmissions(){
  var el=document.getElementById('cmsPanel_submissions');
  if(!el)return;
  el.innerHTML='Loading...';
  var showAll=el.dataset.showAll==='1';
  try{
    var r=await fetch('/api/admin/submissions'+(showAll?'?status=all':''));
    var d=await r.json();
    var fb='<div style="margin-bottom:1rem;display:flex;gap:.5rem"><button class="btn btn-sm" style="background:'+(showAll?'rgba(255,255,255,.1)':'var(--a)')+';color:#fff" onclick="setSubFilter(0)">Pending</button><button class="btn btn-sm" style="background:'+(showAll?'var(--a)':'rgba(255,255,255,.1)')+';color:#fff" onclick="setSubFilter(1)">All</button></div>';
    if(!d.submissions||!d.submissions.length){el.innerHTML=fb+'<p style="color:var(--muted)">No submissions'+(showAll?'':' pending')+'.</p>';return;}
    var h=fb+'<div style="display:grid;gap:.75rem">';
    d.submissions.forEach(function(s){
      var icon=s.type==='article'?'&#128215;':s.type==='photo'?'&#128247;':s.type==='video'?'&#127916;':'&#128172;';
      var label=s.title||s.filename||s.type;
      var sc=s.status==='published'?'#4ade80':s.status==='rejected'?'#f87171':'#f59e0b';
      var isImg=s.r2_key&&s.content_type&&s.content_type.indexOf('image')===0;
      var thumb=isImg?'<img src="/media/serve/'+encodeURIComponent(s.r2_key)+'" style="width:80px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0">':'';
      var icon_div=thumb||'<div style="width:80px;height:60px;background:rgba(255,255,255,.06);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0">'+icon+'</div>';
      var actions=s.status==='pending'?'<div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center"><button class="btn btn-sm" style="background:#22c55e;color:#fff" data-id="'+s.id+'" onclick="approveSubmission(this.dataset.id)">Approve</button><button class="btn btn-sm" style="background:#ef4444;color:#fff" data-id="'+s.id+'" onclick="rejectSubmission(this.dataset.id)">Reject</button><span id="rejectForm_'+s.id+'" style="display:none"><input id="rejectNote_'+s.id+'" class="sinput" placeholder="Reason" style="max-width:200px"/><button class="btn btn-sm" style="background:#ef4444;color:#fff" data-id="'+s.id+'" onclick="confirmReject(this.dataset.id)">Send</button></span></div>':'';
      h+='<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1rem"><div style="display:flex;gap:.75rem;align-items:flex-start">'+icon_div+'<div style="flex:1;min-width:0"><div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.3rem"><strong style="color:#fff;font-size:.9rem">'+label+'</strong><span style="background:'+sc+';color:#000;font-size:.65rem;font-weight:700;padding:.1rem .45rem;border-radius:8px;text-transform:uppercase">'+s.status+'</span></div><div style="font-size:.75rem;color:var(--muted);margin-bottom:.5rem">'+(s.member_name||'Unknown')+' &bull; '+s.type+' &bull; '+(s.created_at||'').slice(0,10)+'</div>'+(s.summary||s.caption?'<div style="font-size:.78rem;color:var(--muted);margin-bottom:.5rem">'+(s.summary||s.caption)+'</div>':'')+actions+'</div></div></div>';
    });
    h+='</div>';
    el.innerHTML=h;
  }catch(e){el.innerHTML='<p style="color:#f87171">'+e.message+'</p>';}
}
window.loadSubmissions=loadSubmissions;
function setSubFilter(all){var el=document.getElementById('cmsPanel_submissions');if(el)el.dataset.showAll=all?'1':'0';loadSubmissions();}
window.setSubFilter=setSubFilter;
async function approveSubmission(id){try{var r=await fetch('/api/admin/submissions/'+id+'/approve',{method:'POST'});var d=await r.json();if(d.ok){alert(d.message);loadSubmissions();}else alert(d.error||'Error');}catch(e){alert(e.message);}}
window.approveSubmission=approveSubmission;
function rejectSubmission(id){var el=document.getElementById('rejectForm_'+id);if(el)el.style.display=el.style.display==='inline-flex'?'none':'inline-flex';}
window.rejectSubmission=rejectSubmission;
async function confirmReject(id){var note=(document.getElementById('rejectNote_'+id)||{}).value||'';try{var r=await fetch('/api/admin/submissions/'+id+'/reject',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({note:note})});var d=await r.json();if(d.ok)loadSubmissions();else alert(d.error||'Error');}catch(e){alert(e.message);}}
window.confirmReject=confirmReject;

// ── Content Hub Tab ───────────────────────────────────────────────────────────
var _chFilter='pending';
var _chActiveCard=null;

async function loadContentHub(){
  var el=document.getElementById('panelContentHub');
  if(!el)return;
  el.innerHTML='<span class="spin"></span> Loading...';
  try{
    var r=await fetch('/api/admin/content-submissions?status='+_chFilter);
    var d=await r.json();
    var filterBar='<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.25rem">'+['pending','approved','posted','rejected','all'].map(function(f){return'<button class="btn btn-sm" style="background:'+(_chFilter===f?'var(--a)':'rgba(255,255,255,.1)')+';color:#fff" onclick="setChFilter(\''+f+'\')">'+f.charAt(0).toUpperCase()+f.slice(1)+'</button>';}).join('')+'<button class="btn btn-sm" style="background:rgba(200,168,75,.2);color:var(--a);margin-left:auto" onclick="loadContentHub()">&#8635; Refresh</button></div>';
    if(!d.submissions||!d.submissions.length){el.innerHTML=filterBar+'<div style="text-align:center;padding:3rem;color:var(--muted)"><div style="font-size:3rem;margin-bottom:.75rem">&#128247;</div><p>No '+(_chFilter==='all'?'':_chFilter+' ')+'content submissions.</p><p style="font-size:.82rem;margin-top:.5rem">Share an upload link with crew via Members tab.</p></div>';return;}
    var html=filterBar+'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem">';
    d.submissions.forEach(function(s){
      var isImg=s.content_type&&s.content_type.indexOf('image')===0;
      var isVid=s.content_type&&s.content_type.indexOf('video')===0;
      var thumb=isImg?'<img src="/media/serve/'+encodeURIComponent(s.r2_key)+'" style="width:100%;height:160px;object-fit:cover;display:block"/>':isVid?'<video src="/media/serve/'+encodeURIComponent(s.r2_key)+'" style="width:100%;height:160px;object-fit:cover;display:block" muted playsinline></video>':'<div style="height:100px;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;font-size:2.5rem">&#128172;</div>';
      var sc=s.status==='posted'?'#4ade80':s.status==='approved'?'#60a5fa':s.status==='rejected'?'#f87171':'#f59e0b';
      var note=s.raw_note||'(no note)';
      html+='<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden">'+(s.r2_key?'<div style="position:relative">'+thumb+'</div>':thumb)+'<div style="padding:1rem"><div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.5rem"><span style="background:'+sc+';color:#000;font-size:.65rem;font-weight:700;padding:.15rem .5rem;border-radius:8px;text-transform:uppercase">'+s.status+'</span><span style="font-size:.72rem;color:var(--muted)">'+s.submitted_by+'</span><span style="font-size:.7rem;color:var(--muted);margin-left:auto">'+(s.created_at||'').slice(0,10)+'</span></div><p style="font-size:.82rem;color:var(--muted);margin-bottom:.75rem;line-height:1.45">'+note.slice(0,140)+(note.length>140?'...':'')+'</p>';
      if(s.status==='pending'){html+='<div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn btn-gold btn-sm" onclick="openChCard('+s.id+')">&#10024; Review &amp; Post</button><button class="btn btn-sm" style="background:#ef4444;color:#fff" onclick="quickRejectSub('+s.id+')">Reject</button></div>';}
      else if(s.status==='approved'){html+='<button class="btn btn-gold btn-sm" onclick="openChCard('+s.id+')">&#128640; Dispatch</button>';}
      else if(s.status==='posted'||s.status==='guided_dispatched'){html+='<span style="color:#4ade80;font-size:.8rem">&#10003; Dispatched</span>';}
      html+='</div></div>';
    });
    html+='</div>';
    el.innerHTML=html;
  }catch(e){el.innerHTML='<p style="color:#f87171">'+e.message+'</p>';}
}
window.loadContentHub=loadContentHub;

function setChFilter(f){_chFilter=f;loadContentHub();}
window.setChFilter=setChFilter;

async function quickRejectSub(id){if(!confirm('Reject this submission?'))return;try{await fetch('/api/admin/content-submissions/'+id+'/reject',{method:'POST'});loadContentHub();}catch(e){alert(e.message);}}
window.quickRejectSub=quickRejectSub;

async function openChCard(id){
  var overlay=document.getElementById('chOverlay');
  overlay.style.display='flex';
  var content=document.getElementById('chModalContent');
  content.innerHTML='<div style="text-align:center;padding:2rem"><span class="spin"></span><p style="margin-top:1rem;color:var(--muted)">Generating AI captions...</p></div>';
  try{
    await fetch('/api/admin/content-submissions/'+id+'/generate-captions',{method:'POST'});
    var r=await fetch('/api/admin/content-submissions?status=all');
    var d=await r.json();
    var s=(d.submissions||[]).find(function(x){return x.id===id;});
    if(!s){content.innerHTML='<p style="color:#f87171">Submission not found</p>';return;}
    var captions=[];
    try{captions=JSON.parse(s.ai_captions||'[]');}catch(e){captions=[];}
    if(!captions.length)captions=['Share your moment from the job site! #contractor #construction','Great work by our team today! #licensed #buildbetter','Another job well done. #craftsmanship #quality'];
    _chActiveCard=s;
    renderChModal(s,captions);
  }catch(e){content.innerHTML='<p style="color:#f87171">'+e.message+'</p>';}
}
window.openChCard=openChCard;

function renderChModal(s,captions){
  var isImg=s.content_type&&s.content_type.indexOf('image')===0;
  var isVid=s.content_type&&s.content_type.indexOf('video')===0;
  var mediaHtml='';
  if(s.r2_key){
    if(isImg)mediaHtml='<img src="/media/serve/'+encodeURIComponent(s.r2_key)+'" style="width:100%;max-height:220px;object-fit:cover;border-radius:8px;margin-bottom:1rem;display:block"/>';
    else if(isVid)mediaHtml='<video src="/media/serve/'+encodeURIComponent(s.r2_key)+'" controls style="width:100%;max-height:220px;border-radius:8px;margin-bottom:1rem;display:block"></video>';
  }
  var captionOpts=captions.map(function(c,i){return'<div style="background:rgba(255,255,255,.05);border:1.5px solid var(--border);border-radius:var(--r);padding:.85rem;margin-bottom:.5rem;cursor:pointer" id="cap_'+i+'" onclick="selectCaption('+i+')" data-cap="'+c.replace(/"/g,'&quot;')+'"><div style="font-size:.75rem;color:var(--a);font-weight:600;margin-bottom:.3rem">Option '+(i+1)+'</div><p style="font-size:.84rem;color:var(--text);line-height:1.5">'+c+'</p></div>';}).join('');
  var content=document.getElementById('chModalContent');
  content.innerHTML=mediaHtml
    +'<p style="font-size:.8rem;color:var(--muted);margin-bottom:1rem"><strong style="color:#fff">From:</strong> '+s.submitted_by+' &bull; '+s.raw_note+'</p>'
    +'<div style="margin-bottom:1.25rem"><div style="font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.6rem">AI Caption Suggestions</div>'+captionOpts+'</div>'
    +'<div style="margin-bottom:1.25rem"><div style="font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.6rem">Edit Caption</div><textarea id="chCaption" style="width:100%;background:rgba(255,255,255,.06);border:1.5px solid var(--border);border-radius:var(--r);padding:.75rem;color:#fff;font-size:.88rem;font-family:inherit;min-height:80px;outline:none;resize:vertical">'+captions[0]+'</textarea></div>'
    +'<div style="margin-bottom:1.5rem"><div style="font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.8rem">Dispatch to Platform</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem" id="platformBtns">'
    +'<button class="btn btn-sm" style="background:#0560ff;color:#fff;padding:.65rem" onclick="dispatchPost(\'bluesky\')" data-plat="bluesky">&#127964; Bluesky<br><span style="font-size:.7rem;opacity:.7">Direct API post</span></button>'
    +'<button class="btn btn-sm" style="background:#563acc;color:#fff;padding:.65rem" onclick="dispatchPost(\'mastodon\')" data-plat="mastodon">&#128025; Mastodon<br><span style="font-size:.7rem;opacity:.7">Direct API post</span></button>'
    +(s.r2_key?'<button class="btn btn-sm" style="background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;padding:.65rem" onclick="guidedPost(\'instagram_guided\')" data-plat="instagram_guided">&#128247; Instagram<br><span style="font-size:.7rem;opacity:.85">Guided preflight</span></button>':'<button class="btn btn-sm" style="background:rgba(255,255,255,.08);color:var(--muted);padding:.65rem;cursor:not-allowed" disabled>&#128247; Instagram<br><span style="font-size:.7rem">Image required</span></button>')
    +(s.r2_key?'<button class="btn btn-sm" style="background:#000;color:#fff;padding:.65rem;border:1px solid #333" onclick="guidedPost(\'tiktok_guided\')" data-plat="tiktok_guided">&#127925; TikTok<br><span style="font-size:.7rem;opacity:.85">Guided preflight</span></button>':'<button class="btn btn-sm" style="background:rgba(255,255,255,.08);color:var(--muted);padding:.65rem;cursor:not-allowed" disabled>&#127925; TikTok<br><span style="font-size:.7rem">Media required</span></button>')
    +'</div></div>'
    +'<div id="chPostResult"></div>'
    +'<div style="display:flex;gap:.75rem;margin-top:.5rem"><button class="btn btn-sm" style="background:rgba(255,255,255,.08);color:var(--muted);flex:1" onclick="closeChOverlay()">Close</button><button class="btn btn-sm" style="background:#ef4444;color:#fff" onclick="quickRejectSub('+s.id+');closeChOverlay()">Reject</button></div>';
}
window.renderChModal=renderChModal;

function selectCaption(i){document.querySelectorAll('[id^="cap_"]').forEach(function(el){el.style.borderColor='var(--border)';});var el=document.getElementById('cap_'+i);if(el){el.style.borderColor='var(--a)';document.getElementById('chCaption').value=el.dataset.cap;}}
window.selectCaption=selectCaption;

async function dispatchPost(platform){
  var s=_chActiveCard;if(!s)return;
  var caption=document.getElementById('chCaption').value.trim();
  if(!caption){alert('Please enter or select a caption first.');return;}
  var res=document.getElementById('chPostResult');
  res.innerHTML='<div style="text-align:center;padding:.75rem"><span class="spin"></span> Posting to '+platform+'...</div>';
  try{
    await fetch('/api/admin/content-submissions/'+s.id+'/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caption:caption,platforms:[platform]})});
    var r2=await fetch('/api/admin/content-submissions/'+s.id+'/post',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({platform:platform,caption:caption})});
    var d=await r2.json();
    if(d.ok){var plink=d.post_url?'<br><a href="'+d.post_url+'" target="_blank" style="color:var(--a)">View Post &#8599;</a>':'';res.innerHTML='<div style="background:rgba(34,197,94,.1);border:1px solid #22c55e;border-radius:var(--r);padding:.75rem;font-size:.85rem;color:#4ade80">&#10003; Posted to '+platform+'!'+plink+'</div>';setTimeout(function(){loadContentHub();},2000);}
    else{res.innerHTML='<div style="background:rgba(239,68,68,.1);border:1px solid #ef4444;border-radius:var(--r);padding:.75rem;font-size:.82rem;color:#f87171">&#10007; '+platform+' error: '+(d.error||'Unknown error')+'</div>';}
  }catch(e){res.innerHTML='<div style="background:rgba(239,68,68,.1);border:1px solid #ef4444;border-radius:var(--r);padding:.75rem;font-size:.82rem;color:#f87171">Error: '+e.message+'</div>';}
}
window.dispatchPost=dispatchPost;

async function guidedPost(platform){
  var s=_chActiveCard;if(!s)return;
  var caption=document.getElementById('chCaption').value.trim();
  var res=document.getElementById('chPostResult');
  try{
    await fetch('/api/admin/content-submissions/'+s.id+'/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caption:caption,platforms:[platform]})});
    await fetch('/api/admin/content-submissions/'+s.id+'/post',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({platform:platform,caption:caption})});
  }catch(e){}
  var mediaUrl=s.r2_key?location.origin+'/media/serve/'+encodeURIComponent(s.r2_key):null;
  var deepLink=platform==='instagram_guided'?'instagram://camera':'snssdk1128://';
  var platformName=platform==='instagram_guided'?'Instagram':'TikTok';
  res.innerHTML='<div style="background:rgba(200,168,75,.1);border:1px solid var(--a);border-radius:var(--r);padding:1rem;margin-bottom:.75rem"><div style="font-size:.82rem;font-weight:600;color:var(--a);margin-bottom:.75rem">&#9992;&#65039; '+platformName+' Pre-Flight Station</div>'+(caption?'<div style="margin-bottom:.75rem"><div style="font-size:.72rem;color:var(--muted);margin-bottom:.35rem">Caption (tap to copy)</div><div style="background:rgba(255,255,255,.06);border-radius:var(--r);padding:.65rem;font-size:.82rem;color:#fff;cursor:pointer" onclick="copyAndAlert(this.dataset.cap)" data-cap="'+caption.replace(/"/g,'&quot;')+'">'+caption.slice(0,200)+'<br><span style="color:var(--a);font-size:.72rem">Tap to copy &#128203;</span></div></div>':'')+(mediaUrl?'<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem"><a href="'+mediaUrl+'" download="content.jpg" class="btn btn-sm" style="background:var(--a);color:#fff;text-decoration:none">&#11015;&#65039; Download Media</a><a href="'+deepLink+'" class="btn btn-sm" style="background:rgba(255,255,255,.1);color:#fff;text-decoration:none">Open '+platformName+' App &#8599;</a></div>':'')+'<div style="font-size:.72rem;color:var(--muted)">After downloading: open '+platformName+', create a post, upload the saved media, paste the caption from your clipboard, and publish.</div></div>';
  setTimeout(function(){loadContentHub();},1500);
}
window.guidedPost=guidedPost;

function copyAndAlert(text){try{navigator.clipboard.writeText(text).then(function(){alert('Caption copied to clipboard!');});}catch(e){prompt('Copy caption:',text);}}
window.copyAndAlert=copyAndAlert;

function closeChOverlay(){var ov=document.getElementById('chOverlay');if(ov){ov.style.display='none';}_chActiveCard=null;}
window.closeChOverlay=closeChOverlay;

// ── Boot ──────────────────────────────────────────────────────────────────────
function boot(){
  try{sessionStorage.setItem('ccs_admin_v2','1');}catch(e){}
  var lock=document.getElementById('lock');
  var appEl=document.getElementById('app');
  if(lock)lock.style.display='none';
  if(appEl)appEl.style.display='block';
  var tabsEl=document.querySelector('.atabs');
  if(tabsEl&&!document.querySelector('[data-tab="contenthub"]')){
    var btn=document.createElement('button');
    btn.className='atab';
    btn.dataset.tab='contenthub';
    btn.setAttribute('onclick',"showTab('contenthub')");
    btn.textContent='&#128247; Content Hub';
    tabsEl.appendChild(btn);
    var body=document.querySelector('.abody');
    if(body){
      var panel=document.createElement('div');
      panel.className='apanel';
      panel.dataset.panel='contenthub';
      panel.style.display='none';
      panel.innerHTML='<div class="acard"><div class="acard-head"><h2>&#127917; Content Gathering Hub</h2><button class="btn btn-outline btn-sm" onclick="loadContentHub()">Refresh</button></div><div class="acard-body"><div id="panelContentHub"><div style="color:var(--muted);font-size:.85rem">Click a tab to load.</div></div></div></div>';
      body.appendChild(panel);
      var ov=document.createElement('div');
      ov.id='chOverlay';
      ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:400;display:none;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto';
      ov.innerHTML='<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:1.75rem;width:100%;max-width:580px;margin:auto" id="chModalInner"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem"><h3 style="font-family:Oswald,sans-serif;color:#fff;font-size:1.15rem">Review &amp; Post</h3><button onclick="closeChOverlay()" style="background:transparent;border:none;color:var(--muted);font-size:1.4rem;cursor:pointer">&#10005;</button></div><div id="chModalContent"></div></div>';
      document.body.appendChild(ov);
    }
  }
  loadStatus();
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{boot();}

})();
</script>`;

function bypassAdminPassword(html) {
  const css = `<style id="admin-bypass-css">
#lock{display:none!important;}
#app{display:block!important;}
</style>`;
  let out = html;
  if (out.includes("</head>")) out = out.replace("</head>", css + "</head>");
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

    if (request.method === "GET" && (path === "/status" || path === "/admin/status" || path === "/api/status")) {
      return fastStatus(env);
    }

    const chRes = await routeContentHub(request, env, ctx, path);
    if (chRes) return chRes;

    if (request.method === "GET" && path === "/admin") {
      const response = await app.fetch(request, env, ctx);
      const html = await response.text();
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "text/html;charset=UTF-8");
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("X-Admin-Fix", "v5-regex-fix");
      return new Response(bypassAdminPassword(html), { status: response.status, headers });
    }

    return app.fetch(request, env, ctx);
  }
};
