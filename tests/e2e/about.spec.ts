import { expect, test } from '@playwright/test';

/**
 * About.
 *
 * The two mandatory sentences, and the constraint that no employer is named
 * anywhere — which is the one that carries real risk (R7). A reader who infers
 * that a founder's employer is connected to, or endorses, this business would
 * be wrong, and the inference is easy to invite by accident.
 */

test.describe('about', () => {
  test('is reachable from the header navigation', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'About' })
      .click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('names both founders', async ({ page }) => {
    await page.goto('/about');
    const text = await page.locator('#main').innerText();

    expect(text).toContain('Stephen Russell');
    expect(text).toContain('Zaim Rana');
  });

  test('carries the mandatory honesty line about the limits of the experience', async ({
    page,
  }) => {
    await page.goto('/about');
    const text = await page.locator('#main').innerText();

    expect(text).toMatch(
      /does not by itself make anyone an expert in apprenticeship regulation or provider compliance/i,
    );
    expect(text).toMatch(/documented methodology/i);
    expect(text).toMatch(/current published rules/i);
  });

  test('carries the mandatory independence statement', async ({ page }) => {
    await page.goto('/about');
    const text = await page.locator('#main').innerText();

    expect(text).toContain(
      'ApprentiGate is independent and is not affiliated with, sponsored by or endorsed by any employer, training provider or government body.',
    );
  });

  test('names no employer, and says so rather than leaving a gap', async ({ page }) => {
    await page.goto('/about');
    const main = page.locator('#main');
    const text = await main.innerText();

    /**
     * A specific employer name cannot be tested for without knowing it, so what
     * gets blocked is the disclosure *shape* — a phrase of introduction followed
     * by a proper noun. The trailing capital is load-bearing: without it the
     * pattern fires on "the employers we work for", which is the honest line
     * this test exists to protect. Matching the phrase rather than the named
     * form is a mistake this codebase has now made three times.
     */
    for (const shape of [
      /\b(currently )?works? (at|for) [A-Z]/,
      /\bemployed (at|by) [A-Z]/,
      /\bday jobs? (at|with) [A-Z]/,
      /\bin (his|their) role at [A-Z]/,
      /\bapprenticeship (at|with) [A-Z]/,
    ]) {
      expect(text).not.toMatch(shape);
    }

    // The absence is explained, so a reader does not fill the gap themselves.
    expect(text).toMatch(/we do not name the employers we work for/i);

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description).toBeTruthy();
    for (const shape of [
      /\bworks at\b/i,
      /\bemployed by\b/i,
      /\bat [A-Z][a-z]+ (Ltd|plc|Group)\b/,
    ]) {
      expect(description!).not.toMatch(shape);
    }
  });

  test('uses no photography of people', async ({ page }) => {
    await page.goto('/about');
    /**
     * Stock photography of people posed as clients is on the prohibited list,
     * and there is no reason to add founder photos to make a two-person
     * pre-launch business look larger than it is.
     */
    await expect(page.locator('#main img')).toHaveCount(0);
  });

  test('states the pre-launch position rather than implying a track record', async ({
    page,
  }) => {
    await page.goto('/about');
    const text = await page.locator('#main').innerText();

    expect(text).toMatch(/pre-launch/i);
    expect(text).not.toMatch(/\byears of experience helping\b/i);
    expect(text).not.toMatch(/\bwe have helped\b/i);
  });
});
