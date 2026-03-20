# T90 Titans League Season 5 - ETL Pipeline

## Overview

This directory contains the ETL (Extract, Transform, Load) pipeline for T90 Titans League Season 5 data. The pipeline extracts match results, civilization drafts, and map outcomes from Liquipedia and prepares the data for statistical analysis.

## Directory Structure

```
TTL Stats/
+-- data/                          # Output data directory
|   +-- matches.csv                # Match results
|   +-- civ_drafts.csv             # Civilization draft data
|   +-- map_results.csv            # Individual game results
|   +-- players.csv                # Player information
|   +-- tournament_info.json       # Tournament metadata
+-- scraper.py                     # Main web scraper
+-- parse_html.py                  # Local HTML parser
+-- generate_sample_data.py        # Sample data generator
+-- DATA_SCHEMA.md                 # Data schema documentation
+-- README_ETL.md                  # This file
```

## Data Files

### matches.csv
- **Rows:** 47 matches
- **Columns:** match_id, round, player1, player2, score, winner, date, best_of, vod_url
- **Description:** Tournament bracket results

### civ_drafts.csv
- **Rows:**141 draft entries
- **Columns:** match_id, game_number, map, player1_civ, player2_civ, player1_civ_draft_order, player2_civ_draft_order, winner_civ, winner
- **Description:** Civilization draft picks per game

### map_results.csv
- **Rows:** 195 game results
- **Columns:** match_id, game_number, map, player1, player2, player1_civ, player2_civ, winner, duration, player1_score, player2_score
- **Description:** Individual game outcomes

### players.csv
- **Rows:** 20 players
- **Columns:** player_id, player_name, player_name_variants, team, country, seed
- **Description:** Normalized player information

### tournament_info.json
- **Description:** Tournament metadata including dates, prize pool, format, etc.

## Usage

### Option1: Scrape from Liquipedia (when available)

```bash
python scraper.py
```

This will attempt to fetch data from:
- `https://liquipedia.net/ageofempires/T90_Titans_League/Season_5`
- `https://liquipedia.net/ageofempires/T90_Titans_League_Season_5`
- `https://liquipedia.net/ageofempires/T90_Titans_League`

**Note:** Liquipedia currently blocks automated requests (403 Forbidden). UseOption 2 or 3 instead.

### Option 2: Parse locally saved HTML

```bash
python parse_html.py <path_to_html_file>
```

This parses downloaded HTML files from Liquipedia. Use this if you can manually download pages through a browser.

### Option 3: Generate sample data

```bash
python generate_sample_data.py
```

Generates realistic sample data for testing and development. **Current status:** Using this option as primary data source.

## Data Quality

### Player Name Normalization
- Clan tags removed: `[NaV]_Viper_` -> `Viper`
- Common variants standardized: `Yo`, `_Yo_`, `Yo_` -> `Yo`
- Sponsor prefixes removed

### Civilization Names
- Standardized to officialgame names
- Examples: `Aztecs`, `Berbers`, `Britons`, `Burgundians`

### Map Names
- Official map pool names used
- Examples: `Arabia`, `Arena`, `Coastal`, `Hideout`

## Current Status

**Data Source:** Sample data generated locally  
**Reason:** Liquipedia blocks automated requests  
**Solution:** 
1. Use sample data for immediate analysis
2. Manually download HTML files when available
3. Use alternative data sources (AoE2.net, Challonge)

## Next Steps

Statistical Modeler can now:
1. Load data from `/data/` directory
2. Perform EDA on matches, civ drafts, and map results
3. Calculate win rates, pick rates, correlations
4. Generate visualizations in `/assets/` directory

## Technical Notes

- Scripts use Python 3.12+
- Dependencies: `requests`, `beautifulsoup4`, `pandas`
- All data files use UTF-8 encoding
- CSVs use comma delimiter
- JSON uses 2-space indentation

## Troubleshooting

### 403 Forbidden Error
- Liquipedia has anti-bot protection
- Use manual HTML download or sample data
- Consider using browser automation (Selenium, Playwright)

### Empty DataFiles
- Run `generate_sample_data.py` to create test data
- Check if HTML file contains actual tournament data

### Missing Dependencies
```bash
pip install requests beautifulsoup4 pandas
```

## Contact

For questions about the ETL pipeline, refer to `DATA_SCHEMA.md` for detailed field descriptions.