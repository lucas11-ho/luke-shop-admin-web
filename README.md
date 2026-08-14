# LUKE_SHOP_ADMIN_WEB — current release v0.9.0

**Merchant Operations & Control Completion** · 2026-08-14

Requires Luke Shop Backend v0.11.0 with migration 012 for the new operations/control features.

See `RELEASE_NOTES_v0.9.0.md`, `TECHNICAL_ANALYSIS_v0.9.0.md` and `DEPLOYMENT_CHECKLIST_v0.9.0.md`.

## What merchants can control now

Merchant Admin now exposes the backend operations that previously existed only partially or not at all in the UI: stores, categories, modifier groups/options, inventory locations, payment method public configuration, audited refund records, delivery public configuration, promotion codes/targets, customer operational detail, Luke CS credential revocation, tenant audit, and the signed-in merchant's own profile/password/sessions.

Store Designer v3 remains intact with real Customer Web preview, responsive device modes, Media Library integration and published/draft controls.

## Security boundaries

- Backend authorization remains the source of truth for every action.
- Public payment/delivery configuration must never contain provider secrets.
- Refund status controls record an external/provider result; they do not execute money movement by themselves.
- No local dev/build workflow is included in this release package.

## Verification

The shipped `npm run verify` command performs source/regression checks only and does not start a development server or create a production build.
