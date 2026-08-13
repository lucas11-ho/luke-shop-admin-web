# Security — Luke Shop Admin Web

- No direct database access.
- No database credentials or password hashes in the browser.
- Merchant bearer credentials are kept in tab-scoped `sessionStorage`, not `localStorage`.
- Backend v0.7.0 performs all real authorization from live PostgreSQL role assignments.
- The UI does not expose OWNER assignment to non-OWNER users and avoids self-destructive staff controls, but these UI restrictions are not treated as security boundaries.
- Password reset revocation, last-owner protection, system-role protection, tenant isolation, and privilege-escalation prevention are backend responsibilities.
- Production must use HTTPS and restrictive backend CORS origins.
