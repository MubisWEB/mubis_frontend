import { defineConfig, devices } from '@playwright/test';

const port = process.env.E2E_PORT || '5174';
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${port}`;
const apiURL = process.env.E2E_API_URL || process.env.VITE_API_URL || 'http://127.0.0.1:3000/api';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results/e2e',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      VITE_API_URL: apiURL,
    },
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
      },
    },
  ],
});
