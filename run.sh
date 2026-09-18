#!/usr/bin/env bash
# MaintIQ launcher: backend API + frontend web. Exits after both are up.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
API_PORT="${API_PORT:-}"
WEB_PORT="${WEB_PORT:-}"
DB_URL="${MAINTIQ_DATABASE_URL:-sqlite:///./maintiq.db}"
API_PID=/tmp/maintiQ-api.pid
WEB_PID=/tmp/maintiQ-web.pid

# Pick a free port: shouted ports on this machine are taken
# (e.g. :3000 serves Metabase, :8000 another API).
pick_port() {
  python3 - "$@" <<'EOF'
import socket, sys
for p in map(int, sys.argv[1:]):
    with socket.socket() as s:
        try:
            s.bind(("127.0.0.1", p))
        except OSError:
            continue
        print(p)
        break
EOF
}

[ -n "$API_PORT" ] || API_PORT=$(pick_port 8000 8100 8001 8010 5000)
[ -n "$WEB_PORT" ] || WEB_PORT=$(pick_port 5173 3001 3002 8080 4173)

stop_old() {
  for f in "$API_PID" "$WEB_PID"; do
    if [ -f "$f" ] && kill -0 "$(cat "$f")" 2>/dev/null; then kill "$(cat "$f")" 2>/dev/null || true; fi
  done
  sleep 1
}
stop_old

echo "[MaintIQ] root: $ROOT api:$API_PORT web:$WEB_PORT"
[ -x "$BACKEND/.venv/bin/python" ] || python3 -m venv "$BACKEND/.venv"
"$BACKEND/.venv/bin/pip" install -q -r "$BACKEND/requirements.txt"
[ -d "$ROOT/node_modules" ] || (cd "$ROOT" && npm install --legacy-peer-deps)
(cd "$BACKEND" && PYTHONPATH=. MAINTIQ_DATABASE_URL="$DB_URL" .venv/bin/python -m app.seed)

(cd "$BACKEND" && PYTHONPATH=. MAINTIQ_DATABASE_URL="$DB_URL" MAINTIQ_CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3100,http://localhost:4173,http://localhost:5173,http://localhost:8080" nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port "$API_PORT" > /tmp/maintiQ-api.log 2>&1 & echo $! > "$API_PID"; disown || true)
(cd "$ROOT" && VITE_API_URL="http://localhost:$API_PORT" nohup ./node_modules/.bin/vite --port="$WEB_PORT" --host=0.0.0.0 > /tmp/maintiQ-web.log 2>&1 & echo $! > "$WEB_PID"; disown || true)

for i in $(seq 1 20); do
  if curl -sm 2 "http://localhost:$API_PORT/health" | grep -q ok; then break; fi
  sleep 1
done
echo "[MaintIQ] API: $(curl -sm 3 "http://localhost:$API_PORT/health" || echo NOT-READY)"
WEB_URL=$(grep -oE "http://localhost:[0-9]+/" /tmp/maintiQ-web.log | tail -n 1)
[ -z "$WEB_URL" ] && WEB_URL="http://localhost:$WEB_PORT/"
echo "[MaintIQ] Web: $WEB_URL  API docs: http://localhost:$API_PORT/docs"
echo ""
echo "==============================================="
echo "  Open this page: $WEB_URL"
echo "  Sign in with one of these accounts:"
echo "    admin   / admin123   (full access)"
echo "    manager / manager123 (maintenance actions)"
echo "    viewer  / viewer123  (read-only)"
echo "==============================================="
echo "[MaintIQ] stop: kill $(cat $API_PID) $(cat $WEB_PID)"
if command -v xdg-open >/dev/null 2>&1; then
  nohup xdg-open "$WEB_URL" >/dev/null 2>&1 & disown || true
  echo "[MaintIQ] browser opened."
elif command -v open >/dev/null 2>&1; then
  open "$WEB_URL" || true
else
  echo "[MaintIQ] no browser opener found; open the URL above manually."
fi
