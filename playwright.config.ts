import { defineConfig } from '@playwright/test';

const API = 'http://localhost:8123';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5123',
  },
  webServer: [
    {
      command:
        `sh -c 'rm -f /tmp/mq-e2e.db && cd backend && ` +
        `PY="\$(test -f .venv/bin/python && echo .venv/bin/python || echo python3)" && ` +
        `PYTHONPATH=. MAINTIQ_DATABASE_URL=sqlite:////tmp/mq-e2e.db MAINTIQ_CORS_ORIGINS=http://localhost:5123 ` +
        `$PY -m app.seed >/dev/null && PYTHONPATH=. MAINTIQ_DATABASE_URL=sqlite:////tmp/mq-e2e.db ` +
        `MAINTIQ_CORS_ORIGINS=http://localhost:5123 $PY -m uvicorn app.main:app --port 8123'`,
      url: `${API}/health`,
      timeout: 120000,
      reuseExistingServer: true,
    },
    {
      command: `VITE_API_URL=${API} ./node_modules/.bin/vite --port=5123 --host=127.0.0.1`,
      url: 'http://localhost:5123',
      timeout: 120000,
      reuseExistingServer: true,
    },
  ],
});
