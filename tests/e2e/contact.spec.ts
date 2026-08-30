import { expect, test } from '@playwright/test';

/**
 * Contact and booking.
 *
 * These cover what can be verified against the static build. The Worker's own
 * behaviour — validation, honeypot, rate limiting, the forced-failure path — is
 * exercised by `pnpm verify:worker`, which runs against a real Worker runtime.
 */

test.describe('contact', () => {
  test('is reachable from the header call to action', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Book a call' }).first().click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('leads with what the call is worth, and claims no track record', async ({
    page,
  }) => {
    /**
     * This replaces an assertion that the page disclosed the business was "just
     * starting out" and that the reader "would be one of our first employers".
     * That wording was added to close finding F1 and has been removed on the
     * owner's instruction: it volunteered a weakness at the moment a reader is
     * deciding whether to trust us with a hiring decision.
     *
     * The risk in removing it is overcorrecting into a claim we cannot support,
     * so this test guards that edge rather than the old sentence — the page has
     * to say what the reader gets, and must still assert no history of
     * delivery. The full prohibition set runs in prohibitions.spec.ts.
     */
    await page.goto('/contact');
    const text = (await page.locator('#main').textContent()) ?? '';

    expect(text).toMatch(/which standard it maps to/i);
    expect(text).toMatch(/funding position/i);

    expect(text).not.toMatch(/\bwe have (helped|worked with|placed|delivered)\b/i);
    expect(text).not.toMatch(/\bour (clients|customers)\b/i);
    expect(text).not.toMatch(/\btrack record\b/i);
  });

  test('offers both routes side by side', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'Pick a time' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Or send an enquiry' })).toBeVisible();
  });

  test('carries exactly the fields the Content Spec lists, and no others', async ({
    page,
  }) => {
    await page.goto('/contact');
    const form = page.locator('#main form');

    for (const label of [
      'Your name',
      'Company',
      'Work email',
      'Phone',
      'Approximate number of employees',
      'Roles you are recruiting',
      'Approximate number of potential apprentices',
      'Message',
    ]) {
      await expect(form.getByLabel(label, { exact: false }).first()).toBeVisible();
    }

    /**
     * Nothing else. Every additional field costs conversions on a page whose
     * only job is to start a conversation, so the count is asserted rather than
     * left to drift: eight visible fields, one consent box, one honeypot.
     */
    const visibleControls = form.locator(
      'input:not([type="hidden"]):not([tabindex="-1"]), select, textarea',
    );
    await expect(visibleControls).toHaveCount(9);

    // The fields the Content Spec explicitly rules out.
    const text = await page.locator('#main').textContent();
    expect(text).not.toMatch(/how did you hear about us/i);
    expect(text).not.toMatch(/budget/i);
    expect(text).not.toMatch(/subscribe|newsletter|marketing emails/i);
  });

  test('leaves the consent checkbox unticked and links the privacy notice', async ({
    page,
  }) => {
    await page.goto('/contact');
    const consent = page.locator('#enquiry-consent');

    await expect(consent).not.toBeChecked();
    await expect(page.getByLabel(/happy for ApprentiGate to contact me/i)).toBeVisible();
    await expect(
      page.locator('#main').getByRole('link', { name: /how we handle your details/i }),
    ).toHaveAttribute('href', '/privacy');
  });

  test('marks optional fields as optional rather than marking required ones', async ({
    page,
  }) => {
    await page.goto('/contact');
    const form = page.locator('#main form');
    // Five optional fields; the three required ones carry no marker at all.
    await expect(form.getByText('Optional', { exact: true })).toHaveCount(5);
  });

  test('hides a honeypot field from people and from assistive technology', async ({
    page,
  }) => {
    await page.goto('/contact');
    const honeypot = page.locator('#enquiry-website');

    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
    await expect(honeypot).toHaveAttribute('autocomplete', 'off');

    /**
     * Positioned off-screen rather than `display: none`, which is the point: a
     * field that is not rendered at all is easy for a bot to detect and skip.
     * Playwright counts a 1×1 off-screen element as "visible", so the check is
     * on where it actually is rather than on that heuristic.
     */
    const box = await honeypot.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThan(0);

    // And hidden from assistive technology, so nobody is asked to fill it in.
    await expect(
      page.locator('[aria-hidden="true"]').filter({ has: honeypot }),
    ).toHaveCount(1);
  });

  test('submits to the Worker even without JavaScript', async ({ page }) => {
    await page.goto('/contact');
    const form = page.locator('#main form');
    // A real action and method, so a submission still reaches the endpoint if
    // the script fails to load or run.
    await expect(form).toHaveAttribute('action', '/api/enquiry');
    await expect(form).toHaveAttribute('method', 'post');
  });

  test('validates in the browser before troubling the network', async ({ page }) => {
    await page.goto('/contact');

    let requested = false;
    page.on('request', (request) => {
      if (request.url().includes('/api/enquiry')) requested = true;
    });

    await page.getByRole('button', { name: 'Send enquiry' }).click();

    await expect(
      page.getByText('Enter your name so we know who we are replying to.'),
    ).toBeVisible();
    expect(requested).toBe(false);
    // Focus lands on the first thing that is wrong.
    await expect(page.locator('#enquiry-name')).toBeFocused();
  });

  test('nudges about a personal address without blocking it', async ({ page }) => {
    await page.goto('/contact');

    await page.locator('#enquiry-email').fill('sam@gmail.com');
    await page.locator('#enquiry-email').blur();

    await expect(page.getByText(/That looks like a personal address/i)).toBeVisible();
    // A nudge, not a block: the field is not in an error state.
    await expect(page.locator('#enquiry-email')).not.toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});

