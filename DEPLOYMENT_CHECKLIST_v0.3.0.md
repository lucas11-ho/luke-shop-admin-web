# Deployment Checklist — Admin Web v0.3.0

1. Confirm Luke Shop Backend v0.6.0 is healthy and all migrations through 006 are already applied.
2. Stop the Admin Web dev server.
3. Run the v0.3.0 Windows upgrade installer; preserve `.env` and `package-lock.json`.
4. Run `npm install --no-audit --no-fund` if dependencies are missing.
5. Run `npm run verify`.
6. Run `npm run build` and confirm `dist/` is produced.
7. Run `npm run dev` and log in as a tenant OWNER.
8. Open Products and validate detail, variant, media, modifier, and inventory tabs.
9. Open Inventory and validate balances, ledger, and locations.
10. Open an Order and validate items, payment, delivery, and history tabs.
11. Validate payment-method and delivery-method edit flows with disposable development records.
12. Validate a disposable promotion with a coupon code and ORDER/PRODUCT/CATEGORY target as appropriate.
13. Confirm Staff/RBAC and Luke CS/AI pages still load.
14. For production, set the HTTPS API base URL and update backend CORS for the deployed Admin origin.
