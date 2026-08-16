# Technical Analysis — luke-shop-admin-web v0.11.0

## Architecture

This is an additive coordinated Luke Shop release. Tenant/store isolation, existing auth/session contracts, Experience Engine rendering and Luke CS boundaries are preserved.

## Major implementation

- Adds tenant customer ID prefix and customer-login provider controls with readiness indicators.
- Customer directory surfaces readable customer code, avatar and phone.
- Orders only expose status transitions returned by Backend for each fulfillment group.
- Adds unread red badge to Orders and notification bell plus user-controlled two-tone new-order sound.
- Notification polling runs every six seconds and never pretends to be WebSocket push.

## Safety properties

- Internal UUIDs remain authoritative; readable customer codes are presentation/operations identifiers.
- Provider-dependent features are runtime-gated by Backend readiness.
- Fulfillment state transitions are server-authoritative.
- No fake courier data, fake OTP, Emergent identity provider or direct database access from frontends is introduced.

## Runtime-needed items

- Requires Backend v0.13.0 + migration 014.
- Browser audio requires a prior user interaction before Web Audio can play reliably.
- Runtime browser verification remains required after deployment.
