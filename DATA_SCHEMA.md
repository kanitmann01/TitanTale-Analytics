# T90 Titans League Season 5 - Data Schema

## Overview
This document defines the data schema for T90 Titans League Season 5 analytics. Data is extracted from Liquipedia and local tournament sources.

Interpretation and headline conclusions for Spirit outputs and integrated
narrative are documented in [ANALYTICAL_BRIEF.md](ANALYTICAL_BRIEF.md)
(sections 11-13) and summarized for investigators in
[SPIRIT_FINDINGS.md](SPIRIT_FINDINGS.md). When building UI copy, keep
statistical caveats (multiple testing, sparse civ pairs, structural Player-1
effects) aligned with those docs.

## Multi-season layout and web resolution

The Next.js app in `web/` loads CSV/JSON via `web/lib/data/paths.ts`.

- **Season folders**: Put the same filenames the adapters expect under `data/seasons/{seasonId}/`, for example `data/seasons/s5/ttl_s5_matches.csv`, `players.csv`, `tournament_info.json`, etc. Optional per-season Spirit outputs: `data/seasons/{seasonId}/spirit/*.csv` and `findings.json` (see Spirit outputs below).
- **Slug**: Season IDs are lowercase slugs such as `s5`. Default season is `s5` when a folder or cookie is missing.
- **Fallback chain**: For a file `F` and season `S`, resolution tries `data/seasons/S/F`, then `data/seasons/s5/F`, then `data/F` (repo root `data/`).
- **DATA_DIR**: Set the `DATA_DIR` environment variable to point at the directory that contains `seasons/` (or flat CSVs). If unset, the app resolves from the repo: parent of `web/` (`../data`) when present, else `web/data`.
- **URL and cookie**: `?season=s5` sets the `ttl-season` cookie (see `web/middleware.ts`). Adapters receive `seasonId` from server helpers (`getSeasonId()`).

Python ETL should write per-season outputs into `data/seasons/{id}/` using the same column layouts as documented below so the web layer can switch seasons without code changes.

## Spirit outputs (`spirit_of_the_law_analysis.py`)

Produced by the Spirit script (not the Liquipedia ETL). Resolution order matches `spiritDataPath` / `trySpiritDataPath` in `web/lib/data/paths.ts`: `data/seasons/{seasonId}/spirit/`, then `data/seasons/s5/spirit/`, then `data/spirit/`.

### findings.json (machine-readable investigations)

Top-level object:

| Field | Type | Description |
|-------|------|-------------|
| season_id | string | Season slug (e.g. `s5`) |
| generated_at | string | ISO-8601 UTC timestamp |
| investigations | array | Ten entries, stable order I-X matching `SPIRIT_SLUGS` in the Python script |

Each investigation object (snake_case from Python):

| Field | Type | Description |
|-------|------|-------------|
| id | int | 1-10 |
| slug | string | Stable key (e.g. `snowball`, `positional_advantage`) |
| title | string | Short label |
| hypothesis | string | Tested claim |
| method | string | Procedure summary |
| finding | string | Primary numeric result line |
| effect_size | string | Matrix-style effect summary |
| statistical_weight | string | Human-readable p phrasing (e.g. `p < 0.0001`) |
| verdict | string | `CONFIRMED`, `BUSTED`, or `INCONCLUSIVE` |
| p_value | float or null | Raw p when defined |
| test_name | string or null | Named test family |
| n | int or null | Primary sample size or cell count where applicable |
| ci_low, ci_high | float or null | 95% Wilson interval for key proportions when computed |
| viz_path | string or null | Repo-relative PNG path (e.g. `assets/spirit/snowball_effect.png`) |
| n_significant | int | Optional; count of significant cells (clutch, civ grid) |
| multiple_testing_note | string | Optional caution for many tests |

TypeScript: `SpiritFindingsFileSchema` in `web/lib/schemas/spirit.ts`. The Research page merges this file with editorial fields from `web/lib/data/spirit-findings-fallback.ts` via `getSpiritFindings()`.

### Spirit CSVs (unchanged)

- `clutch_factor.csv`, `civ_matchup_matrix.csv`, `player_map_affinity.csv`, `upset_probability_by_elo_bin.csv` -- column layouts unchanged; see existing adapters in `web/lib/data/spirit.ts`.

### Operator markdown

- `SPIRIT_FINDINGS_auto.md` -- auto-generated summary next to `findings.json`; does not replace curated `SPIRIT_FINDINGS.md` at repo root.

### Drift check (optional CI)

- `scripts/check_spirit_findings_drift.py` (repo root) -- validates `findings.json` shape (10 investigations, required keys). With `--strict-verdicts`, exits non-zero if the verdict sequence differs from the frozen Season 5 reference tuple in that script (update the tuple when the pipeline output is intentionally changed).

## Data Files

### 1. ttl_s5_matches.csv
Game-by-game match results with ELO and civilization data.

| Column | Type | Description |
|--------|------|-------------|
| match_id | integer | Match group identifier |
| game_number | integer | Game number within match |
| player1 | string | Player 1 name |
| player2 | string | Player 2 name |
| winner | string | Winner player name |
| loser | string | Loser player name |
| player1_civ | string | Player 1's civilization |
| player2_civ | string | Player 2's civilization |
| map | string | Map name |
| duration_minutes | float | Game duration in minutes |
| stage | string | Tournament stage (Group Stage, etc.) |
| player1_elo | float | Player 1 ELO rating |
| player2_elo | float | Player 2 ELO rating |

