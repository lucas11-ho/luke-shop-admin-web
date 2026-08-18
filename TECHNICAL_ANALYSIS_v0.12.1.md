# Technical Analysis — Merchant Admin v0.12.1

The merchant controls policy, not credentials. Backend readiness is authoritative. Merchant Admin may enable a provider only when Backend reports it production-ready, preserving the existing anti-lockout rule. Turnstile policy is stored in tenant identity `auth_config` and does not expose Siteverify secrets.
