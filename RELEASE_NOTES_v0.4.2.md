# Luke Shop Admin Web v0.4.2 — Inline Stock & Inventory Workflow

## Summary
Adds stock quantity controls directly to the Products workspace while preserving the existing append-only inventory ledger as the source of truth. Backend v0.7.1 remains unchanged and no database migration is required.

## Added
- Opening stock quantity during base product creation.
- Opening stock quantity during tracked variant/SKU creation.
- Low-stock threshold in the create-product flow.
- Current on-hand, reserved, and available totals in Product Overview.
- Quick Stock Adjustment inside each product's Inventory tab.
- Permission-aware stock writes using `inventory.write`.
- RECEIVE/RETURN/ADJUSTMENT/DAMAGE movements through the existing inventory API.

## Safety
- Stock is not stored as an editable product counter.
- Every quantity change continues to use `POST /v1/merchant/inventory/adjustments`.
- Backend prevents negative on-hand and reducing on-hand below reserved stock.
- Existing Inventory workspace and ledger remain unchanged.
- No backend or database migration.
