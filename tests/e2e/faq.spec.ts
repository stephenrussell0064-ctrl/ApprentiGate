import { expect, test } from '@playwright/test';

/**
 * FAQ.
 *
 * The structured-data checks matter most here. Search engines require FAQPage
 * markup to match what the visitor actually sees, and structured data is the
 * easiest place on a site for a claim to hide, because nobody reads it.
 */

const EXPECTED_QUESTIONS = [
  'What is ApprentiGate?',
  'Are you a training provider?',
  'Who employs the apprentice?',
  'Who chooses the apprentice?',
  'Who pays the apprentice?',
  'Who pays for the training?',
  'Can government cover the whole training cost?',
  'What does ApprentiGate cost?',
  'How do you choose which providers to recommend?',
  'Can we use a provider we already know?',
  'Why not go to a training provider directly?',
  'Do you manage recruitment?',
  'Do you work with degree apprenticeships?',
  'What size businesses do you work with?',
  'Does the apprentice pay anything?',
];

async function structuredData(page: import('@playwright/test').Page) {
  /**
   * Selected by type rather than position. Organization data was added
   * site-wide at WP12, so this page now carries two JSON-LD blocks and taking
   * the first one silently started testing the wrong thing.
   */
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();

  const faq = blocks
    .map((entry) => JSON.parse(entry) as Record<string, unknown>)
    .find((block) => block['@type'] === 'FAQPage');

  expect(faq, 'no FAQPage block found on the page').toBeTruthy();
  return faq as unknown as {
    '@type': string;
    mainEntity: { name: string; acceptedAnswer: { text: string } }[];
  };
}

/**
 * All text in the document, including answers inside collapsed <details>.
 *
 * `innerText` returns only rendered text, so it omits every collapsed answer —
 * which would make these assertions test the disclosure state rather than the
 * content. `textContent` is what a crawler and a screen reader can reach, and
 * it is what these assertions are actually about.
 */
async function documentText(page: import('@playwright/test').Page) {
  return (await page.locator('#main').textContent()) ?? '';
}

/** Every property name appearing anywhere in a parsed JSON-LD object. */
function collectKeys(value: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const entry of value) collectKeys(entry, found);
  } else if (value !== null && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      found.add(key);
      collectKeys(nested, found);
    }
  }
  return found;
}

test.describe('faq', () => {
  test('is reachable from the header navigation', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'FAQ' })
      .click();

    await expect(page).toHaveURL(/\/faq$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('asks all fifteen questions, in the Content Spec order', async ({ page }) => {
    await page.goto('/faq');
    const questions = await page.locator('#main details > summary').allInnerTexts();
    expect(questions.map((q) => q.trim())).toEqual(EXPECTED_QUESTIONS);
  });

  test('opens and closes each answer by keyboard', async ({ page }) => {
    await page.goto('/faq');
    const first = page.locator('#main details').first();

    await expect(first).not.toHaveAttribute('open', '');
    await first.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('open', '');
    await page.keyboard.press('Enter');
    await expect(first).not.toHaveAttribute('open', '');
  });

  test('keeps answers in the document even while collapsed', async ({ page }) => {
    await page.goto('/faq');
    // Collapsed, not removed — so crawlers and assistive technology reach them.
    const text = await documentText(page);
    expect(text).toContain('ApprentiGate does not teach, assess or award anything.');

    // And genuinely collapsed, not merely styled to look so.
    await expect(page.locator('#main details[open]')).toHaveCount(0);
  });

  test('publishes FAQPage structured data matching the visible answers', async ({
    page,
  }) => {
    await page.goto('/faq');
    const data = await structuredData(page);

    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(15);
    expect(data.mainEntity.map((q) => q.name)).toEqual(EXPECTED_QUESTIONS);

    /**
     * Every answer in the markup must appear verbatim on the page. Structured
     * data that promises something the page does not say is both a search
     * violation and the easiest place for an unsourced claim to survive.
     */
    const pageText = await documentText(page);
    for (const entry of data.mainEntity) {
      expect(pageText).toContain(entry.acceptedAnswer.text);
    }
  });

  test('fabricates no rating, review or award properties', async ({ page }) => {
    await page.goto('/faq');
    const data = await structuredData(page);

    /**
     * Checked as property names, not as substrings of the serialised JSON.
     * Substring matching fails on legitimate copy — the answer "does not teach,
     * assess or award anything" contains "award" — which would either raise a
     * false alarm or, worse, get silenced in a way that stops the check finding
     * a genuinely fabricated property later.
     */
    const keys = collectKeys(data);
    for (const property of [
      'aggregateRating',
      'review',
      'reviewCount',
      'award',
      'awards',
      'ratingValue',
      'bestRating',
    ]) {
      expect(keys.has(property)).toBe(false);
    }
  });

  test('keeps the funding answers conditional, as the Funding page does', async ({
    page,
  }) => {
    await page.goto('/faq');
    const text = await documentText(page);

    /**
     * A short answer format is exactly where conditions get quietly dropped.
     * "Can government cover the whole training cost?" is the riskiest question
     * on the site, because the honest answer is "yes, if" and the tempting
     * answer is "yes".
     */
    expect(text).toMatch(/eligible employers who do not pay the levy/i);
    expect(text).toMatch(/aged 16 to 24 at the start of training/i);
    expect(text).toMatch(/up to the funding band maximum/i);
    expect(text).toMatch(/confirmed case by case/i);
  });

  test('holds the line on what ApprentiGate does not do', async ({ page }) => {
    await page.goto('/faq');
    const text = await documentText(page);

    expect(text).toMatch(/we do not interview and we do not select/i);
    expect(text).toMatch(/does not teach, assess or award anything/i);
    expect(text).toMatch(/cannot be used for wages/i);
    expect(text).toMatch(/carries no weight at all/i);
  });
});
