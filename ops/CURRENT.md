# Project Snapshot

Updated: 2026-03-20

## Status
- Analytics pipeline: COMPLETE. All 14 CSVs, 12 visualizations, Spirit_of_the_Law analysis (8 viz, 4 CSVs, findings doc).
- Full-stack web app: COMPLETE. 6 main pages + 3 sub-pages, 11 data adapters, 11 chart components. Editorial design system with varied panel styles, rank badges, callout boxes, rich tooltips.
- **PROJECT PHASE: DELIVERY COMPLETE.** All mission deliverables achieved.

## Analytics Outputs (Ready for Web App)
| Output | Location | Description |
|--------|----------|-------------|
| Player stats | `data/player_statistics.csv` | Win rates, ELO, game counts, unique civs/maps |
| Civ stats | `data/civilization_statistics.csv` | Win rates, pick rates, avg duration by civ |
| Map stats | `data/map_statistics.csv` | Duration, most common civ, balance by map |
| Match data | `data/ttl_s5_matches.csv` | Game-by-game results with ELO and stage |
| Group standings | `data/matches.csv` | League standings by group |
| Player civs | `data/player_civs.csv` | Civ performance by player and league tier |
| Map outcomes | `data/map_outcomes.csv` | Map play rates by league tier |
| Visualizations | `assets/*.png` | 12 charts (heatmaps, scatter, violin) |
| Analytical Brief | `ANALYTICAL_BRIEF.md` | Strategic insights narrative (updated 2026-03-20 with advanced metrics, performance tiers, scouting intelligence) |

## In Progress
- (none)

## Backlog
- (none)

## Next Phase
- Production deployment: ship web/ to hosting (Vercel recommended)
- Real data integration: replace sample data pipeline with live Liquipedia scrape (Cloudflare workaround needed)

## Recently Completed
- 2026-03-20 | TASK-006: Deployment strategy complete. ADR-003 documents deployment architecture, paths.ts supports env-based resolution, no blockers.
- 2026-03-20 | Analytical Brief updated: now includes advanced metrics (performance tiers, upset probabilities, position bias, scouting intelligence, draft analysis) synthesized from full analytics pipeline outputs.
- 2026-03-20 | Backend deployment ready: ADR-003 documents data layer deployment strategy, paths.ts supports env-based data directory resolution, no backend blockers for deployment.
- 2026-03-20 | Design polish pass: broke uniform AI-template pattern across all pages. Varied panel styles, rank badges, asymmetric hero, rich scatter tooltips, donut gaps, callout boxes.
- 2026-03-20 | TASK-004: Backend API routes for feature enhancements complete. Player profiles, civ matchups, map breakdowns with Zod validation.
- 2026-03-20 | UI beautification: editorial design system, SVG chart components, /analysis dashboard.
- 2026-03-20 | TASK-005: Performance audit complete. Bundle 87-96 kB (acceptable), static generation optimal.
- 2026-03-20 | TASK-003: Landing page + /players, /civilizations, /maps routes with adapter data.
- 2026-03-20 | TASK-002: 11 data adapters, Zod schemas, test-data verification page.
- 2026-03-20 | Docs: PLAN.md and README_ETL.md aligned with current web-delivery phase.
- 2026-03-20 | ADR-002: Types and data schema aligned with actual CSV outputs.
- 2026-03-19 | TASK-001: Next.js scaffold complete. web/ structure created.
- 2026-03-19 | Analytics pipeline: ETL, EDA, Analytical Brief all delivered.
