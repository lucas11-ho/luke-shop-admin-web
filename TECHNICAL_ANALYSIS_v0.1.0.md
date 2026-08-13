# Technical Analysis — v0.1.0
Architecture: React 19 + Vite 7 SPA, hash-based client routing (no server rewrite requirement), native fetch client, no UI framework dependency. The frontend is a separate deployment unit from Luke Shop Backend.

Known backend contract boundary: Backend v0.5.0 has RBAC enforcement but no merchant-user/role CRUD APIs, so Admin Web v0.1.0 displays current roles/permissions and marks staff management as a backend dependency rather than fabricating unsupported writes. The backend also resolves the primary store when `x-store-id` is omitted; Admin Web exposes an optional store context field until a store-list API exists.
