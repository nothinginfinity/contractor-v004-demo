// ============================================================
// Content Gathering Hub — content-hub.js
// Handles:
//   GET  /crew/upload           — mobile crew upload page (tokenized)
//   POST /crew/upload           — submit media + note → content_submissions
//   GET  /api/admin/content-submissions          — list pending/all
//   POST /api/admin/content-submissions/:id/generate-captions  — AI captions
//   POST /api/admin/content-submissions/:id/approve            — approve + pick caption + platforms
//   POST /api/admin/content-submissions/:id/reject             — reject
//   POST /api/admin/content-submissions/:id/post               — dispatch to Bluesky/Mastodon or log guided
//   GET  /api/admin/social-posts                               — post history
// ============================================================

const CHAT_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const R2_PREFIX  = 'contractor-v003-2/';

function j(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
function h(html) {
  return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}
function now() { return new Date().toISOString(); }
function uid() { return 'ch-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,6); }
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── DB helpers ────────────────────────────────────────────────────────────────
async function dbRun(env, sql, p=[]) {
  return env.V003_2_DB.prepare(sql).bind(...p).run();
}
async function dbAll(env, sql, p=[]) {
  const r = await env.V003_2_DB.prepare(sql).bind(...p).all();
  return r.results || [];
}
async function dbFirst(env, sql, p=[]) {
  return env.V003_2_DB.prepare(sql).bind(...p).first();
}

// ── Token validation — reuse existing crew_members table ──────────────────────
async function getMemberByToken(env, token) {
  // Try crew_members table (existing system)
  try {
    const m = await dbFirst(env,
      "SELECT * FROM crew_members WHERE portal_token=? AND active=1",
      [token]
    );
    if (m) return m;
  } catch(e) {}
  // Fallback: try members table variant
  try {
    const m = await dbFirst(env,
      "SELECT * FROM members WHERE portal_token=? AND active=1",
      [token]
    );
    if (m) return m;
  } catch(e) {}
  return null;
}

// ── Crew Upload Page ──────────────────────────────────────────────────────────
function renderCrewUploadPage(member, token, submitted = false, error = '') {
  const name = esc(member ? member.name : 'Team Member');
  const CSS = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--p:#1a2744;--a:#c8a84b;--bg:#0f1a2e;--card:#1a2744;--border:#2a3a5c;--text:#e8eaf0;--muted:#8899aa;--r:12px}
    body{font-family:system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);min-height:100dvh;display:flex;flex-direction:column;align-items:center;padding:1.5rem 1rem;}
    .card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:1.75rem;width:100%;max-width:480px;}
    .logo{font-size:1.4rem;font-weight:700;letter-spacing:.06em;color:#fff;margin-bottom:.25rem;}
    .logo span{color:var(--a);}
    .greeting{font-size:.9rem;color:var(--muted);margin-bottom:1.75rem;}
    label{display:block;font-size:.78rem;color:var(--muted);margin-bottom:.35rem;font-weight:500;letter-spacing:.04em;text-transform:uppercase;}
    textarea{width:100%;background:rgba(255,255,255,.06);border:1.5px solid var(--border);border-radius:var(--r);padding:.85rem 1rem;font-size:1rem;color:#fff;outline:none;resize:none;min-height:90px;font-family:inherit;margin-bottom:1.25rem;}
    textarea:focus{border-color:var(--a);}
    textarea::placeholder{color:rgba(255,255,255,.25);}
    .upload-zone{border:2px dashed var(--border);border-radius:var(--r);padding:2rem 1rem;text-align:center;cursor:pointer;background:rgba(255,255,255,.03);margin-bottom:1.25rem;transition:border-color .15s;}
    .upload-zone.has-file{border-color:var(--a);background:rgba(200,168,75,.08);}
    .upload-zone input{display:none;}
    .upload-icon{font-size:2.5rem;margin-bottom:.5rem;}
    .upload-label{font-size:.9rem;color:var(--muted);}
    .upload-label strong{color:#fff;}
    .preview{max-width:100%;max-height:200px;border-radius:8px;margin-top:.75rem;display:none;}
    .btn{width:100%;background:var(--a);color:#fff;border:none;border-radius:var(--r);padding:1rem;font-size:1rem;font-weight:700;cursor:pointer;letter-spacing:.04em;transition:opacity .15s;}
    .btn:hover{opacity:.88;}
    .btn:disabled{opacity:.45;cursor:not-allowed;}
    .success{background:rgba(34,197,94,.12);border:1px solid #22c55e;border-radius:var(--r);padding:1.5rem;text-align:center;}
    .success h2{color:#22c55e;margin-bottom:.5rem;font-size:1.2rem;}
    .success p{color:var(--muted);font-size:.88rem;}
    .error{background:rgba(239,68,68,.1);border:1px solid #ef4444;border-radius:var(--r);padding:.75rem 1rem;color:#f87171;font-size:.85rem;margin-bottom:1rem;}
    .prog{font-size:.82rem;color:var(--a);text-align:center;margin-top:.75rem;display:none;}
    @media(max-width:400px){.card{padding:1.25rem;}}
  `;

  if (submitted) {
    return h(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover"><title>Submitted!</title><style>${CSS}</style></head><body><div class="card"><div class="logo">CCS<span>.</span></div><div class="greeting">Content Hub</div><div class="success"><h2>&#10003; Submitted!</h2><p>Your content is in the review queue. The admin will be notified.</p></div><br><button class="btn" onclick="location.reload()">Submit Another</button></div></body></html>`);
  }

  return h(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover"><title>Content Upload</title><style>${CSS}</style></head><body>
<div class="card">
  <div class="logo">CCS<span>.</span></div>
  <div class="greeting">Hey ${name} &mdash; share a moment from today &#128247;</div>
  ${error ? `<div class="error">${esc(error)}</div>` : ''}
  <form id="uploadForm">
    <label>Photo or Video</label>
    <div class="upload-zone" id="uploadZone" onclick="document.getElementById('mediaFile').click()">
      <div class="upload-icon" id="uploadIcon">&#128247;</div>
      <div class="upload-label" id="uploadLbl"><strong>Tap to choose</strong> a photo or video</div>
      <img class="preview" id="imgPreview" alt="preview"/>
      <input type="file" id="mediaFile" accept="image/*,video/*" capture="environment" onchange="handleFileSelect(this)"/>
    </div>
    <label>Quick note <span style="font-weight:400;color:rgba(255,255,255,.35)">(optional — what's happening?)</span></label>
    <textarea id="rawNote" placeholder="e.g. Finished the kitchen cabinets today — looking great!" maxlength="500"></textarea>
    <button class="btn" id="submitBtn" type="button" onclick="submitContent()">Submit Content</button>
    <div class="prog" id="prog">Uploading... please wait</div>
  </form>
</div>
<script>
function handleFileSelect(input){
  var zone=document.getElementById('uploadZone');
  var lbl=document.getElementById('uploadLbl');
  var prev=document.getElementById('imgPreview');
  var icon=document.getElementById('uploadIcon');
  if(!input.files||!input.files[0])return;
  var f=input.files[0];
  zone.classList.add('has-file');
  lbl.innerHTML='<strong>'+f.name+'</strong> ('+Math.round(f.size/1024)+'KB)';
  if(f.type.startsWith('image/')){
    icon.style.display='none';
    var reader=new FileReader();
    reader.onload=function(e){prev.src=e.target.result;prev.style.display='block';};
    reader.readAsDataURL(f);
  }
}
async function submitContent(){
  var file=document.getElementById('mediaFile').files[0];
  var note=document.getElementById('rawNote').value.trim();
  var btn=document.getElementById('submitBtn');
  var prog=document.getElementById('prog');
  if(!file&&!note){alert('Please add a photo/video or a note.');return;}
  btn.disabled=true;
  prog.style.display='block';
  var fd=new FormData();
  if(file)fd.append('file',file);
  fd.append('note',note);
  fd.append('token','${esc(token)}');
  try{
    var r=await fetch('/crew/upload',{method:'POST',body:fd});
    var d=await r.json();
    if(d.ok){window.location.href='/crew/upload?token=${esc(token)}&submitted=1';}
    else{prog.style.display='none';btn.disabled=false;alert(d.error||'Upload failed, try again.');}
  }catch(e){prog.style.display='none';btn.disabled=false;alert('Network error: '+e.message);}
}
</script>
</body></html>`);
}

// ── AI Caption Generation ─────────────────────────────────────────────────────
async function generateCaptions(env, rawNote, companyName) {
  const co = companyName || 'CCS Services Group';
  try {
    const r = await env.AI.run(CHAT_MODEL, {
      messages: [{
        role: 'user',
        content: `You are a social media writer for ${co}, a licensed contractor business. Write exactly 3 short social media captions (max 240 chars each) based on this note from a team member: "${rawNote}". Return ONLY a JSON array of 3 strings, no other text. Vary tone: [0] professional, [1] friendly/warm, [2] casual/fun. Include 2-3 relevant hashtags in each.`
      }],
      max_tokens: 500
    });
    const text = r.response || r.choices?.[0]?.message?.content || '';
    // Extract JSON array robustly
    const match = text.match(/\[.*\]/s);
    if (match) {
      const arr = JSON.parse(match[0]);
      if (Array.isArray(arr) && arr.length >= 1) return arr.slice(0,3);
    }
    // Fallback: return raw text as single caption
    return [text.trim().slice(0,240)];
  } catch(e) {
    return [
      `${rawNote ? rawNote.slice(0,200) : 'Great work today!'} #contractor #construction`,
      `Team in action! ${rawNote ? rawNote.slice(0,180) : ''} #licensed #buildbetter`,
      `Another great day on the job. ${rawNote ? rawNote.slice(0,160) : ''} #craftsmanship`
    ];
  }
}

// ── Bluesky Direct Post ───────────────────────────────────────────────────────
async function postToBluesky(env, caption, r2Key) {
  const handle   = env.BLUESKY_HANDLE;
  const password = env.BLUESKY_APP_PASSWORD;
  if (!handle || !password) throw new Error('Bluesky credentials not configured (add BLUESKY_HANDLE + BLUESKY_APP_PASSWORD secrets)');

  // 1. Get auth token
  const authRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: handle, password })
  });
  if (!authRes.ok) throw new Error('Bluesky auth failed: ' + await authRes.text());
  const { accessJwt, did } = await authRes.json();

  let embed = undefined;
  // 2. Optionally upload image blob
  if (r2Key) {
    try {
      const obj = await env.V003_2_R2.get(r2Key);
      if (obj && obj.httpMetadata?.contentType?.startsWith('image/')) {
        const buf = await obj.arrayBuffer();
        const blobRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + accessJwt, 'Content-Type': obj.httpMetadata.contentType },
          body: buf
        });
        if (blobRes.ok) {
          const blobData = await blobRes.json();
          embed = { $type: 'app.bsky.embed.images', images: [{ image: blobData.blob, alt: caption.slice(0,100) }] };
        }
      }
    } catch(e) { /* image upload optional */ }
  }

  // 3. Create post
  const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + accessJwt, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repo: did,
      collection: 'app.bsky.feed.post',
      record: {
        $type: 'app.bsky.feed.post',
        text: caption.slice(0,300),
        createdAt: now(),
        ...(embed ? { embed } : {})
      }
    })
  });
  if (!postRes.ok) throw new Error('Bluesky post failed: ' + await postRes.text());
  const postData = await postRes.json();
  const rkey = postData.uri?.split('/').pop() || '';
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

