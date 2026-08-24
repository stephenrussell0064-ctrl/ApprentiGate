/**
 * ============================================================================
 * DRAFT — REQUIRES LEGAL REVIEW BEFORE TRADING.
 *
 * This notice was written to be accurate about what the site actually does, not
 * to be a legally settled document. It has not been reviewed by a solicitor.
 * Operator handover item 18 requires all four compliance pages to be reviewed
 * before any paid engagement.
 *
 * One point a reviewer should look at first: ApprentiGate is not incorporated,
 * so the data controllers are the two founders personally rather than a
 * company. That is stated below because it is true, and it changes at
 * incorporation — at which point this page needs rewriting, not just amending.
 * ============================================================================
 */

import type { Metadata } from 'next';
import { LegalList, LegalPage, LegalSection } from '@/components/ui/LegalPage';
import { ENQUIRY_RETENTION_MONTHS } from '@/lib/legal';
import { BUSINESS_LOCATION, ROUTES } from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Privacy notice',
  description:
    'What we collect when you contact ApprentiGate, why, how long we keep it, who else sees it, and the rights you have over it.',
};

export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="What we do with your details"
      intro="Short version: we use what you send us to reply to your enquiry, we keep it for a limited time, we do not sell it, and you can ask us to delete it whenever you like."
    >
      <LegalSection heading="Who is responsible for your data">
        <p>
          ApprentiGate is operated by Stephen Russell and Zaim Rana, based in{' '}
          {BUSINESS_LOCATION}. The business is not yet incorporated, so we are the data
          controllers personally rather than a company. If that changes, this page will be
          rewritten to say so.
        </p>
        {siteConfig.enquiriesEmail && (
          <p>
            You can reach us about anything on this page at{' '}
            <a
              href={`mailto:${siteConfig.enquiriesEmail}`}
              className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
            >
              {siteConfig.enquiriesEmail}
            </a>
            .
          </p>
        )}
      </LegalSection>

      <LegalSection heading="What we collect">
        <p>Only what you type into the enquiry form:</p>
        <LegalList
          items={[
            'Your name, your company and your work email — these are required, because without them we cannot reply to the right person.',
            'Your phone number, roughly how many people you employ, the roles you are recruiting, roughly how many apprentices you are considering, and your message — all optional. If you leave one blank, nothing is recorded for it.',
          ]}
        />
        <p>
          We do not use tracking cookies, we do not build a profile of you, and we do not
          run advertising. The{' '}
          <a
            href={ROUTES.cookies}
            className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
          >
            cookie policy
          </a>{' '}
          sets out exactly what the site does and does not store.
        </p>
      </LegalSection>

      <LegalSection heading="Why we use it, and our lawful basis">
        <p>
          We use your details to reply to your enquiry and to have the conversation you
          asked for. Nothing else.
        </p>
        <p>
          Our lawful basis is your{' '}
          <strong className="font-semibold text-[color:var(--color-ag-ink)]">
            consent
          </strong>
          , which you give by ticking the box on the form. The box is never ticked for
          you. You can withdraw consent at any time by emailing us, and we will stop
          contacting you and delete what we hold.
        </p>
        <p>
          We will not add you to a mailing list, and we will not contact you about
          anything other than the enquiry you sent.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Up to {ENQUIRY_RETENTION_MONTHS} months from our last contact with you, after
          which we delete it. If you ask us to delete it sooner, we will.
        </p>
        <p>
          If your enquiry becomes an engagement, we will tell you separately what we keep
          and for how long, because that is a different arrangement to this one.
        </p>
      </LegalSection>

      <LegalSection heading="Who else sees it">
        <p>
          We use a small number of services to run the site and deliver email. They
          process data on our instructions and do not use it for their own purposes:
        </p>
        <LegalList
          items={[
            <>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                Cloudflare
              </strong>{' '}
              — hosts the site and provides the bot protection on the enquiry form.
            </>,
            <>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                Resend
              </strong>{' '}
              — delivers your enquiry to our mailbox as an email.
            </>,
            <>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                Cal.com
              </strong>{' '}
              — provides the booking calendar, and only if you choose to load it and book
              a time.
            </>,
          ]}
        />
        <p>
          We do not sell your details, we do not share them with training providers
          without asking you first, and we do not pass them to anyone for marketing.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>Under UK data protection law you can ask us to:</p>
        <LegalList
          items={[
            'Give you a copy of what we hold about you.',
            'Correct anything that is wrong.',
            'Delete it.',
            'Stop using it, or restrict how we use it.',
            'Send it to you, or to someone else, in a portable form.',
            'Stop contacting you, by withdrawing the consent you gave.',
          ]}
        />
        <p>
          Ask by email and we will do it. There is no charge, and we will respond within
          one month.
        </p>
      </LegalSection>

      <LegalSection heading="If you are unhappy with how we have handled it">
        <p>
          Tell us first and we will try to put it right. If you are still unhappy, you can
          complain to the Information Commissioner&rsquo;s Office, the UK regulator for
          data protection, at{' '}
          <a
            href="https://ico.org.uk/make-a-complaint/"
            className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
          >
            ico.org.uk
          </a>
          . You do not need our permission to do that.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
