import { expect, test } from '@playwright/test';
import { FUNDING_RULES_REVIEWED } from '../../src/lib/funding';

/**
 * Funding Explained.
 *
 * The most claim-dense page on the site. These assert the things that make the
 * difference between an honest funding page and a liability: the review date,
 * the conditionality, the fees statement, and the absence of figures that could
 * not be traced.
 */

test.describe('funding explained', () => {
  test('is reachable from the header navigation', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Funding' })
      .click();

    await expect(page).toHaveURL(/\/funding$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows the review date visibly, as a machine-readable time', async ({ page }) => {
    await page.goto('/funding');

    const reviewed = page.locator('#main time');
    await expect(reviewed).toBeVisible();
    await expect(reviewed).toHaveAttribute('datetime', FUNDING_RULES_REVIEWED.iso);
    await expect(reviewed).toHaveText(FUNDING_RULES_REVIEWED.display);

    /**
     * "Visible" means visible, not filed in the footer. A reader deciding how
     * much to trust a funding page needs its freshness before they read it.
     */
    const box = await reviewed.boundingBox();
    expect(box?.y ?? Infinity).toBeLessThan(900);
  });

  test('carries the mandatory fees sentence verbatim', async ({ page }) => {
    await page.goto('/funding');
    const text = await page.locator('#main').innerText();

    expect(text).toContain(
      'ApprentiGate’s fees are commercial fees paid by you. They are separate from apprenticeship funding and are not paid from it.',
    );
    /**
     * The opposite implication, matched only in the affirmative. The page says
     * "Using us is not paid for by government", which is exactly what the
     * Content Spec requires — so a pattern that fires on the phrase regardless
     * of the "not" would forbid the very sentence it exists to protect.
     * "is not paid for by" does not match "is paid for by".
     */
    expect(text).not.toMatch(/\b(is|are) paid for by (the )?government\b/i);
    expect(text).not.toMatch(/\bgovernment (pays|covers) our fees\b/i);
    expect(text).not.toMatch(/\bour fees are (funded|covered) by\b/i);
  });

  test('states the band maximum as a ceiling, both directions', async ({ page }) => {
    await page.goto('/funding');
    const text = await page.locator('#main').innerText();

    expect(text).toMatch(/ceiling, not a payment/i);
    // Under the band: nothing is paid out. Over it: the employer pays.
    expect(text).toMatch(/not paid out to anyone/i);
    expect(text).toMatch(/you pay the excess in full/i);
  });

  test('gives the age split with its conditions attached', async ({ page }) => {
    await page.goto('/funding');
    const text = await page.locator('#main').innerText();

    expect(text).toMatch(/aged 16 to 24/);
    expect(text).toMatch(/25 or over/);
    expect(text).toMatch(/95%/);
    expect(text).toMatch(/1 August 2026/);
    // Never an unconditional promise of full funding.
    expect(text).toMatch(/up to the funding band maximum/i);
  });

  test('presents the hiring payment as conditional, and claims no instalment schedule', async ({
    page,
  }) => {
    await page.goto('/funding');
    const text = await page.locator('#main').innerText();

    expect(text).toMatch(/up to £2,000/);
    expect(text).toMatch(/1 October 2026/);
    expect(text).toMatch(/90 days/);
    expect(text).toMatch(/something to check, not something to count on/i);

    /**
     * GOV.UK confirms only that the payment is "paid in instalments" and does
     * not give the schedule. The Content Spec's "two instalments, first after
     * 90 days" could not be traced, so it must not appear. An untraceable
     * detail is deleted, not softened.
     */
    expect(text).not.toMatch(/two instalments/i);
    expect(text).not.toMatch(/first instalment/i);
    expect(text).not.toMatch(/£1,000/);
  });

  test('prints no minimum wage figure, and links the rates instead', async ({ page }) => {
    await page.goto('/funding');
    const main = page.locator('#main');
    const text = await main.innerText();

    /**
     * Minimum wage rates change every April, which makes a printed figure the
     * likeliest thing on this page to go stale between quarterly reviews. The
     * condition employers actually miss is stated; the number is one click away.
     */
    expect(text).not.toMatch(/£8(\.\d+)?\s*(an hour|per hour|ph)\b/i);
    expect(text).toMatch(/under 19, or in the first year/i);

    await expect(
      main.locator('a[href="https://www.gov.uk/national-minimum-wage-rates"]'),
    ).toBeVisible();
  });

  test('names GOV.UK as the authority and links it', async ({ page }) => {
    await page.goto('/funding');
    const main = page.locator('#main');

    await expect(
      main.getByRole('link', { name: /GOV\.UK is the authority/i }),
    ).toBeVisible();
    await expect(main).toContainText(/eligibility is confirmed for each employer/i);
  });

  test('scopes itself to England', async ({ page }) => {
    await page.goto('/funding');
    const text = await page.locator('#main').innerText();

    expect(text).toMatch(/England only/i);
    expect(text).toMatch(/devolved/i);
  });

  test('lists no restricted standards, which would go stale', async ({ page }) => {
    await page.goto('/funding');
    const text = await page.locator('#main').innerText();

    expect(text).toMatch(/checked for each engagement/i);
    // Naming individual standards or levels would date the page immediately.
    expect(text).not.toMatch(/\bLevel 7\b/);
    expect(text).not.toMatch(/\b16 standards\b/);
  });
});
