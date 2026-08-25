import { expect, test } from '@playwright/test';
import { POLICY_UPDATED } from '../../src/lib/legal';

/**
 * The four compliance pages.
 *
 * The cookie policy's assertions are the important ones: the brief requires it
 * to match what the site actually sets, so the test measures the browser rather
 * than reading the page and taking its word.
 */

const COMPLIANCE_PAGES = [
  { path: '/privacy', name: 'Privacy notice' },
  { path: '/cookies', name: 'Cookie policy' },
  { path: '/terms', name: 'Terms of use' },
  { path: '/accessibility', name: 'Accessibility statement' },
];

test.describe('compliance pages', () => {
  for (const page_ of COMPLIANCE_PAGES) {
    test(`${page_.name} is reachable from the footer of every page`, async ({ page }) => {
      // Checked from a content page, not just the home page, because the footer
      // is where these have to be reachable from anywhere.
      await page.goto('/funding');
      await page
        .getByRole('navigation', { name: 'Legal' })
        .getByRole('link', { name: page_.name })
        .click();

      await expect(page).toHaveURL(new RegExp(`${page_.path}$`));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test(`${page_.name} shows when it was last reviewed`, async ({ page }) => {
      await page.goto(page_.path);
      const reviewed = page.locator('#main time');
      await expect(reviewed).toBeVisible();
      await expect(reviewed).toHaveAttribute('datetime', POLICY_UPDATED.iso);
    });
  }
});

test.describe('cookie policy', () => {
  /**
   * The acceptance criterion is that the policy matches what the site actually
   * sets. So this measures the browser and compares it with the claim, rather
   * than checking that the page contains a reassuring sentence.
   */
  test('is true: the site sets no cookies and stores nothing', async ({ page }) => {
    await page.goto('/cookies');
    await page.waitForLoadState('networkidle');

    const stored = await page.evaluate(() => ({
      cookies: document.cookie,
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    }));

    expect(stored.cookies).toBe('');
    expect(stored.local).toEqual([]);
    expect(stored.session).toEqual([]);
  });

  test('is true on the contact page too, where the bot check loads', async ({ page }) => {
    await page.goto('/contact');

    /*
     * Wait for the thing we actually care about — the widget having run —
     * rather than for the network to fall idle and then a fixed three
     * seconds on top.
     *
     * `networkidle` never settles here, because the Turnstile script keeps a
     * connection to challenges.cloudflare.com busy; it burned its 30s timeout
     * and failed in CI while passing locally. The hidden response field is
     * Turnstile's own signal that it has initialised and issued a token, so
     * waiting for it is both faster and a stronger guarantee than the sleep
     * it replaces — the assertion below is only meaningful if the widget ran,
     * and now the test cannot reach it otherwise.
     */
    await expect(page.locator('[name="cf-turnstile-response"]')).toBeAttached({
      timeout: 30_000,
    });

    const stored = await page.evaluate(() => ({
      cookies: document.cookie,
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    }));
    expect(stored.cookies).toBe('');
    expect(stored.local).toEqual([]);
    expect(stored.session).toEqual([]);
  });

  test('describes no cookie that is not set', async ({ page }) => {
    await page.goto('/cookies');
    const text = (await page.locator('#main').textContent()) ?? '';

    // The failure the brief warns against: a boilerplate policy listing
    // categories of cookie the site has never set.
    expect(text).not.toMatch(/\b(strictly )?necessary cookies\b/i);
    expect(text).not.toMatch(/\bperformance cookies\b/i);
    expect(text).not.toMatch(/\btargeting cookies\b/i);
    expect(text).not.toMatch(/\bmanage your (cookie )?preferences\b/i);
  });

  test('names the two third-party services honestly', async ({ page }) => {
    await page.goto('/cookies');
    const text = (await page.locator('#main').textContent()) ?? '';

    expect(text).toMatch(/Turnstile/);
    expect(text).toMatch(/Cal\.com/);
    expect(text).toMatch(/do not load it until you press the button/i);
  });
});

test.describe('privacy notice', () => {
  test('covers what UK GDPR requires it to cover', async ({ page }) => {
    await page.goto('/privacy');
    const text = (await page.locator('#main').textContent()) ?? '';

    expect(text).toMatch(/data controllers/i);
    expect(text).toMatch(/lawful basis is your\s+consent/i);
    expect(text).toMatch(/24 months/);
    expect(text).toMatch(/Information Commissioner/i);
    // Named processors, not a vague gesture at "trusted third parties".
    for (const processor of ['Cloudflare', 'Resend', 'Cal.com']) {
      expect(text).toContain(processor);
    }
  });

  test('states consent is never pre-given, matching the form', async ({ page }) => {
    await page.goto('/privacy');
    const text = (await page.locator('#main').textContent()) ?? '';
    expect(text).toMatch(/never ticked for you/i);
    expect(text).toMatch(/withdraw consent at any time/i);
  });
});

test.describe('terms of use', () => {
  test('says plainly that this is information rather than advice', async ({ page }) => {
    await page.goto('/terms');
    const text = (await page.locator('#main').textContent()) ?? '';

    expect(text).toMatch(/not advice about your business/i);
    expect(text).toMatch(/not legal, financial, tax, employment or regulatory advice/i);
  });

  test('disclaims funding, outcomes, provider capacity and candidates', async ({
    page,
  }) => {
    await page.goto('/terms');
    const text = (await page.locator('#main').textContent()) ?? '';

    expect(text).toMatch(
      /do not guarantee that you will receive apprenticeship funding/i,
    );
    expect(text).toMatch(/do not guarantee any particular outcome/i);
    expect(text).toMatch(/do not guarantee that a training provider will have capacity/i);
    expect(text).toMatch(/GOV\.UK is right/i);
  });
});

test.describe('accessibility statement', () => {
  test('names the conformance level and what was tested', async ({ page }) => {
    await page.goto('/accessibility');
    const text = (await page.locator('#main').textContent()) ?? '';

    expect(text).toMatch(/Web Content Accessibility Guidelines 2\.2/);
    expect(text).toMatch(/level AA/);
    expect(text).toMatch(/320px, 768px and 1440px/);
  });

  test('admits the limitations rather than claiming full conformance', async ({
    page,
  }) => {
    await page.goto('/accessibility');
    const text = (await page.locator('#main').textContent()) ?? '';

    /**
     * The statement must not get ahead of the work. Automated verification is
     * done and recorded in QA-REPORT.md, but nobody has used a screen reader on
     * the site from top to bottom — and an accessibility statement is a poor
     * place to start being unreliable. This asserts the admission survives, so
     * it cannot be tidied away before the audit that would justify removing it.
     */
    expect(text).toMatch(/Nobody has listened to the whole site yet/i);
    expect(text).toMatch(/not the same as someone actually using one/i);
    expect(text).toMatch(/provided by Cal\.com and we do not control its accessibility/i);
    expect(text).toMatch(/aim to reply within five working days/i);
  });
});
