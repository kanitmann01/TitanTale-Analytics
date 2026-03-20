# Performance Audit Report

Date: 2026-03-20
Auditor: Performance Agent
Scope: Bundle size, caching, rendering cost

## Executive Summary

The TTL Stats web application demonstrates solid performance fundamentals with staticsite generation and Server Components. The First Load JS bundle is reasonable at 87-96 kB. Key optimization opportunities exist in data caching and CSS delivery.

## Bundle Size Analysis

### Current Metrics

| Route | Page Size | First Load JS | Status |
|-------|-----------|---------------|--------|
| / | 183 B | 96 kB | Acceptable |
| /players | 183 B | 96 kB | Acceptable |
| /civilizations | 183 B | 96 kB | Acceptable |
| /maps | 183 B | 96 kB | Acceptable |
| /test-data | 138 B | 87.2 kB | Good |

### Shared JS Breakdown

| Chunk | Size | Purpose |
|-------|------|---------|
| chunks/fd9d1056...js | 53.6 kB | React/Next.js core |
| chunks/117-87f8b6df...js | 31.6 kB | Framework utilities |
| other shared chunks | 1.86 kB | Misc |

### Dependencies Analysis

| Package | Version | Impact |
|---------|---------|--------|
| next | 14.2.28 | Core framework |
| react | 18.3.1 | UI library |
| react-dom | 18.3.1 | React DOM |
| zod | 4.3.6 | Schema validation (~40 kB gzip) |

**Assessment**: Bundle sizes are within acceptable ranges for a data visualization app. The 53.6 kB core chunk is typical for Next.js 14.

## Caching Analysis

### Current State: No Caching

The data adapters (`web/lib/data/*.ts`) parse CSV files on every call without caching:

```typescript
// player-stats.ts:6-13
export function getPlayerStats(): PlayerStats[] {
  const rows = parseCSV(dataFilePath("player_statistics.csv"));
  return rows.map((row) => PlayerStatsSchema.parse({...}));
}
```

**Impact**: Each page render re-parses CSV and re-validates with Zod. For static generation this is acceptable (happens once at build time). For SSR or ISR, this would be a significant bottleneck.

### Recommendations

1. **Static Generation (Current - Good)**: Continue using static generation. No caching needed since data is frozen at build time.

2. **Future ISR/SSR**: If revalidating data is needed:
   - Add request-scoped caching with `unstable_cache`
   - Consider in-memory LRU cache for parsed CSVs
   - Pre-parse and serialize to JSON at build time

## Rendering Cost Analysis

### Component Architecture

All pages use Server Components by default (no `"use client"` directive). This is optimal for:

- No hydration overhead
- Zero client-side JavaScript for data fetching
- Automatic code-splitting

### Identified Costs

1. **Google Fonts Loading** (`layout.tsx:5-14`)
   - Cinzel (display): 400, 700, 900 weights
   - Plus Jakarta Sans (body): variable weights
   - **Impact**: ~30-50 kB font files loaded from CDN

2. **CSS-in-JS**: None (Tailwind) - Good

3. **Animation Classes**: Custom animations in page components
   - `animate-fade-up`, `stagger-*` classes
   - **Impact**: Minimal (CSS animations)

4. **Data Transformation** (`page.tsx:82-87`)
   - `reduce()` operations to find top player/civ
   - **Impact**: Negligible for current data size (~100-500rows)

### Client-Side JavaScript

None detected. All pages are static HTML with CSS animations.

## Recommendations

### High Priority

1. **Pre-computed Static Data (Recommended)**
   - Convert CSV parsing to a build-time process
   - Output pre-computed JSON for faster page generation
   - Reduces build time and eliminates Zod validation at runtime

2. **Font Optimization**
   - Reduce Cinzel weights to only needed (700 for headings)
   - Consider `font-display: swap` for faster initial paint
   - Audit if all three weights are actually used

### Medium Priority

3. **Image Optimization** (Future)
   - If adding visualizations from `assets/`, use `next/image`
   - Serve optimized WebP format
   - Lazy load below-fold images

4. **Bundle Monitoring**
   - Add `@next/bundle-analyzer` to CI pipeline
   - Set size budgets: warn at 100 kB, error at 150 kB First Load JS

### Low Priority

5. **CSS Purge Verification**
   - Verify Tailwind is purging unused styles
   - Current config looks correct (`tailwind.config.ts:4-8`)

## Performance Budgets

| Metric | Budget | Current | Margin |
|--------|--------|---------|--------|
| First Load JS | 100 kB | 96 kB | 4% remaining |
| Page Size | 5 kB | 183 B | Excellent |
| Time to First Byte | 200 ms | Static | N/A |
| Total Bundle | 150 kB | ~96 kB | 36% margin |

## Conclusion

The TTL Stats web app is well-optimized for its current use case. Static generationeliminates most performance concerns. The primary optimization opportunity is reducing font payload and establishing build-time data pre-computation for faster builds.

**Rating**: 8/10 - Good performance foundation with minor improvements available.

---

## Appendix: Build Output

```
Route (app)                              Size     First Load JS
+ First Load JS shared by all            87.1 kB
  - chunks/fd9d1056...js                53.6 kB (React core)
  - chunks/117-87f8b6df...js            31.6 kB (utils)
  - other shared chunks                  1.86 kB

All routes: Static prerendered (SSG)
```