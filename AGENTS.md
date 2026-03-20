# AGENTS.md

Guidance for human and AI agents working in this repository.

## 1. Purpose

TTL Stats is a multi-agent analytics and web project for Age of Empires II
tournament data (T90 Titans League). It has two layers:

- **Python analytics pipeline** -- ETL, EDA, and statistical modeling at the repo root.
- **Next.js web app** (planned) -- full-stack UI in `web/` that presents the data.

### Analytics Agents

| Agent | Script | Purpose |
|-------|--------|---------|
| Data Engineer | `scraper.py`, `parse_html.py` | ETL: extract and normalize tournament data into `data/` CSVs |
| Statistical Modeler | `analyze_ttl_s5.py`, `analyze_real_data.py`, `advanced_statistical_analysis.py` | Standard EDA: descriptive stats, correlations, outlier detection, variance analysis |
| Spirit_of_the_Law | `spirit_of_the_law_analysis.py` | Deep investigative analysis modeled on the AoE2 YouTuber's methodology: question-driven, empirical, assumption-challenging. Runs 10 targeted investigations that the standard pipeline does not cover (snowball effect, positional advantage, fatigue factor, comfort picks, clutch factor, civ matchup imbalance, map specialization, upset probability, tempo control, meta evolution). Outputs to `SPIRIT_FINDINGS.md`, `assets/spirit/`, `data/spirit/`. |

## 2. Read This First

Before making changes, read in this order:

1. `ops/CURRENT.md` -- active work snapshot (read every session)
2. `DATA_SCHEMA.md` -- structure of the CSV/JSON data in `data/`
3. `ops/decisions/ADR-001-web-boundary.md` -- how the two layers coexist
4. `ROLES.md` -- agent role scopes and skill pointers (reference only)

## 3. Repo Map

```
TTL Stats/
  AGENTS.md                 <-- This file. Project context for all agents.
  ROLES.md                  <-- Role scopes, escalation, skill pointers.
  .cursorrules              <-- Minimal global rules for Cursor IDE.
  .cursor/rules/            <-- Scoped persistent rules (design, Next.js, Python, ops).
  .cursor/skills/           <-- On-demand role skills (loaded when needed, not always).
  ops/
    CURRENT.md              <-- Start here. Active snapshot (keep under 30 lines).
    tasks/backlog/          <-- One file per queued task.
    tasks/in-progress/      <-- Active work items.
    tasks/done/             <-- Completed task archive.
    changes/YYYY-MM/        <-- Monthly append-only changelog.
    decisions/              <-- Architecture Decision Records.
  data/                     <-- Structured CSV/JSON output from the analytics pipeline.
    spirit/                 <-- Derived CSVs from Spirit_of_the_Law investigations.
  assets/                   <-- Visualization PNGs from statistical analysis.
    spirit/                 <-- Visualizations from Spirit_of_the_Law investigations.
  web/                      <-- (planned) Next.js App Router full-stack app.
  scraper.py                <-- ETL: Liquipedia data extraction.
  parse_html.py             <-- ETL: local HTML parsing.
  analyze_ttl_s5.py         <-- Statistical analysis scripts.
  analyze_real_data.py
  advanced_statistical_analysis.py
  spirit_of_the_law_analysis.py  <-- Deep investigative analysis (10 targeted questions).
  generate_sample_data.py   <-- Sample data generator for dev/test.
```

## 4. Tech Stack

| Layer | Stack |
|-------|-------|
| Analytics | Python 3.10+, pandas, scipy, seaborn, matplotlib, BeautifulSoup |
| Web (planned) | Next.js (App Router), TypeScript, Tailwind CSS |
| Data | CSV files in `data/`, JSON metadata |

## 5. Core Engineering Rules

1. **Two-layer boundary.**
   Python scripts at the repo root produce data in `data/`. The web app in `web/`
   consumes it. Neither layer imports from the other.

2. **ASCII only.**
   No emojis in markdown, commit messages, or terminal output. Strict UTF-8/ASCII.

3. **Token discipline.**
   Read `ops/CURRENT.md` first. Open only the files relevant to the active task.
   Never dump full CSVs or HTML into context. Use `.head()`, shape, or schema summaries.

4. **Python standards.**
   Type-hint all function signatures. Catch specific exceptions; no bare `except:`.
   Data outputs to `data/`, visual outputs to `assets/`.

5. **Web standards** (when `web/` exists).
   Server Components by default. `"use client"` only for interactivity.
   API routes in `web/app/api/`. Shared types in `web/lib/types.ts`.
   Data adapters in `web/lib/data/` parse CSVs at build/request time.

6. **Ops workflow.**
   Tasks are one-file-per-item in `ops/tasks/`. Move files between `backlog/`,
   `in-progress/`, and `done/` to reflect status. Append change entries to
   `ops/changes/YYYY-MM/`. See `ops/README.md` for full details.

7. **Do not modify this file** unless explicitly instructed.

## 6. Verification Before Hand-off

Before claiming work is done:

- Python changes: run the script with sample data, confirm output in `data/` or `assets/`.
- Web changes: `next build` completes without errors. Lint passes.
- All changes: update the relevant task file status and append a changelog entry.

## 7. Definition of Done

A change is done when:

1. Acceptance criteria in the task file are met.
2. Build and lint pass for the affected layer.
3. Task file moved to `ops/tasks/done/`.
4. One-line changelog entry appended to `ops/changes/YYYY-MM/`.
5. `ops/CURRENT.md` updated if the overall project status changed.
