---
name: project-sync-content
description: Run the project's end-to-end content update from Figma into mapped code. Use when the user asks to refresh project content across pages or templates. This is a process wrapper around direct Figma-to-code synchronization; Figma is the source of truth and desktop is primary.
---

# Project Sync Content

## Purpose

Coordinate a project-wide content update without introducing another content
source. The pipeline is:

```txt
Figma text variables -> mapped project code -> verification
```

Use `figma-sync-content` as the synchronization procedure and `content-audit`
as the read-only verification procedure.

## Workflow

1. Confirm the Figma file and requested project scope.
2. Use desktop as the canonical design for content and mapping decisions.
3. Read Figma string variables and update explicit code mappings using the
   `figma-sync-content` contract.
4. Audit all affected pages against Figma.
5. Inspect the final diff and report unresolved mappings or unsafe structures.

## Code Mapping

Code references Figma variables with the shared path
`collection/variable/path`:

```html
<span data-token="experience/optima/dates">...</span>
```

Use `data-token-preserve-br` for layout breaks and
`data-token-list="bullet"` for list rendering. Do not infer mappings from text.

## Stop Lines

- Do not use `utils/content/token.json` as input, output, or an intermediate.
- Do not run `scripts/sync-html.js` for active content synchronization.
- Do not push code content back into Figma.
- Do not change Figma variables or bindings unless the user asks.
- Do not expand a requested section sync to unrelated pages or collections.
- If the user asks only for a report, use `content-audit`.
