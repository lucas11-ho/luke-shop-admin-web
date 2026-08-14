# Deployment Checklist — Merchant Admin v0.9.0

- [ ] Deploy Backend v0.11.0 and migration 012 first.
- [ ] Confirm the production API base URL is correct.
- [ ] Confirm Merchant Admin origin is permitted by backend CORS.
- [ ] Verify Stores, My Profile and Audit navigation appears according to permissions.
- [ ] Verify category/modifier/location/promotion edits are tenant/store scoped.
- [ ] Verify payment/delivery public configuration contains no secrets.
- [ ] Verify refund controls are used only to record the corresponding provider/operator result.
- [ ] Verify Luke CS credential revocation invalidates future credential exchange.
- [ ] Review and push the v0.9.0 Git changes through the existing repository.

No local dev/build workflow is part of this release package.
