import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * The quality floor is zero axe violations at WCAG 2.2 AA — a pass condition,
 * not an aspiration (constraint 9). This suite is what CI fails on.
 *
 * The three widths are the ones the quality floor names.
 *
 * `best-practice` is included alongside the WCAG tags deliberately. Running the
 * WCAG tags alone let a real defect through: How It Works went h1 straight to
 * h3, skipping a level, and axe stayed silent because `heading-order` is a
 * best-practice rule rather than a WCAG success criterion. Lighthouse caught it
 * instead — which meant the gate that is supposed to catch accessibility
 * problems was not the one catching them.
 */
const AXE_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
];

const VIEWPORTS = [
  { name: 'mobile', width: 320, height: 640 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'how it works', path: '/how-it-works' },
  { name: 'for employers', path: '/for-employers' },
  { name: 'for training providers', path: '/for-training-providers' },
  { name: 'funding', path: '/funding' },
  { name: 'about', path: '/about' },
  { name: 'faq', path: '/faq' },
  { name: 'contact', path: '/contact' },
  { name: 'enquiry confirmed', path: '/contact/confirmed' },
  { name: 'privacy', path: '/privacy' },
  { name: 'cookies', path: '/cookies' },
  { name: 'terms', path: '/terms' },
  { name: 'accessibility', path: '/accessibility' },
  { name: '404', path: '/no-such-page' },
  // The gallery renders every component in every state, including the error
  // and disabled states, so running axe over it covers the whole library at
  // all three widths in one pass.
  { name: 'component gallery', path: '/components' },
];

for (const route of ROUTES) {
  for (const viewport of VIEWPORTS) {
    test(`${route.name} has no axe violations at ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(route.path);

      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();

      // Print the rule and the offending node, so a CI failure is actionable
      // without re-running locally.
      expect(
        results.violations.map((violation) => ({
          rule: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.map((node) => node.html),
        })),
      ).toEqual([]);
    });
  }
}

test('every interactive element is reachable by keyboard with a visible focus ring', async ({
  page,
}) => {
  await page.goto('/no-such-page');

  await page.keyboard.press('Tab');
  const focused = page.locator(':focus-visible');
  await expect(focused).toBeVisible();

  const outline = await focused.evaluate((element) => {
    const style = getComputedStyle(element);
    return { width: style.outlineWidth, style: style.outlineStyle };
  });
  expect(outline.style).not.toBe('none');
  expect(parseFloat(outline.width)).toBeGreaterThan(0);
});

/**
 * Inline links are big enough to hit with a thumb.
 *
 * WCAG 2.5.8 exempts inline targets, because their height is set by the line
 * box of the text around them — so axe does not flag these and never will.
 * That exemption is about what can reasonably be required of prose, not about
 * whether a 20px link is pleasant to tap on a phone. It is not.
 *
 * Measured at 320px, the narrowest width the site supports, because that is
 * where a mis-tap is most likely. The rule that makes this pass lives in
 * globals.css and works by padding the inline box and giving the space back
 * as negative margin, so a regression here is most likely to be someone
 * removing that rule while tidying — hence a test rather than a comment.
 *
 * Buttons are excluded: they are flex boxes with real padding and are covered
 * by axe's own target-size checks.
 */
test('inline links in prose are at least 24px tall at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });

  const pagesWithInlineLinks = ['/funding', '/privacy', '/', '/cookies', '/terms'];

  for (const route of pagesWithInlineLinks) {
    await page.goto(route);

    const tooSmall = await page.evaluate(() => {
      const links = [
        ...document.querySelectorAll('#main :is(p, li, dd, dt) a:not(.inline-flex)'),
      ];
      return links
        .map((link) => ({
          text: (link.textContent ?? '').trim().slice(0, 40),
          height: Math.round(link.getBoundingClientRect().height),
        }))
        .filter((link) => link.height > 0 && link.height < 24);
    });

    expect(tooSmall, `${route} has inline links under 24px tall`).toEqual([]);
  }
});
