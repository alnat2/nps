---
name: figma-section-implementation
description: Implement a section or breakpoint from a Figma design into this static site. Use when the user provides a Figma link and asks to build, update, align, or verify a section in HTML/CSS. This skill emphasizes source reading, precise Figma extraction, scoped implementation, local visual verification, and clear communication.
---

# Figma Section Implementation

## Overview

Implement one section or one breakpoint from Figma into the NPS static site while preserving the existing project structure. Treat Figma as the source of truth for both visuals and text content, project documentation as process guardrails, and local code as the delivery target.

This skill is for layout and visual implementation. It must also perform the first code mapping from Figma variables for newly implemented text. For later text synchronization, use `figma-sync-content`; use `content-audit` for read-only verification.

## Communication Contract

1. If the user asks a question, answer the question first.
   - Do not edit files or run mutating commands until the user explicitly asks for implementation or approves the next step.
   - If the request is ambiguous, ask before changing code.

2. When reporting Figma work, refer to Figma layer, frame, or component names.
   - Do not expose raw node IDs unless the user asks for them or they are needed for debugging.

3. Do not report completion until verification is done or a blocker is clearly stated.
   - If browser or screenshot verification cannot run, say exactly what was verified and what was not.

## Required Inputs

- Figma link, or an already known Figma target.
- Target breakpoint or viewport, such as desktop, tablet, or mobile.
- Target section name, frame name, or clear user instruction.

If any of these are missing and cannot be inferred safely, ask for clarification before editing.

## Workflow

### 1. Read Project Context

Before implementing, inspect the local project:

- Read `.agents/AGENTS.md`.
- Check `git status --short`.
- Inspect nearby HTML/CSS for the target section.
- Prefer existing class names, CSS variables, assets, component patterns, and breakpoint conventions.
- Do not overwrite or revert unrelated user changes.

### 2. Extract Figma Context

Use Figma MCP as the primary source:

- Get design context for the target frame/node.
- Retrieve or capture a Figma screenshot for the exact target breakpoint.
- Record the visible Figma layer/frame names relevant to the work.
- Extract exact typography, spacing, dimensions, colors, effects, assets, and text line breaks when they affect layout.

Do not guess values that are available in Figma. If Figma data is incomplete or inconsistent, state the uncertainty and ask if needed.

### 3. Handle Assets

When Figma assets are needed:

- Use MCP asset tools to obtain the asset URL or screenshot source.
- Download assets with `curl` to the project, using an appropriate `assets/` subdirectory.
- Prefer a single exported SVG/group when the Figma layer is meant to be one decorative object.
- Do not recreate Figma SVG/icon art with ad hoc HTML tags when a real asset exists.
- Keep desktop-only, tablet-only, or mobile-only assets scoped to their breakpoints.

### 4. Map Figma Content Variables

When implementing new text from Figma, add the initial code mapping at the same time as the markup:

- Use the desktop Figma variant as the canonical reference for content and mapping.
- Read the string variable bound to each desktop text layer.
- Map the Figma collection and variable name using the shared path `collection/variable/path`.
- Add `data-token="collection/variable/path"` to the HTML element that owns that text.
- Use `data-token-preserve-br` when an existing or Figma-required line break is part of layout.
- Use `data-token-list="bullet"` on `<ul>` or `<ol>` when a multiline Figma variable renders list items.
- If a desktop text layer is not bound to a variable, do not invent a mapping or match by text. Report that the Figma binding is missing.
- If the same semantic text appears in tablet or mobile HTML for the requested work, use the same `data-token` path there too.

This step maps existing Figma variables into code. Do not create or change Figma text-layer bindings unless the user explicitly includes that work.

### 5. Implement Narrowly

Change only what the requested section needs:

- Preserve existing section wrappers and navigation anchors.
- Take text content from Figma variables. Do not use local JSON or current rendered text as the canonical value.
- Keep layout, spacing, visual styling, and responsive behavior in CSS.
- Avoid broad refactors, breakpoint rewrites, or architecture changes during section implementation.
- Avoid fixed heights unless Figma requires a fixed visual frame and content overflow is intentionally controlled.
- For buttons, tags, badges, and pills, center text horizontally and vertically by default.

### 6. Breakpoint Discipline

Implement only the requested breakpoint unless the user asks for all breakpoints.

- Desktop: preserve desktop layout and do not accidentally affect tablet/mobile.
- Tablet: inspect tablet-specific media blocks and existing reset rules.
- Mobile: verify horizontal overflow, line breaks, menu overlap, and carousel behavior when relevant.

If a shared rule affects other breakpoints, call that out and scope it before finishing.

### 7. Local Verification

For new sections or breakpoint work, verify locally:

1. Start or reuse a local server when the page needs HTTP.
2. Capture the local viewport with browser automation when available.
3. Compare local screenshot against the Figma screenshot.
4. Iterate until the visual match is acceptable.
5. Run lightweight code checks such as `git diff --check`.

If a screenshot tool produces generated artifacts, remove or restore those artifacts unless the user asked to keep them.

Do not rely only on visual intuition. Use dimensions, screenshots, overlays, or targeted DOM measurements when practical.

### 8. Final Report

Keep the final report short:

- Say what section/breakpoint was implemented.
- Mention files changed.
- Mention verification performed.
- Mention any unverified part or blocker.
- Do not claim “ready” if tests or visual checks were skipped.

## Stop Lines

- Do not mutate files when the user only asks a question.
- Do not add new documentation, scripts, or architecture unless the user asks or approves it.
- Do not create new content-sync mechanisms while implementing layout; use the content sync skills instead.
- Do not skip initial code `data-token` mapping when the desktop Figma text layer has a variable binding.
- Do not create or change Figma variables or text-layer bindings unless the user explicitly asks.
- Do not commit unless the user explicitly asks for a commit.
- Do not include unrelated dirty files in a commit.
