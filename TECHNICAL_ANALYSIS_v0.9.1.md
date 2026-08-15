# Technical Analysis — Merchant Admin v0.9.1

The production console showed repeated PUT /v1/merchant/customer-experience/draft failures. Because Store Identity, Theme, Typography, Layout, Home Sections, Navigation, Features and Search & Sharing all mutate the same draft configuration, one blocked PUT made the full editor appear nonfunctional.

v0.9.1 does not hide that transport failure. It serializes writes, stops automatic retries after failure, exposes retry state and prevents publishing stale/unsaved local state.

The visual editor also previously became overly compressed at narrower desktop widths. The repaired studio keeps three deliberate surfaces and gives Sections, Preview and Inspector their own scroll behavior.
