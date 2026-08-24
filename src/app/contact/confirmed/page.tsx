import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { ROUTES } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

/**
 * Enquiry confirmation.
 *
 * A page, not a toast. A toast disappears, cannot be returned to, cannot be
 * screenshotted for a colleague, and is invisible to anyone who was not looking
 * at that part of the screen when it appeared. Someone who has just handed over
 * their details deserves a thing that stays put.
 *
 * It is noindex: it says nothing useful to a searcher and would be an odd
 * result to land on cold.
 */

export const metadata: Metadata = pageMetadata({
  title: 'Enquiry sent',
  description: 'Your enquiry reached us and one of us will reply.',
  path: ROUTES.bookingConfirmed,
  noindex: true,
});

export default function EnquiryConfirmed() {
  return (
    <Section
      width="narrow"
      eyebrow="Enquiry sent"
      heading="Thanks — that reached us."
      headingLevel={1}
    >
      <div className="flex flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
        <p>
          One of us will read it and reply. There are two of us, so it will be a person
          who has actually looked at what you sent rather than an automated response.
        </p>
        <p>
          If it turns out an apprenticeship is not the right route for the role you
          described, we will say so — that is a useful answer too.
        </p>
        {siteConfig.enquiriesEmail && (
          <p>
            If you need to add anything, reply to us at{' '}
            <a
              href={`mailto:${siteConfig.enquiriesEmail}`}
              className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
            >
              {siteConfig.enquiriesEmail}
            </a>
            .
          </p>
        )}
      </div>

      <div className="mt-[var(--spacing-ag-8)] flex flex-col gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
        <ButtonLink href={ROUTES.howItWorks}>See how it works</ButtonLink>
        <ButtonLink href={ROUTES.funding} variant="secondary">
          How funding works
        </ButtonLink>
      </div>
    </Section>
  );
}
