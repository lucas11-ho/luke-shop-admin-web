# Luke Shop Admin Web v0.4.1 — API Integration

Backend contract: **Luke Shop Backend v0.7.1+**.

Every authenticated request sends the merchant bearer access token plus `x-tenant-slug`; store-aware operations may also send `x-store-id`. No direct database access is used or permitted.

## Advanced commerce endpoints used in v0.4.1

### Catalog
- `GET/PATCH /v1/merchant/products/:productId`
- `POST/PATCH /v1/merchant/products/:productId/variants[...]`
- `POST /v1/merchant/products/:productId/media`
- `POST /v1/merchant/products/:productId/modifier-groups`
- `POST /v1/merchant/products/:productId/modifier-groups/:groupId/options`

### Inventory
- `GET /v1/merchant/inventory`
- `GET /v1/merchant/inventory/ledger`
- `GET/POST /v1/merchant/inventory/locations`
- `POST /v1/merchant/inventory/adjustments`

### Orders / payments / delivery
- `GET /v1/merchant/orders/:orderRef`
- `POST /v1/merchant/orders/:orderRef/transition`
- `GET /v1/merchant/orders/:orderRef/payment`
- `POST /v1/merchant/orders/:orderRef/payment/confirm`
- `POST /v1/merchant/orders/:orderRef/payment/fail`
- `PATCH /v1/merchant/fulfillments/:fulfillmentId`
- `GET/POST/PATCH /v1/merchant/payment-methods[...]`
- `GET/POST/PATCH /v1/merchant/delivery-methods[...]`

### Promotions
- `GET/POST/PATCH /v1/merchant/promotions[...]`
- `POST /v1/merchant/promotions/:promotionId/codes`
- `POST /v1/merchant/promotions/:promotionId/targets`

### Customers / tenant
- `GET /v1/merchant/customers/:customerId`
- `PATCH /v1/merchant/customers/:customerId/status`
- `GET /v1/merchant/tenant`
- `PATCH /v1/merchant/tenant/settings`

Existing v0.2.0 Staff/RBAC and Luke CS/AI endpoints remain integrated.

## Contract discipline

No unsupported delete, refund, product-media mutation, modifier mutation, or other invented endpoint is added by the frontend. When Backend v0.6.0 does not expose an operation, Admin Web v0.4.1 does not fabricate a button for it.


## Customer Experience
- `GET /v1/merchant/customer-experience`
- `PUT /v1/merchant/customer-experience/draft`
- `POST /v1/merchant/customer-experience/publish`
- `POST /v1/merchant/customer-experience/rollback`
- `POST /v1/merchant/customer-experience/preview-token`

Client Admin edits only the bounded server-driven configuration schema; it does not edit customer frontend source.

The preview-token response contains a short-lived `preview_path`. Admin Web never exposes a draft using an unsigned `?draft=true` query.


## Media Library v0.5.0

The Admin sends selected files directly to `POST /v1/merchant/assets/upload` using the file MIME type as `Content-Type`; tenant/store and bearer context come from the authenticated merchant session. Uploaded assets can be reused across product media attachments. Product media ordering/primary/removal uses only backend-supported endpoints.
