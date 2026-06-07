import app from "./contractor-v004-demo.js";

export default {
  async fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  }
};
