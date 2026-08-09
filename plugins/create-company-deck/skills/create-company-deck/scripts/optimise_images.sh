#!/usr/bin/env bash
# Compress generated photography for a 1920-wide stage.
#
# Generation produces 5-6 MB per image; five of them is 27 MB of deck. At
# 2400px wide and WebP q82 the same five came to 1.9 MB total and were visually
# indistinguishable at the size they are actually displayed. 2400 rather than
# 1920 leaves headroom for a retina export and for a crop.
#
# This overwrites nothing: it writes .webp beside the source and leaves the
# original alone, because upscaling a compressed file back is not a recovery.
# If quality is the priority, regenerate rather than reprocess.
#
# Usage:  ./optimise_images.sh path/to/imgs [width] [quality]

set -euo pipefail
DIR="${1:?usage: optimise_images.sh <dir> [width=2400] [quality=82]}"
W="${2:-2400}"
Q="${3:-82}"

command -v cwebp >/dev/null || { echo "cwebp not found — brew install webp" >&2; exit 2; }

total_before=0; total_after=0
shopt -s nullglob nocaseglob
for src in "$DIR"/*.{png,jpg,jpeg}; do
  out="${src%.*}.webp"
  before=$(wc -c < "$src")
  cwebp -quiet -resize "$W" 0 -q "$Q" "$src" -o "$out"
  after=$(wc -c < "$out")
  total_before=$((total_before + before)); total_after=$((total_after + after))
  printf '%-52s %6dKB -> %5dKB\n' "$(basename "$out")" $((before/1024)) $((after/1024))
done

if [ "$total_before" -eq 0 ]; then
  echo "no png/jpg found in $DIR"
  exit 0
fi
printf '\ntotal %dKB -> %dKB (%d%%)\n' \
  $((total_before/1024)) $((total_after/1024)) $((total_after*100/total_before))
echo "originals kept. Point the deck's <img src> at the .webp files."