### 2. matches.csv
Group standings snapshot by league tier.

| Column | Type | Description |
|--------|------|-------------|
| league | string | League tier (Platinum, Gold, etc.) |
| group | string | Group identifier (Group A, Group B, etc.) |
| player | string | Player name |
| standings_snapshot | string | Win-loss record string |

### 3. civ_drafts.csv
Civilization draft picks for each game.

| Column | Type | Description |
|--------|------|-------------|
| match_id | string | Match identifier |
| game_number | integer | Game number within match |
| map | string | Map name |
| player1_civ | string | Player 1's civilization |
| player2_civ | string | Player 2's civilization |
| player1_civ_draft_order | integer | Draft position for player 1's civ |
| player2_civ_draft_order | integer | Draft position for player 2's civ |
| winner_civ | string | Civilization that won |
| winner | string | Winner player name |

### 4. map_results.csv
Individual game results by map.

| Column | Type | Description |
|--------|------|-------------|
| match_id | string | Match identifier |
| game_number | integer | Game number within match |
| map | string | Map name |
| player1 | string | Player 1 name |
| player2 | string | Player 2 name |
| player1_civ | string | Player 1's civilization |
| player2_civ | string | Player 2's civilization |
| winner | string | Winner player name |
| duration | string | Game duration (mm:ss) |
| player1_score | integer | Player 1 final score |
| player2_score | integer | Player 2 final score |

### 5. players.csv
Normalized player information.

| Column | Type | Description |
|--------|------|-------------|
| player_id | string | Unique player identifier |
| player_name | string | Normalized player name |
| player_name_variants | string | Alternative names/spellings |
| team | string | Team name (if applicable) |
| country | string | Country code (ISO 3166-1 alpha-3) |
| seed | integer | Tournament seed/qualification |

### 6. player_statistics.csv
Aggregated player performance statistics.

| Column | Type | Description |
|--------|------|-------------|
| player | string | Player name |
| total_games | integer | Total games played |
| wins | integer | Total wins |
| losses | integer | Total losses |
| win_rate | float | Win rate (0-1) |
| elo | float | ELO rating |
| avg_game_duration | float | Average game duration in minutes |
| unique_civs | integer | Number of unique civilizations played |
| unique_maps | integer | Number of unique maps played |

### 7. player_civs.csv
Civilization performance by player and league tier.

| Column | Type | Description |
|--------|------|-------------|
| league | string | League tier (Platinum, Gold, etc.) |
| civilization | string | Civilization name |
| wins | integer | Wins with this civ in this league |
| losses | integer | Losses with this civ in this league |
| winrate | string | Win rate as percentage string |
| total_games | integer | Total games with this civ |

### 8. civilization_statistics.csv
Aggregated civilization performance across tournament.

| Column | Type | Description |
|--------|------|-------------|
| civilization | string | Civilization name |
| games_played | integer | Total games played |
| wins | integer | Total wins |
| losses | integer | Total losses |
| win_rate | float | Win rate (0-1) |
| pick_rate | float | Pick rate (0-1) |
| avg_duration | float | Average game duration in minutes |

### 9. map_statistics.csv
Map performance statistics.

| Column | Type | Description |
|--------|------|-------------|
| map | string | Map name |
| total_games | integer | Total games on this map |
| avg_duration | float | Average game duration in minutes |
| most_common_civ | string | Most played civilization |
| balance_std | float | Win rate balance standard deviation |

### 10. map_outcomes.csv
Map play rates by league tier.

| Column | Type | Description |
|--------|------|-------------|
| league | string | League tier (Platinum, Gold, etc.) |
| map | string | Map name |
| num_games | integer | Number of games played |
| play_rate | string | Play rate as percentage string |

### 11. tournament_info.json
Tournament metadata.

```json
{
  "tournament_name": "T90 Titans League Season 5",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "prize_pool": 0,
  "currency": "USD",
  "location": "Online",
  "game": "Age of Empires II: DE",
  "format": "",
  "total_players": 0,
  "organizer": "T90Official",
  "links": {
    "liquipedia": "https://liquipedia.net/ageofempires/...",
    "challonge": "",
    "youtube": ""
  }
}
```

## Data Quality Rules

### Player Name Normalization
- Remove clan tags: `[NaV]_Viper_` -> `Viper`
- Remove sponsor prefixes when present
- Remove suffixes: `Player_Jr` -> `Player_Jr` (keep Jr/Sr)
- Standardize common variations:
  - `Yo`, `_Yo_`, `Yo_` -> `Yo`
  - `TheViper`, `The Viper` -> `TheViper`
  - `Hera`, `_Hera_` -> `Hera`

### Civilization Names
- Standardize to official names:
  - `Aztecs` not `Aztec`
  - `Berbers` not `Berber`
  - `Burgundians` not `Burgundy`

### Map Names
- Use official map pool names
- Standardize variants: `Arabia` not `arabia` or `Arabia_v2`

## TypeScript Types

Type definitions are maintained in `web/lib/types.ts` and mirror this schema. Useexact CSV column names (snake_case) in types; adapters should map to camelCase for UI consumption.