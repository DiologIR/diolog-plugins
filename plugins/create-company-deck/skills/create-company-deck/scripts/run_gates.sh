#!/usr/bin/env bash
# Run the deck gates across the window sizes a deck actually meets.
#
# One viewport proves nothing about a scaled fixed stage: the defect that
# reached production was invisible at 1280x1024 and clipped 120px off every
# slide at 1680x1050. Sizes wider and narrower than 16:9 are both needed,
# because the scale is bounded by whichever axis runs out first.
#
# Serve over HTTP, never file:// — module scripts, fetches and some fonts fail
# silently from the filesystem, and a deck that "works locally" from a file URL
# has not been tested.
#
# Usage:  ./run_gates.sh http://localhost:8000/deck.html [session-name]

set -euo pipefail
URL="${1:?usage: run_gates.sh <url> [session]}"
SESSION="${2:-deckgate}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GATES="$(cat "$HERE/gates.js")"

if [[ "$URL" == file://* ]]; then
  echo "refusing a file:// URL — serve the deck over HTTP (python3 -m http.server)" >&2
  exit 2
fi

playwright-cli -s="$SESSION" open "$URL" >/dev/null

for VP in 1280x800 1440x900 1680x1050 1920x1080 2560x1440; do
  W="${VP%x*}"; H="${VP#*x}"
  echo "═══ ${W}x${H} ═══"
  playwright-cli -s="$SESSION" resize "$W" "$H" >/dev/null
  playwright-cli -s="$SESSION" --raw eval "$GATES"
  echo
done

echo "═══ console ═══"
playwright-cli -s="$SESSION" console || echo "(no console command in this playwright-cli build)"

cat <<'NOTE'

Read the denominators, not just the failure counts. A row reading `examined: 0`
is a gate that never ran, and uniform zeros across many surfaces are the
signature of an assertion written against a field the probe never sets.

Still not covered by this script, and each needs its own pass:
  · the printed PDF — open page 1, a middle photo slide, and the last one;
    a 12-page PDF whose page 1 composites all twelve slides still counts twelve.
  · text sitting over a photograph — see contrastDeferred; measure the median
    luminance of the text's line box from a screenshot, because glyph ink is a
    minority of the box and the median is what the reader sees behind it.
  · whether each image is the one that was commissioned. Look at them.
NOTE
