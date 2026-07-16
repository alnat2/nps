# Content Tokens

`utils/content/token.json` is the local source of truth for text content in the project.

The content pipeline is:

1. `utils/content/token.json`
2. Figma text variables
3. `index.html` and other rendered project files

## File Location

Canonical file:

```txt
utils/content/token.json
```

All helper skills and content-sync logic live in:

```txt
utils/content/
```

## Token Shape

Text tokens use a DTCG-like structure:

```json
{
  "$type": "string",
  "$value": "Работы",
  "$description": "",
  "$extensions": {
    "mode": {}
  }
}
```

Only tokens with `"$type": "string"` and a string `$value` are synced as text content.

## Collections

Top-level keys are content collections.

Example:

```json
{
  "top-nav": {},
  "hero": {},
  "cases": {},
  "experience": {},
  "skills": {},
  "contact": {},
  "footer": {}
}
```

Each top-level collection maps to a Figma variable collection with the same name.

Nested JSON paths map to Figma variable names using `/`.

Example:

```json
"top-nav": {
  "menu": {
    "item1": {
      "$type": "string",
      "$value": "Работы"
    }
  }
}
```

maps to:

```txt
Figma collection: top-nav
Figma variable: menu/item1
```

## Synced Collections

The sync allowlist is stored in:

```json
"nps-content-sync": {
  "source": "utils/content/token.json",
  "target": "figma:variables",
  "syncedCollections": [
    "hero",
    "top-nav",
    "cases",
    "experience",
    "skills",
    "contact",
    "footer"
  ]
}
```

Only collections listed in `syncedCollections` should be synced to Figma and audited against rendered files.

## Updating Content

When text changes, update `utils/content/token.json` first.

Then run:

1. `project-sync-content`
   Updates `index.html` / rendered project files from JSON.

2. `figma-sync-content`
   Updates Figma text variables from JSON.

3. `content-audit`
   Checks that JSON, Figma variables, and rendered files are in sync.
