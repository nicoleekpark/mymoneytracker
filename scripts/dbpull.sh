#!/usr/bin/env bash
set -euo pipefail

# -------------------------------
# HoH Finance Tracker - DB Pull
# - Robust snapshot from iOS Simulator to local folder
# - Avoids cp/race issues by using sqlite3 .backup or VACUUM INTO
# - Also copies -wal/-shm when present (not required for .backup, but useful for debugging)
# -------------------------------

log() { printf "%s\n" "$*"; }
die() { printf "ERROR: %s\n" "$*" >&2; exit 1; }

# ---- Config (override via env) ----
DB_ENV="${DB_ENV:-dev}"                         # dev | prod (optional)
DB_NAME="${DB_NAME:-hoh_fi_dev.db}"             # fallback if server doesn't provide
DEV_SERVER_URL="${DEV_SERVER_URL:-http://127.0.0.1:3333}"  # your dev-server.cjs
EXPORT_ROOT="${EXPORT_ROOT:-db_exports}"         # output root
MODE="${MODE:-backup}"                          # backup | vacuum
KEEP_HISTORY="${KEEP_HISTORY:-1}"               # 1 to keep history copy

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HISTORY_DIR="$ROOT_DIR/$EXPORT_ROOT/history"
LATEST_DIR="$ROOT_DIR/$EXPORT_ROOT/latest"

if [[ "$DB_ENV" == "prod" && "${ALLOW_PROD_DB_PULL:-}" != "true" ]]; then
  echo "❌ PROD DB export is disabled. Set ALLOW_PROD_DB_PULL=true to override."
  exit 1
fi

mkdir -p "$HISTORY_DIR" "$LATEST_DIR"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

need_cmd curl
need_cmd python3
need_cmd sqlite3
need_cmd date
need_cmd mkdir
need_cmd cp
need_cmd ls

timestamp() {
  # YYYYMMDD_HHMMSS
  date +"%Y%m%d_%H%M%S"
}

# Prefer pulling metadata from dev server if available
fetch_meta_from_server() {
  # Expected JSON from server (example):
  # { "env":"dev", "dbName":"hoh_fi_dev.db", "dbPath":"/.../hoh_fi_dev.db" }
  local json
  if ! json="$(curl -sf "$DEV_SERVER_URL/db/meta" 2>/dev/null)"; then
    return 1
  fi

  # Parse with python (more portable than jq)
  local env name path
  env="$(python3 - <<'PY'
import json,sys
j=json.load(sys.stdin)
print(j.get("env",""))
PY
<<<"$json")"
  name="$(python3 - <<'PY'
import json,sys
j=json.load(sys.stdin)
print(j.get("dbName",""))
PY
<<<"$json")"
  path="$(python3 - <<'PY'
import json,sys
j=json.load(sys.stdin)
print(j.get("dbPath",""))
PY
<<<"$json")"

  if [[ -z "$path" ]]; then
    return 1
  fi

  DB_ENV="${env:-$DB_ENV}"
  DB_NAME="${name:-$DB_NAME}"
  SRC_DB_PATH="$path"
  return 0
}

# Fallback: try to locate simulator DB by searching (last resort)
find_sim_db_fallback() {
  # This is intentionally conservative
  # Searches common Simulator container Documents/SQLite paths
  local base="$HOME/Library/Developer/CoreSimulator/Devices"
  [[ -d "$base" ]] || die "Simulator devices folder not found: $base"

  local found
  found="$(find "$base" -type f -name "$DB_NAME" 2>/dev/null | head -n 1 || true)"
  [[ -n "$found" ]] || die "Could not find $DB_NAME under Simulator devices folder"
  SRC_DB_PATH="$found"
}

ensure_src_exists() {
  [[ -f "$SRC_DB_PATH" ]] || die "Source DB not found: $SRC_DB_PATH"
}

# Make a consistent snapshot into a destination DB file
snapshot_db() {
  local src="$1"
  local dst="$2"

  mkdir -p "$(dirname "$dst")"

  # sanity: show src size
  local src_size
  src_size="$(ls -lh "$src" | awk '{print $5}')"
  log "· src size:    $src_size"

  # Primary: sqlite3 .backup (safe with WAL/in-use)
  if [[ "$MODE" == "backup" ]]; then
    sqlite3 "$src" ".backup '$dst'"
  elif [[ "$MODE" == "vacuum" ]]; then
    sqlite3 "$src" "VACUUM INTO '$dst';"
  else
    die "Unknown MODE=$MODE (use backup or vacuum)"
  fi

  # minimal sanity check: list tables
  local tables
  tables="$(sqlite3 "$dst" "SELECT name FROM sqlite_master WHERE type='table' ORDER BY 1;" || true)"
  if [[ -z "$tables" ]]; then
    die "Snapshot produced an empty DB (no tables). Check SRC_DB_PATH points to the real DB."
  fi

  # sanity: show dst size
  local dst_size
  dst_size="$(ls -lh "$dst" | awk '{print $5}')"
  log "· dst size:    $dst_size"
}

copy_wal_shm_if_any() {
  local src="$1"
  local dst="$2"

  # these are not needed if using .backup/VACUUM INTO,
  # but copying them helps debug if something is odd
  for suf in -wal -shm; do
    if [[ -f "${src}${suf}" ]]; then
      cp -f "${src}${suf}" "${dst}${suf}" || true
    fi
  done
}

main() {
  local SRC_DB_PATH=""

  if fetch_meta_from_server; then
    :
  else
    log "· dev server meta not available, falling back to search"
    find_sim_db_fallback
  fi

  ensure_src_exists

  local ts
  ts="$(timestamp)"

  local hist="$HISTORY_DIR/${DB_NAME%.db}_${ts}.db"
  local latest="$LATEST_DIR/$DB_NAME"

  log "DB PULL"
  log "· env:        $DB_ENV"
  log "· db:         $DB_NAME"
  log "· from:       $SRC_DB_PATH"
  log "· mode:       $MODE"
  log "· history →   $hist"
  log "· latest  →   $latest"

  # Snapshot to history
  snapshot_db "$SRC_DB_PATH" "$hist"
  copy_wal_shm_if_any "$SRC_DB_PATH" "$hist"

  # Update latest (atomic-ish)
  cp -f "$hist" "$latest"
  copy_wal_shm_if_any "$SRC_DB_PATH" "$latest"

  # Print quick stats
  log ""
  log "Sanity"
  log "· tables:"
  sqlite3 "$latest" "SELECT name FROM sqlite_master WHERE type='table' ORDER BY 1;" | sed 's/^/  - /'
  log ""
  log "OK"
}

main "$@"
