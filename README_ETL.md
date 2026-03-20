# T90 Titans League Season 5 -- ETL Pipeline

Last audited: 2026-03-20

## Overview

The ETL pipeline extracts Age of Empires II tournament data from Liquipedia (or
generates sample data locally) and produces structured CSV/JSON files in `data/`.
These outputs feed both the Python statistical analysis scripts and the Next.js
web app in `web/`.

**Status:** Pipeline complete. Outputs are produced for both core analytics and
Spirit_of_the_Law investigations.

## Pipeline Scripts

| Script | Purpose |
|--------|---------|
| `scraper.py` | Fetches data from Liquipedia (blocked by Cloudflare; see Troubleshooting) |
| `generate_sample_data.py` | Generates realistic sample data for dev/test (current primary source) |
| `analyze_ttl_s5.py` | Core statistical analysis on `data/` CSVs |
| `advanced_statistical_analysis.py` | Extended EDA and advanced metrics outputs |
| `spirit_of_the_law_analysis.py` | Question-driven deep investigations (spirit data + charts) |

## Produced Data Files

All outputs live in `data/`. For column-level detail, see `DATA_SCHEMA.md`.

| File | Description |
|------|-------------|
| `ttl_s5_matches.csv` | Game-by-game results with ELO, civ, map, duration |
| `matches.csv` | Group standings snapshot by league tier |
| `players.csv` | Normalized player info (name, team, country, seed) |
| `player_statistics.csv` | Aggregated player stats (win rate, ELO, game counts) |
| `player_advanced_metrics.csv` | Advanced player scoring and consistency metrics |
| `player_h2h.csv` | Player head-to-head records |
| `scouting_reports.csv` | Scouting-style summary indicators |
| `player_civs.csv` | Civ performance by league tier |
| `civ_drafts.csv` | Per-game civ draft picks |
| `civilization_statistics.csv` | Aggregated civ stats (win rate, pick rate, avg duration) |
| `draft_position_outcomes.csv` | Performance by draft order/position |
| `map_results.csv` | Individual game results by map |
| `map_statistics.csv` | Map-level aggregates (avg duration, balance) |
| `map_outcomes.csv` | Map play rates by league tier |
| `tournament_info.json` | Tournament metadata (dates, prize pool, format) |

Spirit outputs in `data/spirit/`:

| File | Description |
|------|-------------|
| `civ_matchup_matrix.csv` | Civ-vs-civ matchup win-rate matrix |
| `clutch_factor.csv` | High-pressure performance indicators |
| `player_map_affinity.csv` | Player specialization by map |
| `upset_probability_by_elo_bin.csv` | Upset likelihood by ELO spread bins |

## How the Web App Consumes Data

The Next.js app in `web/` reads `data/` files through typed adapters in
`web/lib/data/`. This is the only coupling point between the two layers
(see `ops/decisions/ADR-001-web-boundary.md`).

```
data/*.csv  -->  web/lib/data/<domain>.ts  -->  Server Components / API routes
                     |
              web/lib/types.ts (shared TS interfaces)
              web/lib/schemas/  (optional Zod validation)
```

Adapters parse CSV at build or request time and return typed arrays. Frontend
pages never read CSV files directly.

## Data Quality

- **Player names:** clan tags, sponsor prefixes, and common variants normalized.
- **Civilization names:** standardized to official AoE2:DE names.
- **Map names:** official map pool names only.

See `DATA_SCHEMA.md` for normalization rules and column definitions.

## Usage

Generate sample data (primary workflow):

```bash
python generate_sample_data.py
```

Run statistical analysis:

```bash
python analyze_ttl_s5.py
python advanced_statistical_analysis.py
```

## Technical Notes

- Python 3.10+
- Dependencies: `requests`, `beautifulsoup4`, `pandas`, `scipy`, `seaborn`, `matplotlib`
- All CSV files use UTF-8 encoding with comma delimiters
- JSON uses 2-space indentation

## Troubleshooting

**403 Forbidden from Liquipedia:** Cloudflare blocks automated requests. Use
`generate_sample_data.py` or manually download HTML and parse locally.

**Empty data files:** Run `generate_sample_data.py` to regenerate test data.

**Missing dependencies:**

```bash
pip install requests beautifulsoup4 pandas scipy seaborn matplotlib
```
