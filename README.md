# LUKE_SHOP_ADMIN_WEB — current release v0.11.0

**Customer Identity, Type-safe Fulfillment & Order Notifications** · 2026-08-17

Requires Luke Shop Backend v0.13.0 with migration 014. Delivery/location, status visuals, operations and Store Designer contracts are carried forward.

See `RELEASE_NOTES_v0.11.0.md`, `TECHNICAL_ANALYSIS_v0.11.0.md` and `DEPLOYMENT_CHECKLIST_v0.11.0.md`.



## v0.11.0 release focus

Requires Backend v0.13.0 + migration 014 for customer identity settings, type-safe fulfillment transitions and merchant notification data. New-order sound is browser-controlled and notification delivery is near-real-time polling rather than a fake push channel.

Coordinated versions: Backend v0.13.0, Merchant Admin v0.11.0, Customer Web v0.8.0, Platform Admin v0.6.0.

## v0.10.0 delivery operations

- Customer Experience can inherit or select a platform-approved fulfillment status visual pack.
- Order workspace shows precise customer delivery coordinates and active live customer location with accuracy/update time.
- Fulfillment management separates estimated-ready and estimated-delivery timestamps.

## Customer Experience v0.9.1 repair

- Draft writes are serialized and autosave stops retrying after a transport failure until the merchant explicitly retries.
- Publish refuses to continue if a dirty draft cannot be saved first.
- Browser/network errors now identify the method and API path and explicitly point to CORS/API connectivity.
- The Store Designer has independent scroll areas for Sections, Preview and Inspector, a stable horizontal scroll frame when the available viewport is narrow, and a wrapped action bar instead of compressing controls into unreadable space.
- Preview zoom includes Fit, 50%, 67%, 75%, 90% and 100%.
- History shows recent versions first and moves older versions behind an expandable control.
- Ratings is visibly unavailable instead of exposing a setting that Customer Web cannot implement yet.

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
