---
name: figma-sync-content
description: Sync approved text content variables from Figma into this project's local content token file. Use when the user asks to import, refresh, pull, or normalize Figma Variables content into `utils/content/token.json`, especially for the Experience collection or future text-content collections. This skill writes JSON only and must not update `index.html`, templates, CSS, or rendered output.
---

# Figma Sync Content

## Overview

Import text variables from Figma into `utils/content/token.json` while preserving this project's content-token contract. Treat Figma as the upstream source and JSON as the local source of truth for later project rendering.

## Workflow

1. Confirm the Figma source is available.
   - If the user has not provided a Figma URL, file key, node, or already-open Figma context, ask for the source before changing files.
   - Use Figma MCP tools when available. If a write or programmatic Figma inspection requires `use_figma`, load the `figma-use` skill first.

2. Read current local content from `utils/content/token.json`.
   - Preserve collections that are not part of the requested sync.
   - Preserve DTCG-style fields: `$type`, `$value`, `$description`, `$extensions`.

3. Normalize imported Figma variables into project shape.
   - Current canonical path: `experience`.
   - Current canonical order: `optima`, `finpro`, `xlab`.
   - Current fields per experience item: `tag`, `dates`, `title`, `par1title`, `par1info`, `par2title`, `par2info`.
   - Store `par2info` as one string with bullet markers `•` and newline separators, because this maps cleanly to Figma text variables.

4. Update only `utils/content/token.json`.
   - Do not update `index.html`.
   - Do not generate HTML.
   - Do not edit CSS or assets.

5. Validate the result.
   - Parse JSON with Node before finishing.
   - Report changed collections and any missing or ambiguous Figma variables.

## Stop Lines

- If Figma content conflicts with the established project contract, report the mismatch instead of inventing a new structure.
- If the task is to render JSON into HTML, use `project-sync-content` instead.
- If the task is only to compare sources, use `content-audit` instead.
