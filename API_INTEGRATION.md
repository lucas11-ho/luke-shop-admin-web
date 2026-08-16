# API Integration — Merchant Admin v0.10.0

Required backend: Luke Shop Backend v0.12.0 with migration 013.

Merchant Admin uses `/v1/merchant/*` and authenticated tenant/store context. Backend permissions remain authoritative.

## Delivery operations

Order detail consumes the backend shipping-address snapshot and may display:
- customer-confirmed latitude/longitude
- GPS accuracy
- location update time
- active customer live point / last ping

Merchant Admin does not collect customer GPS itself.

Fulfillment updates use the existing merchant fulfillment PATCH contract and now support separate `estimated_ready_at` and `estimated_delivery_at` values.

## Customer Experience status visuals

Customer Experience catalog supplies platform-approved status visual packs. Merchant draft configuration stores `status_visual_pack` as `AUTO` or an explicit canonical pack. `AUTO` inherits the effective template/theme default.

The selection changes Customer Web presentation only. It does not mutate order or fulfillment state-machine values.

## Existing control surfaces carried forward

Stores, products/categories/variants/media/modifiers, inventory, orders, payments/refunds, delivery, promotions, customers, Luke CS & AI, Staff/RBAC, merchant profile/security/audit, and Store Designer v3 remain integrated.

No direct database access is permitted from Merchant Admin. No unsupported service/internal mutation routes are invented by the frontend.

No unsupported delete or mutation route is invented merely to create a UI control; frontend operations remain limited to backend-supported contracts.

## v0.11.0 identity, fulfillment and notifications

- Tenant identity settings use `GET /v1/merchant/customer-auth/options` and `PATCH /v1/merchant/tenant/settings`.
- Customer directory consumes `customer_code`, phone and avatar fields.
- Order fulfillment controls consume server-provided `fulfillment_type`, `workflow`, grouped `items` and `allowed_transitions`; the UI does not manufacture a generic status list.
- Notification bell/order badges poll `GET /v1/merchant/notifications` and mark notifications read through the dedicated notification routes.
