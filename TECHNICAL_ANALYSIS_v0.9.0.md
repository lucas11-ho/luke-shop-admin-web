# Technical Analysis — Merchant Admin v0.9.0

The control-surface audit compared normal `/v1/merchant/*` backend routes against frontend references and found several route families with no usable control or only partial fields. v0.9.0 adds dedicated workspaces/forms instead of exposing raw JSON/database concepts.

The store workspace resolves the merchant's actual stores and uses the canonical Customer Experience catalog when creating a store. Merchant self-security is separate from staff management so an owner/staff member can manage their own identity and sessions without an administrator impersonation flow.

Payment and delivery `public_config` remain JSON objects because providers vary, but the UI labels them customer-safe and explicitly forbids secrets. Refund actions no longer use browser prompt dialogs; they use explicit modal fields and explain the provider boundary.
