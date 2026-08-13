# Technical Analysis — Admin Web v0.2.0

The Access workspace is a thin client over Backend v0.6.0. It does not calculate authorization locally beyond presentation. Every sensitive write is re-authorized by the backend using permissions loaded from PostgreSQL for the current merchant session.

The UI intentionally prevents obvious lockout paths (self suspend/disable, self role replacement) and does not offer OWNER role assignment to non-OWNER users. These are convenience controls only; the backend independently enforces the same rules.

Password reset accepts a new password but never reads or displays a stored password/hash. Session lists expose only public session references plus browser/IP/timestamps returned by the backend.
