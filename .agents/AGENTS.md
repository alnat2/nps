# Agent Rules

## Figma Assets
- When downloading assets or images from Figma, always use the MCP tools (`download_assets` or `get_screenshot`) to obtain the download URL, and then use the `curl` command to download the file directly to the disk. 
- Do NOT use the `enableBase64Response: true` option to fetch base64 inline images, as it consumes too many context window tokens.

## Communication Workflow
- **Answer First, Act Later:** When the user asks a question, ALWAYS answer the question first. If applicable, propose a plan of action or suggest what needs to be done next. DO NOT run any modifying commands or edit any code until the user explicitly approves the proposed plan or gives a direct instruction to execute it.
- **Figma References:** When reporting Figma work to the user, refer to elements by their Figma layer/frame/component names. Do not expose raw node IDs unless the user explicitly asks for them or they are needed for a debugging handoff.
- **Completion Updates:** When a task is complete, briefly let the user know in chat. Do not explain what was done unless the user explicitly asks for details, a summary, or a rationale.
- **Desktop First:** When Figma has desktop, tablet, and mobile variants and a content-token mapping decision is ambiguous, use the desktop version as the reference. Do not plan or perform tablet/mobile text-layer binding as part of this content-token pipeline.

## Strict Adherence
- **Do Not Invent:** If something is not explicitly stated in the design or documents, DO NOT invent or assume values (e.g., adding `100vh` just because it's common). If requirements are unclear or missing, ALWAYS ask the user for clarification before proceeding.

## Self-Verification Process
- **Figma to Local Verification:** For every new section or breakpoint:
  1. Retrieve the original screenshot from Figma.
  2. Implement the layout in HTML/CSS.
  3. **Viewport Size:** Ensure you set the correct viewport width before taking screenshots (e.g., using `puppeteer_evaluate` to set `document.documentElement.style.width = '375px'` or `document.body.style.width = '375px'` for mobile testing), because screenshot tools default to 800x600 and will miss mobile breakpoint issues.
  4. Take a screenshot of the local result.
  5. Compare the local screenshot against the Figma screenshot.
  6. Refine the code until it is a 100% visual match.
  7. Only report completion to the user AFTER this rigorous self-verification is fully satisfied.

## Typography Verification
- **Double Check Fonts:** Always use `get_design_context` from the Figma MCP to extract the exact font size, line-height, and font-weight for text elements. Never guess these values. Also, verify where the line breaks occur in Figma (e.g. by counting lines) and insert `<br class="mobile-only">` or similar tags to ensure the typography matches pixel-perfect.
- **Center Text in Controls:** For buttons, tags, badges, pills, and similar compact UI controls, text must be centered horizontally and vertically by default. Do not copy asymmetric Figma padding as a reason to visually offset the text, because Figma may use its own centering behavior. Only intentionally offset text in these controls when the user or the design documentation explicitly says that the text should be shifted.
