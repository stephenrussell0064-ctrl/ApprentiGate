import { expect, test } from '@playwright/test';

/**
 * SEO, structured data and AI-search metadata.
 *
 * Two things get real scrutiny here. Structured data is where a fabricated
 * claim is likeliest to survive, because nobody reads it. And every absolute
 * URL must derive from the site-URL variable — if one is written out longhand,
 * the domain cutover stops being a configuration change.
 */

/** Pages meant to be found, and the title each should carry. */
const INDEXABLE = [
  '/',
  '/how-it-works',
  '/for-employers',
  '/for-training-providers',
  '/funding',
  '/about',
  '/faq',
  '/contact',
  '/privacy',
  '/cookies',
  '/terms',
  '/accessibility',
];

const NOINDEX = ['/components', '/contact/confirmed'];

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

async function structuredDataBlocks(page: import('@playwright/test').Page) {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.map((entry) => JSON.parse(entry) as Record<string, unknown>);
}

test.describe('titles and descriptions', () => {
  test('every page has a unique title and description', async ({ page }) => {
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();

    for (const path of INDEXABLE) {
      await page.goto(path);
      const title = await page.title();
      const description =
        (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';

      expect(title, `${path} has no title`).toBeTruthy();
      expect(description, `${path} has no description`).toBeTruthy();
      titles.set(path, title);
      descriptions.set(path, description);
    }

    expect(new Set(titles.values()).size, 'two pages share a title').toBe(
      INDEXABLE.length,
    );
    expect(new Set(descriptions.values()).size, 'two pages share a description').toBe(
      INDEXABLE.length,
    );
  });

  test('titles stay under 60 characters and descriptions under 155', async ({ page }) => {
    // Content Spec 5. Beyond these, search engines truncate and the end of the
    // sentence is simply not read.
    for (const path of INDEXABLE) {
      await page.goto(path);
      const title = await page.title();
      const description =
        (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';

      expect(
        title.length,
        `${path} title is ${title.length} chars: ${title}`,
      ).toBeLessThanOrEqual(60);
      expect(
        description.length,
        `${path} description is ${description.length} chars`,
      ).toBeLessThanOrEqual(155);
    }
  });
});

test.describe('canonical and social URLs', () => {
  test('every page declares a canonical URL matching its own path', async ({ page }) => {
    for (const path of INDEXABLE) {
      await page.goto(path);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical, `${path} has no canonical`).toBeTruthy();
      expect(new URL(canonical!).pathname).toBe(path);
    }
  });

  test('every absolute URL derives from the configured site URL', async ({ page }) => {
    await page.goto('/funding');

    const urls = await page.evaluate(() => {
      const values: string[] = [];
      for (const selector of [
        'link[rel="canonical"]',
        'meta[property="og:url"]',
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
      ]) {
        const element = document.querySelector(selector);
        const value = element?.getAttribute('href') ?? element?.getAttribute('content');
        if (value) values.push(value);
      }
      return values;
    });

    expect(urls.length).toBeGreaterThanOrEqual(4);
    for (const url of urls) {
      // The test build is served from a configured origin; the point is that
      // they all share one, rather than one being written out by hand.
      expect(new URL(url).origin).toBe(new URL(urls[0]!).origin);
    }
  });

  test('the social card is a real PNG served with the right content type', async ({
    page,
  }) => {
    await page.goto('/');
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(image).toMatch(/\/og\.png$/);

    /**
     * The extension is load-bearing. Next's `opengraph-image` convention emits
     * an extensionless file, Cloudflare derives an asset's MIME type from its
     * extension, and a scraper handed an image with no content type renders no
     * card at all.
     */
    const response = await page.request.get(new URL(image!).pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
  });
});

test.describe('structured data', () => {
  test('every page carries Organization data', async ({ page }) => {
    for (const path of ['/', '/funding', '/about']) {
      await page.goto(path);
      const blocks = await structuredDataBlocks(page);
      const organization = blocks.find((block) => block['@type'] === 'Organization');
      expect(organization, `${path} has no Organization data`).toBeTruthy();
      expect(organization!['name']).toBe('ApprentiGate');
    }
  });

  test('is valid JSON on every page that has any', async ({ page }) => {
    for (const path of [...INDEXABLE, ...NOINDEX]) {
      await page.goto(path);
      // JSON.parse throwing is the failure; this asserts it did not.
      const blocks = await structuredDataBlocks(page);
      for (const block of blocks) {
        expect(block['@context']).toBe('https://schema.org');
        expect(block['@type']).toBeTruthy();
      }
    }
  });

  test('fabricates no rating, review or award property anywhere', async ({ page }) => {
    const forbidden = [
      'aggregateRating',
      'ratingValue',
      'reviewCount',
      'review',
      'award',
      'awards',
      'bestRating',
    ];

    for (const path of INDEXABLE) {
      await page.goto(path);
      for (const block of await structuredDataBlocks(page)) {
        const keys = collectKeys(block);
        for (const property of forbidden) {
          expect(keys.has(property), `${path} declares ${property}`).toBe(false);
        }
      }
    }
  });

  test('claims England rather than the UK, as the copy does', async ({ page }) => {
    await page.goto('/');
    const blocks = await structuredDataBlocks(page);
    const organization = blocks.find((block) => block['@type'] === 'Organization');
    // Funding is devolved; claiming UK coverage would be a factual error in the
    // markup exactly as it would be in the copy.
    expect(JSON.stringify(organization)).toContain('England');
    expect(JSON.stringify(organization)).not.toMatch(/United Kingdom|"GB"/);
  });
});

test.describe('robots and sitemap', () => {
  test('robots.txt refuses all crawling while indexing is disabled', async ({
    request,
  }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();

    // The default, and the thing that stops a preview URL being indexed.
    expect(body).toMatch(/User-Agent: \*/i);
    expect(body).toMatch(/Disallow: \/\s*$/m);
    expect(body).not.toMatch(/^Allow: \//m);
  });

  test('the sitemap lists indexable pages and excludes the rest', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();

    for (const path of INDEXABLE) {
      const expected =
        path === '/' ? /<loc>[^<]+\/<\/loc>/ : new RegExp(`<loc>[^<]+${path}</loc>`);
      expect(body, `sitemap is missing ${path}`).toMatch(expected);
    }

    // A sitemap listing a noindex page tells a search engine one thing while
    // the page tells it another.
    for (const path of NOINDEX) {
      expect(body, `sitemap should not list ${path}`).not.toContain(`${path}</loc>`);
    }
  });
});

test.describe('llms.txt', () => {
  test('is served as plain text', async ({ request }) => {
    const response = await request.get('/llms.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
  });

  test('states the boundaries an assistant would otherwise guess wrong', async ({
    request,
  }) => {
    const body = await (await request.get('/llms.txt')).text();

    /**
     * The whole reason this file exists. An assistant asked what ApprentiGate
     * is will infer "training provider" or "recruiter" from an
     * apprenticeship-shaped site — the same wrong guess a human makes, and the
     * one the home page spends its first section correcting.
     */
    expect(body).toMatch(/Not a training provider/i);
    expect(body).toMatch(/Not a recruitment agency/i);
    expect(body).toMatch(/Not an end-point assessment organisation/i);
    expect(body).toMatch(/England only/i);
    expect(body).toMatch(/never guaranteed/i);
    expect(body).toMatch(/separate from\s+apprenticeship funding/i);
    expect(body).toMatch(/pre-launch and not yet incorporated/i);
  });
});
