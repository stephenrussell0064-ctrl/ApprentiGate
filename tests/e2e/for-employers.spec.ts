import { expect, test } from '@playwright/test';

/**
 * For Employers.
 *
 * Four things the Content Spec makes non-negotiable on this page, asserted so
 * that a later edit cannot quietly weaken them.
 */

test.describe('for employers', () => {
  test('is reachable from the header navigation', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'For employers' })
      .click();

    await expect(page).toHaveURL(/\/for-employers$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('lists all six service blocks', async ({ page }) => {
    await page.goto('/for-employers');
    const headings = await page
      .locator('#main')
      .getByRole('heading', { level: 3 })
      .allInnerTexts();

    expect(headings).toEqual([
      'Role and standard assessment',
      'Funding guidance',
      'Provider comparison',
      'Setup coordination',
      'Recruitment logistics support',
      'Ongoing programme support',
    ]);
  });

  test('states the hiring position explicitly and near the top, not buried', async ({
    page,
  }) => {
    await page.goto('/for-employers');
    const text = await page.locator('#main').innerText();

    expect(text).toMatch(/You interview, you select and you employ your apprentices\./);
    expect(text).toMatch(/ApprentiGate does not make hiring decisions\./);

    /**
     * "Prominent, not buried" is a position claim, so position is what gets
     * asserted: the statement must appear before the service blocks, not after
     * them. A reader who suspects we pick their staff reads everything below
     * it differently.
     */
    const statementIndex = text.indexOf('You interview, you select');
    const servicesIndex = text.indexOf('Role and standard assessment');
    expect(statementIndex).toBeGreaterThan(-1);
    expect(servicesIndex).toBeGreaterThan(-1);
    expect(statementIndex).toBeLessThan(servicesIndex);
  });

  test('states the comparison methodology and that commercial arrangements carry no weight', async ({
    page,
  }) => {
    await page.goto('/for-employers');
    const text = await page.locator('#main').innerText();

    // The methodology itself.
    for (const factor of [
      'Training quality and outcomes',
      'Support for you as the employer',
      'Support for the apprentice',
      'Delivery model and location',
      'Progression opportunities',
    ]) {
      expect(text).toContain(factor);
    }

    // The sentence without which the methodology is worthless (risk R6).
    expect(text).toMatch(/commercial arrangements? carr(y|ies) zero weight/i);
    expect(text).toMatch(/you make the final choice of provider/i);
  });

  test('explains KSBs as the thing that actually gets assessed', async ({ page }) => {
    await page.goto('/for-employers');
    const text = await page.locator('#main').innerText();

    expect(text).toMatch(/knowledge, skills and behaviours/i);
    // The point is the distinction, not the acronym.
    expect(text).toMatch(/not the job title/i);
    expect(text).toMatch(/day-to-day work/i);
  });

  test('promises no software, and shows no mockup of any', async ({ page }) => {
    /**
     * This replaces a test that asserted a wireframe of a future employer
     * dashboard, captioned "In development. Not currently available."
     *
     * The caption existed so nobody could mistake the diagram for working
     * software. Removing the diagram removes the need for it — and removes the
     * thing itself, which was four empty grey boxes on a live business site
     * advertising a capability that does not exist.
     *
     * The safety property it protected is kept and inverted here: the page must
     * not show a mockup, and must not describe a product as though it were
     * available.
     */
    await page.goto('/for-employers');

    await expect(page.locator('#main figure')).toHaveCount(0);
    await expect(page.locator('#main [role="img"]')).toHaveCount(0);

    const text = await page.locator('#main').innerText();
    expect(text).not.toMatch(/dashboard/i);
    expect(text).not.toMatch(/\bplatform\b/i);
    expect(text).not.toMatch(/log ?in to|sign ?in to your account/i);
  });
});
