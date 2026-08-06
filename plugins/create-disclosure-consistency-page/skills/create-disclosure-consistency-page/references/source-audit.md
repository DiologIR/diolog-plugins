# Auditing against the source

The failure mode this file exists to prevent: a page that reads beautifully, is 95% faithful,
and carries four details nobody can trace. On a compliance artifact that is worse than a rough
page, because a reader cannot tell which 5% to distrust.

Audit in **both directions**. Invented content and dropped content are separate failures and
neither one implies the other.

## Extract the source to text before writing any markup

```bash
python3 - <<'PY'
import re, html
s = open('<report>.html', encoding='utf-8', errors='replace').read()
s = re.sub(r'(?is)<script.*?</script>', '', s)
s = re.sub(r'(?is)<style.*?</style>', '', s)
s = re.sub(r'(?is)<svg.*?</svg>', ' [svg] ', s)
t = html.unescape(re.sub(r'(?s)<[^>]+>', '\n', s))
open('source.txt', 'w').write('\n'.join(l.strip() for l in t.split('\n') if l.strip()))
PY
```

Read `source.txt` end to end. Working from the rendered app page instead is how detail gets
paraphrased into something the source does not say.

## Inventory what is actually there

Write these down before drafting, because a count you fixed up front is a count you can check
later, and a count you form at the end just describes what you happened to build:

- the target document, and each comparison document with its date, subtitle and size
- headline metrics: pass rate, confidence score, inconsistency count, key-finding count
- the executive analysis paragraph
- the key findings, and the closing recommendation line
- each detected inconsistency: severity, category, current statement, historical context,
  analysis, suggestion
- every verification-matrix row: number, statement, status, severity, notes
- each semantic-drift item, including any already acknowledged
- each forward-looking statement with its original guidance and assessment
- the track record rows and their periods
- the anticipated questions with their proposed answers
- the next steps
- the disclaimer

Then reconcile the statuses against the metrics. If the matrix has 18 rows and the pass rate
says 3 of 18, three rows should be consistent. If they do not agree, the source is what it is:
report the discrepancy rather than smoothing it.

## Check direction one: nothing invented

```bash
python3 - <<'PY'
import re
mine = open('<output>.html').read()
mine = mine[mine.index('<body>'):]
txt  = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', mine))
src  = open('source.txt').read()

# every number in the output should exist in the source
norm = lambda x: x.replace(',', '').rstrip('.').lower()
srcn = {norm(x) for x in re.findall(r'\$?[\d][\d,\.]*[mk%]?', src.replace('–', '-'))}
bad  = sorted({x for x in re.findall(r'\$?[\d][\d,\.]*[mk%]?', txt)
               if norm(x) not in srcn and len(norm(x)) > 1})
print('numbers not in source:', bad)

# phrases that get invented
for p in ['owner', 'blocks release', 'due', 'corroborated statement',
          'as at', 'report id', 'ref:', 'assigned']:
    if p in txt.lower():
        print('CHECK:', p)
PY
```

Section indices, statement numbers and CSS values will show up as false positives. Anything
else is a claim you added, and it either comes out or gets traced.

## Check direction two: nothing dropped

Grep your output for each item in the inventory. Restoring dropped content is not optional
just because the omission improved the page: a five-row table where every outcome reads
"unknown" is a weak table, but if the source carries it, the source carries it. Add the honest
note beneath it rather than cutting it.

The distinction worth holding: **you may re-say anything, and you may re-order anything, but
you may not decide the source's content is not worth including.**

## Judgement calls that are not invention

- **Structure.** Section order, headings, grouping, progressive disclosure.
- **Compression.** "Alfabs Australia Limited refers to the announcement dated 5 May 2026
  regarding the appointment of Mr Peter White is an Executive Director" may become "Mr White
  was appointed an Executive Director" - same fact, fewer words. Check the compression against
  the source text, not against your memory of it.
- **Framing.** Recasting a pass rate as coverage is a truer reading of the same numbers, not a
  new claim. Keep the original metrics too.
- **Identifiers** for cross-referencing, as long as they are visibly labels and never presented
  as something the source assigned.
- **The document's own furniture**: title, masthead, contents rail, confidentiality marker
  where the source's own language supports it.

## What to do when the source is thin or contradictory

Say so on the page, in the report's own voice. A field the source leaves blank is a fact about
the audit, and the reader needs it more than they need a tidy layout. Never fill a gap with a
plausible value.
