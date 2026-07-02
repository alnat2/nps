# Technical Debt

## CSS architecture: mobile-first refactor

Status: planned, optional.

The current `style.css` is organized by full breakpoint rewrites:

- base styles for header and hero
- `@media (min-width: 1280px)` for desktop sections and footer
- `@media (max-width: 1279px)` tablet reset
- `@media (min-width: 768px) and (max-width: 1279px)` for tablet
- `@media (max-width: 767px)` for mobile
- `@media (min-width: 375px) and (max-width: 767px)` for mobile padding overrides

This creates a lot of duplicated component styles for `.case-card`, `.job-card`, `.skill-card`, `.contact-right`, and related blocks.

Recommended future refactor:

- Move mobile styles to the base layer.
- Add tablet overrides in `@media (min-width: 768px)`.
- Add desktop overrides in `@media (min-width: 1280px)`.
- Keep shared component styles outside breakpoint-specific blocks.
- Preserve the current visual output with screenshot checks for mobile, tablet, and desktop.

Risk: high visual-regression risk. Do this as a separate branch/task after layout stabilization, not together with Figma section implementation.
