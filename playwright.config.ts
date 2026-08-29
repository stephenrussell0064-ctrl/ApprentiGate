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
    /**
     * Built with the third-party integrations configured, so the suite
     * exercises the real contact page rather than its "not configured yet"
     * fallbacks. The Turnstile key is Cloudflare's published always-passes test
     * key; the Cal link and address are fictional and never contacted, because
     * the calendar only loads on click and the form posts to a Worker that is
     * not running here.
     *
     * Every variable the suite depends on is set here explicitly, including the
     * ones it wants *empty*. Next reads `.env.local`, so without pinning them
     * the suite inherits whatever the machine happens to have configured for
     * production — and it did: adding a `.env.local` with
     * NEXT_PUBLIC_ALLOW_INDEXING=true turned two robots assertions red without
     * a line of source changing. A test run has to describe its own world.
     */
    command: [
      'NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA',
      'NEXT_PUBLIC_CAL_LINK=apprentigate/consultation',
      'NEXT_PUBLIC_ENQUIRIES_EMAIL=enquiries@example.test',
      // Asserted as noindex by scaffold.spec.ts and seo.spec.ts.
      'NEXT_PUBLIC_ALLOW_INDEXING=',
      'NEXT_PUBLIC_SITE_URL=',
      'NEXT_PUBLIC_BUSINESS_PHONE=',
      'NEXT_PUBLIC_COMPANY_NUMBER=',
      'NEXT_PUBLIC_ANALYTICS_TOKEN=',
      'pnpm build && pnpm serve:out',
    ].join(' '),
    url: BASE_URL,
    /**
     * Never reuse. Reusing a leftover server means the suite silently tests a
     * stale `out/` — which is exactly what happened, and it defeats the reason
     * these tests serve the built export at all. Starting fresh every run costs
     * a rebuild; if the port is occupied Playwright fails loudly, which is far
     * better than a green run against yesterday's build.
     */
    reuseExistingServer: false,
    timeout: 180_000,
    // The static server logs every asset request, which buries test results.
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
