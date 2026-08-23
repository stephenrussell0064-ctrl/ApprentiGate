import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Spread rather than `workers: undefined`, which `exactOptionalPropertyTypes`
  // rejects. Omitting it lets Playwright pick the default worker count locally.
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: process.env.CI
    ? ([['github'], ['html', { open: 'never' }]] as const)
    : ([['list']] as const),

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Kept as its own project so `pnpm test:a11y` can run the accessibility
      // gate alone, and so a failure is unambiguously an axe failure.
      name: 'a11y',
      testDir: './tests/a11y',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /**
   * Serves the real static export, not a dev server — the dev server has
   * different markup and would let an export-only bug through.
   */
  webServer: {
    command: 'pnpm build && pnpm serve:out',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // The static server logs every asset request, which buries test results.
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
