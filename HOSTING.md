# Merchant Admin Production Hosting

## Production platform

Merchant Admin is deployed as Cloudflare Workers Static Assets.

- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Output directory: `dist`
- Non-production branch builds: disabled
- Worker preview URLs: disabled by `wrangler.jsonc`

The production build wrapper detects Cloudflare Workers Builds on `main` and refuses to produce a bundle when the API URL is missing, non-HTTPS, or local.

## Required production build variable

Set under Worker > Settings > Build > Variables and secrets:

- `VITE_LUKE_SHOP_API_BASE_URL=https://<production-api-host>`

`VITE_APP_ENV=production` may also be set explicitly; the build wrapper sets it for the production Vite process automatically.

## Backend CORS

Add only the final Merchant Admin HTTPS origin to Backend `CORS_ORIGINS`.

Example shape:

`https://admin.<your-domain>`

Do not use `*`, localhost, HTTP, paths, query strings, or trailing application paths as production CORS entries. Backend startup normalizes valid origins and rejects unsafe production values.

## Local development

Local Admin Web runs on port `4173` and may use `http://localhost:4100` through `.env`/`.env.local`. The production guard is intentionally not applied to ordinary local development builds.
