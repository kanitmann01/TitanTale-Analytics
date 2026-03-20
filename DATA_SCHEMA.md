# T90 Titans League Season 5 - Data Schema

## Overview
This document defines the data schema for T90 Titans League Season 5 analytics. Data is extracted from Liquipedia and local tournament sources.

## Data Files

### 1. matches.csv
Match results from tournament bracket.

| Column | Type | Description |
|--------|------|-------------|
| match_id | string | Unique match identifier |
| round | string | Tournament round (Group Stage, Quarterfinals, etc.) |
| player1 | string | Player 1 normalized name |
| player2 | string | Player2 normalized name |
| score | string | Match score (e.g., "3-2") |
| winner | string | Winner player name |
| date | date | Match date (YYYY-MM-DD) |
| best_of | integer | Best of X games |
| vod_url | string | Link to VOD (if available) |

### 2. civ_drafts.csv
Civilization draft picks for each game.

| Column | Type | Description |
|--------|------|-------------|
| match_id | string | Foreign key to matches.match_id |
| game_number |integer | Game number within match (1, 2, 3, etc.) |
| map | string | Map name |
| player1_civ | string |Player 1's civilization |
| player2_civ | string | Player 2's civilization |
| player1_civ_draft_order | integer | Draft position for player 1's civ |
| player2_civ_draft_order | integer | Draft position for player 2's civ |
| winner_civ | string | Civilization that won|
| winner | string | Winner player name |

### 3. map_results.csv
Individual game results by map.

| Column | Type | Description |
|--------|------|-------------|
| match_id | string | Foreign key to matches.match_id |
| game_number | integer | Game number within match |
| map | string | Map name |
| player1 | string | Player 1 name |
| player2 | string | Player 2 name|
| player1_civ | string | Player 1's civilization |
| player2_civ | string | Player 2's civilization |
| winner | string | Winner player name |
| duration | string | Game duration (mm:ss) |
| player1_score | integer | Player 1 final score (kills, resources) |
| player2_score | integer | Player 2 final score |

### 4. players.csv
Normalized player information.

| Column | Type | Description |
|--------|------|-------------|
| player_id | string | Unique player identifier |
| player_name | string | Normalized player name |
| player_name_variants | array | Alternative names/spellings |
| team | string | Team name (if applicable) |
| country | string | Country code (ISO 3166-1 alpha-3) |
| seed | integer | Tournament seed/qualification |

### 5. tournament_info.json
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

## Extracted Data Sources

1. **Liquipedia Tournament Page**
   - URL Pattern: `https://liquipedia.net/ageofempires/T90_Titans_League/Season_5`
   - Contains: Bracket results, prize pool, player list

2. **Liquipedia Match Pages**
   - Individual match details
   - Civ drafts, maps, VODs

3. **Additional Sources** (if available):
   - Challonge bracket
   - T90 YouTube VODs
   - AoE2.net match history