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

## Mapping Content

Use one token path format everywhere:

```txt
collection/path/name
```

The same path is used for:

```txt
token.json key path
Figma variable name
HTML data-token value
```

Example:

```html
<span data-token="experience/optima/dates">апр 2024 — настоящее время</span>
```

maps to:

```txt
Figma collection: experience
Figma variable: optima/dates
JSON token path: experience/optima/dates
```

Use the desktop Figma variant as the reference when deciding which visible text maps to which token. Tablet and mobile text-layer binding is outside this pipeline.

Do the first mapping in small passes, not as one full-mockup operation. A good order is:

1. Header / top navigation
2. Hero
3. Cases
4. Experience
5. Skills
6. Contact / footer

For each pass:

1. Pick one desktop section in Figma.
2. Match visible desktop text to existing token paths.
3. Add `data-token` attributes to the matching HTML elements.
4. Use `data-token-preserve-br` only when existing `<br>` layout must be preserved.
5. Use `data-token-list="bullet"` on `<ul>` / `<ol>` elements generated from multiline bullet tokens.
6. Run the HTML sync/audit flow for that section before moving to the next one.

Do not infer that every token must appear in every HTML file. Tokens that are unused in the current page are coverage information, not an error. A real error is an HTML `data-token` value that does not exist in `token.json`.

## Updating Content

When text changes, update `utils/content/token.json` first.

Then run:

1. `project-sync-content`
   Updates `index.html` / rendered project files from JSON.

2. `figma-sync-content`
   Updates Figma text variables from JSON.

3. `content-audit`
   Checks that JSON, Figma variables, and rendered files are in sync.
