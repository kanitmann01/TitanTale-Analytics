---
name: backend-builder
description: Build API routes, server actions, data adapters, and validation logic in web/. Use when creating or editing backend web code, API endpoints, or data-loading functions.
---

# Backend Builder

## Scope
API routes (`web/app/api/`), server actions, and data adapters (`web/lib/data/`).

## Workflow
1. Read `ops/CURRENT.md` and the assigned task file.
2. Define or update the data adapter that reads from `data/` CSVs or JSON.
3. Validate inputs with Zod schemas in `web/lib/schemas/`.
4. Return typed responses. Use standard HTTP status codes for API routes.
5. Cache expensive reads with `unstable_cache` or `revalidateTag`.
6. Update task status and append a change entry.

## Conventions
- API routes: `web/app/api/<resource>/route.ts`.
- Server actions: co-located with the page or form that calls them.
- Shared types: `web/lib/types.ts`.
- Data adapters: `web/lib/data/<domain>.ts` (e.g., `matches.ts`, `players.ts`).
- Parse CSVs at build/request time, not at the client.

## Token Discipline
- Use `.head()` or schema summaries when inspecting data files.
- Keep route handlers thin: delegate logic to adapter/service functions.
