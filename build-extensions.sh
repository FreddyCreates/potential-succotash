#!/usr/bin/env bash
# ============================================================================
# build-extensions.sh — Package all 25 AI extensions into installable .zip files
#
# Usage:  bash build-extensions.sh
# Output: dist/extensions/<extension-name>.zip
#
# Browser extensions (20):
#   Each .zip contains manifest.json, background.js, content.js, icons/
#   → Load in Chrome via chrome://extensions > "Load unpacked" (unzip first)
#   → Or drag the .zip into chrome://extensions with Developer Mode on
#
# Windows extensions (5):
#   Each .zip contains manifest.json, engine.js, interface.js, icons/
#   → Unzip into your Windows extensions directory for one-click activation
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_DIR="${SCRIPT_DIR}/extensions"
DIST_DIR="${SCRIPT_DIR}/dist/extensions"

# Clean previous builds
rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}"

BROWSER_COUNT=0
WINDOWS_COUNT=0

# ── Browser Extensions ──────────────────────────────────────────────────────
echo "══════════════════════════════════════════════════════════"
echo "  Building Browser Extensions"
echo "══════════════════════════════════════════════════════════"

for ext_path in "${EXT_DIR}"/*/; do
  # Skip the windows/ subdirectory and index.js
  ext_name="$(basename "${ext_path}")"
  [ "${ext_name}" = "windows" ] && continue

  manifest="${ext_path}/manifest.json"
  [ ! -f "${manifest}" ] && continue

  echo "  📦 Packaging: ${ext_name}"

  # Create zip from extension directory
  (cd "${ext_path}" && zip -r -q "${DIST_DIR}/${ext_name}.zip" \
    manifest.json \
    background.js \
    content.js \
    icons/ \
    2>/dev/null || true)

  # Verify the zip was created
  if [ -f "${DIST_DIR}/${ext_name}.zip" ]; then
    size=$(du -h "${DIST_DIR}/${ext_name}.zip" | cut -f1)
    echo "     ✓ ${ext_name}.zip (${size})"
    BROWSER_COUNT=$((BROWSER_COUNT + 1))
  else
    echo "     ✗ FAILED: ${ext_name}"
  fi
done

# ── Windows Extensions ──────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Building Windows Extensions"
echo "══════════════════════════════════════════════════════════"

WINDOWS_DIR="${EXT_DIR}/windows"
if [ -d "${WINDOWS_DIR}" ]; then
  for ext_path in "${WINDOWS_DIR}"/*/; do
    ext_name="$(basename "${ext_path}")"
    manifest="${ext_path}/manifest.json"
    [ ! -f "${manifest}" ] && continue

    echo "  📦 Packaging: ${ext_name}"

    (cd "${ext_path}" && zip -r -q "${DIST_DIR}/${ext_name}.zip" \
      manifest.json \
      engine.js \
      interface.js \
      icons/ \
      2>/dev/null || true)

    if [ -f "${DIST_DIR}/${ext_name}.zip" ]; then
      size=$(du -h "${DIST_DIR}/${ext_name}.zip" | cut -f1)
      echo "     ✓ ${ext_name}.zip (${size})"
      WINDOWS_COUNT=$((WINDOWS_COUNT + 1))
    else
      echo "     ✗ FAILED: ${ext_name}"
    fi
  done
fi

# ── Summary ─────────────────────────────────────────────────────────────────
TOTAL=$((BROWSER_COUNT + WINDOWS_COUNT))
echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Build Complete"
echo "══════════════════════════════════════════════════════════"
echo "  Browser extensions: ${BROWSER_COUNT}"
echo "  Windows extensions: ${WINDOWS_COUNT}"
echo "  Total packaged:     ${TOTAL}"
echo "  Output directory:   ${DIST_DIR}"
echo ""
echo "  Install browser extensions:"
echo "    1. Unzip the .zip file"
echo "    2. Open chrome://extensions"
echo "    3. Enable Developer Mode"
echo "    4. Click 'Load unpacked' and select the unzipped folder"
echo ""
echo "  Install Windows extensions:"
echo "    1. Unzip the .zip file"
echo "    2. Place in your Windows extensions directory"
echo "    3. The extension loads automatically on next launch"
echo "══════════════════════════════════════════════════════════"
