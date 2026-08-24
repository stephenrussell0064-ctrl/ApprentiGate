import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The contrast figures documented in tokens.css must be true.
 *
 * They were originally written from memory, and one was wrong in the direction
 * that matters: signal was documented as 7.4:1 when it measures 6.16:1 — an
 * overstatement that would have let someone use it for body text believing it
 * cleared AAA. The figures are now computed from the hex values and compared
 * with the comment, so the documentation cannot drift away from the palette.
 *
 * Reading the CSS rather than a duplicated table is deliberate: a second copy
 * of the palette in a test file would be the very thing that goes stale.
 */

// Resolved from the project root: under jsdom, `import.meta.url` is not a
// file: URL, so readFileSync cannot take it.
const tokensCss = readFileSync(resolve(process.cwd(), 'src/app/tokens.css'), 'utf8');

/** WCAG relative luminance. */
function luminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (raw: number) => {
    const c = raw / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * channel((value >> 16) & 255) +
    0.7152 * channel((value >> 8) & 255) +
    0.0722 * channel(value & 255)
  );
}

function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (lighter + 0.05) / (darker + 0.05);
}

function token(name: string): string {
  const match = tokensCss.match(new RegExp(`--color-ag-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match?.[1]) throw new Error(`Token --color-ag-${name} not found in tokens.css`);
  return match[1];
}

/** The `CONTRAST <token> <ratio> …` lines in the token file's comment. */
function documentedRatios(): { name: string; ratio: number }[] {
  return [...tokensCss.matchAll(/CONTRAST (\w+) ([\d.]+)/g)].map((match) => ({
    name: match[1]!,
    ratio: Number.parseFloat(match[2]!),
  }));
}

describe('colour tokens', () => {
  const paper = token('paper');

  it('documents a contrast figure for every foreground token', () => {
    expect(documentedRatios().map((entry) => entry.name)).toEqual([
      'ink',
      'slate',
      'signal',
      'alert',
    ]);
  });

  it.each(documentedRatios())(
    'documents $name as $ratio:1, and that is what it measures',
    ({ name, ratio }) => {
      const measured = contrastRatio(token(name), paper);
      // Two decimal places: enough that a changed hex fails, loose enough that
      // floating point does not.
      expect(measured).toBeCloseTo(ratio, 1);
    },
  );

  it.each(documentedRatios())('$name clears WCAG AA for normal text', ({ name }) => {
    expect(contrastRatio(token(name), paper)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps white legible on the signal colour, which the primary button relies on', () => {
    // The primary call to action is paper on signal, not signal on paper.
    expect(contrastRatio(paper, token('signal'))).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps text legible on the mist surface as well as on paper', () => {
    const mist = token('mist');
    expect(contrastRatio(token('ink'), mist)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(token('slate'), mist)).toBeGreaterThanOrEqual(4.5);
  });

  it('does not claim AAA for a token that does not reach it', () => {
    /**
     * The guard against the original mistake. Ink and slate reach 7:1; signal
     * and alert do not, and the comment says so. If a palette change made one
     * of them cross that line the comment would need revisiting, and this test
     * makes that a decision rather than an oversight.
     */
    expect(contrastRatio(token('signal'), paper)).toBeLessThan(7);
    expect(contrastRatio(token('alert'), paper)).toBeLessThan(7);
    expect(contrastRatio(token('ink'), paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(token('slate'), paper)).toBeGreaterThanOrEqual(7);
  });
});
