# TitanTale Analytics Blueprint

## Directory Structure
/assets (PNG visualizations)
/data (Cleaned CSVs)
/src 
  |- scraper.py (Data Engineer)
  |- modeler.py (Statistical Modeler)
/logs
AGENTS.md
ANALYTICAL_BRIEF.md

## Execution Phases

- [ ] **Phase 1: ETL Scaffolding (Data Engineer)**
  - Draft `src/scraper.py`.
  - Implement Liquipedia HTML fetching and basic table parsing.
  - Output raw data structure to console for validation.

- [ ] **Phase 2: Data Cleaning (Data Engineer)**
  - Implement name normalization and missing value handling in `scraper.py`.
  - Save final outputs as `matches.csv`, `civ_drafts.csv`, and `maps.csv` in `/data`.

- [ ] **Phase 3: EDA & Visualization (Statistical Modeler)**
  - Draft `src/modeler.py` to ingest `/data` CSVs.
  - Generate base statistics (win rates, civ pick rates).
  - Generate 3 high-density plots (Heatmap, Violin, Correlation) and save to `/assets`.

- [ ] **Phase 4: Synthesis (CEO)**
  - Review generated assets and basic statistical outputs.
  - Draft `ANALYTICAL_BRIEF.md` explaining variance and predictive indicators.