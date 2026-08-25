import { expect, test } from '@playwright/test';

/**
 * Contrast, measured on what actually renders.
 *
 * The unit tests check the palette; this checks the pages. They are different
 * questions, and the difference caught a false claim: the accessibility
 * statement said the lowest pairing on the site was 6.16:1, which is the
 * signal colour on white. Signal also appears on the mist surface, where it is
 * 5.42:1 — still comfortably past AA, but not what the page said.
 *
 * Publishing a contrast figure obliges us to keep it true, so the figure on the
 * page is asserted against a real measurement rather than trusted.
 */

const ROUTES = [
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

/** WCAG AA for normal text. */
const AA_NORMAL = 4.5;

/** The figure the accessibility statement publishes. */
const PUBLISHED_MINIMUM = 5.42;

async function measure(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const linear = (channel: number) => {
      const c = channel / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const parse = (value: string) => {
      const parts = value.match(/\d+(\.\d+)?/g);
      return parts ? (parts.slice(0, 3).map(Number) as [number, number, number]) : null;
    };
    const luminance = (rgb: [number, number, number]) =>
      0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);
    const ratio = (a: [number, number, number], b: [number, number, number]) => {
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
        number,
        number,
      ];
      return (light + 0.05) / (dark + 0.05);
    };

    /** The first ancestor that actually paints a background. */
    const backgroundOf = (element: Element): [number, number, number] => {
      let node: Element | null = element;
      while (node) {
        const value = getComputedStyle(node).backgroundColor;
        const rgb = parse(value);
        if (rgb && !/rgba\(.*,\s*0\)/.test(value)) return rgb;
        node = node.parentElement;
      }
      return [255, 255, 255];
    };

    const results: { ratio: number; text: string }[] = [];
    for (const element of document.querySelectorAll('main *')) {
      const hasOwnText = [...element.childNodes].some(
        (node) => node.nodeType === 3 && node.textContent?.trim(),
      );
      if (!hasOwnText) continue;

      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') continue;

      const foreground = parse(style.color);
      if (!foreground) continue;

      results.push({
        ratio: ratio(foreground, backgroundOf(element)),
        text: (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 60),
      });
    }
    return results;
  });
}

test('every piece of rendered text clears WCAG AA, and the published figure is true', async ({
  page,
}) => {
  let lowest = { ratio: Number.POSITIVE_INFINITY, text: '', route: '' };
  let measured = 0;

  for (const route of ROUTES) {
    await page.goto(route);
    for (const entry of await measure(page)) {
      measured += 1;
      expect(
        entry.ratio,
        `${route}: "${entry.text}" is ${entry.ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(AA_NORMAL);
      if (entry.ratio < lowest.ratio) lowest = { ...entry, route };
    }
  }

  expect(measured).toBeGreaterThan(300);

  /**
   * The accessibility statement names this number publicly. If the palette or
   * a surface changes so the real minimum moves, this fails and the page has to
   * be corrected rather than quietly becoming wrong.
   */
  expect(
    Number(lowest.ratio.toFixed(2)),
    `lowest is ${lowest.ratio.toFixed(2)}:1 on ${lowest.route} ("${lowest.text}") — the accessibility statement says ${PUBLISHED_MINIMUM}:1`,
  ).toBe(PUBLISHED_MINIMUM);
});

test('the accessibility statement publishes the measured figure', async ({ page }) => {
  await page.goto('/accessibility');
  const text = (await page.locator('#main').textContent()) ?? '';
  expect(text).toContain(`${PUBLISHED_MINIMUM}:1`);
});
