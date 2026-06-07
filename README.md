# contractor-v004-demo

Demo contractor website powered by Cloudflare Workers + D1 + Vectorize + R2 + AI.

Part of the **Message OS Cloud Social MVP** ecosystem.

## Stack
- Cloudflare Workers (edge runtime)
- D1 (SQLite database)
- Vectorize (AI vector search)
- R2 (media storage)
- Workers AI (chat + embeddings)

## Shared Demo Databases
This demo reuses the shared demo D1/Vectorize/R2 resources.
For a production client site, provision new resources and update `wrangler.toml`.

## Deploy
```bash
cd workers/contractor-v004-demo
wrangler deploy
```

## Worker URL
After deploy: `https://contractor-v004-demo.<account>.workers.dev`

## Admin
`/admin` — open admin panel (demo mode, no password required)

## Template source
Based on [contractor-v004-template](https://github.com/nothinginfinity/contractor-v004-template)