test.describe('booking calendar', () => {
  test('requests nothing from the booking provider until asked', async ({ page }) => {
    const thirdParty: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('cal.com')) thirdParty.push(request.url());
    });

    await page.goto('/contact');

    /*
     * Anchored on the page being loaded and the control being present, not on
     * `networkidle`.
     *
     * `networkidle` waits for the network to go quiet, and on this page it
     * never does: the Turnstile script keeps a connection to
     * challenges.cloudflare.com busy, so the wait ran to its 30s timeout and
     * failed the test in CI while passing locally. It was also the wrong
     * question — an eager embed would fire its request during load, so once
     * the document has loaded and the click-to-load button is showing, the
     * absence of a cal.com request is already proven.
     */
    await page.waitForLoadState('load');
    await expect(page.getByRole('button', { name: /load the calendar/i })).toBeVisible();

    /**
     * Click-to-load, not lazy-on-scroll. Most visitors never book, and loading
     * an embed on their behalf hands a third party a page view they had no
     * reason to receive. It also keeps the cookie policy honest.
     */
    expect(thirdParty).toEqual([]);
  });

  test('loads the plain booking page, not a URL that renders nothing', async ({
    page,
  }) => {
    /**
     * A regression guard for two separate wrong URLs, both of which looked fine
     * and both of which shipped.
     *
     * `app.cal.com/<link>` is Cal's dashboard and framed Cal's 404 page.
     * `cal.com/<link>/embed` looks more correct and is worse: it renders a
     * blank iframe unless Cal's own embed script drives it, with no error and
     * no console output. Checking that the slug was configured correctly — as
     * was done — could not catch either, because the slug was right both times.
     *
     * The request is aborted rather than allowed, so asserting the URL never
     * costs a real call to a third party from CI.
     */
    await page.route('**://cal.com/**', (route) => route.abort());

    await page.goto('/contact');
    await page.getByRole('button', { name: /load the calendar/i }).click();

    const src = await page.locator('iframe').getAttribute('src');
    expect(src).toBe('https://cal.com/apprentigate/consultation');
  });

  test('explains what loading the calendar will do', async ({ page }) => {
    await page.goto('/contact');
    const text = await page.locator('#main').textContent();
    expect(text).toMatch(/provided by Cal\.com/i);
    expect(text).toMatch(/do not load it until you ask/i);
  });
});

test.describe('enquiry confirmation', () => {
  test('is a page that stays put, not a toast', async ({ page }) => {
    const response = await page.goto('/contact/confirmed');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('keeps itself out of search results', async ({ page }) => {
    await page.goto('/contact/confirmed');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });
});
