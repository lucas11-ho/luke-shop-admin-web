# Test Result — Admin Web v0.8.0

Date: 2026-08-14

## Passed

- Source regressions: **140/140**.
- Design regressions: **11/11**.
- Store Designer v3 regressions: **21/21**.
- Total repository checks: **172/172**.
- JSX/JavaScript syntax included in the coordinated frontend parser sweep.
- CSS parses successfully with PostCSS.

## Build limitation

A fresh `npm install` was attempted in the sandbox but timed out before dependencies were installed. Therefore a real Vite production build was not independently completed here. The release package does not claim otherwise. Run `npm run build` in GitHub Actions/Cloudflare/local Node 24 after dependency installation.
