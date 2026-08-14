# Deployment Checklist — Admin Web v0.8.0

- [ ] Deploy Backend v0.10.0 and apply migration 011 first.
- [ ] Deploy Customer Web v0.5.0 before enabling the real iframe preview in production.
- [ ] Set `VITE_LUKE_SHOP_API_BASE_URL` to the production backend.
- [ ] Set `VITE_LUKE_SHOP_CUSTOMER_WEB_BASE_URL` to the production Customer Web origin.
- [ ] Ensure the Admin Web origin is included in backend CORS.
- [ ] Run `npm run verify` and a production Vite build in CI/local environment with dependencies installed.
- [ ] Log in as a tenant owner and verify the store selector.
- [ ] Verify Desktop/Tablet/Mobile/Side-by-side preview.
- [ ] Change Customer Display Name, font, theme, hero layout, and responsive columns; confirm immediate preview changes.
- [ ] Confirm autosave, Undo/Redo, Publish, and rollback.
- [ ] Confirm GitHub/Cloudflare deployment uses the intended v0.8.0 commit.
