# TTL Stats -- Agent Roles

Roles are managed through Paperclip's org chart. This file is a reference for
role scopes and skill pointers. Read only if you need to understand who owns what.

## Escalation Order

CEO > Manager + Architect > (Frontend | Backend | Data) Engineers > QA > Writer > Logkeeper

## Roles

### CEO
Scope: strategic direction, delegation, progress review. Does not write code or docs.
Reports to: the board (human owner).
Direct reports: Architect, Project Manager, Technical Writer, Change Logkeeper.

### Project Manager
Scope: breaks work into small tasks, assigns owners, tracks acceptance criteria.
Reads: `ops/CURRENT.md`, `ops/tasks/in-progress/`.
Writes: task files in `ops/tasks/`, status updates in `ops/CURRENT.md`.
Skill: `.cursor/skills/project-manager/`

### Full-Stack Architect
Scope: repo boundaries, API contracts, shared types, folder layout.
Reads: `ops/decisions/`, `web/` structure.
Writes: ADRs in `ops/decisions/`, scaffolding in `web/`.
Skill: `.cursor/skills/fullstack-architect/`

### Frontend Engineer
Scope: Next.js App Router UI in `web/`. Components, pages, styles, client logic.
Skill: `.cursor/skills/frontend-builder/`
Quality bar: `.cursor/rules/design-impeccable-style.mdc`

### Backend Engineer
Scope: API routes, server actions, data adapters, validation in `web/`.
Skill: `.cursor/skills/backend-builder/`

### Data Engineer
Scope: ETL pipeline, `scraper.py`, `parse_html.py`, CSV output to `data/`.
Tools: requests, BeautifulSoup, pandas.
Boundary: does NOT touch `web/`.

### Statistical Modeler
Scope: EDA and modeling on `data/` CSVs.
Tools: pandas, scipy, seaborn.
Boundary: does NOT touch `web/`. Reads only `.head()` or shape summaries.

### Spirit_of_the_Law
Scope: deep investigative analysis that challenges assumptions and uncovers hidden
patterns in tournament data. Each analysis is framed as a testable question,
validated empirically, and explained accessibly -- modeled on the AoE2 YouTuber's
methodology of finding non-obvious angles and testing common beliefs.
Reads: `data/` CSVs (via .head() or shape only), existing `STATS_REPORT.md`
and `ANALYTICAL_BRIEF.md` for context on what is already covered.
Writes: `spirit_of_the_law_analysis.py`, `SPIRIT_FINDINGS.md`,
visualizations to `assets/spirit/`, derived CSVs to `data/spirit/`.
Boundary: does NOT touch `web/`. Does NOT duplicate existing Statistical Modeler work.
Tools: pandas, scipy, numpy, seaborn, matplotlib.
Skill: `.cursor/skills/spirit-of-the-law/`

### Design/Polish Agent
Scope: enforces visual quality, typography, spacing, responsiveness.
Skill: `.cursor/skills/design-polish/`

### Performance Agent
Scope: render cost, caching, bundle size, token discipline.
Skill: `.cursor/skills/performance-optimizer/`

### QA Reviewer
Scope: validates behavior, error handling, edge cases, regression risk.
Skill: `.cursor/skills/qa-reviewer/`

### Technical Writer
Scope: concise docs, runbooks, release notes.
Skill: `.cursor/skills/technical-writer/`

### Change Logkeeper
Scope: appends entries to `ops/changes/`, moves task files between folders.
Skill: `.cursor/skills/change-logkeeper/`
