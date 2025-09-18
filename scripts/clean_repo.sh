#!/usr/bin/env bash
set -euo pipefail

echo "Stopping dev servers if running..."
pkill -f 'uvicorn app.main:app' || true
pkill -f 'next dev' || true

echo "Removing backend artifacts..."
rm -rf backend/venv backend/*.db backend/__pycache__ backend/app/**/__pycache__ || true
rm -f backend_uvicorn.log || true

echo "Removing frontend artifacts..."
rm -rf "track-my-impact/node_modules" "track-my-impact/out" "track-my-impact/.next" "track-my-impact/output" || true
rm -f frontend_next.log || true

echo "Removing miscellaneous artifacts..."
rm -rf track-my-impact-complete || true
echo "Removing macOS AppleDouble files (._*)..."
find . -type f -name '._*' -print -delete 2>/dev/null || true

echo "Tip: To keep stale build outputs out of git, see .gitignore entries for track-my-impact/out and .next"

echo "Done. Repo cleaned."

# Optional: Move legacy uploads/ to docs/uploads/
if [ -d "uploads" ]; then
  echo "Relocating legacy uploads/ to docs/uploads/ ..."
  mkdir -p docs/uploads
  for f in uploads/*; do
    [ -e "$f" ] || continue
    mv "$f" "docs/uploads/" 2>/dev/null || true
  done
  rmdir uploads 2>/dev/null || true
  echo "Moved uploads -> docs/uploads."
fi
