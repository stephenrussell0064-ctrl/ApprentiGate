import { expect, test } from '@playwright/test';

/**
 * The prohibited-content scan (Content Spec 2, brief constraint 1).
 *
 * It runs against the **rendered page**, not the source. That matters: the
 * footer's source legitimately contains the string "company number" inside a
 * conditional that is false while the business is unincorporated, so a source
 * scan would report a violation that does not exist, and — worse — could be
 * silenced in a way that stops it catching the real thing later. What ships is
 * what counts.
 *
 * WP14 extends this to the full site and reconciles every remaining claim
 * against CONTENT-SOURCES.md. This is the per-page gate in the meantime.
 *
 * The gallery at /components is excluded: it is an internal reference carrying
 * demonstration text, is not linked or indexed, and is not part of the public
 * site.
 */

const PUBLIC_ROUTES = ['/', '/how-it-works', '/for-employers', '/no-such-page'];

interface Prohibition {
  readonly pattern: RegExp;
  readonly why: string;
}

const PROHIBITED: readonly Prohibition[] = [
  // Social proof the business does not have and must not invent.
  { pattern: /\btrusted by\b/i, why: 'implies customers that do not exist' },
  { pattern: /\baward[-\s]?winning\b/i, why: 'no awards' },
  { pattern: /\b(the|a|market[-\s])leading\b/i, why: 'unsupportable superiority claim' },
  { pattern: /\bUK'?s number one\b/i, why: 'unsupportable superiority claim' },
  { pattern: /\bas featured in\b/i, why: 'no press coverage' },
  {
    pattern: /\bproven\b/i,
    why: 'nothing has been proven yet; there is no track record',
  },
  { pattern: /\btestimonial\b/i, why: 'no testimonials may appear' },
  { pattern: /\bcase stud(y|ies)\b/i, why: 'no case studies exist' },
  { pattern: /\bstar rating\b|\b\d(\.\d)?\s?\/\s?5\b/i, why: 'no ratings' },

  // Counts and figures that would imply a track record.
  {
    pattern:
      /\b\d[\d,]*\+?\s+(employers|providers|apprentices|placements|clients|customers)\b/i,
    why: 'a count of employers, providers or apprentices implies a track record',
  },
  { pattern: /\bachievement rate\b/i, why: 'no achievement-rate claim of our own' },
  { pattern: /\bsuccess rate\b/i, why: 'no success-rate claim' },
  { pattern: /\bsave (you )?£/i, why: 'no savings figure' },
  { pattern: /\breturn on investment\b|\bROI\b/, why: 'no ROI claim' },

  // Funding claims that would be false or misleading.
  {
    pattern: /\b(we )?guarantee(s|d)?\b(?!\s+(of|that we do not))/i,
    why: 'nothing about funding, candidates or provider availability may be guaranteed',
  },
  {
    pattern: /\bfunding is guaranteed\b|\bguaranteed funding\b/i,
    why: 'funding is never guaranteed; eligibility is confirmed per employer',
  },
  {
    pattern: /\btraining is free\b|\bfree training\b|\bcompletely free\b/i,
    why: 'training is not free without qualification',
  },
  {
    pattern: /\bwe (secure|obtain|get you) funding\b/i,
    why: 'ApprentiGate does not secure funding',
  },

  // Status claims that would be untrue or imply endorsement.
  {
    pattern: /\bwe are an approved (training )?provider\b/i,
    why: 'ApprentiGate is not an approved training provider',
  },
  {
    pattern: /\bend[-\s]point assessment organisation\b/i,
    why: 'ApprentiGate is not an EPAO',
  },
  {
    /**
     * Only the affirmative claim. Denying it — "we are not a recruitment
     * agency" — is exactly what the Content Spec wants said, so the pattern
     * must not fire on the denial. "are not a" does not match "are a".
     */
    pattern: /\b(is|are) an? recruitment agency\b/i,
    why: 'ApprentiGate is not a recruitment agency',
  },
  {
    pattern: /\b(government|DfE)[-\s]?(approved|endorsed|backed)\b/i,
    why: 'implies government endorsement',
  },
  { pattern: /\bour partners?\b|\bpartner(ed)? with\b/i, why: 'there are no partners' },

  // Corporate status the business does not yet have.
  { pattern: /\bLtd\b|\bLimited\b/, why: 'not incorporated' },
  { pattern: /\bregistered office\b/i, why: 'no registered office' },

  // Unfinished work.
  { pattern: /lorem ipsum/i, why: 'placeholder text' },
  { pattern: /\bTODO\b|\bFIXME\b/, why: 'unfinished-work marker' },
  { pattern: /\[placeholder\]/i, why: 'placeholder marker' },

  // England only: devolved funding differs, so a UK-wide claim is a factual error.
  {
    pattern: /\bacross the UK\b|\bUK[-\s]wide\b|\bthroughout the UK\b/i,
    why: 'funding is devolved; English rules must not be stated as UK-wide',
  },
];

for (const route of PUBLIC_ROUTES) {
  test(`${route} contains no prohibited content`, async ({ page }) => {
    await page.goto(route);

    // The whole rendered document, header and footer included.
    const text = await page.locator('body').innerText();

    const found = PROHIBITED.filter(({ pattern }) => pattern.test(text)).map(
      ({ pattern, why }) => `${text.match(pattern)?.[0]} — ${why}`,
    );

    expect(found).toEqual([]);
  });
}

test('the home page concedes that employers can already find providers', async ({
  page,
}) => {
  /**
   * The inverse of a prohibition, and just as important. The Content Spec is
   * explicit that the site must not claim employers cannot find providers,
   * because they can, and a managing director who has used the GOV.UK service
   * would catch the lie immediately. This asserts the honest framing is still
   * there, so it cannot be quietly edited out in favour of a stronger-sounding
   * claim later.
   */
  await page.goto('/');
  const text = await page.locator('#main').innerText();

  expect(text).toMatch(/compare approved providers yourself/i);
  expect(text).not.toMatch(/cannot find (a )?provider/i);
  expect(text).not.toMatch(/impossible to (find|compare)/i);
});

test('the home page states the funding position with its conditions attached', async ({
  page,
}) => {
  await page.goto('/');
  const text = await page.locator('#main').innerText();

  // Never the bare promise; always the band cap, the conditionality and the wage.
  expect(text).toMatch(/funding band maximum/i);
  expect(text).toMatch(/depends on the apprentice, the employer and the standard/i);
  expect(text).toMatch(/wage is always/i);
});
