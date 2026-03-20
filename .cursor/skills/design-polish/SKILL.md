---
name: design-polish
description: Review and refine UI for visual quality, typography, spacing, color, motion, and responsiveness. Use when polishing interfaces or enforcing the impeccable style quality bar.
---

# Design Polish

## Scope
Visual refinement pass on any UI in `web/`.

## Review Checklist
1. **Typography**: distinctive font pairing, fluid scale, clear hierarchy.
2. **Color**: cohesive palette via CSS custom properties, no pure black/white, no "AI palette."
3. **Layout**: varied spacing, intentional asymmetry, no card-in-card nesting.
4. **Motion**: staggered reveals, ease-out transitions, transform/opacity only, respects reduced-motion.
5. **Responsiveness**: container queries where useful, mobile adapts rather than hides.
6. **Empty states**: teach the interface, not just "nothing here."
7. **Quality gate**: would someone immediately say "AI made this"? If yes, redesign.

## Workflow
1. Take a snapshot or screenshot of the current state.
2. Walk through each checklist item and note issues.
3. Fix issues in priority order: typography > layout > color > motion > micro-details.
4. Re-check against the quality gate.

## Token Discipline
- Only read the component files being polished. Do not load unrelated pages.
