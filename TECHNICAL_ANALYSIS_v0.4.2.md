# Technical Analysis — v0.4.2

The v0.4.1 Products UI exposed `track_inventory` and `low_stock_threshold`, but quantity changes were only available in the separate Inventory page. The backend already models stock correctly using inventory items, location balances, reservations, and an append-only ledger.

v0.4.2 therefore reuses the existing inventory adjustment contract rather than introducing a direct mutable `stock_quantity` field. Product and variant creation can optionally perform a follow-up RECEIVE movement for opening stock. Existing products expose a quick adjustment form in the Inventory tab.

This keeps checkout reservations, auditability, multi-location inventory, and future warehouse expansion compatible.
