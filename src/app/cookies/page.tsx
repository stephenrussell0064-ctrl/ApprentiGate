/**
 * ============================================================================
 * DRAFT — REQUIRES LEGAL REVIEW BEFORE TRADING.
 *
 * Not reviewed by a solicitor. Operator handover item 18 requires all four
 * compliance pages to be reviewed before any paid engagement.
 * ============================================================================
 *
 * This page describes what the site actually does, measured rather than
 * assumed. On 24 August 2026, with the Turnstile widget loaded and its response
 * token issued, the site set:
 *
 *   cookies         none
 *   localStorage    empty
 *   sessionStorage  empty
 *   third-party JS  none on content pages; the Turnstile script on /contact
 *
 * **If you add anything that stores data, this page must change in the same
 * commit.** In particular WP12 adds Cloudflare Web Analytics: it is cookieless,
 * so the "no cookies" statement still holds, but it adds a third-party script
 * and this page must say so. Describing storage the site does not use is
 * exactly the failure the brief warns against, and so is the reverse.
 */

import type { Metadata } from 'next';
import { LegalList, LegalPage, LegalSection } from '@/components/ui/LegalPage';
import { ROUTES } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'Cookie policy',
  description:
    'This site sets no cookies and stores nothing in your browser. What it does instead, and the two third-party services involved.',
};

export default function Cookies() {
  return (
    <LegalPage
      eyebrow="Cookies"
      title="This site does not use cookies"
      intro="Not “essential only”, and not “cookies with your consent”. None at all. That is also why there is no cookie banner interrupting you."
    >
      <LegalSection heading="What that means">
        <p>
          Nothing is written to your browser when you read this site. No cookies, no local
          storage, no session storage, no fingerprinting, no advertising identifiers, and
          nothing that follows you to another website.
        </p>
        <p>
          We do not need your consent for any of that, because there is nothing to consent
          to. A banner asking permission we do not require would be theatre.
        </p>
      </LegalSection>

      <LegalSection heading="Two places a third party is involved">
        <p>
          Storing nothing is not the same as contacting nobody, so here is where your
          browser talks to someone other than us:
        </p>
        <LegalList
          items={[
            <>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                Bot protection on the enquiry form.
              </strong>{' '}
              The{' '}
              <a
                href={ROUTES.contact}
                className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
              >
                contact page
              </a>{' '}
              loads Cloudflare Turnstile, which checks that a submission comes from a
              person rather than a script. We checked what it stores on this site, with
              the widget fully loaded: nothing. It does contact Cloudflare to run the
              check.
            </>,
            <>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                The booking calendar, only if you ask for it.
              </strong>{' '}
              The calendar is provided by Cal.com, and we do not load it until you press
              the button. If you never press it, your browser never contacts them. If you
              do, their own privacy and cookie terms apply inside that calendar.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="How we know how many people visit">
        <p>
          Honestly, at the moment we do not, beyond what our host records to serve the
          site. When we do add analytics it will be a cookieless kind that counts page
          views in aggregate and cannot identify you or follow you elsewhere — and this
          page will be updated to say so before it goes live, not after.
        </p>
      </LegalSection>

      <LegalSection heading="Checking for yourself">
        <p>
          You do not have to take our word for any of this. Open your browser&rsquo;s
          developer tools, look under Application or Storage, and you will find the cookie
          and storage lists for this site empty.
        </p>
        <p>
          If you ever find that is not true, tell us — it would be a bug, and we would
          want to fix it and correct this page.
        </p>
      </LegalSection>

      <LegalSection heading="Your details, as opposed to your browser">
        <p>
          This page is only about what is stored on your device. What happens to the
          details you type into the enquiry form is a separate question, answered in the{' '}
          <a
            href={ROUTES.privacy}
            className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
          >
            privacy notice
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
