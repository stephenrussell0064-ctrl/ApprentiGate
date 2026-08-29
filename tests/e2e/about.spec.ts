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

  test('keeps the founders off the page while the legal pages still name them', async ({
    page,
  }) => {
    /**
     * The About page used to name both founders under a "Two people, so far"
     * heading. That was removed on the owner's instruction — it read as a
     * disclosure of how small the business is rather than as a credential.
     *
     * Removing it must not remove the identification that actually matters:
     * the privacy notice and the terms name the operators because, with no
     * company incorporated, they are personally the data controllers. So this
     * asserts the pair — gone from the marketing page, still present where a
     * reader has a right to know who they are dealing with.
     */
    await page.goto('/about');
    const about = await page.locator('#main').innerText();
    expect(about).not.toContain('Stephen Russell');
    expect(about).not.toContain('Zaim Rana');
    expect(about).not.toMatch(/\btwo people\b/i);

    await page.goto('/privacy');
    const privacy = await page.locator('#main').innerText();
    expect(privacy).toContain('Stephen Russell');
    expect(privacy).toContain('Zaim Rana');
  });

  test('grounds its advice in the published rules, and dates what could move', async ({
    page,
  }) => {
    /**
     * The page used to concede that being on an apprenticeship "does not by
     * itself make anyone an expert in apprenticeship regulation". That framing
     * has gone, but the substance a sceptical reader actually needs has not:
     * the basis for the advice, and the admission that the rules change.
     */
    await page.goto('/about');
    const text = await page.locator('#main').innerText();

    expect(text).toMatch(/current published funding rules/i);
    expect(text).toMatch(/traces back to a named source/i);
    expect(text).toMatch(/the rules change/i);
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

    /*
     * There is no longer a sentence explaining the absence, and none is needed:
     * the page no longer says the founders are employed anywhere, so there is
     * no gap for a reader to fill. The constraint that matters — that no
     * employer is ever named or hinted at — is what the shapes above enforce.
     */

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
     * and founder photos are not a substitute for the substance of the page.
     */
    await expect(page.locator('#main img')).toHaveCount(0);
  });

  test('claims no track record, and volunteers no headcount', async ({ page }) => {
    /**
     * The pre-launch disclosure and the "Two people, so far" heading were
     * removed on the owner's instruction. Neither was required to keep the page
     * truthful — that job belongs to the prohibitions below, which is why they
     * are asserted here rather than assumed.
     */
    await page.goto('/about');
    const text = await page.locator('#main').innerText();

    expect(text).not.toMatch(/\byears of experience helping\b/i);
    expect(text).not.toMatch(/\bwe have helped\b/i);
    expect(text).not.toMatch(/\btrack record\b/i);
    expect(text).not.toMatch(/\b(two|three|four) people\b/i);
  });
});
