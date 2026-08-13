# Hosting — Luke Shop Admin Web v0.4.0

## Local
Admin Web runs on port `4173` and expects Luke Shop Backend v0.7.0+ at the URL configured by `VITE_LUKE_SHOP_API_BASE_URL`.

The backend must allow the Admin Web origin in `CORS_ORIGINS`, for example `http://localhost:4173` in development.

## Cloudflare Pages
- Build command: `npm ci && npm run build` after a lockfile is committed; use `npm install --no-audit --no-fund && npm run build` for the first lockfile generation.
- Output directory: `dist`
- Build variable: `VITE_LUKE_SHOP_API_BASE_URL=https://<shop-api-domain>`
- Hash routing requires no catch-all SPA rewrite.

## Render Static Site
Use the same build command and publish `dist`. Set `VITE_LUKE_SHOP_API_BASE_URL` as a build environment variable.

For either host, use HTTPS and add only the final Admin Web origin(s) to backend CORS.
