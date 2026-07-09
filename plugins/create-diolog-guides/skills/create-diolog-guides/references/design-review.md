# Design Review Ledger - Diolog Guides

The design-layer twin of `create-diolog-content`'s `diolog-voice-review.md`: reviewer corrections on shipped guides, each generalised to the failure class it exemplifies. **This file exists because routed feedback needs a receiver** - the first guide review's design items were "routed to the design skill" in a copy ledger and then applied by nobody, because nothing here received them. When any skill routes a design/layout item to this plugin, it lands here; when you build or revise a guide, read this file alongside `emphasis-and-legibility.md` and apply or explicitly overrule every open item.

Entry format: **instance** (reviewer's words) → **class** → **rule** → **status** (open / encoded in `<file>` / overruled: reason).

## Review: Amy on the 30-investor-questions guide (2026-07)

1. **Instance:** "I do not understand why there is a grid on the front cover. It does not feel very Diolog." / back cover: "The grid in the background is not necessary."
   **Class:** decorative texture inherited from the design system's navy-band idiom without earning its place on this artifact; brand judgment overruled by a cached token.
   **Rule:** the mono grid texture is not a default - navy bands ship clean unless the reviewer approves the texture for that artifact. More generally: a background texture must survive the same "why is this here" question as a word.
   **Status:** open - remove from the guide's covers (master file Part 1 and both cover image prompts) at next render; DESIGN-Website.md's navy-band spec should mark the grid optional-not-default.

2. **Instance:** "The table of contents at the bottom of the front cover is really hard to read... should be easier to read and vertically arranged, rather than sitting next to each other horizontally."
   **Class:** navigation furniture set for looks (a horizontal strip) instead of scanning (a vertical list).
   **Rule:** ToC and any list a reader must actually use is vertically stacked; horizontal arrangements are for decoration only.
   **Status:** encoded here; the revised master removed the cover ToC entirely - if a ToC returns, it returns vertical.

3. **Instance:** category chips read A, D, B, E, C, F ("I read it left to right... does not feel intentional").
   **Class:** column-major layout in a row-major reading culture.
   **Rule:** grouped sequences order across rows or stack vertically.
   **Status:** encoded in `emphasis-and-legibility.md` and SKILL.md's emphasis-budget bullet.

4. **Instance:** "The 'A / Strategy and Business' section at the top is not clear... not enough text hierarchy, so I am not naturally reading it as the title of the section."
   **Class:** section opener indistinguishable from a content page; hierarchy flattened to decoration.
   **Rule:** a section opener must be unmistakable at arm's length - size step and spatial change, not another styled strip.
   **Status:** encoded in SKILL.md's emphasis-budget bullet; verify per guide in the archetype gate.

5. **Instance:** "The typewriter-style text for 'why they ask', 'good answer', and 'the trap' needs to be slightly bigger and easier to read." Plus the compounding italics overload across pages 3-4.
   **Class:** micro-chrome below the legibility floor; emphasis systems stacking per page.
   **Rule:** mono chrome >= 11px, labels sized to be read; per-page emphasis budget in `emphasis-and-legibility.md`.
   **Status:** encoded in `emphasis-and-legibility.md`; the master file's Part 1 foundation must state the same size as its layout notes (a 7.5-8pt restatement survived the first revision - sweep restatements when a spec changes).

6. **Instance:** "This page [19, sources/verification] does not feel necessary and can be removed."
   **Class:** back matter shipped by default; production apparatus given a reader-facing page.
   **Rule:** back matter earns its place page by page. With citations inline, a sources page needs a positive reason to exist (counsel requirement, distribution-channel requirement); the default is cut. Overruling a reviewer's explicit cut is the content owner's call, stated in the delivery note - never a silent keep.
   **Status:** open - decision owed to Amy on the current master (kept in slimmed form without a stated overrule).

7. **Instance:** "The product mock-up... is not clear enough that this is what Diolog does. Add a short piece of guidance or description around the mock-up, but not inside the mock-up itself."
   **Class:** product imagery legible as decoration; the bridge to the reader's job missing (copy side lives in the voice ledger).
   **Rule:** every product slice gets adjacent use-bridge copy (outside the mock), and the render must leave room for it - the panel and its bridge are one unit in the page map.
   **Status:** encoded here; verify per guide in the archetype gate.

8. **Instance:** "The dots in the HTML background sometimes behave strangely."
   **Class:** decorative canvas effects with unstable rendering across viewports/print.
   **Rule:** background effects must be verified in the rendered artifact (screen scroll + print emulation + crops), not assumed from CSS; anything that "sometimes behaves strangely" is cut, not tuned.
   **Status:** encoded here; falls under the Looking Contract.

## Adding the next review

One entry per item, reviewer's words as the instance. Every routed-in item from another skill's review lands here with a status; an item may be **overruled** only with a stated reason delivered back to the reviewer - "open" items are debts, and a guide does not ship while an open item that applies to it is unaddressed and unstated.
