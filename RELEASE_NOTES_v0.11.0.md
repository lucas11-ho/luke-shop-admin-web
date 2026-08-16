# Luke Shop luke-shop-admin-web v0.11.0

## Customer Identity, Type-safe Fulfillment & Order Notifications

- Adds tenant customer ID prefix and customer-login provider controls with readiness indicators.
- Customer directory surfaces readable customer code, avatar and phone.
- Orders only expose status transitions returned by Backend for each fulfillment group.
- Adds unread red badge to Orders and notification bell plus user-controlled two-tone new-order sound.
- Notification polling runs every six seconds and never pretends to be WebSocket push.

## Release boundary

- Requires Backend v0.13.0 + migration 014.
- Browser audio requires a prior user interaction before Web Audio can play reliably.
- Runtime browser verification remains required after deployment.
