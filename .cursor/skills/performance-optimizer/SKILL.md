---
name: performance-optimizer
description: Audit and improve loading speed, rendering, bundle size, caching, and token efficiency. Use when investigating slow pages, large bundles, or excessive context usage.
---

# Performance Optimizer

## Scope
Web performance in `web/` and token/context efficiency across all agents.

## Web Performance Checklist
1. **Bundle**: dynamic-import heavy components, check for barrel re-exports pulling unused code.
2. **Images**: use `next/image` with explicit dimensions and lazy loading.
3. **Data**: cache expensive reads (`unstable_cache`, ISR, or static generation). Parse CSVs at build time when possible.
4. **Rendering**: prefer Server Components. Move `"use client"` as deep in the tree as possible.
5. **Fonts**: use `next/font` to self-host and avoid layout shift.
6. **CSS**: purge unused styles. Prefer utility classes or CSS Modules over global CSS.

## Token Efficiency Checklist
1. Agents read `ops/CURRENT.md` first, not the full ops tree.
2. Data files accessed via `.head()` or typed adapters, never dumped raw.
3. Skills loaded on demand, not always-on.
4. Change entries are single-line appends, not full-file rewrites.

## Workflow
1. Identify the bottleneck (bundle size, data fetch, render path, or token bloat).
2. Measure before fixing: use Lighthouse, `next build` output, or profiling tools.
3. Apply the smallest effective change.
4. Measure again to confirm improvement.
