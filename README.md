# LUKE_SHOP_ADMIN_WEB — current release v0.12.0

Merchant Admin v0.12.0 adds the merchant-side setup surface for **Luke Commerce Connector v2**. It requires Backend v0.14.0 + migration 015 for the new signed-context metadata. Platform Admin remains v0.6.0.

Merchant workflow:
1. Store Settings → Customer service: configure the HTTPS Luke CS Chat URL and platform route key.
2. Customer Service policy: keep the AI service credential least-privilege/read-only.
3. Create/rotate/revoke service credentials from Merchant Admin; credentials never enter Customer Web.

See `RELEASE_NOTES_v0.12.0.md`, `TECHNICAL_ANALYSIS_v0.12.0.md`, `TEST_RESULT_v0.12.0.md` and `DEPLOYMENT_CHECKLIST_v0.12.0.md`.
