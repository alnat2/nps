---
name: project-sync-content
description: Render this project's local content tokens into project files. Use when the user asks to update `index.html`, templates, or generated project output from `utils/content/token.json`, especially for the Experience section. This skill consumes local JSON and writes project files only; it must not read from or sync Figma.
---

# Project Sync Content

## Overview

Apply `utils/content/token.json` to the static site while preserving existing layout, classes, accessibility attributes, and visual behavior. Treat JSON as the source of truth and rendered HTML as derived output.

## Workflow

1. Read the local content file.
   - Canonical path: `utils/content/token.json`.
   - Parse JSON before editing project files.
   - For `experience`, use the object key order unless an explicit order field is later added.

2. Validate required Experience fields before rendering.
   - Required item fields: `tag`, `dates`, `title`, `par1title`, `par1info`, `par2title`, `par2info`.
   - Each field must have a string `$value`.
   - Parse `par2info` by splitting on newline, trimming each line, and removing one leading `•` plus surrounding whitespace for list text.

3. Update the smallest possible region.
   - Current target: the Experience timeline inside `index.html`.
   - Preserve existing section wrappers, class names, comments where useful, and link targets.
   - Prefer adding stable generator markers around generated regions before replacing large HTML blocks.

4. Escape rendered text.
   - Insert text safely as HTML text content, not raw HTML.
   - Preserve intentional line breaks only when the design already requires them.

5. Verify the output.
   - Re-parse JSON.
   - Inspect the rendered HTML diff.
   - For visual-risk changes, run the existing Puppeteer checks or targeted screenshot checks when practical.

## Rendering Contract

Experience cards render as:

- `.job-date` from `dates.$value`
- `.tag.fancy` from `tag.$value`
- job heading from `title.$value`
- first `<strong>` from `par1title.$value`
- first paragraph from `par1info.$value`
- second `<strong>` from `par2title.$value`
- `<li>` items from parsed `par2info.$value`

## Stop Lines

- Do not contact Figma or change Figma data.
- Do not change `utils/content/token.json` unless the user explicitly asks to fix local content.
- If the user asks only for a report, use `content-audit` instead.
