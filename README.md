# TitanTale Analytics

Analytics and visualization platform for the **T90 Titans League Season 5**
(Age of Empires II: Definitive Edition).

Last audited: 2026-03-20

[![DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/kanitmann01/TitanTale-Analytics)

---

## What This Is

A two-layer project that scrapes, analyzes, and visualizes professional
tournament data from the T90 Titans League:

1. **Python analytics pipeline** -- ETL, exploratory data analysis, and
   statistical modeling at the repo root. Produces structured CSV/JSON
   in `data/` and visualizations in `assets/`.
2. **Next.js web app** -- full-stack UI in `web/` that presents the data
   through typed adapters, with routes for players, civilizations, maps,
   analysis, matchups, compare, research, and test-data.

### Dataset at a Glance

| Metric | Value |
|--------|-------|
| Matches | 136 |
| Individual games | 546 |
| Players | 20 |
| Civilizations | 39 |
| Maps | 20 |

---

## Architecture

```
                    Liquipedia
                        |
                  scraper.py (ETL)
                        |
                      data/
                   CSV + JSON
                   /        \
     analyze_*.py            web/ (Next.js)
     (EDA, stats)            (adapters, pages)
          |                       |
       assets/              Browser
     (PNG plots)
```

The two layers are decoupled by design
([ADR-001](ops/decisions/ADR-001-web-boundary.md)). Python scripts produce
data; the web app consumes it through typed adapters in `web/lib/data/`.
Neither layer imports from the other.

---

## Quick Start

### Analytics Pipeline

```bash
pip install -r requirements.txt
python generate_sample_data.py
python analyze_ttl_s5.py
```

Output lands in `data/` (CSV/JSON) and `assets/` (visualizations).
See [README_ETL.md](README_ETL.md) for full pipeline documentation.

### Web App

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`. The app reads CSV/JSON from `data/` via
server-side adapters -- no separate API server needed.

---

## Repo Structure

```
TTL Stats/
  scraper.py                    ETL: Liquipedia data extraction
  analyze_ttl_s5.py             Statistical analysis (EDA)
  analyze_real_data.py          Real data analysis
  advanced_statistical_analysis.py  Advanced stats and modeling
  generate_sample_data.py       Sample data generator for dev/test
  validate_ascii.py             ASCII compliance checker
  data/                         Structured CSV/JSON output (core + spirit datasets)
  assets/                       Visualization PNGs (current spirit charts under assets/spirit/)
  web/                          Next.js App Router app
    app/                        Routes: /, /players, /civilizations, /maps, /analysis, /matchups, /compare, /research, /test-data
    lib/data/                   Typed CSV/JSON adapters and parser utilities
    lib/types.ts                Shared TypeScript interfaces
    lib/schemas/                Zod runtime validation
  agents/                       Multi-agent instruction files (Paperclip)
  ops/
    CURRENT.md                  Active project snapshot
    tasks/                      Backlog, in-progress, done
    changes/                    Monthly append-only changelog
    decisions/                  Architecture Decision Records
  .cursor/
    rules/                      Scoped persistent rules
    skills/                     On-demand role skills
```

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Analytics | Python 3.10+, pandas, scipy, seaborn, matplotlib, BeautifulSoup |
| Web | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zod |
| Data | CSV files in `data/`, JSON metadata |
| Agent System | Paperclip multi-agent orchestration |

---

## Key Findings

Standard pipeline (see [ANALYTICAL_BRIEF.md](ANALYTICAL_BRIEF.md)):

- **TheViper, Hera, and Liereyy** form a statistically distinct
  performance tier (win rates exceeding the 95% confidence interval)
- **Poles and Byzantines** emerge as S-tier civilizations (win rates
  15-20% above the field)
- **Pre-tournament ELO is a weak predictor** of tournament success
  (R^2 = 0.082)
- **No civilization-map synergy** in the current meta -- players select
  civs independently of map context

Spirit investigations (brief sections 12-13; details in
[SPIRIT_FINDINGS.md](SPIRIT_FINDINGS.md)):

- **Tournament volatility** exceeds logistic ELO upset predictions by about
  **1.62x** (p &lt; 0.0001)
- **Snowball effect:** Game-1 winners take the series **~89%** of the time
- **Player-1 listing** wins **~74.2%** of games -- strong structural signal in
  data; interpret with seeding/listing caveats (see brief 12.2)
- **Map specialization** is **rare** (1/196 significant at p &lt; 0.05);
  **clutch** shows one significant player with multiple-testing caveats
- **Civ matchup imbalance:** none of **25** tested pairs (min 3 games) was
  significant -- not proof of perfect balance (low power)
- **Busted here:** fatigue-by-game-index, comfort-pick superiority, tempo
  (duration CV) vs win rate; **inconclusive:** meta evolution (single stage)

## Web app integration (brief section 11)

Structured outputs under `data/` (per-season under `data/seasons/{id}/` when
used) are loaded by typed adapters in [web/lib/data/](web/lib/data/). The
Next.js app exposes routes including `/`, `/players`, `/civilizations`,
`/maps`, `/analysis`, `/matchups`, `/compare`, `/research`, and `/test-data`.
Exports consumed for advanced views include among others:
`player_statistics.csv`, `player_advanced_metrics.csv`, `player_h2h.csv`,
`scouting_reports.csv`, `draft_position_outcomes.csv`, and Spirit CSVs under
`spirit/`. See the brief for the full file list and narrative.

---

## Contributing

See [AGENTS.md](AGENTS.md) for project conventions. Branch from `dev`,
one branch per task (`feature/TASK-NNN-slug`). PRs target `dev`, not
`main`. Commits follow
[Conventional Commits](https://www.conventionalcommits.org/) with ASCII
only.

---

## License

This project is licensed under the **GNU General Public License v3.0**.
See [LICENSE](LICENSE) for the full text.
