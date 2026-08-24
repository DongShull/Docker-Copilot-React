#!/bin/sh

# Generate a safely escaped runtime API configuration, then start the static server.
set -eu

if [ "$#" -eq 0 ]; then
  API_BASE_URL="${VITE_API_BASE_URL:-http://localhost}"
  DIST_DIR="/app/dist"
  PORT="${PORT:-12713}"
  START_SERVER=true
else
  API_BASE_URL="$1"
  DIST_DIR="${2:-.}/dist"
  PORT="${3:-12713}"
  START_SERVER=false
fi

if [ ! -d "$DIST_DIR" ] || [ ! -f "$DIST_DIR/index.html" ]; then
  echo "Distribution directory is incomplete: $DIST_DIR" >&2
  exit 1
fi

node - "$API_BASE_URL" "$DIST_DIR/runtime-config.js" <<'NODE'
const fs = require('node:fs')
const apiURL = process.argv[2]
const output = process.argv[3]
const parsed = new URL(apiURL)
if (!['http:', 'https:'].includes(parsed.protocol)) {
  throw new Error('API URL must use HTTP or HTTPS')
}
fs.writeFileSync(output, `window.__API_BASE_URL = ${JSON.stringify(apiURL)}\n`, { mode: 0o644 })
NODE

if [ "$START_SERVER" = "false" ]; then
  echo "Runtime configuration written to $DIST_DIR/runtime-config.js"
  exit 0
fi

export PORT VITE_API_BASE_URL="$API_BASE_URL" STATIC_ROOT="$DIST_DIR"
exec node /app/server.mjs
