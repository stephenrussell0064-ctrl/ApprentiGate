'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Wordmark } from '@/components/brand/Wordmark';
import { ButtonLink } from '@/components/ui/Button';
import { PRIMARY_CTA, PRIMARY_NAV, ROUTES } from '@/lib/navigation';

/**
 * Site header with responsive navigation.
 *
 * The mobile menu is a disclosure, not a modal, and it is built by hand rather
 * than with <details> so the keyboard behaviour can be correct:
 *
 *   - the trigger carries aria-expanded and aria-controls
 *   - Escape closes it and returns focus to the trigger, so a keyboard user is
 *     never stranded inside a panel they cannot leave
 *   - it closes on viewport resize into the desktop layout, otherwise the
 *     panel's state survives into a layout that has no way to show it
 *
 * The panel is unmounted rather than hidden with CSS, so its links are out of
 * the tab order when it is closed rather than being focusable off-screen.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  /**
   * The header sticks, and earns its border only once the page has moved.
   *
   * At the top it sits flush on the page with no line under it, so the hero
   * starts at the very top of the viewport rather than under a bar. Once
   * content scrolls beneath it, it needs to separate itself from that content
   * or text slides under an invisible edge — so it takes a hairline and a
   * translucent backing at that point and not before.
   *
   * Threshold is a few pixels rather than zero so a trackpad's elastic overscroll
   * does not flicker the border on and off.
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    // 768px is the `md` breakpoint, where the desktop nav takes over.
    const desktop = window.matchMedia('(min-width: 768px)');
    function onBreakpointChange(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onBreakpointChange);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onBreakpointChange);
    };
  }, [open]);

  return (
    <header
      className={[
        'sticky top-0 z-40',
        'transition-[background-color,border-color,box-shadow]',
        'duration-[var(--duration-ag-standard)] ease-[var(--ease-ag-enter)]',
        'border-b',
        scrolled || open
          ? 'border-[var(--color-ag-mist)] bg-[var(--color-ag-paper)]/85 shadow-[var(--shadow-ag-raised)] backdrop-blur-md'
          : 'border-transparent bg-[var(--color-ag-paper)]',
      ].join(' ')}
    >
      {/*
        Skip link. First thing in the tab order, visually hidden until focused,
        so a keyboard user does not have to walk the whole nav on every page.
      */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-[var(--spacing-ag-3)] focus:rounded-[var(--radius-ag-lg)] focus:bg-[var(--color-ag-ink)] focus:px-[var(--spacing-ag-4)] focus:py-[var(--spacing-ag-3)] focus:text-[color:var(--color-ag-paper)]"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex max-w-6xl items-center gap-[var(--spacing-ag-4)] px-[var(--spacing-ag-6)] py-[var(--spacing-ag-4)]">
        <a
          href={ROUTES.home}
          aria-label="ApprentiGate home"
          className="rounded-[var(--radius-ag-sm)]"
        >
          <Wordmark decorative />
        </a>

        <nav aria-label="Main" className="ml-auto hidden md:block">
          <ul className="flex list-none items-center gap-[var(--spacing-ag-6)] p-0">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[length:var(--text-ag-sm)] font-semibold text-[color:var(--color-ag-slate)] transition-colors duration-[var(--duration-ag-micro)] ease-[var(--ease-ag-enter)] hover:text-[color:var(--color-ag-ink)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden md:block">
          <ButtonLink href={PRIMARY_CTA.href}>{PRIMARY_CTA.label}</ButtonLink>
        </div>

        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="ml-auto inline-flex size-12 items-center justify-center rounded-[var(--radius-ag-lg)] border border-[var(--color-ag-mist)] md:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div id={panelId} className="border-t border-[var(--color-ag-mist)] md:hidden">
          <nav
            aria-label="Main"
            className="mx-auto max-w-6xl px-[var(--spacing-ag-6)] py-[var(--spacing-ag-4)]"
          >
            <ul className="flex list-none flex-col p-0">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex min-h-[48px] items-center border-b border-[var(--color-ag-mist)] text-[length:var(--text-ag-base)] font-semibold text-[color:var(--color-ag-ink)]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <ButtonLink
              href={PRIMARY_CTA.href}
              className="mt-[var(--spacing-ag-4)] w-full"
            >
              {PRIMARY_CTA.label}
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
