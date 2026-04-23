#!/usr/bin/env bash
# ============================================================================
# build-extensions.sh — Package all 25 AI extensions into installable .zip files
#
# Usage:  bash build-extensions.sh
# Output: dist/extensions/<extension-name>.zip
#
# For TRUE 1-click install (no zipping/unzipping needed), use instead:
#   ./install-organism.sh          (macOS/Linux)
#   install-organism.bat           (Windows — double-click)
#   node organism-cli/organism.js install   (any platform with Node.js)
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# If Node.js is available, use the organism CLI
if command -v node &>/dev/null; then
  exec node "${SCRIPT_DIR}/organism-cli/organism.js" build
fi

# Fallback: pure bash build
EXT_DIR="${SCRIPT_DIR}/extensions"
DIST_DIR="${SCRIPT_DIR}/dist/extensions"

rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}"

BROWSER_COUNT=0
WINDOWS_COUNT=0

echo "══════════════════════════════════════════════════════════"
echo "  Building Browser Extensions"
echo "══════════════════════════════════════════════════════════"

for ext_path in "${EXT_DIR}"/*/; do
  ext_name="$(basename "${ext_path}")"
  [ "${ext_name}" = "windows" ] && continue
  [ ! -f "${ext_path}/manifest.json" ] && continue

  echo "  📦 Packaging: ${ext_name}"
  (cd "${ext_path}" && zip -r -q "${DIST_DIR}/${ext_name}.zip" \
    manifest.json background.js content.js icons/ 2>/dev/null || true)

  if [ -f "${DIST_DIR}/${ext_name}.zip" ]; then
    size=$(du -h "${DIST_DIR}/${ext_name}.zip" | cut -f1)
    echo "     ✓ ${ext_name}.zip (${size})"
    BROWSER_COUNT=$((BROWSER_COUNT + 1))
  else
    echo "     ✗ FAILED: ${ext_name}"
  fi
done

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Building Windows Extensions"
echo "══════════════════════════════════════════════════════════"

WINDOWS_DIR="${EXT_DIR}/windows"
if [ -d "${WINDOWS_DIR}" ]; then
  for ext_path in "${WINDOWS_DIR}"/*/; do
    ext_name="$(basename "${ext_path}")"
    [ ! -f "${ext_path}/manifest.json" ] && continue

    echo "  📦 Packaging: ${ext_name}"
    (cd "${ext_path}" && zip -r -q "${DIST_DIR}/${ext_name}.zip" \
      manifest.json engine.js interface.js icons/ 2>/dev/null || true)

    if [ -f "${DIST_DIR}/${ext_name}.zip" ]; then
      size=$(du -h "${DIST_DIR}/${ext_name}.zip" | cut -f1)
      echo "     ✓ ${ext_name}.zip (${size})"
      WINDOWS_COUNT=$((WINDOWS_COUNT + 1))
    else
      echo "     ✗ FAILED: ${ext_name}"
    fi
  done
fi

TOTAL=$((BROWSER_COUNT + WINDOWS_COUNT))
echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Build Complete: ${TOTAL} extensions packaged"
echo "  Output: ${DIST_DIR}"
echo ""
echo "  For 1-click install, use:  ./install-organism.sh"
echo "══════════════════════════════════════════════════════════"
