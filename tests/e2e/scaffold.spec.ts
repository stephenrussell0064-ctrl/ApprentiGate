import { expect, test } from '@playwright/test';

test.describe('static export', () => {
  test('serves the home page with the approved hero heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Build your apprenticeship programme without the complexity.',
    );
  });

  test('declares British English on the document', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
  });

  test('renders the custom 404 page for an unknown path', async ({ page }) => {
    const response = await page.goto('/no-such-page');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  });

  test('logs nothing to the console and requests nothing that 404s', async ({ page }) => {
    const errors: string[] = [];

    // Report the failing URL, not just that something failed. A bare
    // "Failed to load resource" tells you a gate is red without telling you
    // which file to add, which makes the failure unactionable in CI.
    page.on('response', (response) => {
      if (response.status() >= 400) {
        errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
      }
    });
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('Failed to load')) {
        errors.push(message.text());
      }
    });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });

  test('keeps crawlers out until indexing is explicitly enabled', async ({ page }) => {
    await page.goto('/');
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /noindex/);
  });

  test('serves a favicon, so no request 404s', async ({ page }) => {
    await page.goto('/');
    const href = await page.locator('link[rel="icon"]').first().getAttribute('href');
    expect(href).toBeTruthy();

    const response = await page.request.get(href!);
    expect(response.status()).toBe(200);
  });

  /**
   * The destinations do not exist until WP2 and WP10. Asserting the hrefs
   * rather than following them keeps the intent recorded without pretending
   * the routes are built.
   */
  test('points both calls to action at their eventual destinations', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('link', { name: 'Explore apprenticeships for your business' }),
    ).toHaveAttribute('href', '/contact');
    await expect(page.getByRole('link', { name: 'See how it works' })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
  });
});

test.describe('design system', () => {
  test('consumes the colour tokens rather than literal values', async ({ page }) => {
    await page.goto('/');

    const signal = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-ag-signal')
        .trim(),
    );
    expect(signal).toBe('#0b6e5f');

    /**
     * The call to action must actually resolve to that token. Asserting the
     * rendered colour rather than the class name is what catches the failure
     * mode this very test was written after: `text-[var(--x)]` is ambiguous to
     * Tailwind between colour and font-size, so the label colour was silently
     * dropped and the button failed contrast. Comparing computed values
     * catches that; comparing markup would not.
     */
    const rendered = await page
      .getByRole('link', { name: 'Explore apprenticeships for your business' })
      .evaluate((element) => {
        const style = getComputedStyle(element);
        return { background: style.backgroundColor, text: style.color };
      });

    const probe = await page.evaluate(() => {
      const element = document.createElement('span');
      element.style.backgroundColor = 'var(--color-ag-signal)';
      element.style.color = 'var(--color-ag-paper)';
      document.body.append(element);
      const style = getComputedStyle(element);
      const values = { background: style.backgroundColor, text: style.color };
      element.remove();
      return values;
    });

    expect(rendered.background).toBe(probe.background);
    expect(rendered.text).toBe(probe.text);
  });

  test('renders the relay band naming all three parties', async ({ page }) => {
    await page.goto('/');
    const band = page.getByRole('group', { name: /How the three parties relate/i });
    await expect(band).toBeVisible();
    await expect(band.getByText('Employer', { exact: true })).toBeVisible();
    await expect(band.getByText('ApprentiGate', { exact: true })).toBeVisible();
    await expect(band.getByText('Training provider', { exact: true })).toBeVisible();
  });

  test('gives every call to action a touch target of at least 44px', async ({ page }) => {
    await page.goto('/');
    for (const name of [
      'Explore apprenticeships for your business',
      'See how it works',
    ]) {
      const box = await page.getByRole('link', { name }).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });
});
