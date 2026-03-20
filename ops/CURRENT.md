# Project Snapshot

Updated: 2026-03-20

## Status
- Analytics pipeline: complete (CSVs, assets, Spirit outputs in `data/spirit/`).
- Web app (`web/`): full-site audit implemented -- layout/SEO/footer, `not-found` + loading UI, multi-season paths (`data/seasons/{id}/`), nav season control (`?season=` + `ttl-season` cookie), chart/table UX, analysis/research polish, docs below.

## Data for web
- Primary: `data/seasons/{seasonId}/` (mirror of expected CSV/JSON names); env `DATA_DIR` overrides root. See `DATA_SCHEMA.md` (multi-season section).
- Spirit: `data/seasons/{id}/spirit/` or fallback `data/spirit/`.

## In progress
- (none)

## Next
- Production deploy; optional ETL to populate `data/seasons/s1`..`sN` from Liquipedia.

## Recently completed
- 2026-03-20 | Full web audit: metadata, global footer, favicon, heatmap/scatter/compare/profile/analysis/research updates, season-aware adapters and middleware.
