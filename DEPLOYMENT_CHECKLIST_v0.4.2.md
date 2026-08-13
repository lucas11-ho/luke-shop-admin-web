# Deployment Checklist — Admin Web v0.4.2

1. Backend must remain v0.7.1 and `/health/ready` must return ready.
2. Install the v0.4.2 upgrade into `LUKE_SHOP_ADMIN_WEB`.
3. Preserve `.env` and existing `package-lock.json`.
4. Run `npm install --no-audit --no-fund`.
5. Run `npm run verify`. Expected: `116/116 Luke Shop Admin Web v0.4.2 source regression checks passed`.
6. Run `npm run build`.
7. Run `npm run dev` and open `http://localhost:4173`.
8. Test base product opening stock.
9. Test tracked variant opening stock.
10. Test positive RECEIVE and negative ADJUSTMENT/DAMAGE behavior.
11. Confirm reserved stock cannot be reduced below reservation.

No backend migration is required.
