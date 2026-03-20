# TitanTale Analytics

Analytics and visualization platform for the **T90 Titans League Season 5**
(Age of Empires II: Definitive Edition).

[![DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/kanitmann01/TitanTale-Analytics)

---

## What This Is

A two-layer project that scrapes, analyzes, and visualizes professional
tournament data from the T90 Titans League:

1. **Python analytics pipeline** -- ETL, exploratory data analysis, and
   statistical modeling at the repo root. Produces structured CSV/JSON
   in `data/`.
2. **Next.js web app** (in progress) -- full-stack UI in `web/` that
   presents the data with a polished, impeccable design quality bar.

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
     (EDA, stats)            (UI, adapters)
          |                       |
       assets/              Browser
     (PNG plots)
```

The two layers are decoupled by design
([ADR-001](ops/decisions/ADR-001-web-boundary.md)). Python scripts produce
data; the web app consumes it. Neither layer imports from the other.

---

## Quick Start

### Analytics Pipeline

```
pip install -r requirements.txt
python scraper.py
python analyze_ttl_s5.py
```

Output lands in `data/` (CSVs) and `assets/` (visualizations).

### Web App (when available)

```
cd web
npm install
npm run dev
```

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
  data/                         Structured CSV/JSON output
  assets/                       Visualization PNGs (planned)
  web/                          (planned) Next.js App Router app
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
| Web (planned) | Next.js (App Router), TypeScript, Tailwind CSS |
| Data | CSV files in `data/`, JSON metadata |
| Agent System | Paperclip multi-agent orchestration (12 agents) |

---

## Key Findings

- **TheViper, Hera, and Liereyy** form a statistically distinct
  performance tier (win rates exceeding the 95% confidence interval)
- **Poles and Byzantines** emerge as S-tier civilizations (win rates
  15-20% above the field)
- **Pre-tournament ELO is a weak predictor** of tournament success
  (R^2 = 0.082)
- **No civilization-map synergy** in the current meta -- players select
  civs independently of map context

See [ANALYTICAL_BRIEF.md](ANALYTICAL_BRIEF.md) for the full statistical
narrative.

---

## Contributing

See [AGENTS.md](Agents.MD) for project conventions. Branch from `dev`,
one branch per task (`feature/TASK-NNN-slug`). PRs target `dev`, not
`main`. Commits follow
[Conventional Commits](https://www.conventionalcommits.org/) with ASCII
only.

---

## License

TBD
