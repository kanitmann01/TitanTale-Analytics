# Claude / AI context

Canonical design source of truth: `.impeccable.md` (includes implementation quick reference). The section below is kept in sync for assistants that read `CLAUDE.md`.

## Design Context

### Users

Primary audience: people who follow **T90 Titans League** and **Age of Empires II** at a competitive level -- viewers, community analysts, and fans comparing players, civilizations, maps, and matchups. They use the site to **explore structured tournament data** (tables, charts, research summaries) rather than casual browsing. Context is often desktop-first deep dives; mobile should remain usable (nav scroll, fluid type) without hiding core tasks.

*Refine with project owner:* primary persona (caster vs. data nerd vs. casual fan), and whether compare/pro workflows need extra emphasis.

### Brand Personality

**Inferred from implementation:** prestigious tournament **ledger** -- serious analytics with a **medieval / regal** accent (display serif, gold/bronze, navy void). Voice in UI: concise labels, uppercase section markers where used, no gimmicky copy.

**Working three-word personality:** *authoritative, crafted, arena-lit.*

*Refine with project owner:* your own three words, plus any tie-in to T90 or Liquipedia tone guidelines if they exist.

### Aesthetic Direction

- **Visual tone:** Dark-only experience today (`--color-bg` navy stack, warm off-white text). Gold and bronze for hierarchy and emphasis; cool blue accent for links/data series; semantic win/loss greens and reds where needed.
- **Typography:** **Cinzel** (`font-display`) for brand and headings; **Plus Jakarta Sans** (`font-body`) for UI and body. Fluid type scale utilities in `globals.css` (`text-fluid-*`).
- **Surface language:** Raised panels (`.panel`, `.panel-accent`, `.panel-inset`), subtle grain overlay, gradient dividers with gold mid-tone, optional `.lift` hover on interactive cards.
- **Motion:** Stagger-friendly animation utilities with **`prefers-reduced-motion: reduce`** disabling transforms (see `globals.css`).
- **References (implicit):** high-end game stats sites and editorial dark UIs -- not generic SaaS dashboard templates.
- **Anti-patterns (from project design-polish skill):** pure black/white flats, clichéd "AI" purple gradients, card-within-card clutter, decorative motion that obscures data.

*Refine with project owner:* explicit reference URLs/apps, things the product must **not** resemble, and whether **light mode** is in scope later.

### Design Principles

1. **Data first.** Charts and tables are the hero; chrome supports scanability (contrast, spacing, clear hierarchy).
2. **One coherent palette.** Use `ttl.*` / `:root` CSS variables and Tailwind extensions -- avoid one-off hex except for chart series already mapped to tokens.
3. **Tactile but restrained.** Grain, gold dividers, and lift states add depth; avoid noise that competes with numbers.
4. **Motion serves clarity.** Prefer opacity/transform; respect reduced motion; use stagger classes for page entry, not constant animation.
5. **Would a user say "AI slop"?** If yes, adjust typography, spacing, or asymmetry until the UI feels intentional (see `.cursor/skills/design-polish/SKILL.md`).

### Accessibility and inclusion (baseline)

- Respect **`prefers-reduced-motion`** (already in CSS).
- Keep text/background contrast strong on the dark theme; gold on dark passes for accents, not long body copy -- body remains warm off-white on navy.
- *Refine with project owner:* target WCAG level (A/AA), color-blind testing expectations for win/loss and multi-series charts, and any known audience needs.
