import type { Metadata } from 'next';
import { ROUTES } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import Script from 'next/script';
import { BookingEmbed } from '@/components/booking/BookingEmbed';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { Section } from '@/components/ui/Section';
import { siteConfig } from '@/lib/site-config';

/**
 * Contact — Content Spec 4.8.
 *
 * Two routes side by side: the calendar as the primary action, the form as the
 * alternative. The form carries exactly the fields the Content Spec lists and
 * nothing else — no "how did you hear about us", no budget range, no marketing
 * opt-in. Every additional field costs conversions on a page whose only job is
 * to start a conversation.
 *
 * The Turnstile script is the one third-party script that loads on page view,
 * because the widget has to be ready before the form is submitted. The booking
 * calendar does not load until the visitor asks for it.
 */

export const metadata: Metadata = pageMetadata({
  title: 'Book a call',
  description:
    'Book a short call about apprenticeships for your business, or send an enquiry and we will come back to you.',
  path: ROUTES.contact,
});

export default function Contact() {
  return (
    <>
      {siteConfig.turnstileSiteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
          async
          defer
        />
      )}

      <Section
        eyebrow="Book a call"
        heading="Tell us what you are trying to hire for."
        headingLevel={1}
      >
        <p className="max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          Half an hour is usually enough to work out whether an apprenticeship suits the
          role. If it does not, we will tell you that instead of selling you something.
        </p>

        {/*
          Finding F1 from the WP14 adversarial pass, closed here.

          "Pre-launch" was stated on About and For Training Providers but nowhere
          on the path an employer actually takes. Nothing on those pages claimed
          a track record, so the site passed its own content rules — but the
          honesty was unevenly distributed, and someone could have reached this
          page without learning they would be among the first.

          It sits on this page rather than on Home because this is where a person
          commits their details, and above both routes rather than beside the
          form because booking a call is a commitment too. Asserted by test so it
          cannot be quietly removed.
        */}
        <p className="mt-[var(--spacing-ag-6)] max-w-[62ch] text-[length:var(--text-ag-lg)] font-semibold text-[color:var(--color-ag-ink)]">
          We are just starting out. You would be one of our first employers, and we would
          rather tell you that now than on the call.
        </p>
      </Section>

      <Section divided>
        <div className="grid gap-[var(--spacing-ag-12)] lg:grid-cols-2 lg:gap-[var(--spacing-ag-16)]">
          <div className="flex flex-col gap-[var(--spacing-ag-6)]">
            <h2 className="text-[length:var(--text-ag-2xl)] font-semibold text-[color:var(--color-ag-ink)]">
              Pick a time
            </h2>
            <BookingEmbed calLink={siteConfig.calLink} />
          </div>

          <div className="flex flex-col gap-[var(--spacing-ag-6)]">
            <div className="flex flex-col gap-[var(--spacing-ag-2)]">
              <h2 className="text-[length:var(--text-ag-2xl)] font-semibold text-[color:var(--color-ag-ink)]">
                Or send an enquiry
              </h2>
              <p className="max-w-[52ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
                Only the first three are needed. The rest just save us a round of
                questions.
              </p>
            </div>

            <EnquiryForm
              turnstileSiteKey={siteConfig.turnstileSiteKey}
              fallbackEmail={siteConfig.enquiriesEmail}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
