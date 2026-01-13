#!/usr/bin/env bash
set -euo pipefail

# -------------------------------
# HoH Finance Tracker - DB Pull (Option 1)
# - No dev server
# - Loads .env.local (optional)
# - Resolve iOS Simulator DB path via bundleId + simctl
# - Snapshot safely using sqlite3 .backup or VACUUM INTO
# - Save to db_exports/history + db_exports/latest
# -------------------------------

log() { printf "%s\n" "$*"; }
die() { printf "ERROR: %s\n" "$*" >&2; exit 1; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

need_cmd xcrun
need_cmd sqlite3
need_cmd date
need_cmd mkdir
need_cmd cp
need_cmd ls

# Project root (one level up from scripts/)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ---- Load .env.local for local dev (so EXPO_PUBLIC_* vars are visible) ----
ENV_FILE="${ENV_FILE:-.env.local}"
if [[ -f "$ROOT_DIR/$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT_DIR/$ENV_FILE"
  set +a
fi

# ---- Config (override via env) ----
DB_ENV="${DB_ENV:-dev}"                       # dev | prod
MODE="${MODE:-backup}"                        # backup | vacuum
EXPORT_ROOT="${EXPORT_ROOT:-db_exports}"       # output root folder

# Single prod lock flag (unified)
ALLOW_PROD_DB_PULL="${ALLOW_PROD_DB_PULL:-}"  # set to "true" to allow prod pull

# bundle id: REQUIRED (env or first arg)
BUNDLE_ID="${IOS_BUNDLE_ID:-${EXPO_PUBLIC_IOS_BUNDLE_ID:-}}"
if [[ -z "${BUNDLE_ID}" ]]; then
  BUNDLE_ID="${1:-}"
fi
[[ -n "${BUNDLE_ID}" ]] || die "Missing bundleId. Set EXPO_PUBLIC_IOS_BUNDLE_ID/IOS_BUNDLE_ID or pass as arg: bash scripts/dbpull.sh com.your.app"

# DB name must match app config
DB_NAME="${DB_NAME:-}"
if [[ -z "${DB_NAME}" ]]; then
  if [[ "${DB_ENV}" == "prod" ]]; then
    DB_NAME="hoh_fi_prod.db"
  else
    DB_NAME="hoh_fi_dev.db"
  fi
fi

if [[ "${DB_ENV}" == "prod" && "${ALLOW_PROD_DB_PULL}" != "true" ]]; then
  die "PROD DB pull disabled. Set ALLOW_PROD_DB_PULL=true to override locally."
fi

HISTORY_DIR="$ROOT_DIR/$EXPORT_ROOT/history"
LATEST_DIR="$ROOT_DIR/$EXPORT_ROOT/latest"
mkdir -p "$HISTORY_DIR" "$LATEST_DIR"

timestamp() {
  date +"%Y%m%d_%H%M%S"
}

get_app_container() {
  # xcrun simctl get_app_container booted <bundleId> data
  local out
  if ! out="$(xcrun simctl get_app_container booted "${BUNDLE_ID}" data 2>/dev/null)"; then
    die "Failed to resolve app container. Is the simulator booted AND the app installed? bundleId=${BUNDLE_ID}"
  fi
  [[ -n "${out}" ]] || die "simctl returned empty container path. bundleId=${BUNDLE_ID}"
  printf "%s" "${out}"
}

resolve_src_db_path() {
  local container
  container="$(get_app_container)"

  # app DB location
  local p="${container}/Documents/SQLite/${DB_NAME}"
  [[ -f "${p}" ]] || die "Source DB not found: ${p}. (Has the app created the DB yet?)"
  printf "%s" "${p}"
}

snapshot_db() {
  local src="$1"
  local dst="$2"
  mkdir -p "$(dirname "$dst")"

  local src_size
  src_size="$(ls -lh "$src" | awk '{print $5}')"
  log "· src size:    $src_size"

  if [[ "$MODE" == "backup" ]]; then
    sqlite3 "$src" ".backup '$dst'"
  elif [[ "$MODE" == "vacuum" ]]; then
    sqlite3 "$src" "VACUUM INTO '$dst';"
  else
    die "Unknown MODE=$MODE (use backup or vacuum)"
  fi

  local tables
  tables="$(sqlite3 "$dst" "SELECT name FROM sqlite_master WHERE type='table' ORDER BY 1;" || true)"
  [[ -n "$tables" ]] || die "Snapshot produced an empty DB (no tables)."

  local dst_size
  dst_size="$(ls -lh "$dst" | awk '{print $5}')"
  log "· dst size:    $dst_size"
}

copy_wal_shm_if_any() {
  local src="$1"
  local dst="$2"

  for suf in -wal -shm; do
    if [[ -f "${src}${suf}" ]]; then
      cp -f "${src}${suf}" "${dst}${suf}" || true
    fi
  done
}

main() {
  local src
  src="$(resolve_src_db_path)"

  local ts
  ts="$(timestamp)"

  local hist="$HISTORY_DIR/${DB_NAME%.db}_${ts}.db"
  local latest="$LATEST_DIR/$DB_NAME"

  log "DB PULL"
  log "· env:        $DB_ENV"
  log "· bundleId:   $BUNDLE_ID"
  log "· db:         $DB_NAME"
  log "· from:       $src"
  log "· mode:       $MODE"
  log "· history →   $hist"
  log "· latest  →   $latest"

  snapshot_db "$src" "$hist"
  copy_wal_shm_if_any "$src" "$hist"

  cp -f "$hist" "$latest"
  copy_wal_shm_if_any "$src" "$latest"

  log ""
  log "Sanity"
  log "· tables:"
  sqlite3 "$latest" "SELECT name FROM sqlite_master WHERE type='table' ORDER BY 1;" | sed 's/^/  - /'
  log ""
  log "OK"
}

main "$@"
