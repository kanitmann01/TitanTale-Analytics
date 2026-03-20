# TASK-002: Build data adapters for CSV ingestion
Owner: Backend Engineer
Status: done
Created: 2026-03-19
Updated: 2026-03-20 (Architect - expanded scope to match all data files)
Completed: 2026-03-20
---

## Data Adapters (one file per domain)

Primary data (most used):
- [x] `web/lib/data/matches.ts` - reads `data/ttl_s5_matches.csv` as TTLMatch[]
- [x] `web/lib/data/standings.ts` - reads `data/matches.csv` as GroupStanding[]

Player data:
- [x] `web/lib/data/players.ts` - reads `data/players.csv` as Player[]
- [x] `web/lib/data/player-stats.ts` - reads `data/player_statistics.csv` as PlayerStats[]
- [x] `web/lib/data/player-civs.ts` - reads `data/player_civs.csv` as PlayerCivStats[]

Civilization data:
- [x] `web/lib/data/civ-stats.ts` - reads `data/civilization_statistics.csv` as CivilizationStats[]
- [x] `web/lib/data/civ-drafts.ts` - reads `data/civ_drafts.csv` as CivDraft[]

Map data:
- [x] `web/lib/data/map-stats.ts` - reads `data/map_statistics.csv` as MapStats[]
- [x] `web/lib/data/map-results.ts` - reads `data/map_results.csv` as MapResult[]
- [x] `web/lib/data/map-outcomes.ts` - reads `data/map_outcomes.csv` as MapOutcome[]

Tournament metadata:
- [x] `web/lib/data/tournament.ts` - reads `data/tournament_info.json` as TournamentInfo

## Validation
- [x] Add Zod schemas in `web/lib/schemas/` for runtime validation (5 primary datasets).
- [x] Create test page `web/app/test-data/page.tsx` to verify adapters work in Server Components.

## Notes
- Types are defined in `web/lib/types.ts` and match DATA_SCHEMA.md.
- Shared CSV parser in `web/lib/data/csv.ts` handles quoted fields.
- Data path resolved via `web/lib/data/paths.ts` relative to web/ root.
- Build verified: `next build` passes with all adapters and test page.
