import { test, expect } from '@playwright/test';
import { ROUTES } from '../../src/lib/navigation';

/**
 * Layout integrity at the three widths the brief makes a pass condition.
 *
 * The obvious test — `document.scrollWidth <= innerWidth` — is not enough on
 * its own, and trusting it cost us a real bug. A hero section carrying
 * `overflow-hidden` clips anything too wide instead of scrolling, so the
 * document width stays honest while the content is silently cut off mid-word.
 * That is worse than a scrollbar, not better: nothing tells you, and the copy
 * a visitor needs is simply not there.
 *
 * So this measures the elements themselves. Any element whose box extends past
 * the viewport is a failure whether or not the page can scroll to reach it.
 *
 * The tolerance is one pixel, for sub-pixel rounding in the layout engine, and
 * elements that are deliberately off-screen — the skip link, the collapsed
 * mobile menu — are excluded by testing visibility first.
 */

const WIDTHS = [
  { name: '320 (smallest supported phone)', width: 320, height: 640 },
  { name: '768 (tablet)', width: 768, height: 1024 },
  { name: '1440 (laptop)', width: 1440, height: 900 },
] as const;

const PATHS = Object.values(ROUTES);

for (const { name, width, height } of WIDTHS) {
  test.describe(`layout at ${name}`, () => {
    test.use({ viewport: { width, height } });

    for (const path of PATHS) {
      test(`${path} fits the viewport`, async ({ page }) => {
        await page.goto(path);

        const report = await page.evaluate(() => {
          const limit = window.innerWidth + 1;

          /*
           * Wide content inside a deliberate scroll container is fine: the
           * reader can reach all of it. `overflow-x: hidden` is deliberately
           * NOT accepted here — that is exactly the silent clipping this test
           * exists to catch.
           */
          const inScrollContainer = (el: Element) => {
            let node = el.parentElement;
            while (node && node !== document.body) {
              const overflowX = getComputedStyle(node).overflowX;
              if (overflowX === 'auto' || overflowX === 'scroll') return true;
              node = node.parentElement;
            }
            return false;
          };

          const overflowing = [...document.querySelectorAll('body *')]
            .filter((el) => {
              const style = getComputedStyle(el);
              if (style.visibility === 'hidden' || style.display === 'none') return false;
              // Off-screen-until-focused patterns (skip link) park themselves
              // outside the viewport on purpose.
              if (style.position === 'fixed' || style.position === 'absolute')
                return false;
              const box = el.getBoundingClientRect();
              if (box.width === 0 || box.height === 0) return false;
              if (box.right <= limit) return false;
              return !inScrollContainer(el);
            })
            .map((el) => {
              const box = el.getBoundingClientRect();
              const id = el.id ? `#${el.id}` : '';
              // The text and the computed white-space are what actually
              // identify the offender when this fails in CI, where you cannot
              // simply open the page and look at it.
              const text = (el.textContent ?? '')
                .trim()
                .replace(/\s+/g, ' ')
                .slice(0, 48);
              const ws = getComputedStyle(el).whiteSpace;
              const cls = (el.getAttribute('class') ?? '').slice(0, 70);
              const parent = el.parentElement
                ? `${el.parentElement.tagName.toLowerCase()}[${(el.parentElement.getAttribute('class') ?? '').slice(0, 50)}]`
                : '(none)';
              return `${el.tagName.toLowerCase()}${id}[${cls}] in ${parent} width=${Math.round(box.width)} right=${Math.round(box.right)} white-space=${ws} text=${JSON.stringify(text)}`;
            });

          return {
            documentWidth: document.documentElement.scrollWidth,
            viewportWidth: window.innerWidth,
            // De-duplicated: one overflowing child reports every ancestor too,
            // and the first few entries are enough to find the cause.
            overflowing: [...new Set(overflowing)].slice(0, 6),
          };
        });

        expect(
          report.overflowing,
          `Elements extend past the ${width}px viewport. The widest offenders are listed; ` +
            `check for whitespace-nowrap, a fixed width, or a grid item missing min-w-0.`,
        ).toEqual([]);

        expect(
          report.documentWidth,
          `The document scrolls horizontally at ${width}px.`,
        ).toBeLessThanOrEqual(report.viewportWidth + 1);
      });
    }
  });
}
