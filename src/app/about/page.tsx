import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Section } from '@/components/ui/Section';
import { ROUTES } from '@/lib/navigation';

/**
 * About — Content Spec 4.6.
 *
 * Two sentences on this page are mandatory and are asserted in tests: the
 * honesty line about what the founders' experience does and does not qualify
 * them for, and the independence statement.
 *
 * No employer is named here, currently or formerly — not in the copy, not in
 * the metadata, not in a comment, not in alt text. That is constraint 7 and
 * risk R7: the founders are on apprenticeship programmes with real employers,
 * and naming one would invite a reader to infer a connection or an endorsement
 * that does not exist. The page says outright that employers are not named,
 * rather than leaving a gap for the reader to fill in.
 *
 * There are no photographs. There is no stock photography of people, which is
 * on the prohibited list, and no reason to add pictures of the founders to make
 * a two-person pre-launch business look larger.
 */

export const metadata: Metadata = {
  title: 'About',
  description:
    'ApprentiGate is Stephen Russell and Zaim Rana. Why we started it, what our experience does and does not qualify us for, and who we are independent of.',
};

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
          We have both seen a well-run apprenticeship from the inside, and then looked at
          what it would take for a smaller employer to build the same thing from scratch.
        </p>
      </Section>

      <Section divided width="narrow" eyebrow="Who we are" heading="Two people, so far">
        <div className="flex flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            ApprentiGate is{' '}
            <strong className="font-semibold text-[color:var(--color-ag-ink)]">
              Stephen Russell
            </strong>{' '}
            and{' '}
            <strong className="font-semibold text-[color:var(--color-ag-ink)]">
              Zaim Rana
            </strong>
            .
          </p>
          <p>
            We are both currently on high-level apprenticeship programmes. That means we
            have spent the last few years inside a structured programme — seeing what a
            good one looks like, where they go wrong, and how much of the outcome depends
            on what the employer does rather than the training provider.
          </p>
          <p>
            What struck us is that a smaller business has no realistic route to building
            the same thing. Not because the information is hidden — it is published, and
            we say so elsewhere on this site — but because nobody there has the time to
            become the person who knows it.
          </p>
        </div>
      </Section>

      {/*
        Mandatory honesty line, Content Spec 4.6. It sits in its own block rather
        than inside a paragraph of biography, because the whole point is that a
        sceptical reader should not have to hunt for the limits of what we know.
      */}
      <Section
        divided
        tone="mist"
        width="narrow"
        eyebrow="What that does and does not mean"
      >
        <div className="rounded-[var(--radius-ag-lg)] border-l-4 border-[var(--color-ag-signal)] bg-[var(--color-ag-paper)] p-[var(--spacing-ag-6)]">
          <div className="flex flex-col gap-[var(--spacing-ag-3)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
            <p className="text-[length:var(--text-ag-lg)] font-semibold text-[color:var(--color-ag-ink)]">
              Being on an apprenticeship tells you what one should feel like. It does not
              by itself make anyone an expert in apprenticeship regulation or provider
              compliance.
            </p>
            <p>
              So the service is built on documented methodology and the current published
              rules rather than on assertion. It is also why every factual claim on this
              site traces back to a named source, and why the funding page carries the
              date it was last checked.
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
            We do not name the employers we work for, and nothing here is connected to
            them. This is a separate business, built in our own time, and no employer of
            ours has any involvement in it or any say in what we recommend.
          </p>
          <p>
            The same applies on the provider side. If we ever hold a commercial
            arrangement with a training provider, it carries no weight in what we
            recommend to an employer — which is the only thing that makes a recommendation
            from us worth having.
          </p>
        </div>
      </Section>

      <Section divided tone="mist" width="narrow" eyebrow="Where we are up to">
        <Notice tone="info" title="Pre-launch, and saying so.">
          We are speaking to employers and training providers now and building the service
          around what they tell us. We would rather start a conversation from an honest
          position than describe a track record we have not earned yet.
        </Notice>
      </Section>

      <Section divided width="narrow">
        <h2 className="max-w-[22ch] text-[length:var(--text-ag-2xl)] font-semibold text-balance text-[color:var(--color-ag-ink)] md:text-[length:var(--text-ag-3xl)]">
          Talk to one of us directly.
        </h2>
        <p className="mt-[var(--spacing-ag-4)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          At this size there is nobody to be passed along to. You get one of the two of
          us.
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
