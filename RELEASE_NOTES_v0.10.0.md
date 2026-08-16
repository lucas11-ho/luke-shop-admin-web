# Luke Shop Merchant Admin v0.10.0

## Delivery Operations & Status Visual Selection

Base: v0.9.1. Requires Backend v0.12.0 + migration 013.

### Customer Experience
- Merchants can inherit the template's status visual pack with `AUTO` or select an explicit platform-approved pack.
- The catalog comes from Backend; Merchant Admin does not own arbitrary icon uploads.
- Status visuals change presentation only; semantic order/fulfillment states remain unchanged.

### Order operations
- Shipping address detail shows the customer-confirmed precise delivery coordinate, accuracy and last update when available.
- Active customer live location is shown separately with last ping time and accuracy.
- Both precise and live points provide an external map link.
- Fulfillment editor separates Estimated ready and Estimated delivery timestamps.
