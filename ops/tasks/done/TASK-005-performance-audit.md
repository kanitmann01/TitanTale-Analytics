# TASK-005: Performance audit
Owner: Performance Agent
Status: done
Created: 2026-03-20
Completed: 2026-03-20
---
- [x] Audit bundle size and remove unused dependencies.
- [x] Verify static export compatibility (no server-only APIs on client).
- [x] Check rendering cost for data-heavy pages (players, civs, maps).
- [x] Validate caching headers and ISR/revalidation strategy.

## Summary
Performance audit completed and documented in `ops/reports/PERFORMANCE_AUDIT_2026-03-20.md`.
The app is static-first with acceptable First Load JS (87-96 kB) and no immediate
performance blockers for deployment.
