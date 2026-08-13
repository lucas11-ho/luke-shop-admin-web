# Deployment Checklist — Admin Web v0.2.0

1. Upgrade Luke Shop Backend to v0.6.0 and apply migration 006.
2. Verify Backend `/health/ready` reports `0.6.0-merchant-staff-rbac-management`.
3. Preserve the Admin Web `.env` and `package-lock.json` during upgrade.
4. Run `npm install --no-audit --no-fund` if dependencies are missing.
5. Run `npm run verify`.
6. Run `npm run build` and confirm `dist/` is produced.
7. Run `npm run dev` and log in as a tenant OWNER.
8. Open **Access & roles** and verify Staff, Roles, and Permissions tabs.
9. Create a disposable custom role and staff account; test force logout and password reset.
10. For production, set `VITE_LUKE_SHOP_API_BASE_URL` to the HTTPS backend URL and allow the Admin Web origin in backend CORS.
