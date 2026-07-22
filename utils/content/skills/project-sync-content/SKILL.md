---
name: project-sync-content
description: Sync this project's local content tokens into HTML and other rendered project files. Use when the user asks to update code, HTML, templates, or project output from `utils/content/token.json`. This skill treats JSON as the source of truth, uses `scripts/sync-html.js` for deterministic HTML updates, writes project files only, and must not read from or sync Figma.
---

# Project Sync Content

## Overview

Apply `utils/content/token.json` to rendered project files while preserving layout, classes, accessibility attributes, and visual behavior.

Use this skill as the process wrapper for JSON -> code sync. The deterministic implementation is `scripts/sync-html.js`; prefer running or inspecting that script instead of hand-editing synced text.

## Workflow

1. Read the local content contract.
   - Canonical path: `utils/content/token.json`.
   - Read `nps-content-sync.syncedCollections`.
   - Ignore the `nps-content-sync` configuration block as content.
   - Treat only string tokens with string `$value` as syncable content.

2. Confirm HTML mapping exists.
   - Sync targets are elements with explicit `data-token`.
   - The token path format is `collection/path/name`, for example `experience/optima/dates`.
   - Do not infer mappings from matching text alone.
   - If mapping is missing, stop and say the HTML needs `data-token` attributes before automatic sync can update that content.

3. Run the deterministic sync script.
   - Default check: `node scripts/sync-html.js --check`.
   - Apply changes only when the user asked to update project files: `node scripts/sync-html.js`.
   - Use `--root <path>` or `--token-file <path>` only for non-standard locations.

4. Interpret sync results.
   - Missing in JSON: error. HTML references a token that does not exist.
   - Structural warnings: error until resolved. The script skipped content to avoid damaging markup.
   - Would change files in `--check`: expected when content is stale.
   - Unused tokens in HTML: coverage information, not a failure by itself.

5. Inspect the diff after applying.
   - Confirm changes are text-only unless the mapped element intentionally renders a list.
   - Preserve existing section wrappers, class names, links, ARIA attributes, comments, and responsive layout.
   - For visual-risk changes, run local browser or screenshot verification when practical.

## HTML Mapping Contract

Use one token path everywhere:

```html
<span data-token="experience/optima/dates">апр 2024 — настоящее время</span>
```

Line breaks must be explicit:

```html
<h1 data-token="hero/title" data-token-preserve-br>...</h1>
```

Lists must be explicit:

```html
<ul data-token="experience/optima/par2info" data-token-list="bullet">...</ul>
```

Do not add `data-token` attributes as part of this skill unless the user explicitly asks to map HTML. Mapping during Figma section implementation belongs to `figma-section-implementation`.

## Stop Lines

- Do not contact Figma or change Figma data.
- Do not change `utils/content/token.json` unless the user explicitly asks to fix local content.
- Do not bind Figma variables to text layers.
- Do not hand-edit rendered text when `scripts/sync-html.js` can perform the sync.
- If the user asks only for a report, use `content-audit` instead.
