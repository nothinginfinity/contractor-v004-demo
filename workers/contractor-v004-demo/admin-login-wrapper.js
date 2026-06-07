import app from "./contractor-v004-demo.js";

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

    if (request.method === "GET" && path === "/admin") {
      const response = await app.fetch(request, env, ctx);
      const html = await response.text();
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "text/html;charset=UTF-8");
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("X-Contractor-Demo-Admin", "password-bypass-v1");
      return new Response(bypassAdminPassword(html), { status: response.status, headers });
    }

    return app.fetch(request, env, ctx);
  }
};
