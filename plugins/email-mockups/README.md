# email-mockups

Turn a named Diolog feature (or several) into **email-ready product-mockup
graphics on a Figma canvas** — for product-update and marketing emails.

The graphics are *impressions, not replicas*: they convey the idea and impact of a
feature at a glance (like the small device graphic in the existing product-update
email), built on the real Diolog design system and the feature's real words.

## What it does

1. **Scopes** the request — which feature(s), which audience (web companies/IR, the
   IR-pro mobile app, or the investor mobile app).
2. **Gathers real context** — `docs/marketing/product-feature-guide.md`,
   `features-build/plain/NN-*.md`, and the React mock UI in
   `apps/web-design-system` and the `customer-mobile` / `investor-mobile` design
   systems (handling each mobile app's own section numbering).
3. **Plans** a small, deliberate set of graphics, choosing among four treatments:
   soft panel + peeking device (the house style), browser frame, phone bezel, and
   frameless fragment.
4. **Builds the HTML** via the **design-craft** skill, on the live Diolog tokens —
   one self-contained file of titled, spaced artboards.
5. **Verifies** the render in a browser.
6. **Builds it in Figma** via whatever *write-capable* Figma MCP is connected
   (the "Talk to Figma" family — a Figma plugin + socket bridge; the read-only Dev
   Mode MCP can't create frames).

If no write-capable Figma MCP is available, the **HTML file is retained as the
final deliverable** (each artboard still exports to PNG for the email).

## Requirements

- Run from inside (or alongside) the **dAIolog** repo — that's where the feature
  docs and the React mock UIs live.
- The **design-craft** plugin (same marketplace) for the build step.
- For the Figma step: a **write-capable** Figma MCP (e.g. a "Talk to Figma" bridge).
  Optional — without it you still get the HTML.
- A browser-automation skill (`playwright-cli` / `agent-browser`) or the Chrome MCP
  for the render verification.

## Bundled resources

- `skills/email-mockups/SKILL.md` — the orchestration pipeline.
- `skills/email-mockups/references/` — feature-context map, the mockup playbook, and
  the tool-agnostic Figma build guide.
- `skills/email-mockups/assets/` — the `mock-kit.css` (tokens + primitives) and a
  self-contained `artboard-template.html` with worked examples of each treatment.

## Triggers

"create email mockups for the question composer", "I need a product-update email
graphic for the disclosure consistency checker", "make a figma mockup of the smart
inbox for the investor email", "mock up the new calendar feature for the companies
email", or any "visual / graphic / representation of a feature for an email"
request.
