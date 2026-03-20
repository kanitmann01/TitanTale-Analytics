# TTL Season 5 Data Scraping Report

## Data Engineer: ETL Pipeline Report

### Data Sources
- **Platform**: Liquipedia (Age of Empires)
- **Tournament**: T90 Titans League Season 5
- **URL Pattern**: `https://liquipedia.net/ageofempires/T90_Titans_League/5/{League}_League`

### Leagues Scraped
1. Platinum League
2. Gold League  
3. Silver League
4. Bronze League

---

## Data Quality Issues Encountered

### Blocking Issue: Cloudflare Protection
- **Problem**: Liquipedia uses Cloudflare Turnstile CAPTCHA which blocks programmatic access to:
  - Individual match result pages
  - Head-to-head match history queries (`Special:RunQuery/Match_history`)
  - Detailed civ draft data per match
  
- **Impact**: Cannot extract:
  - Individual match results (player vs player with scores)
  - Per-game civilization picks
  - Map-specific win/loss data for specific players

### Mitigation Applied
- Scraped available Statistics pages for aggregate data
- Extracted group stage standings from main league pages
- Civilization and map aggregate statistics captured

---

## Output Files

### 1. `data/player_civs.csv`
**Purpose**: Civilization performance statistics per league

| Column | Description |
|--------|-------------|
| league | Tournament division (Platinum/Gold/Silver/Bronze) |
| civilization | AoE2 civilization name |
| wins | Total wins across league |
| losses | Total losses across league |
| winrate | Win percentage |
| total_games | Total games played |

**Record Count**: 187 civilizations across all leagues

### 2. `data/map_outcomes.csv`
**Purpose**: Map play frequency and usage statistics

| Column | Description |
|--------|-------------|
| league | Tournament division |
| map | Map name |
| num_games | Number of games on this map |
| play_rate | Percentage of total games |

**Record Count**: 60 map entries across all leagues

### 3. `data/matches.csv`
**Purpose**: Group stage player standings snapshots

| Column | Description |
|--------|-------------|
| league | Tournament division |
| group | Group identifier (A, B, C, D) |
| player | Player name (normalized) |
| standings_snapshot | Round-by-round standings (format: "W-L \| W-L \| ...") |

**Record Count**: 182 player-group combinations

---

## Data Limitations

1. **No Individual Match Data**: Due to Cloudflare blocking, match-level detail unavailable
2. **No Civ Drafts**: Per-game civilization selections not accessible
3. **Aggregate Only**: Statistics reflect tournament totals, not individual games
4. **Bronze League**: Group stage data not available in same format

---

## Player Name Normalization
- Names extracted directly from Liquipedia HTML
- Some variations exist (e.g., "TheViper" vs "Vivi")
- Further normalization recommended before modeling

---

## Technical Notes
- Scraping method: Playwright with Chromium (bypasses some Cloudflare checks)
- Fallback: Aggregate stats from Statistics subpages
- HTML parsing: BeautifulSoup4 with html.parser

---

## Recommendations for Complete Data
1. Manual data entry for critical matches
2. Explore Liquipedia API alternatives
3. Consider AOE4 World or Trackie as data sources
4. Contact T90Official for official match data

---

*Generated: ETL Pipeline v1.0*
*Team: TitanTale Analytics - Data Engineer*
