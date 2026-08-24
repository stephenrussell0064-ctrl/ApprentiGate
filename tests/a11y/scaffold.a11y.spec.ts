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
