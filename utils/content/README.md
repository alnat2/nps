# Content Sync

Figma is the single source of truth for text content in this project.

The active content pipeline is:

```txt
Figma text variables -> project code
```

`utils/content/token.json` is not part of the active pipeline. Do not use it as
an intermediate store or source for synchronization. `scripts/sync-html.js` is
also legacy and must not be used for Figma-to-code updates.

## Primary Design

The desktop Figma layout is the primary design version.

Use desktop to determine:

- the canonical text value;
- which Figma variable a code element maps to;
- content order and structure when adaptive layouts differ;
- intentional line breaks that affect the desktop layout.

Tablet and mobile are adaptive representations. They may change layout and line
breaks, but they do not override desktop content or define separate content
tokens unless the Figma variable itself is explicitly breakpoint-specific.

## Figma Variables

Content comes from Figma string variables. A code mapping uses this path:

```txt
collection/variable/path
```

Example:

```txt
Figma collection: experience
Figma variable: optima/dates
Code path: experience/optima/dates
```

In HTML, keep the mapping explicit:

```html
<span data-token="experience/optima/dates">...</span>
```

`data-token` is a code-side reference to a Figma variable. It is not a reference
to JSON.

Do not infer mappings from matching text alone. If a Figma text layer is not
bound to a variable or the intended variable is ambiguous, report the missing
mapping instead of guessing.

## Rendering Rules

Plain text replaces only the text owned by the mapped element. Preserve its
classes, attributes, links, accessibility markup, and surrounding structure.

Use `data-token-preserve-br` when code must preserve layout `<br>` elements:

```html
<h1 data-token="hero/title" data-token-preserve-br>...</h1>
```

Use `data-token-list="bullet"` when a Figma string contains bullet items that
must render as list elements:

```html
<ul data-token="experience/optima/par2info" data-token-list="bullet">...</ul>
```

## Workflow

1. Update and approve text variables in the desktop Figma design.
2. Run `figma-sync-content` to read those variables and update mapped code.
3. Run `content-audit` to compare Figma variables with code without changing
   either side.

`project-sync-content` remains a process wrapper for a full project update. It
uses the same direct Figma-to-code contract and does not introduce another
content source.

## Boundaries

- Do not update content in JSON first.
- Do not push code text back into Figma during normal synchronization.
- Do not treat tablet or mobile text as canonical when desktop exists.
- Do not require every Figma variable to appear on every page.
- A code mapping that has no matching Figma variable is an error.
- An unused Figma variable is coverage information unless the user asks for
  cleanup.
