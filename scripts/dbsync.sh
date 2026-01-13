# DELETE

#!/usr/bin/env bash
set -euo pipefail

node ./scripts/dev-server.js &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 0.3

./scripts/dbpull.sh
