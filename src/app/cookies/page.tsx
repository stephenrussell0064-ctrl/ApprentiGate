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
 * commit.** Describing storage the site does not use is exactly the failure the
 * brief warns against, and so is the reverse.
 *
 * Cloudflare Web Analytics was added at WP12. It is cookieless, so the "no
 * cookies" statement still holds — but it is a third-party script, so the
 * analytics section below names it whenever the token is configured and says
 * so is not when it is not. The page is therefore accurate in both states
 * rather than accurate in one and aspirational in the other.
 */

import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LegalList, LegalPage, LegalSection } from '@/components/ui/LegalPage';
import { ROUTES } from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = pageMetadata({
  title: 'Cookie policy',
  description:
    'This site sets no cookies and stores nothing in your browser. What it does instead, and the two third-party services involved.',
  path: ROUTES.cookies,
});

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
        {siteConfig.analyticsToken ? (
          <>
            <p>
              We use Cloudflare Web Analytics. It counts page views in aggregate and is
              cookieless: it sets nothing in your browser, does not give you an
              identifier, and cannot follow you to another site or build a profile of you.
            </p>
            <p>
              It is still a script served by Cloudflare, so your browser does contact them
              — which is why it is named here rather than left out on the grounds that it
              stores nothing.
            </p>
          </>
        ) : (
          <p>
            At the moment we do not, beyond what our host records in order to serve the
            site. When we do add analytics it will be a cookieless kind that counts page
            views in aggregate and cannot identify you or follow you elsewhere — and this
            page names it as soon as it is switched on, not afterwards.
          </p>
        )}
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
