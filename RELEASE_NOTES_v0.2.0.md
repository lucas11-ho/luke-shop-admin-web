# Release Notes — Luke Shop Admin Web v0.2.0

## Merchant Staff & RBAC Workspace

- Replaces the v0.1.0 Access placeholder with live Backend v0.6.0 integration.
- Create merchant staff with initial password and one or more roles.
- View status, role membership, last login, and active-session count.
- Edit display name and lifecycle state (`ACTIVE`, `SUSPENDED`, `DISABLED`).
- Reset staff password; backend revokes active sessions atomically.
- Force logout all sessions or revoke an individual session.
- Create/edit/delete custom roles and replace their permission set.
- Assign roles to staff with OWNER-aware UI restrictions.
- Permission-aware controls mirror backend least-privilege policies.
- System OWNER role is displayed as protected.

Backend v0.6.0 is required for these new controls.
