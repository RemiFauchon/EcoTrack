import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright — tests E2E ECOTRACK.
 * Démarrer la stack avant : `cd app && docker compose up -d`
 * Puis :                    `cd app/e2e && npm test`
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,           // évite les courses sur l'API (auth/seed)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
