# LUKE_SHOP_ADMIN_WEB — current release v0.7.0

**Advanced Store Designer + Promotion/Order Operations** · 2026-08-13

See `RELEASE_NOTES_v0.7.0.md` and `DEPLOYMENT_CHECKLIST_v0.7.0.md`.

# Luke Shop Admin Web v0.6.1

## v0.6.1 Customer Experience Builder Polish

- Safe feature toggles for search, promotions, and support.
- Section image, CTA label/path, and item limit controls already supported by Backend v0.8.0.
- Expandable campaign/home-section editor and richer draft preview.
- Backend v0.8.0 remains unchanged.

Tenant-scoped commerce operations and Customer Experience manager. **Required backend: Luke Shop Backend v0.8.0 or later.**


## v0.6.0 Professional Commerce UI

- Grouped merchant navigation: Operate, Grow, Experience, System.
- Premium commerce operations shell and login experience.
- Unified Luke Professional Design System tokens and responsive behavior.
- Existing v0.5.0 Media Library, stock, Customer Experience, RBAC and commerce workflows are preserved.

## v0.4.1 routing/preview additions
- Displays the tenant's published Customer Web path.
- `Open published` launches the canonical tenant storefront.
- `Preview draft` requests a short-lived signed preview token from Backend and opens `/preview/{token}`.
- Draft/publish/rollback behavior from v0.4.0 is preserved.
- No arbitrary HTML/JavaScript/source editing is exposed to tenant owners.

## Local environment
```env
VITE_LUKE_SHOP_API_BASE_URL=http://localhost:4100
VITE_LUKE_SHOP_CUSTOMER_WEB_BASE_URL=http://localhost:4174
VITE_APP_ENV=development
```

```powershell
npm install --no-audit --no-fund
npm run verify
npm run build
npm run dev
```

Default URL: `http://localhost:4173`. Merchant credentials remain tab-scoped in `sessionStorage`; backend authorization remains authoritative.


## v0.5.0 Inline Stock
Products can now receive opening stock during creation and tracked SKU creation. Existing product inventory can be adjusted from the product workspace. These controls reuse the audited inventory ledger; Backend v0.8.0 is unchanged.


## Media Library
Upload tenant images/videos once and attach them to products from the Product Media workspace.