// ── Mastodon Direct Post ──────────────────────────────────────────────────────
async function postToMastodon(env, caption, r2Key) {
  const instance    = env.MASTODON_INSTANCE;    // e.g. 'mastodon.social'
  const accessToken = env.MASTODON_ACCESS_TOKEN;
  if (!instance || !accessToken) throw new Error('Mastodon credentials not configured (add MASTODON_INSTANCE + MASTODON_ACCESS_TOKEN secrets)');

  let media_ids = [];
  if (r2Key) {
    try {
      const obj = await env.V003_2_R2.get(r2Key);
      if (obj && obj.httpMetadata?.contentType?.startsWith('image/')) {
        const buf = await obj.arrayBuffer();
        const fd = new FormData();
        fd.append('file', new Blob([buf], { type: obj.httpMetadata.contentType }), 'media.jpg');
        const mRes = await fetch(`https://${instance}/api/v1/media`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + accessToken },
          body: fd
        });
        if (mRes.ok) { const mData = await mRes.json(); media_ids = [mData.id]; }
      }
    } catch(e) { /* optional */ }
  }

  const statusRes = await fetch(`https://${instance}/api/v1/statuses`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: caption.slice(0,500), ...(media_ids.length ? { media_ids } : {}) })
  });
  if (!statusRes.ok) throw new Error('Mastodon post failed: ' + await statusRes.text());
  const statusData = await statusRes.json();
  return statusData.url || `https://${instance}`;
}

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function handleContentHub(req, env) {
  const url  = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = req.method;

  // ── GET /crew/upload ──────────────────────────────────────────────────────
  if (method === 'GET' && path === '/crew/upload') {
    const token = url.searchParams.get('token') || '';
    const submitted = url.searchParams.get('submitted') === '1';
    if (!token) return h(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Access Denied</title></head><body style="font-family:system-ui;background:#0f1a2e;color:#e8eaf0;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:2rem"><div><h1 style="color:#ef4444;font-size:1.5rem;margin-bottom:.75rem">&#128274; Invalid Link</h1><p style="color:#8899aa">This upload link is invalid or has expired.<br>Ask your manager for a new link.</p></div></body></html>`);
    const member = await getMemberByToken(env, token);
    if (!member) return h(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Access Denied</title></head><body style="font-family:system-ui;background:#0f1a2e;color:#e8eaf0;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:2rem"><div><h1 style="color:#ef4444;font-size:1.5rem;margin-bottom:.75rem">&#128274; Invalid Link</h1><p style="color:#8899aa">This upload link is invalid or has expired.<br>Ask your manager for a new link.</p></div></body></html>`);
    return renderCrewUploadPage(member, token, submitted);
  }

  // ── POST /crew/upload ─────────────────────────────────────────────────────
  if (method === 'POST' && path === '/crew/upload') {
    try {
      const fd    = await req.formData();
      const token = fd.get('token') || '';
      const note  = (fd.get('note') || '').trim().slice(0, 1000);
      const file  = fd.get('file');
      const member = await getMemberByToken(env, token);
      if (!member) return j({ ok: false, error: 'Invalid token' }, 403);

      let r2Key = null;
      let contentType = null;

      if (file && file.size > 0) {
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const allowed = ['jpg','jpeg','png','gif','webp','mp4','mov','heic','m4v'];
        if (!allowed.includes(ext)) return j({ ok: false, error: 'File type not allowed' }, 400);
        if (file.size > 50 * 1024 * 1024) return j({ ok: false, error: 'File too large (50MB max)' }, 400);
        const key = R2_PREFIX + 'content-hub/' + Date.now() + '-' + uid() + '.' + ext;
        const buf = await file.arrayBuffer();
        await env.V003_2_R2.put(key, buf, { httpMetadata: { contentType: file.type } });
        r2Key = key;
        contentType = file.type;
      }

      if (!r2Key && !note) return j({ ok: false, error: 'Please add a photo/video or a note' }, 400);

      await dbRun(env,
        `INSERT INTO content_submissions (submitted_by, raw_note, r2_key, content_type, status, created_at) VALUES (?,?,?,?,?,?)`,
        [member.name || member.id, note, r2Key, contentType, 'pending', now()]
      );
      return j({ ok: true, message: 'Submitted! Your content is in the review queue.' });
    } catch(e) {
      return j({ ok: false, error: e.message }, 500);
    }
  }

  // ── GET /api/admin/content-submissions ───────────────────────────────────
  if (method === 'GET' && path === '/api/admin/content-submissions') {
    const status = url.searchParams.get('status') || 'pending';
    const sql = status === 'all'
      ? 'SELECT * FROM content_submissions ORDER BY id DESC LIMIT 200'
      : 'SELECT * FROM content_submissions WHERE status=? ORDER BY id DESC LIMIT 200';
    const params = status === 'all' ? [] : [status];
    const rows = await dbAll(env, sql, params);
    return j({ ok: true, submissions: rows });
  }

  // ── POST /api/admin/content-submissions/:id/generate-captions ────────────
  const genMatch = path.match(/^\/api\/admin\/content-submissions\/(\d+)\/generate-captions$/);
  if (method === 'POST' && genMatch) {
    const id = genMatch[1];
    const row = await dbFirst(env, 'SELECT * FROM content_submissions WHERE id=?', [id]);
    if (!row) return j({ ok: false, error: 'Not found' }, 404);
    // Get company name
    let coName = 'CCS Services Group';
    try { const ct = await dbFirst(env, "SELECT data FROM site_content WHERE section='contact'"); if (ct) coName = JSON.parse(ct.data).company || coName; } catch(e) {}
    const note = row.raw_note || 'Great work by our team today';
    const captions = await generateCaptions(env, note, coName);
    await dbRun(env, 'UPDATE content_submissions SET ai_captions=? WHERE id=?', [JSON.stringify(captions), id]);
    return j({ ok: true, captions });
  }

  // ── POST /api/admin/content-submissions/:id/approve ───────────────────────
  const approveMatch = path.match(/^\/api\/admin\/content-submissions\/(\d+)\/approve$/);
  if (method === 'POST' && approveMatch) {
    const id = approveMatch[1];
    let b = {};
    try { b = await req.json(); } catch(e) {}
    const caption   = b.caption || '';
    const platforms = b.platforms || [];
    await dbRun(env,
      'UPDATE content_submissions SET status=?, selected_caption=?, target_platforms=?, reviewed_at=? WHERE id=?',
      ['approved', caption, JSON.stringify(platforms), now(), id]
    );
    return j({ ok: true, id, status: 'approved' });
  }

  // ── POST /api/admin/content-submissions/:id/reject ────────────────────────
  const rejectMatch = path.match(/^\/api\/admin\/content-submissions\/(\d+)\/reject$/);
  if (method === 'POST' && rejectMatch) {
    const id = rejectMatch[1];
    await dbRun(env, 'UPDATE content_submissions SET status=?, reviewed_at=? WHERE id=?', ['rejected', now(), id]);
    return j({ ok: true, id, status: 'rejected' });
  }

  // ── POST /api/admin/content-submissions/:id/post ──────────────────────────
  const postMatch = path.match(/^\/api\/admin\/content-submissions\/(\d+)\/post$/);
  if (method === 'POST' && postMatch) {
    const id = postMatch[1];
    let b = {};
    try { b = await req.json(); } catch(e) {}
    const platform  = b.platform || '';
    const caption   = b.caption || '';
    const row = await dbFirst(env, 'SELECT * FROM content_submissions WHERE id=?', [id]);
    if (!row) return j({ ok: false, error: 'Not found' }, 404);

    let postUrl = null;
    let status  = 'failed';
    let errorMsg = null;

    if (platform === 'bluesky') {
      try {
        postUrl = await postToBluesky(env, caption, row.r2_key);
        status = 'posted';
      } catch(e) { errorMsg = e.message; }
    } else if (platform === 'mastodon') {
      try {
        postUrl = await postToMastodon(env, caption, row.r2_key);
        status = 'posted';
      } catch(e) { errorMsg = e.message; }
    } else if (['instagram_guided','tiktok_guided','youtube_guided'].includes(platform)) {
      // Guided = we just log the dispatch, no API call
      status = 'guided_dispatched';
    } else {
      return j({ ok: false, error: 'Unknown platform: ' + platform }, 400);
    }

    await dbRun(env,
      'INSERT INTO social_posts (submission_id, platform, status, post_url, caption_used, error_message, posted_at) VALUES (?,?,?,?,?,?,?)',
      [id, platform, status, postUrl, caption, errorMsg, now()]
    );

    if (status === 'posted') {
      await dbRun(env, 'UPDATE content_submissions SET status=? WHERE id=?', ['posted', id]);
    }

    return j({ ok: status !== 'failed', status, post_url: postUrl, error: errorMsg, platform });
  }

  // ── GET /api/admin/social-posts ───────────────────────────────────────────
  if (method === 'GET' && path === '/api/admin/social-posts') {
    const rows = await dbAll(env, 'SELECT * FROM social_posts ORDER BY id DESC LIMIT 200');
    return j({ ok: true, posts: rows });
  }

  return null; // not handled by this module
}
