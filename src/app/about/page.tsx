import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ButtonLink } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { ROUTES } from '@/lib/navigation';

/**
 * About — Content Spec 4.6.
 *
 * The independence statement is mandatory and is asserted in tests. It stays
 * exactly as worded: it is the sentence that makes a provider recommendation
 * from us worth anything, and it reads as professional rather than apologetic.
 *
 * No employer is named here, currently or formerly — not in the copy, not in
 * the metadata, not in a comment, not in alt text. That is constraint 7 and
 * risk R7: naming an employer would invite a reader to infer a connection or an
 * endorsement that does not exist.
 *
 * The page states relevant experience without volunteering headcount or stage.
 * An earlier version opened with "Two people, so far" and described the
 * founders as currently on apprenticeship programmes; it read as a disclaimer
 * rather than a credential and was removed. What replaces it claims no delivery
 * history — the prohibitions suite still forbids that — it simply stops
 * arguing against itself.
 *
 * There are no photographs, and no stock photography of people, which is on the
 * prohibited list.
 */

export const metadata: Metadata = pageMetadata({
  title: 'About',
  description:
    'Why ApprentiGate exists, how we work, and who we are independent of. Apprenticeship support for smaller employers in England.',
  path: ROUTES.about,
});

export default function About() {
  return (
    <>
      <Section
        eyebrow="About"
        heading="Why we started this."
        headingLevel={1}
        width="narrow"
      >
        <p className="max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          We have seen a well-run apprenticeship from the inside, and then looked at what
          it would take for a smaller employer to build the same thing from scratch.
        </p>
      </Section>

      <Section
        divided
        width="narrow"
        eyebrow="Who we are"
        heading="Apprenticeships, understood from the inside"
      >
        <div className="flex flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            ApprentiGate was built by people who have been through high-level
            apprenticeship programmes themselves — who have seen at first hand what a
            well-run programme looks like, where they go wrong, and how much of the
            outcome depends on what the employer does rather than on the training
            provider.
          </p>
          <p className="font-semibold text-[color:var(--color-ag-ink)]">
            We put that experience to work for employers who do not have an in-house
            early-careers team.
          </p>
        </div>
      </Section>

      {/*
        This block used to concede that being on an apprenticeship "does not by
        itself make anyone an expert in apprenticeship regulation". The substance
        underneath it — that advice rests on the published rules and that every
        claim is sourced and dated — is the part a sceptical reader actually
        wants, and it survives here. The disclaimer wrapped around it did not.
      */}
      <Section divided tone="mist" width="narrow" eyebrow="How we work">
        <div className="rounded-[var(--radius-ag-lg)] border-l-4 border-[var(--color-ag-signal)] bg-[var(--color-ag-paper)] p-[var(--spacing-ag-6)]">
          <div className="flex flex-col gap-[var(--spacing-ag-3)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
            <p className="text-[length:var(--text-ag-lg)] font-semibold text-[color:var(--color-ag-ink)]">
              What we tell you is grounded in the current published funding rules and
              apprenticeship standards, not in opinion.
            </p>
            <p>
              Every factual claim on this site traces back to a named source, and the
              funding page carries the date it was last checked against GOV.UK. The rules
              change; where we are relying on something that could move, we say so and we
              date it.
            </p>
          </div>
        </div>
      </Section>

      {/* Mandatory independence statement, Content Spec 4.6. */}
      <Section
        divided
        width="narrow"
        eyebrow="Independence"
        heading="Who we are not connected to"
      >
        <div className="flex flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p className="text-[length:var(--text-ag-lg)] font-semibold text-[color:var(--color-ag-ink)]">
            ApprentiGate is independent and is not affiliated with, sponsored by or
            endorsed by any employer, training provider or government body.
          </p>
          <p>
            ApprentiGate is a separate business, and no employer, training provider or
            government body has any involvement in it or any say in what we recommend.
          </p>
          <p>
            The same applies on the provider side. We take no commission and no referral
            fee from any training provider, and an employer pays the same fee whichever
            provider they choose. If we ever do hold a commercial arrangement with a
            provider, it carries no weight in what we recommend — which is the only thing
            that makes a recommendation from us worth having.
          </p>
          <p>
            Independence is only meaningful if it can be checked, so we compare providers
            on what government publishes for each of them: achievement rates, the cohorts
            behind those rates, employer and apprentice reviews, and how the training is
            delivered. You can look up every one of those yourself and ask us why our
            answer differs.
          </p>
        </div>
      </Section>

      <Section divided width="narrow">
        <h2 className="max-w-[22ch] text-[length:var(--text-ag-2xl)] font-semibold text-balance text-[color:var(--color-ag-ink)] md:text-[length:var(--text-ag-3xl)]">
          Talk to us directly.
        </h2>
        <p className="mt-[var(--spacing-ag-4)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          You deal with the people who will actually do the work — no account managers, no
          being passed along.
        </p>
        <div className="mt-[var(--spacing-ag-8)] flex flex-col gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
          <ButtonLink href={ROUTES.contact}>Book a call</ButtonLink>
          <ButtonLink href={ROUTES.howItWorks} variant="secondary">
            See how it works
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
