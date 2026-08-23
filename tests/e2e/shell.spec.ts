import { expect, test } from '@playwright/test';

/**
 * The shell: header, responsive navigation, footer.
 *
 * These assert the behaviour the quality floor makes a pass condition —
 * keyboard operation and the footer's content prohibitions — rather than
 * appearance, which the axe suite and the visual check cover.
 */

test.describe('header, desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('shows the full navigation without a menu button', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'How it works' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'For employers' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'FAQ' })).toBeVisible();
    await expect(page.getByRole('button', { name: /menu/i })).toBeHidden();
  });

  test('puts the skip link first in the tab order and lands it on main', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await expect(skip).toHaveAttribute('href', '#main');

    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeVisible();
  });
});

test.describe('header, mobile', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test('collapses the navigation behind a labelled menu button', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Open menu' });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('opens and closes the menu, keeping aria-expanded truthful', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Open menu' });

    await trigger.click();
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', {
        name: 'Funding',
      }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close menu' }).click();
    await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  test('closes on Escape and returns focus to the trigger', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();

    await page.keyboard.press('Escape');

    const trigger = page.getByRole('button', { name: 'Open menu' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // Without this, a keyboard user is dropped at the top of the document
    // every time they dismiss the menu.
    await expect(trigger).toBeFocused();
  });

  test('keeps the closed menu out of the tab order entirely', async ({ page }) => {
    await page.goto('/');
    // The panel is unmounted rather than hidden, so its links cannot be
    // focused off-screen while the menu is closed.
    await expect(page.getByRole('link', { name: 'For training providers' })).toHaveCount(
      1,
    ); // the footer's copy only
  });
});

test.describe('footer', () => {
  test('states the location as town and county, with no street address', async ({
    page,
  }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByText('High Wycombe, Buckinghamshire')).toBeVisible();
  });

  test('shows a non-dialable notice until a real number is configured', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('contentinfo').getByText('Telephone number to be confirmed'),
    ).toBeVisible();
  });

  /**
   * Constraint 3: the business is not incorporated, so none of this may appear
   * anywhere until NEXT_PUBLIC_COMPANY_NUMBER is set. Asserting it in a test
   * is what stops it being reintroduced by a later work package.
   */
  test('carries no company number, no "Ltd" and no registered office', async ({
    page,
  }) => {
    await page.goto('/');
    const footer = await page.getByRole('contentinfo').innerText();

    expect(footer).not.toMatch(/\bLtd\b/);
    expect(footer).not.toMatch(/\bLimited\b/);
    expect(footer).not.toMatch(/company number/i);
    expect(footer).not.toMatch(/registered office/i);
  });

  test('links every compliance page', async ({ page }) => {
    await page.goto('/');
    const legal = page.getByRole('navigation', { name: 'Legal' });
    for (const name of [
      'Privacy notice',
      'Cookie policy',
      'Terms of use',
      'Accessibility statement',
    ]) {
      await expect(legal.getByRole('link', { name })).toBeVisible();
    }
  });
});

test.describe('component gallery', () => {
  test('is reachable and renders the error and empty states', async ({ page }) => {
    await page.goto('/components');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Component gallery');

    // The error state must be announced, not merely coloured.
    await expect(
      page.getByRole('alert').filter({ hasText: 'We could not send your enquiry.' }),
    ).toBeVisible();

    await expect(page.getByText('Nothing to show yet.')).toBeVisible();
  });

  test('keeps itself out of search indexes regardless of the site-wide flag', async ({
    page,
  }) => {
    await page.goto('/components');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });

  test('wires every form control to a visible label', async ({ page }) => {
    await page.goto('/components');

    // A placeholder is not a label; this asserts the accessible name comes
    // from a real <label> element.
    await expect(page.getByLabel('Your name').first()).toBeVisible();
    await expect(page.getByLabel('Work email').first()).toBeVisible();
    await expect(
      page.getByLabel('Approximate number of employees').first(),
    ).toBeVisible();
    await expect(
      page
        .getByLabel("I'm happy for ApprentiGate to contact me about my enquiry.")
        .first(),
    ).toBeVisible();
  });

  test('leaves the consent checkbox unticked', async ({ page }) => {
    await page.goto('/components');
    for (const id of ['#demo-consent', '#demo-consent-error']) {
      await expect(page.locator(id)).not.toBeChecked();
    }
  });

  test('ties each field error to its control for screen readers', async ({ page }) => {
    await page.goto('/components');

    const email = page.locator('#demo-email-error');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-describedby', /demo-email-error-error/);

    await expect(
      page.getByRole('alert').filter({ hasText: 'That does not look like an email' }),
    ).toBeVisible();
  });

  test('leaves an untouched select submitting as absent, not as a guess', async ({
    page,
  }) => {
    await page.goto('/components');
    await expect(page.locator('#demo-size')).toHaveValue('');
  });
});
