---
name: figma-sync-content
description: Sync approved Figma text variables directly into mapped project code. Use when the user asks to pull, update, or synchronize site content from Figma. Figma is the source of truth, desktop is the primary design, and no JSON intermediary is used.
---

# Figma Sync Content

## Contract

Read text content from Figma variables and update project code directly.

```txt
Figma text variables -> project code
```

Figma is the source of truth. Use the desktop design as the canonical reference
for content and initial mapping. Do not read from or write through
`utils/content/token.json`.

## Workflow

1. Resolve the Figma file and requested scope.
   - Use the Figma target supplied by the user or the established project file.
   - If the user names sections or collections, limit the sync to that scope.
   - Use the desktop frame to resolve content or mapping ambiguity.

2. Read Figma string variables.
   - Read the requested variable collections and their current values.
   - Address a variable as `collection/variable/path`.
   - Use text-layer bindings in the desktop design to establish which variable
     belongs to visible text.
   - If a required desktop text layer is not bound or is ambiguous, report it
     instead of matching by text alone.

3. Find explicit code mappings.
   - HTML targets use `data-token="collection/variable/path"`.
   - Do not infer a target from its current text.
   - A mapped code path with no matching Figma variable is an error.

4. Update code.
   - Replace only the content owned by the mapped element.
   - Preserve tags, classes, links, ARIA attributes, comments, and responsive
     structure.
   - Preserve existing layout breaks for `data-token-preserve-br`.
   - Render bullet strings as list items only for elements with
     `data-token-list="bullet"`.

5. Verify.
   - Inspect the diff and confirm changes are limited to requested content.
   - Re-read the updated mappings and compare their rendered values with Figma.
   - Report missing mappings, missing variables, ambiguous bindings, and
     structural content that could not be updated safely.

## Stop Lines

- Do not use `utils/content/token.json` or `scripts/sync-html.js` for this flow.
- Do not update Figma from code.
- Do not create or delete Figma variables unless the user explicitly asks.
- Do not bind or rebind Figma text layers unless the user explicitly asks.
- Do not let tablet or mobile override desktop content when desktop exists.
- Do not change layout or styling as part of a content-only sync.
- For a read-only comparison, use `content-audit`.
