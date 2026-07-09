# Verification: what the harness can know, and what only you can

This is the most important file in this skill, because the failure it describes is not a design
failure. It is an epistemics failure, and it survives any amount of design skill.

## The shape of the mistake

A 20-page guide shipped with a 161px void on page three, a chip row wrapping `[5,1]`, and display
numerals sitting at 94px from their text on one page and 45px on the next. The person who
commissioned it found all three in about four seconds by looking at the page.

The harness that "verified" it reported **0 HIGH, 0 MED, 0 LOW**.

When the defects were shown as an image, they were identified instantly and correctly. So this was
never a perception problem. It was a **question** problem, a **coverage** problem, and a **liveness**
problem, in that order of importance.

## 1. The question you bring to an image determines what you see in it

Handed a screenshot with *"do you see anything wrong with this?"*, you find the defect in seconds.
Rendering your own screenshot, the implicit question is *"is this done?"*, and the answer comes back
"yes". Same pixels. Same eyes. Opposite result.

Confirmation is not verification. Verification is an attempt to **falsify**.

So the inspection protocol is fixed, and it is not optional:

- For every crop, ask literally: **"what is wrong with this?"**
- Answering "nothing" requires you to first name the three most likely failure modes for that
  component (a void, a wrap, a misalignment, a contrast miss, an overlapping label) and rule each out
  by pointing at the pixels.
- If you cannot name three, you do not know the component well enough to clear it.

## 2. A gate is a record of defects you have already met

Every rule in `guide-qa.mjs` was written **after** a human pointed at something.

| Rule | Written because |
|---|---|
| `stretch-void` | a 161px void from `margin-top:auto` |
| `orphan-row` | six chips wrapping `[5,1]` |
| `optical-gutter` | numerals at 94px vs 45px from their text |
| `centre-drift` | `.prose p{max-width:68ch}` clamping a caption inside a card |
| `cap-misalign` | `line-height:.8` making the box smaller than the glyph |
| `baseline-drift` | `.essay{padding-top:6mm}` overriding the page inner padding |
| `column-misalign` | a band's own padding pushing its interior off the page grid |

A gate is **downstream of the finding**. It can prove that a defect you have already met has not come
back. It is structurally incapable of finding the defect nobody has met yet. That is not a flaw to be
engineered away; it is what a gate *is*.

Therefore:

> **"0 HIGH" means "no known defect is present". It never means "verified".**

Reporting a clean gate as a verified document is the specific dishonesty that cost the trust here,
because it transferred the reviewing labour back to the person the work was supposed to save.

**Report the two claims separately, in these words:** *"the gate passed"* and *"I opened crops
X, Y, Z and looked for A, B, C"*. Never merge them.

## 3. Prove the gate can fail

The harness's widow rule was this, written inside a JavaScript template literal:

```js
const AUDIT = `... const re = /\S+/g; ...`;
```

Inside an untagged template literal `\S` is not a recognised escape, so it collapses to `S`. The
regex shipped as `/S+/g`. It matched runs of the capital letter S. It found no words, so it found no
widows, so it reported nothing, on every page, on every run, for the life of the project. **Its
silence was reported as a pass**, and there is no way to tell a silent-because-clean rule from a
silent-because-broken rule by reading the output.

Two defences, both cheap, both mandatory:

- **Serialize a real function, never a template-literal string.** `guide-qa.mjs` does
  `b.ev(\`(${AUDIT.toString()})(${JSON.stringify(cfg)})\`)`. Regexes, quotes, and backslashes then
  mean what they say, and your editor lints them.
- **Run the gate against a known-bad snapshot** and confirm each rule fires. Keep a
  `pre-grid.html` / `pre-motion.html` backup for exactly this. Against the pre-grid backup this
  harness reports 327 HIGH, including the 73px numeral overflowing its 62px column and the -24px
  caption drift. A gate that has never failed has never been tested.

Every time you add a rule, add it **against the artifact that motivated it**, watch it fire, and only
then fix the artifact. A rule that has only ever been observed passing is a rule you have not written.

