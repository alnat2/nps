---
name: content-audit
description: Audit content consistency across Figma variables, `utils/content/token.json`, and rendered project files without changing anything. Use when the user asks to compare, verify, check drift, find mismatches, or inspect whether Figma, JSON, and HTML are synchronized. This skill is read-only by default and should report discrepancies instead of editing files.
---

# Content Audit

## Overview

Compare the content pipeline without mutating state. Use it to answer "what is out of sync?" before running `figma-sync-content` or `project-sync-content`.

## Workflow

1. Determine audit scope.
   - If a Figma source is provided, compare Figma -> JSON -> HTML.
   - If no Figma source is provided, compare JSON -> HTML and clearly state that Figma was not checked.

2. Read sources without writing.
   - Figma source: approved text variables from the requested collection.
   - JSON source: `utils/content/token.json`.
   - HTML source: current rendered project files, starting with `index.html`.

3. Normalize before comparison.
   - Compare field paths such as `experience.optima.par2info`.
   - For `par2info`, treat a single string with `•` and newlines as equivalent to rendered `<li>` items after trimming bullet markers and whitespace.
   - Preserve order checks separately from text checks.

4. Report findings.
   - Group by source pair: Figma vs JSON, JSON vs HTML.
   - For each mismatch, include path, expected value, actual value, and suggested next action.
   - Distinguish missing field, extra field, order mismatch, and text mismatch.

## Current Contract

Current local source of truth: `utils/content/token.json`.

Current Experience order:

1. `optima`
2. `finpro`
3. `xlab`

Current Experience fields:

- `tag`
- `dates`
- `title`
- `par1title`
- `par1info`
- `par2title`
- `par2info`

## Stop Lines

- Do not edit files.
- Do not stage or commit.
- If the user asks to fix mismatches after the report, switch to `figma-sync-content` or `project-sync-content` based on which source should change.
