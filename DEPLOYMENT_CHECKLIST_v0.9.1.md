# Deployment Checklist — Merchant Admin v0.9.1

1. Deploy Backend v0.11.1 first.
2. Confirm the production OPTIONS preflight for Customer Experience draft PUT allows PUT/PATCH/DELETE.
3. Deploy Customer Web v0.6.1 so the real preview renderer matches the repaired controls.
4. Deploy Merchant Admin v0.9.1.
5. Verify Store Identity: change display name -> preview -> wait for Saved -> refresh -> value remains -> publish -> live storefront changes.
6. Repeat for Template, Theme, Typography, Layout, Home Sections, Navigation, Features and Search & Sharing.
7. Test the editor at a narrower desktop viewport and confirm Sections, Preview and Inspector remain independently scrollable.
8. If a media URL returns 404, re-upload/reselect the asset after production R2 storage is configured.
