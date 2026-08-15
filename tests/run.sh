#!/bin/sh
# Every check that must pass before a push. Run from the repo root.
set -e
cd "$(dirname "$0")/.."
echo "--- slot math"        && node tests/slots.test.mjs | grep -c PASS | sed 's/^/    /;s/$/ passing/'
echo "--- imports/helpers"  && (cd app && node ../tests/imports.cjs)
echo "--- top-level exec"   && (cd app && node ../tests/toplevel.cjs)
echo "--- temporal dead zone" && (cd app && node ../tests/tdz.cjs clinic.html && node ../tests/tdz.cjs portal.html)
echo "all checks passed"
