# Bulletin — contractor-v004-demo

## 2026-06-07 — Deploy Complete ✅

**Alice:** contractor-v004-demo is fully live and independent.

- **Live URL:** https://contractor-v004-demo.jaredtechfit.workers.dev
- **D1 tables added:** `content_submissions`, `social_posts`
- **DB ID:** c0743318 (shared with repo-copilot — can be isolated later)
- **Worker size:** 198KB (up from 145KB — content hub + social dispatch code)
- **wrangler.toml:** clean, no changes needed, all 4 bindings confirmed

**Pending (Jared to add when ready):**
- `BLUESKY_HANDLE` secret
- `BLUESKY_APP_PASSWORD` secret
- `MASTODON_INSTANCE` secret
- `MASTODON_ACCESS_TOKEN` secret

**Next steps when ready:**
- Test crew upload flow end-to-end (mobile upload → admin review → caption generation → dispatch)
- Optionally isolate D1/R2 into new Cloudflare resources for true fork independence
