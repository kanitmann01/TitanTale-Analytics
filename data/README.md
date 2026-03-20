# Data Directory

Last audited: 2026-03-20

This directory stores analytics outputs used by Python reports and the Next.js
app adapters in `web/lib/data/`.

## Core Files

- `ttl_s5_matches.csv` - match/game-level dataset (546 games, 136 match IDs)
- `matches.csv` - standings snapshots by league/group
- `players.csv` - normalized player roster
- `player_statistics.csv` - player aggregate performance
- `player_advanced_metrics.csv` - advanced scoring and consistency metrics
- `player_h2h.csv` - player head-to-head outcomes
- `scouting_reports.csv` - compact scouting indicators
- `player_civs.csv` - player civilization performance
- `civ_drafts.csv` - draft picks by game
- `civilization_statistics.csv` - civilization aggregate performance
- `draft_position_outcomes.csv` - draft order outcome analysis
- `map_results.csv` - map-level game outcomes
- `map_statistics.csv` - map aggregate performance
- `map_outcomes.csv` - map usage rates by league
- `tournament_info.json` - tournament metadata

## Spirit Investigation Files

The `spirit/` subdirectory contains derived outputs from
`spirit_of_the_law_analysis.py`:

- `spirit/civ_matchup_matrix.csv`
- `spirit/clutch_factor.csv`
- `spirit/player_map_affinity.csv`
- `spirit/upset_probability_by_elo_bin.csv`

## Notes

- Column definitions and schema expectations are documented in `DATA_SCHEMA.md`.
- If Liquipedia scraping is blocked, regenerate local sample datasets with
  `python generate_sample_data.py`.
