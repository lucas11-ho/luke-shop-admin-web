# Luke Shop Merchant Admin v0.9.1 — Customer Experience Studio Reliability & UI Repair

Date: 2026-08-15
Base: v0.9.0
Required backend: v0.11.1

## Fixed

- Serialized Customer Experience draft saves prevent overlapping PUT requests from racing.
- Autosave pauses after a transport/save failure and exposes a clear Retry save action.
- Publish first requires the latest dirty draft to save successfully.
- Customer Experience request errors identify the failed method/path and point to browser CORS/API connectivity.
- Store Designer uses stable independent scroll areas for Sections, real Customer Web Preview and Inspector.
- Narrow desktop windows use a horizontal studio viewport rather than collapsing the three editing surfaces into an unusable layout.
- Page actions wrap instead of compressing the title/controls.
- Preview zoom choices are expanded.
- Version history is compact by default.
- Ratings is disabled until an actual ratings data/API contract exists.

## Runtime acceptance required

Source verification does not prove production CORS. After Backend v0.11.1 is deployed, test every Store Designer panel with change -> save -> refresh -> preview -> publish -> live Customer Web.
