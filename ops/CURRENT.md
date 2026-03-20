# Project Snapshot

Updated: 2026-03-20

## Status
- Analytics pipeline: complete (CSVs, assets, Spirit outputs in `data/spirit/`).
- Web app (`web/`): full-site audit; Radix hover stat tooltips; optional custom cursor (desktop, no reduced-motion); multi-season data paths and nav season control.

## Data for web
- Primary: `data/seasons/{seasonId}/` (mirror of expected CSV/JSON names); env `DATA_DIR` overrides root. See `DATA_SCHEMA.md` (multi-season section).
- Spirit: `data/seasons/{id}/spirit/` or fallback `data/spirit/`.

## In progress
- (none)

## Next
- Production deploy; optional ETL to populate `data/seasons/s1`..`sN` from Liquipedia.

## Recently completed
- 2026-03-20 | Custom cursor + StatHelp Radix hover + z-index/title cleanup (see `ops/changes/2026-03/march.md`).
- 2026-03-20 | Spirit pipeline + research UI: `findings.json`, `getSpiritFindings`, curated `SPIRIT_FINDINGS.md` guard; DATA_SCHEMA / brief alignment.
- 2026-03-20 | Stat tooltips: `stat-tooltips.ts`, `StatHelp` next to titles, heatmap body copy removed (TASK-008).
- 2026-03-20 | Full web audit: metadata, footer, season adapters, middleware.
