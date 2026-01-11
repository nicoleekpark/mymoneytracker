#!/usr/bin/env bash
####################################
#       DEV PURPOSE ONLY           #
####################################

set -euo pipefail

# usage:
#   ./scripts/dbpull.sh dev
#   ./scripts/dbpull.sh prod
#
# called by dev-server.cjs:
#   spawn('bash', [scriptPath, env])

ENV_NAME="${1:-dev}"

if [[ "$ENV_NAME" != "dev" && "$ENV_NAME" != "prod" ]]; then
  echo "Invalid env: $ENV_NAME (expected dev|prod)"
  exit 2
fi

# --- project paths ---
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPORT_ROOT="${PROJECT_ROOT}/db_exports"
LATEST_DIR="${EXPORT_ROOT}/latest"
HISTORY_DIR="${EXPORT_ROOT}/history"

mkdir -p "$LATEST_DIR" "$HISTORY_DIR"

# --- db names ---
DB_NAME="hoh_fi_dev.db"
if [[ "$ENV_NAME" == "prod" ]]; then
  DB_NAME="hoh_fi_prod.db"
fi

# --- candidate locations (optional explicit paths first) ---
CANDIDATES=(
  "${PROJECT_ROOT}/${DB_NAME}"
)

DB_PATH=""

for p in "${CANDIDATES[@]}"; do
  if [[ -f "$p" ]]; then
    DB_PATH="$p"
    break
  fi
done

# --- fallback: search iOS simulator (scoped) ---
if [[ -z "$DB_PATH" ]]; then
  SIM_ROOT="${HOME}/Library/Developer/CoreSimulator/Devices"
  if [[ -d "$SIM_ROOT" ]]; then
    DB_PATH="$(/usr/bin/find "$SIM_ROOT" -type f -name "$DB_NAME" 2>/dev/null | tail -n 1 || true)"
  fi
fi

if [[ -z "$DB_PATH" || ! -f "$DB_PATH" ]]; then
  echo "Could not find ${DB_NAME}"
  echo "Searched:"
  echo "  - explicit candidates"
  echo "  - ${HOME}/Library/Developer/CoreSimulator/Devices"
  exit 1
fi

# --- timestamps ---
TS="$(date +"%Y%m%d_%H%M%S")"
BASENAME="${DB_NAME%.db}"

# history = immutable snapshot
HISTORY_FILE="${HISTORY_DIR}/${BASENAME}_${TS}.db"

# latest = stable name (always overwritten)
LATEST_FILE="${LATEST_DIR}/${BASENAME}.db"

# --- copy ---
cp -f "$DB_PATH" "$HISTORY_FILE"
cp -f "$DB_PATH" "$LATEST_FILE"

echo "˲ DB PULL OK"
echo "˲ env:        $ENV_NAME"
echo "˲ db:         $DB_NAME"
echo "˲ from:       $DB_PATH"
echo "˲ history →   $HISTORY_FILE"
echo "˲ latest  →   $LATEST_FILE"
