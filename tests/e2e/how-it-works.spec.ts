import { expect, test } from '@playwright/test';

/**
 * How It Works.
 *
 * These assert the things the Content Spec makes non-negotiable about this
 * page, so a later edit cannot quietly undo them.
 */

test.describe('how it works', () => {
  test('is reachable from the header navigation', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'How it works' })
      .click();

    await expect(page).toHaveURL(/\/how-it-works$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('presents the steps as a real ordered list, not styled decoration', async ({
    page,
  }) => {
    await page.goto('/how-it-works');

    // The order carries meaning, so it has to be an <ol> for screen readers
    // too — numbered markers that are only visual would be worse than none.
    const list = page.locator('#main ol');
    await expect(list).toHaveCount(1);
    await expect(list.locator('> li')).toHaveCount(6);
  });

  test('keeps the six steps in the order the Content Spec sets', async ({ page }) => {
    await page.goto('/how-it-works');

    const headings = await page
      .locator('#main ol > li')
      .getByRole('heading')
      .allInnerTexts();
    expect(headings).toEqual([
      'Tell us the roles you need',
      'We check whether an apprenticeship fits, and find the standard',
      'We explain the funding position for your business',
      'We research and compare approved providers',
      'You choose your provider',
      'We coordinate the setup',
    ]);
  });

  test('keeps the heading order unbroken', async ({ page }) => {
    /**
     * The steps sit directly under the page's h1 with no section heading
     * between, so they must be h2. They were h3 initially, which skipped a
     * level and broke heading navigation for screen reader users — axe stayed
     * silent because heading-order is a best-practice rule rather than a WCAG
     * criterion, which is why that tag is now in the axe suite too.
     */
    await page.goto('/how-it-works');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(
      page.locator('#main ol > li').getByRole('heading', { level: 2 }),
    ).toHaveCount(6);
  });

  test('says what each step asks of the employer', async ({ page }) => {
    await page.goto('/how-it-works');

    /**
     * Without this line on every step the sequence reads as though the service
     * does everything, which sets up the wrong expectation before the first
     * call. Six steps, six "You" lines.
     */
    const employerLines = page.locator('#main ol > li').getByText('You', { exact: true });
    await expect(employerLines).toHaveCount(6);
  });

  test('states that the employer makes the provider decision', async ({ page }) => {
    await page.goto('/how-it-works');
    const text = await page.locator('#main').innerText();
    expect(text).toMatch(/make the final decision/i);
  });

  test('invents no elapsed times, and explains their absence', async ({ page }) => {
    await page.goto('/how-it-works');
    const text = await page.locator('#main').innerText();

    // The Content Spec names "within 48 hours" as the exact kind of number not
    // to invent. Nothing on this page may promise a duration.
    expect(text).not.toMatch(/within \d+ (hours|days|weeks)/i);
    expect(text).not.toMatch(/\b\d+[-\s](hour|day|week)\s+turnaround\b/i);
    expect(text).not.toMatch(/\bsame day\b/i);

    // An unexplained gap invites the reader to assume the worst.
    expect(text).toMatch(/timings depend on your situation/i);
  });
});
