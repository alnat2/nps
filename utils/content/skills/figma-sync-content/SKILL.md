---
name: figma-sync-content
description: Sync this project's local content tokens from `utils/content/token.json` into Figma text variables. Use when the user asks to push, update, refresh, normalize, or clean up Figma Variables from the JSON source of truth, especially for collections listed in `nps-content-sync.syncedCollections`. This skill writes Figma variables only, may delete stale Figma variables only with explicit user approval, and must not update JSON, `index.html`, templates, CSS, or rendered output.
---

# Figma Sync Content

## Overview

Update Figma text variables from `utils/content/token.json` while preserving this project's content-token contract. Treat JSON as the source of truth and Figma variables as derived content.

## Workflow

1. Confirm the Figma target is available.
   - If the user has not provided a Figma URL, file key, node, or already-open Figma context, ask for the target before changing Figma.
   - Use Figma MCP tools when available. For writes or programmatic Figma inspection with `use_figma`, load the `figma-use` skill first.

2. Read local content from `utils/content/token.json`.
   - Parse JSON before touching Figma.
   - Treat `nps-content-sync.syncedCollections` as the default collection allowlist.
   - If the user names specific collections, sync only those collections and verify they are present in JSON.
   - Preserve DTCG-style fields: `$type`, `$value`, `$description`, `$extensions`.

3. Flatten JSON tokens into Figma variable paths.
   - Sync only entries with `$type: "string"` and a string `$value`.
   - Use the top-level JSON key as the Figma variable collection name.
   - Use nested JSON keys as the variable path joined with `/`.
   - Example: `top-nav.menu.item1.$value` maps to collection `top-nav`, variable `menu/item1`.
   - Preserve multiline strings such as `experience.*.par2info` exactly as JSON stores them, including `•` and newline separators.

4. Update Figma variables.
   - Create missing variable collections when they are listed in `syncedCollections`.
   - Create missing string variables inside those collections when a JSON token path has no matching Figma variable.
   - Update existing variable values from JSON.
   - Prefer text-content scopes for string variables when Figma supports scopes.
   - Do not bind variables to Figma text layers.

5. Detect stale Figma variables.
   - After reading Figma variables, compare every variable in synced collections against the flattened JSON token paths.
   - Treat variables that exist in Figma but not in JSON as stale / extra variables.
   - Report stale variables separately from value mismatches.
   - Do not say "no discrepancies" when stale variables exist. Say "all JSON tokens match Figma, but Figma has stale variables" instead.

6. Delete stale Figma variables only when explicitly allowed.
   - If the user asks only to sync JSON to Figma, do not delete stale variables.
   - If stale variables are found and the user has not explicitly approved deletion in the current request, ask before deleting them.
   - If the user explicitly asks to delete stale variables, clean up only variables inside `nps-content-sync.syncedCollections` that are absent from JSON.
   - Never delete whole variable collections unless the user explicitly names collection deletion.
   - Report every deleted variable by collection/name.

7. Validate the result.
   - Re-read or inspect the changed Figma variables after writing.
   - Confirm every synced JSON string token has a matching Figma variable with the same value.
   - If cleanup was approved, confirm stale variables inside synced collections were removed.
   - Report changed collections, created variables, updated variables, stale variables, deleted variables, and any Figma write failures or ambiguous duplicate variables.

## Stop Lines

- Do not edit `utils/content/token.json`.
- Do not update `index.html`, templates, CSS, or assets.
- Do not search for, edit, or bind Figma text layers.
- Do not delete Figma variables unless the user explicitly approves stale-variable cleanup.
- Do not delete Figma variable collections unless the user explicitly names collection deletion.
- If Figma contains duplicate variables for the same collection/path, report the ambiguity instead of guessing.
- If the task is to render JSON into HTML, use `project-sync-content` instead.
- If the task is only to compare sources, use `content-audit` instead.
