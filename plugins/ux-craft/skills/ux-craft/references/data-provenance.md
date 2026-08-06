# Provenance is a UX problem before it is a data problem

On any surface where a reader will act on a number — an investor page, a health record, a
compliance report, a pricing table — **where the number came from is part of the number.** A
figure with no stated provenance is not neutral; it reads as authoritative, because that is the
default a reader applies.

This is a UX responsibility, not a backend one. The backend decides whether a value is known.
The interface decides whether the reader can tell.

## Three states, never two

Most systems model "have it" and "don't have it", then quietly invent a third behaviour for the
second case — a dash, a zero, a plausible placeholder, a stale cached value. Model it explicitly:

| State | What the reader sees | What it must never do |
|---|---|---|
| **From the record** | the value, its as-at date, and the document it came from | — |
| **Illustrative** | the value, visibly marked, linked to a page listing every marked value | borrow a real source. A mocked figure that cites a genuine document is worse than an unmarked one |
| **Not available** | "not available" | carry a value at all — no placeholder, no last-known, no zero |

**Make the default state impossible.** If a value can omit its provenance and still render, it
will, and it will render as the strongest claim available. In a schema this means no default on
the provenance field: an omission must be an error, not an inference. That single default is the
most dangerous line in a data contract of this kind.

## The marker has to survive being ignored

An illustrative value needs a visible marker at the point of use — a dotted underline and a
superscript, say — **and** a route to a page that lists every one of them with a reason. Neither
alone works: a footnote nobody scrolls to is not disclosure, and a marker with nothing behind it
is decoration.

Generate that page from the same data the marker comes from. A hand-written list of illustrative
values drifts from the actual illustrative values on the second change, and then the disclosure
is worse than none because it is confidently wrong.

## Precision is a claim

If the source publishes month-and-year, show month-and-year. Inventing a day to make a timeline
look tidier fabricates specificity the record does not support, and on a regulated surface a
fabricated date is a fabricated fact. Say what precision you hold, in words, near the data.

The same applies to derived figures: market capitalisation from price × shares is arithmetic, not
data, and if either input is unavailable the output is unavailable rather than approximate.

## A form must never claim a send it did not make

Related failure, same family. If nothing is wired behind a contact form, the success state says
so, keeps everything the reader typed, and offers a route that works. Telling someone their
question was received when it was not is the failure most likely to cause real harm on an
otherwise honest surface — and it is the one people ship because the happy path is the only
state they designed.

## Reviewing for this

Four questions, all answerable by looking:

1. Can a value render with no provenance? If yes, that is the defect — the rest is detail.
2. Does any marked value cite a source that does not support it?
3. Is the disclosure page generated from the same data, or written alongside it?
4. Does any "not available" state show a value anyway — a dash that looks like data, a zero, a
   stale figure?