## 4. Coverage is silent

`qa.config.json` names the selectors each rule inspects. A rule whose selectors match nothing does
not warn you. It passes.

The original harness checked cap-alignment on `.q` rows and `.secband` bands. The guide also had
`.step` rows and `.rule` rows, with the same hanging-numeral pattern, which nobody had listed. They
were misaligned by 2.4 to 5px for the life of the project. The generalised harness, given a config
that lists all four, immediately reported **9 HIGH** on the "finished" document.

So: when you add a component that uses a checked pattern, **add it to the config in the same edit**.
And when the gate is clean, spend one moment asking which of your components no rule mentions.

## 5. Measure ink, not boxes

`getBoundingClientRect()` returns the **box**. Where the glyph sits inside that box depends on
`line-height`, the font's own metrics, and the character. Two boxes with identical `top` can show
their ink 8px apart, which is why "the CSS is correct" and "it looks wrong" are both true at once.

Cap-height needs the baseline plus the font's real ascent:

```js
const probe = document.createElement('span');
probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
el.insertBefore(probe, el.firstChild);
const baselineY = probe.getBoundingClientRect().top;   // the first line's baseline
probe.remove();

ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
const inkTop = baselineY - ctx.measureText(text).actualBoundingBoxAscent;
```

Corollaries that cost real time to learn:

- `line-height` below ~0.95 of the font size makes the box **shorter than the glyph**. Centring then
  lies, and a 64px numeral will render 73px wide and overflow a 62px column. Use `line-height:1` on
  display glyphs and size the column to the widest glyph run.
- Correct optical alignment with `transform: translateY()`, never `margin`. A transform does not
  disturb the box model, so it cannot knock a value off the spacing scale.
- For the horizontal gutter, measure the **glyph run** (`Range.selectNodeContents(el)`), not the
  element, or a right-aligned numeral in a wide column reports the column's edge.

## 6. Motion has no resting state to inspect

Every static rule reads the DOM at rest. At rest an entrance animation has finished and a transient
overlay is `opacity:0`. The bug lives in neither state.

A "Checking..." overlay on a status chip painted **underneath** the chip's own inline text, so a real
export briefly rendered `CONSISTEN` + `CHECKING...` + `RRENT DRAFT` superimposed. Every rule in this
harness passed. The only artifact that contained the bug was a frame captured 200ms into the
animation.

So motion is verified in three passes, and `motion-check.mjs` runs all three:

1. **Print media, at rest.** Anything invisible here is content that will be missing from the PDF.
2. **`prefers-reduced-motion: reduce`, at rest.** Same check, different audience.
3. **Mid-flight frames.** Restart the entrance deterministically
   (`el.classList.remove(c); void el.offsetWidth; el.classList.add(c)`), capture every ~200ms, and
   **open every frame.**

## 7. Look at crops, not pages

A 794x1123 page rendered into a review is a resolution at which a 161px void reads as "generous
whitespace", an orphaned chip is a few ragged pixels, and a 94px-vs-45px gutter asymmetry is
sub-pixel. Judging a document from page thumbnails is looking at an image in which the defects do not
exist, and concluding there are none.

`guide-qa.mjs --out crops/` writes each component at DPR 3, scale 2. Those are the images. Open them.

And the flat prerequisite for all of it: **a screenshot enters your knowledge only when you `Read`
it.** A successful capture tool-call proves a file exists. It is not looking. It has never been
looking.

## The verification report

Say exactly this much, and no more:

```
Gates:    page-fit ok (20pp, no innerOver, fonts ok) · guide-qa 0 HIGH / 3 MED · scope-lint clean
Looked:   12 component crops, 8 entrance frames, PDF pp. 1, 8, 20
Not checked: MED widows on pp. 5-7 (accepted: prose, not headings)
```

Three lines. The first is what a machine asserts. The second is what you assert. The third is the one
that keeps you honest, and it is never empty.
