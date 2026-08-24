/**
 * ============================================================================
 * DRAFT — REQUIRES LEGAL REVIEW BEFORE TRADING.
 *
 * Not reviewed by a solicitor. Operator handover item 18 requires all four
 * compliance pages to be reviewed before any paid engagement.
 * ============================================================================
 *
 * Unlike the other three, this page makes a testable claim, so it must not get
 * ahead of what has actually been done. As at 24 August 2026 the site is
 * checked automatically on every build — axe at WCAG 2.2 AA plus best practice,
 * at 320, 768 and 1440 — and has zero violations. Manual screen reader testing
 * is WP13 and has not happened yet, so this page says so.
 *
 * **Update this page at WP13**, when the manual audit is done, and again if a
 * known limitation is fixed or a new one appears.
 */

import type { Metadata } from 'next';
import { LegalList, LegalPage, LegalSection } from '@/components/ui/LegalPage';
import { ROUTES } from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Accessibility statement',
  description:
    'How accessible this website is, what has been tested and how, the limitations we know about, and how to tell us about a problem.',
};

export default function Accessibility() {
  return (
    <LegalPage
      eyebrow="Accessibility"
      title="How accessible this site is"
      intro="We have built this site to be usable with a keyboard, with a screen reader, at a large text size and on a small screen. Here is what we have actually checked, and what we have not."
    >
      <LegalSection heading="How accessible we think it is">
        <p>
          This website aims to conform to the{' '}
          <a
            href="https://www.w3.org/TR/WCAG22/"
            className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
          >
            Web Content Accessibility Guidelines 2.2
          </a>{' '}
          at level AA.
        </p>
        <p>
          We believe it meets that standard, with the limitations set out below. We say
          &ldquo;believe&rdquo; deliberately: automated testing catches a great deal but
          not everything, and no automated tool can tell you whether a page is actually
          usable.
        </p>
      </LegalSection>

      <LegalSection heading="What we have tested, and how">
        <LegalList
          items={[
            'Every page is checked automatically against WCAG 2.2 AA on every single build, at 320px, 768px and 1440px. A build with any violation does not ship.',
            'Every page is checked for performance, accessibility, best practice and search on each build, and has to score at least 95 in all four.',
            'Every interactive element can be reached and operated with a keyboard alone, and shows a visible focus ring while it is selected.',
            'The site respects your system setting for reduced motion, and there is very little motion to begin with.',
            'Text can be enlarged without the layout breaking, and no page scrolls sideways at 320px.',
          ]}
        />
      </LegalSection>

      <LegalSection heading="Known limitations">
        <p>These are the things we know are not finished:</p>
        <LegalList
          items={[
            <>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                We have not yet completed a manual screen reader audit.
              </strong>{' '}
              Automated checks pass, and we have built to the standard throughout, but a
              person listening to every page is a different test and it is still to be
              done.
            </>,
            <>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                The booking calendar is somebody else&rsquo;s.
              </strong>{' '}
              It is provided by Cal.com and we do not control its accessibility. It only
              loads if you choose to load it, and the{' '}
              <a
                href={ROUTES.contact}
                className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
              >
                enquiry form
              </a>{' '}
              on the same page is an equivalent route to reaching us that we do control.
            </>,
            <>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                The enquiry form uses a bot check.
              </strong>{' '}
              It is configured to stay out of your way and only ask for interaction when
              it needs to. If it ever blocks you, email us instead — we would rather have
              your enquiry than your patience.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="If something does not work for you">
        <p>
          Please tell us. Say which page, what you were trying to do, and what happened —
          and if you use assistive technology, which one, because that usually points
          straight at the problem.
        </p>
        {siteConfig.enquiriesEmail ? (
          <p>
            Email{' '}
            <a
              href={`mailto:${siteConfig.enquiriesEmail}`}
              className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
            >
              {siteConfig.enquiriesEmail}
            </a>{' '}
            and one of us will read it. We aim to reply within five working days.
          </p>
        ) : (
          <p>
            Use the{' '}
            <a
              href={ROUTES.contact}
              className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
            >
              contact page
            </a>{' '}
            and one of us will read it. We aim to reply within five working days.
          </p>
        )}
        <p>
          If you need something on this site in a different format so you can use it, ask
          and we will find a way to get it to you.
        </p>
      </LegalSection>

      <LegalSection heading="Enforcement">
        <p>
          If you contact us about an accessibility problem and you are not happy with how
          we respond, you can contact the{' '}
          <a
            href="https://www.equalityadvisoryservice.com/"
            className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
          >
            Equality Advisory and Support Service
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
