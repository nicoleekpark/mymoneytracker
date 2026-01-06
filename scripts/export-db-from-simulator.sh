#!/usr/bin/env bash
set -euo pipefail

# Resolve project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

BUNDLE_ID="com.houseofhuynh.finance"
DEST="$PROJECT_ROOT/db_exports"
HISTORY_DIR="$DEST/history"

# Ensure destination directories
LOG_FILE="$DEST/export-db.log"

mkdir -p "$HISTORY_DIR"
touch "$LOG_FILE" || true

ts() { date +"%Y-%m-%d %H:%M:%S"; }

log() {
  local msg="$1"
  echo "[$(ts)] $msg" | tee -a "$LOG_FILE"
}

on_error() {
  local exit_code=$?
  local line_no=${BASH_LINENO[0]:-unknown}
  local cmd=${BASH_COMMAND:-unknown}

  local msg="❌ DB export failed | project=$(basename "$PROJECT_ROOT") | line=$line_no | exit=$exit_code | cmd=$cmd"
  log "$msg"
  notify_slack "$msg"

  exit "$exit_code"
}

trap on_error ERR

log "▶ Exporting SQLite DB from iOS Simulator"
log "Project root: $PROJECT_ROOT"
log "Bundle ID: $BUNDLE_ID"
log "Dest: $DEST"

# Get app container
CONTAINER=$(xcrun simctl get_app_container booted "$BUNDLE_ID" data)
if [ -z "$CONTAINER" ]; then
  log "❌ Simulator app container not found (is the app installed and booted)"
  notify_slack "❌ DB export failed | app container not found | bundle=$BUNDLE_ID"
  exit 1
fi

# Find latest exported DB in simulator cache
LATEST_EXPORTED=$(
  find "$CONTAINER" -maxdepth 8 -name "hoh_finance_*.db" -print0 \
  | xargs -0 ls -t 2>/dev/null \
  | head -n 1
)

if [ -z "$LATEST_EXPORTED" ]; then
  log "❌ No exported DB file found (hoh_finance_*.db)"
  log "Tip: press 'Export DB' in DevToolsOverlay first"
  notify_slack "❌ DB export failed | no exported file found | bundle=$BUNDLE_ID"
  exit 1
fi

STAMP=$(date +"%Y%m%d-%H%M%S")
HIST_FILE="$HISTORY_DIR/hoh_finance_${STAMP}.db"
LATEST_FILE="$DEST/hoh_finance_latest.db"

log "✅ Found exported DB: $LATEST_EXPORTED"

cp "$LATEST_EXPORTED" "$HIST_FILE"
log "🗃️ Saved history: $HIST_FILE"

cp "$LATEST_EXPORTED" "$LATEST_FILE"
log "📌 Updated latest: $LATEST_FILE"

log "✅ Export done"
open "$DEST"
