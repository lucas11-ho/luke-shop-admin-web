# Deployment Checklist v0.5.0

1. Upgrade Backend to v0.8.0 and apply migration 009 first.
2. Preserve `.env` and `package-lock.json`.
3. Run `npm install --no-audit --no-fund`.
4. Run `npm run verify`.
5. Run `npm run build`.
6. Test Media Library and Product Media upload/attach flows.
