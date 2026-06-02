#!/usr/bin/env bash
set -euo pipefail

# -------------------------------
# HoH Finance Tracker - DB Reset
# - Deletes the database from iOS Simulator
# - App will recreate + reseed on next launch
# -------------------------------

log() { printf "%s\n" "$*"; }
die() { printf "ERROR: %s\n" "$*" >&2; exit 1; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

need_cmd xcrun
need_cmd rm

# Project root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load .env.local if exists
ENV_FILE="${ENV_FILE:-.env.local}"
if [[ -f "$ROOT_DIR/$ENV_FILE" ]]; then
  set -a
  source "$ROOT_DIR/$ENV_FILE"
  set +a
fi

# Bundle ID
BUNDLE_ID="${IOS_BUNDLE_ID:-${EXPO_PUBLIC_IOS_BUNDLE_ID:-com.houseofhuynh.finance}}"

# DB name
DB_ENV="${DB_ENV:-dev}"
if [[ "${DB_ENV}" == "prod" ]]; then
  DB_NAME="mmt_prod.db"
elif [[ "${DB_ENV}" == "staging" ]]; then
  DB_NAME="mmt_staging.db"
else
  DB_NAME="mmt_dev.db"
fi

get_app_container() {
  local out
  if ! out="$(xcrun simctl get_app_container booted "${BUNDLE_ID}" data 2>/dev/null)"; then
    die "Failed to resolve app container. Is the simulator booted AND the app installed? bundleId=${BUNDLE_ID}"
  fi
  [[ -n "${out}" ]] || die "simctl returned empty container path. bundleId=${BUNDLE_ID}"
  printf "%s" "${out}"
}

main() {
  local container
  container="$(get_app_container)"

  local db_dir="${container}/Documents/SQLite"
  local db_path="${db_dir}/${DB_NAME}"

  log "DB RESET"
  log "· env:        $DB_ENV"
  log "· bundleId:   $BUNDLE_ID"
  log "· db:         $DB_NAME"
  log "· path:       $db_path"
  log ""

  if [[ -f "${db_path}" ]]; then
    rm -f "${db_path}" "${db_path}-wal" "${db_path}-shm" 2>/dev/null || true
    log "✓ Deleted database files"
  else
    log "· Database file not found (already clean)"
  fi

  log ""
  log "Next steps:"
  log "  1. Restart the app in the simulator"
  log "  2. App will auto-migrate and reseed"
  log ""
  log "Or use DevTools overlay:"
  log "  - Tap 'DEV' chip → 'Reset DB' for full reset + seed"
  log ""
  log "OK"
}

main "$@"
