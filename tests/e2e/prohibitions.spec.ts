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

const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/for-employers',
  '/for-training-providers',
  '/funding',
  '/about',
  '/faq',
  '/contact',
  '/contact/confirmed',
  '/privacy',
  '/cookies',
  '/terms',
  '/accessibility',
  '/no-such-page',
];

interface Prohibition {
  readonly pattern: RegExp;
  readonly why: string;
}

const PROHIBITED: readonly Prohibition[] = [
  // Social proof the business does not have and must not invent.
  { pattern: /\btrusted by\b/i, why: 'implies customers that do not exist' },
  { pattern: /\baward[-\s]?winning\b/i, why: 'no awards' },
  {
    /**
     * Was `/\b(the|a|market[-\s])leading\b/i`, which required "theleading" with
     * no space and therefore never matched anything. It sat in the list looking
     * like protection from WP3 onwards while catching nothing at all. The
     * self-test at the bottom of this file found it.
     */
    pattern: /\b(the|a)\s+leading\b|\bmarket[-\s]?leading\b/i,
    why: 'unsupportable superiority claim',
  },
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
    /**
     * A count like "200 employers". Two refinements, both from real false
     * positives: `\s+` matched across a line break, so a "£2,000" heading
     * followed by a paragraph starting "Employers" tripped it — hence a single
     * literal space. And a currency amount is not a count, hence the lookbehind
     * for £.
     */
    pattern:
      /(?<![£\d,])\b\d[\d,]*\+? (employers|providers|apprentices|placements|clients|customers)\b/i,
    why: 'a count of employers, providers or apprentices implies a track record',
  },
  { pattern: /\bachievement rate\b/i, why: 'no achievement-rate claim of our own' },
  { pattern: /\bsuccess rate\b/i, why: 'no success-rate claim' },
  { pattern: /\bsave (you )?£/i, why: 'no savings figure' },
  { pattern: /\breturn on investment\b|\bROI\b/, why: 'no ROI claim' },

  // Funding claims that would be false or misleading.
  {
    /**
     * Affirmative guarantees only. The Terms of Use has to say "we do not
     * guarantee funding" and "funding is not guaranteed" — refusing those
     * sentences would forbid exactly the disclaimer the page exists to make.
     * "we do not guarantee" does not match "we guarantee"; "is not guaranteed"
     * does not match "is guaranteed".
     *
     * This is the fourth guard in this suite to need the distinction between a
     * claim and its denial, so it was written this way from the start.
     */
    pattern:
      /\bwe guarantee\b|\b(is|are) guaranteed\b|\bguaranteed (funding|outcome|results?|place|placement|success)\b/i,
    why: 'nothing about funding, candidates or provider availability may be guaranteed',
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
    /**
     * Affirmative only, like its neighbours. The Terms of Use has to say
     * ApprentiGate is *not* an end-point assessment organisation, so a pattern
     * matching the phrase itself forbids the disclaimer.
     */
    pattern: /\b(we are|is) an end[-\s]point assessment organisation\b/i,
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

    /**
     * `textContent`, not `innerText`. innerText returns only *rendered* text,
     * which silently excluded every collapsed FAQ answer — thirteen answers the
     * content gate was not reading at all. Anything in the document can be read
     * by a crawler or a screen reader, so anything in the document is in scope.
     */
    const text = (await page.locator('body').textContent()) ?? '';

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

/**
 * A self-test for the scan.
 *
 * Five of the patterns above have been narrowed, each time because they were
 * catching an honest denial rather than the claim they targeted — "we are not a
 * recruitment agency", "not paid for by government", "we do not guarantee
 * funding", "not an end-point assessment organisation", "the employers we work
 * for". Every narrowing is a chance to narrow too far and leave a gate that
 * passes everything.
 *
 * So the patterns are run against copy that genuinely should be refused. If one
 * of these ever passes, a prohibition has stopped prohibiting.
 */
const MUST_BE_CAUGHT: readonly string[] = [
  'Trusted by employers across the sector.',
  'The leading apprenticeship intermediary for SMEs.',
  'Our award-winning approach to apprenticeships.',
  'A proven method for building apprenticeship programmes.',
  'Read our case studies from recent clients.',
  'We now work with 240 employers.',
  'Our achievement rate speaks for itself.',
  'We could save you £4,000 a year.',
  'We guarantee funding for every apprentice.',
  'Your funding is guaranteed from day one.',
  'Guaranteed funding for eligible roles.',
  'Apprenticeship training is free for your business.',
  'We secure funding on your behalf.',
  'We are an approved training provider.',
  'ApprentiGate is a recruitment agency for apprentices.',
  'ApprentiGate is an end-point assessment organisation.',
  'A government-approved apprenticeship service.',
  'See our partners across the training sector.',
  'ApprentiGate Ltd, registered office in High Wycombe.',
  'Lorem ipsum dolor sit amet.',
  'We support employers across the UK.',
];

/**
 * And the denials, which must all survive. These are sentences the Content Spec
 * positively requires somewhere on the site.
 */
const MUST_BE_ALLOWED: readonly string[] = [
  'ApprentiGate is not a recruitment agency.',
  'ApprentiGate is not an end-point assessment organisation.',
  'We do not guarantee that you will receive apprenticeship funding.',
  'Funding is not guaranteed, and eligibility is confirmed per employer.',
  'Using us is not paid for by government.',
  'We do not name the employers we work for.',
  'You can compare approved providers yourself.',
  'A hiring payment of up to £2,000.\n\nEmployers who do not pay the levy may qualify.',
  'Nothing here limits liability where the law does not allow it to be limited.',
];

test.describe('the scan itself', () => {
  for (const copy of MUST_BE_CAUGHT) {
    test(`refuses: ${copy.slice(0, 48)}`, () => {
      const matched = PROHIBITED.some(({ pattern }) => pattern.test(copy));
      expect(matched, `nothing in the prohibition list caught: ${copy}`).toBe(true);
    });
  }

  for (const copy of MUST_BE_ALLOWED) {
    test(`allows the denial: ${copy.slice(0, 48).replace(/\n/g, ' ')}`, () => {
      const hits = PROHIBITED.filter(({ pattern }) => pattern.test(copy)).map(
        ({ why }) => why,
      );
      expect(hits, `a required sentence was refused: ${copy}`).toEqual([]);
    });
  }
});
