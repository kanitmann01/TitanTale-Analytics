# ADR-001: Web App Boundary
Date: 2026-03-19
Status: accepted

## Context

The repo is a Python analytics pipeline that produces structured CSV/JSON data
in `data/`. We want to add a Next.js full-stack web app to present this data
with a polished UI, without disrupting the existing pipeline or creating tight
coupling between the two layers.

## Decision

1. All Next.js code lives in `web/` at the repo root. No Next.js files outside this folder.
2. The Python pipeline remains at the repo root and continues to write to `data/` and `assets/`.
3. The web layer reads from `data/` as a **consumer**. It does not write back to `data/`.
4. Shared data contracts are documented in `DATA_SCHEMA.md` at the repo root.
5. The web app uses typed TypeScript adapters in `web/lib/data/` to parse CSVs/JSON.
   These adapters are the single point of coupling between the two layers.
6. Each layer has its own dependency management:
   - Python: `requirements.txt` (or `pyproject.toml`) at the repo root.
   - Node/Next.js: `package.json` inside `web/`.

## Consequences

- **Pro**: clear separation of concerns; either layer can evolve independently.
- **Pro**: Python scripts can be run on any schedule without web app awareness.
- **Pro**: web app can be deployed independently (e.g., Vercel) by pointing to static data exports.
- **Con**: data schema changes require updating both `DATA_SCHEMA.md` and the TS adapters.
- **Follow-up**: if real-time data is ever needed, introduce an API layer instead of direct CSV reads.
