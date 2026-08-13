# Deployment Checklist — v0.1.0
1. Backend v0.5.0 is healthy and migrations through 005 are applied.
2. Configure backend CORS to allow the Admin Web origin.
3. Set `VITE_LUKE_SHOP_API_BASE_URL` to the HTTPS backend origin for the build.
4. Run `npm ci` (or `npm install` before a lockfile exists), `npm run verify`, `npm run build`.
5. Deploy `dist/` to Cloudflare Pages or another static host. Hash routing means no SPA rewrite is required for application routes.
6. Verify merchant login, refresh, logout, tenant isolation, permission hiding, and each read/write module used by the tenant.
7. Configure edge HTTPS/HSTS/CSP and do not expose secrets through Vite variables.
