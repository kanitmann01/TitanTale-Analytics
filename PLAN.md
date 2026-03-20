# TTL Stats -- Project Plan

## Current Phase: Feature Expansion

The Python analytics pipeline is **complete**. The Next.js web app has a working
data layer (11 typed adapters with Zod validation) and four shipped pages:
landing, players, civilizations, and maps. The project is now in the
feature-expansion phase: deepening individual pages and preparing for deployment.

See `ops/CURRENT.md` for the live status snapshot.

## Completed Work

| Deliverable | Location | Owner |
|-------------|----------|-------|
| ETL pipeline | `scraper.py`, `generate_sample_data.py` | Data Engineer |
| Statistical analysis | `analyze_ttl_s5.py`, `advanced_statistical_analysis.py` | Statistical Modeler |
| 10 structured CSVs | `data/` | Data Engineer |
| 12 visualizations | `assets/*.png` | Statistical Modeler |
| Analytical Brief | `ANALYTICAL_BRIEF.md` | CEO |
| Data schema docs | `DATA_SCHEMA.md` | Architect |
| Next.js scaffold | `web/` | Architect (TASK-001) |
| Type alignment | `web/lib/types.ts` | Architect (ADR-002) |
| Data adapters | `web/lib/data/` (11 adapters) | Backend Engineer (TASK-002) |
| Zod schemas | `web/lib/schemas/` (5 primary datasets) | Backend Engineer (TASK-002) |
| Landing page + routes | `web/app/` (4 pages) | Frontend Engineer (TASK-003) |
| Doc alignment | `PLAN.md`, `README_ETL.md` | Technical Writer |

## Upcoming

- Feature page enhancements: deeper player profiles, civ matchup grids, map breakdowns.
- Performance audit: bundle size, caching, and rendering cost.
- Deployment strategy: static export or server-side with file-system access.

## Authoritative References

| Concern | File |
|---------|------|
| Live status | `ops/CURRENT.md` |
| Data contract | `DATA_SCHEMA.md` |
| System boundary | `ops/decisions/ADR-001-web-boundary.md` |
| Type corrections | `ops/decisions/ADR-002-types-data-alignment.md` |
| Task board | `ops/tasks/` (backlog, in-progress, done) |
