#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# build-extensions.sh
# Packages every extension under extensions/ into a downloadable
# .zip file that can be sideloaded into Chrome / Edge / Brave.
#
# Output: dist/extensions/<name>.zip  (one per extension)
#         dist/extensions/all-extensions.zip (bundle of everything)
# ─────────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
EXT_SRC="$REPO_ROOT/extensions"
DIST="$REPO_ROOT/dist/extensions"

rm -rf "$DIST"
mkdir -p "$DIST"

echo "═══════════════════════════════════════════"
echo "  Organism Extension Builder"
echo "  Building downloadable Chrome extensions"
echo "═══════════════════════════════════════════"
echo ""

count=0
for ext_dir in "$EXT_SRC"/*/; do
  name="$(basename "$ext_dir")"
  manifest="$ext_dir/manifest.json"

  # Skip non-extension dirs
  [ -f "$manifest" ] || continue

  echo "📦 Packaging: $name"

  # Create a clean zip — only include the files Chrome needs
  (cd "$ext_dir" && zip -r -q "$DIST/${name}.zip" \
    manifest.json \
    background.js \
    content.js \
    icons/ \
    2>/dev/null || true)

  count=$((count + 1))
done

# Create an all-in-one bundle
echo ""
echo "📦 Creating all-extensions bundle..."
(cd "$DIST" && zip -r -q all-extensions.zip *.zip)

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ $count extensions packaged"
echo "  📂 Output: dist/extensions/"
echo "═══════════════════════════════════════════"
echo ""
echo "Individual zips:"
ls -lh "$DIST"/*.zip | grep -v all-extensions | awk '{print "  " $NF " (" $5 ")"}'
echo ""
echo "Bundle:"
ls -lh "$DIST"/all-extensions.zip | awk '{print "  " $NF " (" $5 ")"}'
