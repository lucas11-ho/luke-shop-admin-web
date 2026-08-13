# Technical Analysis — Admin Web v0.3.0

v0.3.0 is a frontend-only operations expansion over Backend v0.6.0. It deliberately consumes existing APIs rather than adding speculative client-side data models.

Product and order workspaces fetch authoritative detail on demand instead of trusting list-row snapshots. Sensitive writes remain permission-gated in the UI and independently re-authorized by the backend. Inventory adjustments retain the backend `quantity` delta contract and the inventory ledger remains read-only.

The product media workspace follows the backend privacy split: public media uses a public URL, while private media uses only a storage key. The frontend never converts a private storage key into a customer URL.

The order workspace does not implement refunds because Backend v0.6.0 does not expose a refund write API. Likewise, v0.3.0 does not invent delete/edit endpoints for media or modifier records that the backend does not currently expose.

The settings JSON editors are intentionally functional rather than visual-theme builders. They provide access to backend-supported JSON configuration while leaving the later professional design-system pass independent from runtime contracts.
