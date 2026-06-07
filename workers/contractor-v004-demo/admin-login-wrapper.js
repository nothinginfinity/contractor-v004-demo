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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const response = await app.fetch(request, env, ctx);
    if (request.method === "GET" && path === "/admin") {
      const html = await response.text();
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "text/html;charset=UTF-8");
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      return new Response(openAdminForTesting(html), { status: response.status, headers });
    }
    return response;
  }
};
