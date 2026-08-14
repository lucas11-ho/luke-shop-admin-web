# API Integration — Merchant Admin v0.9.0

Required backend: Luke Shop Backend v0.11.0.

Merchant Admin uses `/v1/merchant/*` only and sends the authenticated tenant slug plus selected store context where applicable. Backend permissions remain authoritative.

## Control surfaces

- Stores: list/create/update and Store Designer context selection.
- Products/categories/variants/media/modifiers: complete supported create/edit/deactivate controls.
- Inventory: current levels, ledger, audited adjustments, location create/edit/default/status.
- Orders: detail, controlled state transitions, payment confirm/fail, fulfillment updates.
- Payments: activity, customer-safe payment-method configuration, internal audited refund workflow.
- Delivery: method create/edit plus customer-safe provider configuration.
- Promotions: programs, codes, targets, scheduling and removal/deactivation controls.
- Customers: lifecycle status, saved-address visibility, status history, recent orders, active sessions.
- Luke CS & AI: policy, credential creation and credential revocation.
- Staff & access: staff, roles, permissions, password reset, session revocation.
- Merchant self-security: profile, password and session management.
- Audit: tenant-scoped operational/security events.
- Customer Experience: Store Designer v3, signed Customer Web preview, templates/fonts/media, draft/publish/rollback.

## Important boundaries

`public_config` is customer-safe configuration only. The UI explicitly warns against placing provider/API secrets there.

The refund control creates and advances Luke refund records; it does not call a payment-provider refund endpoint. Provider references/results are recorded after the external/provider operation.

No route is fabricated merely to create a button. Unsupported service/internal APIs remain absent from Merchant Admin.

No direct database access is permitted from Merchant Admin.

No unsupported delete or mutation route is invented by the frontend; controls are limited to backend-supported operations.
