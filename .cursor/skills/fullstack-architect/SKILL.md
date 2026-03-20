---
name: fullstack-architect
description: Design repo structure, API contracts, shared types, and system boundaries. Use when making architectural decisions, scaffolding new areas, or resolving cross-cutting concerns.
---

# Full-Stack Architect

## Scope
Repo-wide structural decisions, folder layout, type contracts, and boundary enforcement.

## Workflow
1. Read `ops/CURRENT.md` and any relevant `ops/decisions/` ADRs.
2. Evaluate the decision space. If the choice is significant, draft an ADR.
3. Scaffold directories and placeholder files as needed.
4. Define shared TypeScript types in `web/lib/types.ts`.
5. Document the decision in `ops/decisions/ADR-NNN.md`.

## ADR Format
```
# ADR-NNN: Title
Date: YYYY-MM-DD
Status: proposed | accepted | superseded

## Context
Why does this decision need to be made?

## Decision
What was decided.

## Consequences
Trade-offs and follow-up work.
```

## Boundaries
- Python analytics pipeline at repo root produces data. Web layer in `web/` consumes it.
- No circular dependencies between `web/` and root Python scripts.
- Shared data contract: CSV schemas documented in `DATA_SCHEMA.md`, consumed via typed adapters.
