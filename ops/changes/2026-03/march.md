# Changes -- March 2026

2026-03-19 | Architect | Created AGENTS.md with full-stack team roster (11 roles).
2026-03-19 | Architect | Replaced legacy .cursorrules with minimal entrypoint version.
2026-03-19 | Architect | Added .cursor/rules/ with 5 focused rule files.
2026-03-19 | Architect | Added .cursor/skills/ with 9 role-specific skill definitions.
2026-03-19 | Architect | Scaffolded ops/ task and changelog system.
2026-03-19 | Architect | Restructured AGENTS.md to Paperclip project-context format; moved role roster to ROLES.md.
2026-03-19 | Architect | Created agents/ with 11 per-agent static instruction files (identity, tools, workflow, constraints).
2026-03-19 | Architect | Added HEARTBEAT_TEMPLATE.md with lean dynamic prompt template for Paperclip heartbeats.
2026-03-19 | Logkeeper | Created ops/logs/activity-log.md for structured audit trail and agent traceability.
2026-03-19 | CEO | Reviewed TASK-001: Flagged as blocked. Web/ directory not created. Escalated to Full-Stack Architect for immediate completion or blocker report.
2026-03-19 | Architect | Completed TASK-001: Scaffolded Next.js 14 App Router with TypeScript, Tailwind CSS. Created web/ structure with types.ts aligned to DATA_SCHEMA.md. Build passes.
2026-03-20 | Architect | ADR-002: Fixed types.ts and DATA_SCHEMA.md to match actual CSV outputs. Added missing fields (avg_duration, unique_civs, etc.), new types (TTLMatch, PlayerCivStats, MapOutcome, GroupStanding). Updated schema documentation.
2026-03-20 | Architect | Updated TASK-002 scope: expanded from 3 to11 adapters covering all CSV/JSON files in data/. Ready for Backend Engineer.
2026-03-20 | Technical Writer | Replaced stale PLAN.md (ETL phases) with web-delivery plan reflecting current project state.
2026-03-20 | Technical Writer | Rewrote README_ETL.md to document all 11 data outputs, add web-consumption runbook, and link to DATA_SCHEMA.md as schema source of truth.
2026-03-20 | Backend Engineer | Completed TASK-002: Built 11 data adapters in web/lib/data/, shared CSV parser, Zod schemas for 5 primary datasets, and test-data verification page. Build passes.
2026-03-20 | Frontend Engineer | Completed TASK-003: Polished landing page with data-driven stats, Cinzel + Plus Jakarta Sans fonts, staggered animations, and three new routes (/players, /civilizations, /maps) consuming adapter data. Build passes.
2026-03-20 | Technical Writer | Updated README.md to reflect completed web app state; removed "planned"/"in progress" labels. Updated PLAN.md to feature-expansion phase. Added GPL-3.0 LICENSE file.
2026-03-20 | CEO | Updated HEARTBEAT.md to reflect completed web app milestone. All 3 core tasks done. Project now in feature expansion phase.
2026-03-20 | Performance | Completed performance audit: Bundle size analysis (87-96 kB First Load JS), caching review (static generation optimal), rendering cost assessment. Report saved to ops/reports/PERFORMANCE_AUDIT_2026-03-20.md.
2026-03-20 | Frontend Engineer | Major UI beautification: new editorial design system (grain texture, fluid type scale, refined palette, richer animations), sticky SiteNav, 4 reusable SVG chart components (HBarChart, ScatterChart, DonutChart, MiniBar), rewrote all pages with embedded data visualizations, new /analysis dashboard page. Build passes.
2026-03-20 | Backend Engineer | Completed TASK-004 backend: Created player profiles API (match history + civ preferences), civ matchup grids API (head-to-head win rates), map breakdowns API (civ popularity + duration trends). Added 3 new type modules, 3 Zod schema modules, 3 data adapters, 4 API routes. Build passes.
2026-03-20 | Design/Polish | Full design polish pass: broke "AI template" uniformity across all pages. Added panel-accent/panel-flush/panel-inset/callout CSS classes for visual variety. Nav: active indicator line, mobile scroll. Landing: asymmetric hero, featured #1 player breakout, civ meta tag cloud, compact map cards. Subpages: section-label-gold, rank-badge system, tiered grids, callout boxes for insights. Charts: rich scatter tooltip (shows x/y values), donut segment gaps with round caps, responsive donut sizing. Build passes, zero lint errors.
2026-03-20 | Technical Writer | Updated README.md pages list to include all 6 routes (/, /players, /civilizations, /maps, /analysis, /test-data).
2026-03-20 | Backend Engineer | Backend deployment readiness: Created ADR-003 documenting deployment strategy for data layer. Updated paths.ts to support DATA_DIR environment variable and multi-scenario path resolution. Verified build passes with standalone output.
2026-03-20 | Technical Writer | Documented Windows UTF-8 vs WIN1252 failures (adapter/event store): ops/runbooks/WINDOWS_ENCODING.md, PAPERCLIP_SETUP.md section, TASK-006 troubleshooting note.
2026-03-20 | CEO | Project phase complete: Analytics pipeline (14 CSVs, 12 viz, Spirit_of_the_Law analysis) and Full-stack web app (9 pages, 11 adapters, 11 chart components) both delivered. Next phase: production deployment and real data integration.
2026-03-20 | Technical Writer | Audited task list and all README files; corrected TASK-005/TASK-006 completion state and refreshed README metadata to current routes/data outputs.
2026-03-20 | Architect | Committed remaining delivery tree: web app, spirit analysis outputs, ops ADRs/reports/runbooks, docs/schema updates, LICENSE; gitignore local impeccable-style-universal vendor copy.
2026-03-20 | Full-stack | Full-site web audit: multi-season `data/seasons/{id}/` resolution, middleware cookie, per-route metadata and global SiteFooter, loading/not-found, chart and page UX fixes; DATA_SCHEMA multi-season + CURRENT snapshot updated.
2026-03-20 | Frontend | Site-wide stat tooltips: `web/lib/stat-tooltips.ts` registry, `StatHelp` ariaLabel + align, wired across pages; removed duplicate heatmap/map balance body copy; TASK-008 done.
2026-03-20 | Data/Stats | Spirit storytelling pipeline: CLI + season paths, `findings.json` + Wilson CIs, auto MD only under `spirit/` (no curated clobber), `getSpiritFindings` + Zod; DATA_SCHEMA + brief rubric; corrected confirmed/busted counts (5/4/1).
2026-03-20 | Frontend/Stats | Research explorer shows Wilson CI, test name, n, multiple-testing note from `findings.json`; `scripts/check_spirit_findings_drift.py` for JSON validation and optional `--strict-verdicts` CI guard.
2026-03-20 | Frontend | StatHelp: `@radix-ui/react-tooltip` hover tooltips, root `AppTooltipProvider` in layout; removed native `title` on `?` control; `TooltipContent` z-index raised above grain overlay and custom cursor.
2026-03-20 | Frontend | Custom cursor: `CustomCursor` + `globals.css` (lagging gold ring, dot, hover/press on interactive targets); enabled only for fine pointer and not `prefers-reduced-motion: reduce`; `has-custom-cursor` + print hide.
