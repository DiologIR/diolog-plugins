# positioning-pipeline

An end-to-end **product-positioning pipeline** for Claude Code, grounded in four canonical positioning books — Al Ries & Jack Trout *Positioning*, April Dunford *Obviously Awesome*, Kim & Mauborgne *Blue Ocean Strategy*, and David C. Baker *The Business of Expertise*.

From a company context it runs two phases:

### Phase 1 — Brief → two Gemini Deep Research prompts + a launcher
- Generates **two** copy-paste-ready Google Gemini Deep Research prompts:
  - **Prompt A — positioning research** (decision-grade: candidate positions, demand & category language, pain-point mining, competitor trajectory, beachhead ranking).
  - **Prompt B — product & market research** (a customer/market-intelligence persona: segments, jobs-to-be-done, pain mining, the competitive/tooling landscape, adoption & pricing).
- Renders a **single self-contained HTML launcher** with copy buttons, a Gemini link, and two **animated** instructions: select **Deep research** from the **+** menu, then **Share & Export → Copy contents** to retrieve each report.

### Phase 2 — Two reports → three positioning options + a decision page
- When the two Gemini reports come back, synthesises **three genuinely distinct positioning territories** as Markdown (Dunford's six components, the word + the enemy, the Blue Ocean ERRC, a four-framework scorecard, copy, objections, risks).
- Builds a **stylised interactive HTML decision page** — side-by-side cards, a live *weigh-what-matters* scorer, a comparison table, feel-the-copy hero previews, and an honest recommendation.

## Usage
Invoke the `positioning-pipeline` skill with a product/company to position (Phase 1), or by bringing back Gemini Deep Research output to turn into options (Phase 2). The skill carries its own framework references, the product-research persona, the Gemini prompt architecture, and the two HTML templates — so it runs without the `deep-research-prompt-creator` plugin (though it will use it if present).

## Honesty
The skill never invents demand, never markets an unbuilt capability as shipped, traces every positioning move to a product attribute + evidence, flags unverified research stats, and refuses "all-in-one" framing.

— DiologIR
