# TASK-004: Feature page enhancements
Owner: Frontend Engineer / Backend Engineer
Status: done
Created: 2026-03-20
Completed: 2026-03-20
---
- [x] Deeper player profiles with match history and civ preferences.
- [x] Civ matchup grids showing head-to-head win rates.
- [x] Map breakdowns with civ popularity and duration trends.

## Backend Implementation Complete

### New Types (web/lib/types.ts)
- `PlayerProfile` - Complete player profile with stats, match history, and civ preferences
- `PlayerMatchHistory` - Individual match records with opponent, civs, result
- `PlayerCivPreference` - Civ performance stats per player
- `CivMatchup` - Head-to-head civ matchup data
- `MapBreakdown` - Detailed map analysis with civ popularity and duration trends
- `MapCivPopularity` - Civ stats per map
- `MapDurationTrend` - Duration distribution per map

### New Schemas (web/lib/schemas/)
- `player-profile.ts` - Zod schemas for player profile data
- `civ-matchup.ts` - Zod schemas for civ matchup data
- `map-breakdown.ts` - Zod schemas for map breakdown data

### New Data Adapters (web/lib/data/)
- `player-profiles.ts` - `getPlayerProfile()`, `getAllPlayerProfiles()`
- `civ-matchups.ts` - `getCivMatchups()`, `getCivMatchupsForCiv()`
- `map-breakdowns.ts` - `getMapBreakdown()`, `getAllMapBreakdowns()`

### New API Routes (web/app/api/)
- `GET /api/players/[name]` - Returns player profile by name
- `GET /api/civs/matchups?civ=<name>` - Returns all civ matchups or filter by civ
- `GET /api/maps/breakdowns` - Returns all map breakdowns
- `GET /api/maps/[name]/breakdown` - Returns specific map breakdown

All endpoints return typed JSON responses with proper error handling.
Build verified: `npm run build` completes successfully.
