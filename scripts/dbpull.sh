#!/usr/bin/env bash

####################################
#       DEV PURPOSE ONLY           #
####################################

set -euo pipefail

BUNDLE_ID="com.houseofhuynh.finance"
DB_NAME="hoh_finance.db"

# project root = scripts/ 상위
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DEST="$PROJECT_ROOT/db_exports"
LATEST_DIR="$DEST/latest"
HISTORY_DIR="$DEST/history"

mkdir -p "$LATEST_DIR" "$HISTORY_DIR"

ts() { date +"%Y%m%d-%H%M%S"; }

echo "[dbpull] bundle=$BUNDLE_ID"
echo "[dbpull] project=$PROJECT_ROOT"

CONTAINER=$(xcrun simctl get_app_container booted "$BUNDLE_ID" data)

if [ -z "$CONTAINER" ]; then
  echo "[dbpull] ERROR: app container not found (is simulator booted + app installed?)"
  exit 1
fi

# Find the original DB inside the app container
DB_PATH=$(find "$CONTAINER" -maxdepth 14 -name "$DB_NAME" -print | head -n 1)

if [ -z "$DB_PATH" ]; then
  echo "[dbpull] ERROR: $DB_NAME not found in container"
  echo "[dbpull] hint: run the app once so SQLite creates the file"
  exit 1
fi

WAL_PATH="${DB_PATH}-wal"
SHM_PATH="${DB_PATH}-shm"

STAMP="$(ts)"
HIST_BASE="$HISTORY_DIR/$STAMP"
mkdir -p "$HIST_BASE"

echo "[dbpull] found db:"
echo "  $DB_PATH"

# Copy main db
cp "$DB_PATH" "$LATEST_DIR/$DB_NAME"
cp "$DB_PATH" "$HIST_BASE/$DB_NAME"

# Copy wal/shm if present (WAL mode)
if [ -f "$WAL_PATH" ]; then
  cp "$WAL_PATH" "$LATEST_DIR/${DB_NAME}-wal"
  cp "$WAL_PATH" "$HIST_BASE/${DB_NAME}-wal"
  echo "[dbpull] copied wal"
else
  rm -f "$LATEST_DIR/${DB_NAME}-wal" || true
fi

if [ -f "$SHM_PATH" ]; then
  cp "$SHM_PATH" "$LATEST_DIR/${DB_NAME}-shm"
  cp "$SHM_PATH" "$HIST_BASE/${DB_NAME}-shm"
  echo "[dbpull] copied shm"
else
  rm -f "$LATEST_DIR/${DB_NAME}-shm" || true
fi

echo "[dbpull] latest ready:"
echo "  $LATEST_DIR/$DB_NAME"
echo "[dbpull] history saved:"
echo "  $HIST_BASE/"

open "$LATEST_DIR"
