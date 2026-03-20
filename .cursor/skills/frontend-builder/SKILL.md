---
name: frontend-builder
description: Build polished Next.js App Router UI components, pages, and client logic in web/. Use when creating or editing frontend code, components, layouts, or styles.
---

# Frontend Builder

## Scope
All UI work inside `web/app/` and `web/components/`.

## Workflow
1. Read `ops/CURRENT.md` and the assigned task file.
2. Check `.cursor/rules/design-impeccable-style.mdc` for the visual quality bar.
3. Implement using Server Components by default. Add `"use client"` only for interactivity.
4. Co-locate styles with components (CSS Modules or Tailwind).
5. Use `loading.tsx` and `error.tsx` for route feedback.
6. After implementation, self-review against the impeccable style quality gate.
7. Update task status and append a one-line change entry.

## Conventions
- Components: PascalCase files in `web/components/`.
- Pages: `page.tsx` inside `web/app/<route>/`.
- Shared UI primitives: `web/components/ui/`.
- Data fetching in Server Components via adapters in `web/lib/data/`.
- Client state: prefer URL search params or React context over global stores.

## Token Discipline
- Do not read data CSVs directly. Use typed adapter functions.
- Import only the components you need. Avoid barrel re-exports.
