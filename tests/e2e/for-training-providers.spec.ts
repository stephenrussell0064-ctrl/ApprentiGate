import { expect, test } from '@playwright/test';

/**
 * For Training Providers.
 *
 * The constraints here are mostly about what the page must NOT say, because the
 * provider proposition is unvalidated and the temptation to dress it up is the
 * main risk.
 */

test.describe('for training providers', () => {
  test('is reachable from the header navigation', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'For training providers' })
      .click();

    await expect(page).toHaveURL(/\/for-training-providers$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('describes no fee model at all', async ({ page }) => {
    await page.goto('/for-training-providers');
    const text = await page.locator('#main').innerText();

    /**
     * Not a rate, not a range, not a structure. The model has not been settled,
     * and the funding rules place real limits on what a provider may pay an
     * intermediary out of — so an invented figure here could be worse than
     * merely wrong.
     */
    expect(text).not.toMatch(/£\s?\d/);
    expect(text).not.toMatch(/\d+\s?%/);
    expect(text).not.toMatch(
      /\b(commission|per placement|per learner|per apprentice|finder'?s fee|subscription fee)\b/i,
    );
    expect(text).not.toMatch(/\bwe charge\b|\bour fees? (are|is|start)\b/i);
  });

  test('uses the word "partner" about nobody', async ({ page }) => {
    await page.goto('/for-training-providers');
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/\bpartner(s|ed|ing|ship|ships)?\b/i);
  });

  test('states where the network is up to rather than implying one exists', async ({
    page,
  }) => {
    await page.goto('/for-training-providers');
    const text = await page.locator('#main').innerText();

    expect(text).toMatch(/building the provider network/i);
    expect(text).toMatch(
      /commercial arrangements are\s+agreed with each provider directly/i,
    );
    // No pipeline may be implied.
    expect(text).not.toMatch(
      /\b(our|a) (growing|extensive|established) (network|pipeline)\b/i,
    );
    expect(text).not.toMatch(/\bemployers (are )?waiting\b/i);
  });

  test('carries the approved call to action', async ({ page }) => {
    await page.goto('/for-training-providers');
    await expect(
      page.getByRole('heading', { name: 'Speak to us about our provider network.' }),
    ).toBeVisible();
    await expect(
      page.locator('#main').getByRole('link', { name: 'Speak to us' }),
    ).toBeVisible();
  });

  test('is deliberately shorter than the employer page', async ({ page }) => {
    /**
     * The Content Spec makes this page "deliberately less developed than the
     * employer side, because the provider proposition is unvalidated". That is
     * a structural instruction, so it is worth holding structurally: if a later
     * work package pads this page out to match, the imbalance the spec asked
     * for has been lost and someone should have to think about it again.
     */
    await page.goto('/for-training-providers');
    const providers = (await page.locator('#main').innerText()).length;

    await page.goto('/for-employers');
    const employers = (await page.locator('#main').innerText()).length;

    expect(providers).toBeLessThan(employers);
  });
});
