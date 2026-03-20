# web/data Mirror

Last audited: 2026-03-20

This directory mirrors the project `data/` outputs for web deployment scenarios
where files are colocated with the Next.js app artifact.

## Included Files

- Core CSV/JSON datasets used by `web/lib/data/*` adapters
- `spirit/` derived investigation datasets
- `README.md` (this file)

## Source of Truth

- Canonical analytics outputs live in the repository root at `data/`.
- Keep mirrored files in sync with root `data/` when preparing deployment assets.
- Schema and column definitions are documented in `DATA_SCHEMA.md`.
