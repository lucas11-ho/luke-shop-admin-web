# Merchant Admin v0.12.1 — Customer Authentication Pro

Release date: 2026-08-18

- Customer Login settings show Google, Telegram and Phone readiness separately from merchant enablement.
- Telegram readiness now distinguishes modern BotFather Web Login Client ID support.
- Adds Cloudflare Turnstile policy controls for email login, email signup and optional social login.
- Provider secrets remain backend-only and are never rendered in Merchant Admin.
- Forgot Password is intentionally unavailable until a real reset-delivery workflow is implemented.
