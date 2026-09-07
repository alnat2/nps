---
name: content-audit
description: Compare Figma text variables directly with mapped project code without changing either side. Use when the user asks to verify synchronization, find drift, or inspect missing and stale content mappings. Figma is the source of truth and desktop is the primary reference.
---

# Content Audit

## Contract

Audit the direct pipeline without mutating Figma or project files:

```txt
Figma text variables -> project code
```

Do not include `utils/content/token.json` in the comparison.

## Workflow

1. Resolve the Figma file and requested sections, collections, or pages.
2. Read Figma string variables and desktop text-layer bindings for that scope.
3. Read code elements with `data-token="collection/variable/path"`.
4. Normalize only declared rendering behavior:
   - preserve layout breaks for `data-token-preserve-br`;
   - compare bullet strings with list items for
     `data-token-list="bullet"`;
   - compare content order separately from text values.
5. Report findings by mapping path.

## Findings

Distinguish these states:

- value mismatch: code differs from the Figma variable;
- missing variable: code references a path absent from Figma;
- missing code mapping: expected desktop content has no mapped code element;
- ambiguous binding: desktop text is not bound clearly enough to determine its
  variable;
- unused Figma variable: present in Figma but not used in the audited code scope;
- structural warning: mapped markup cannot be compared safely.

Unused variables are coverage information, not an automatic failure. Do not say
"everything matches" if other discrepancies or ambiguous bindings remain.

## Stop Lines

- Do not edit files, Figma variables, or Figma bindings.
- Do not stage or commit.
- Do not use JSON as an audit source.
- Do not infer mappings from equal text.
- If the user asks to fix findings, use `figma-sync-content` for the requested
  scope.
