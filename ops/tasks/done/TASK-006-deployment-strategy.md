# TASK-006: Deployment strategy
Owner: Full-Stack Architect
Status: done
Created: 2026-03-20
Completed: 2026-03-20
---
- [x] Evaluate static export (next build + next export) vs server-side with FS access.
- [x] Select hosting target (Vercel, Cloudflare Pages, self-hosted).
- [x] Document required environment variables and build-time config. (Backend Engineer completed)
- [x] Backend deployment considerations documented in ops/decisions/ADR-003-backend-deployment.md. (Backend Engineer completed)

## Backend Engineer Notes (2026-03-20)

Build verification complete:
- `next build` produces standalone output successfully
- 11 pages generated, 4 API routes active
- Bundle size: 87-96 kB First Load JS (acceptable)

Data layer deployment considerations addressed:
- Updated `web/lib/data/paths.ts` to support `DATA_DIR` environment variable
- Paths now resolve in multiple scenarios: dev mode, standalone output, custom mounts
- All data adapters use centralized path resolution

Environment variables documented:
- `DATA_DIR`: Optional override for data directory path
- `NODE_ENV`: Standard Next.js environment

ADR-003 created in ops/decisions/ documenting:
- Build configuration details
- Data layer architecture
- Three deployment strategies for data files
- API routes status
- Security considerations

No backend blockers for deployment. Full-Stack Architect can proceed with hosting selection.

## Troubleshooting (Paperclip / Windows)

If logging or adapter runs fail with `UTF8` / `WIN1252` encoding errors, the event payload contains a Unicode character the database client cannot store as WIN1252. Fix the database connection encoding (UTF-8) or see `ops/runbooks/WINDOWS_ENCODING.md`. Task files in this repo are kept ASCII-only to avoid that class of failure when tools mirror file contents.
