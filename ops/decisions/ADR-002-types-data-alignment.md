# ADR-002: TypeScript Types and Data Schema Alignment
Date: 2026-03-20
Status: accepted

## Context

The `DATA_SCHEMA.md` documentation and `web/lib/types.ts` TypeScript interfaces were written before the analytics pipeline produced final CSV outputs. Upon verification, multiple discrepancies exist:

1. `matches.csv` schema in docs does not match actual file (docs describe match results; actual file contains league standings)
2. `player_statistics.csv` has additional columns not in types: `avg_game_duration`, `unique_civs`, `unique_maps`
3. `civilization_statistics.csv` has `avg_duration` column not typed
4. `map_statistics.csv` has `most_common_civ` and `balance_std` columns not typed
5. Additional CSV files exist but are undocumented: `player_civs.csv`, `map_outcomes.csv`, `ttl_s5_matches.csv`

## Decision

1. Update `web/lib/types.ts` to match actual CSV column names and add missing fields.
2. Use exact CSV column names in TypeScript (snake_case) with mapped display names in UI layer.
3. Add new types for undocumented files: `PlayerCivStats`, `MapOutcome`, `TTLMatch`.
4. Deprecate the incorrect `Match` interface; replace with `GroupStanding` for standings data.
5. Keep `TTLMatch` for actual game-by-game match data from `ttl_s5_matches.csv`.
6. Update `DATA_SCHEMA.md` to reflect actual produced CSV files.

## Consequences

- **Pro**: Types match reality; adapters will have accurate contracts.
- **Pro**: Prevents runtime errors from missing/extra columns.
- **Con**: Types use snake_case which is non-idiomatic TypeScript; adapters should map to camelCase for UI.
- **Follow-up**: Backend Engineer can now build accurate adapters for TASK-002.