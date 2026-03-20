---
name: spirit-of-the-law
description: Deep investigative analysis that challenges assumptions and uncovers hidden patterns in tournament data. Use when exploring non-obvious questions, testing common beliefs, or running targeted statistical investigations that the standard pipeline does not cover.
---

# Spirit of the Law

## Scope
Question-driven investigative analysis on `data/` CSVs. Every analysis starts as
a testable question, is validated empirically, and is explained accessibly.
Does NOT duplicate work already in `STATS_REPORT.md` or `ANALYTICAL_BRIEF.md`.

## Analytical Principles

1. Frame every analysis as a testable question -- not a label.
2. State the hypothesis before running any test.
3. Always include: question, method (plain English + formal test name), key numbers, verdict.
4. Verdict categories: CONFIRMED / BUSTED / INCONCLUSIVE (with confidence level).
5. If a finding contradicts conventional expectations, flag it explicitly.
6. Explain statistical methods accessibly -- one sentence of plain English for every formal test.
7. Never duplicate analysis already in `STATS_REPORT.md` or `ANALYTICAL_BRIEF.md`.

## Workflow

1. Read `ANALYTICAL_BRIEF.md` and `STATS_REPORT.md` to know what is already covered.
2. Run `spirit_of_the_law_analysis.py` (or individual investigation functions).
3. Each investigation: state question -> hypothesis -> method -> key numbers -> verdict.
4. Output: `SPIRIT_FINDINGS.md` (report), `assets/spirit/` (charts), `data/spirit/` (derived CSVs).

## Investigation Catalog

| # | Name | Question |
|---|------|----------|
| 1 | Snowball Effect | Does winning game 1 predict winning the series? |
| 2 | Draft Order Advantage | Does picking first confer a measurable edge? |
| 3 | Fatigue Factor | Does performance decay across a series? |
| 4 | Comfort Picks vs. Wild Cards | Do players win more on their most-played civs? |
| 5 | Clutch Factor | Who over/underperforms in deciding games? |
| 6 | One-Sided Civ Matchups | Which civ pairings are most imbalanced? |
| 7 | Map Specialists | Which players over/underperform on specific maps? |
| 8 | Upset Probability | Do underdogs win more often than ELO theory predicts? |
| 9 | Tempo Control | Does controlling game length correlate with winning? |
| 10 | Meta Evolution | How do civ picks shift as tournament stakes increase? |

## Output Contract

- `SPIRIT_FINDINGS.md` -- structured report, one section per investigation.
- `assets/spirit/` -- one visualization per investigation that warrants a chart.
- `data/spirit/` -- derived CSVs (e.g. `civ_matchup_matrix.csv`, `player_map_affinity.csv`).

## Token Discipline

- Read data via `.head()`, `.shape`, `.describe()` only. Never dump full CSVs.
- Read existing reports only to check for overlap; do not re-analyze covered ground.
