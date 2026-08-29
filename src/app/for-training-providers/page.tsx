import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ButtonLink } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Section } from '@/components/ui/Section';
import { ROUTES } from '@/lib/navigation';

/**
 * For Training Providers — Content Spec 4.4.
 *
 * This page is deliberately shorter and less developed than the employer side,
 * and that is not an oversight to be corrected later. The provider proposition
 * is unvalidated: the commercial model has not been settled, and there is no
 * pipeline to describe. A page padded out to match For Employers would be
 * making the business look further along than it is, to an audience that talks
 * to intermediaries constantly and would spot it.
 *
 * Three hard constraints, all asserted in tests:
 *
 *   1. No fee model. Not a rate, not a range, not a structure. It does not
 *      exist yet, and the funding rules place real limits on what a provider
 *      may pay an intermediary out of, so inventing one now could be worse
 *      than wrong.
 *   2. The word "partner" is not used about anyone. Nobody is a partner.
 *   3. The state of play is stated plainly rather than implied — the network is
 *      arrangements still being worked out, conversations happening now.
 */

export const metadata: Metadata = pageMetadata({
  title: 'For training providers',
  description:
    'We introduce approved training providers to employers with an assessed apprenticeship requirement. Commercial arrangements are still being developed.',
  path: ROUTES.forProviders,
});

const WHAT_WE_DO_FIRST = [
  'Found the employer and started the conversation',
  'Explained how apprenticeships and funding actually work for them',
  'Checked the role against the standard, not just the job title',
  'Scoped roughly how many apprentices and when',
];

export default function ForTrainingProviders() {
  return (
    <>
      <Section
        eyebrow="For training providers"
        heading="An employer who already knows what they want."
        headingLevel={1}
        width="narrow"
      >
        <p className="max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          ApprentiGate aims to introduce approved training providers to employers with a
          genuine, assessed apprenticeship requirement — not a name on a list.
        </p>
      </Section>

      <Section
        divided
        width="narrow"
        eyebrow="The difference"
        heading="What has already happened before we introduce anyone"
      >
        <ul className="flex list-none flex-col gap-[var(--spacing-ag-3)] p-0">
          {WHAT_WE_DO_FIRST.map((item) => (
            <li
              key={item}
              className="flex gap-[var(--spacing-ag-3)] border-b border-[var(--color-ag-mist)] pb-[var(--spacing-ag-3)]"
            >
              <svg
                viewBox="0 0 20 20"
                className="mt-[5px] size-4 shrink-0 text-[color:var(--color-ag-signal)]"
                aria-hidden="true"
              >
                <path
                  d="M4 10.5l4 4 8-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-[var(--spacing-ag-8)] max-w-[62ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          The employer still chooses their provider, and we tell them how we reached the
          shortlist. Any commercial arrangement carries no weight in that decision — which
          matters to you as much as it does to them, because it is the only reason an
          introduction from us is worth anything.
        </p>
      </Section>

      {/*
        The honest state of play. This is the section that stops the page
        reading as though a network already exists.
      */}
      <Section divided tone="mist" width="narrow" eyebrow="Where this is up to">
        <Notice tone="info" title="Where the provider network is up to.">
          <div className="flex flex-col gap-[var(--spacing-ag-3)]">
            <p>
              We are building the provider network now, and commercial arrangements are
              agreed with each provider directly rather than set by a fixed rate card, so
              terms can fit what you actually deliver.
            </p>
            <p>
              The starting point is a conversation: what you deliver, where, what a useful
              introduction looks like to you, and what would make this worth your time.
            </p>
          </div>
        </Notice>
      </Section>

      <Section divided width="narrow">
        <h2 className="max-w-[24ch] text-[length:var(--text-ag-2xl)] font-semibold text-balance text-[color:var(--color-ag-ink)] md:text-[length:var(--text-ag-3xl)]">
          Speak to us about our provider network.
        </h2>
        <p className="mt-[var(--spacing-ag-4)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          Tell us which standards you deliver and how you like to work with employers, and
          we will be straight with you about where we are up to.
        </p>
        <div className="mt-[var(--spacing-ag-8)]">
          <ButtonLink href={ROUTES.contact}>Speak to us</ButtonLink>
        </div>
      </Section>
    </>
  );
}
