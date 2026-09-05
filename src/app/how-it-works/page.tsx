import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { RelayBand } from '@/components/brand/RelayBand';
import { ButtonLink } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Section } from '@/components/ui/Section';
import { StepSequence, type Step } from '@/components/ui/StepSequence';
import { ROUTES } from '@/lib/navigation';

/**
 * How It Works — Content Spec 4.2.
 *
 * Six steps, marked up as an ordered list because the order genuinely carries
 * meaning: the funding position is explained before providers are compared, and
 * the employer chooses the provider before anything is set up. Reordering these
 * would describe a different, worse service.
 *
 * Each step carries one sentence on what happens and one on what is required
 * from the employer. That second line is the honest half — without it the
 * sequence reads as though the service does everything, which would set up the
 * wrong expectation before the first call.
 *
 * No elapsed times. The Content Spec permits them only where they can be
 * honestly estimated, and none of these can: they depend on the standard, on
 * provider intake dates, and on how fast the employer decides. Rather than
 * quietly omitting them, the page says why they are absent — an unexplained
 * gap invites the reader to assume the worst, and the reason is itself
 * reassuring.
 *
 * Claims: the approved-provider framing traces to CONTENT-SOURCES.md S5, and
 * the funding language to S1, S2 and S4. No figures appear on this page.
 */

export const metadata: Metadata = pageMetadata({
  title: 'How it works',
  description:
    'The six steps from telling us the roles you need to handing you over to your chosen provider, set up and ready to start — and what each step asks of you.',
  path: ROUTES.howItWorks,
});

const STEPS: readonly Step[] = [
  {
    title: 'Tell us the roles you need',
    detail:
      'You describe the junior roles you are trying to fill, what the work actually involves day to day, and roughly when you would like someone in post.',
    employerAction: 'describe the role and the team it sits in. Nothing formal.',
  },
  {
    title: 'We check whether an apprenticeship fits, and find the standard',
    detail:
      'We compare the day-to-day work against the published apprenticeship standards, looking at whether the role gives enough exposure to develop the knowledge, skills and behaviours a standard requires — not whether the job title happens to match the standard’s name. If an apprenticeship is not the right route for this role, this is the step where we tell you.',
    // The "You" line describes what the employer does. A promise from us
    // belongs in the detail above, not under a label that says "You".
    employerAction: 'answer a few questions about what the work involves.',
  },
  {
    title: 'We explain the funding position for your business',
    detail:
      'We set out what government funding may cover for this standard and this apprentice, what falls to you, and which parts are confirmed rather than assumed.',
    employerAction: 'confirm whether you pay the apprenticeship levy.',
  },
  {
    title: 'We research and compare approved providers',
    detail:
      'We shortlist approved training providers that can deliver this standard for your location and your intake. We take no commission from any of them, so the shortlist is the same one we would draw up for ourselves — and most of what separates them is already published by government, for every provider on this course:',
    points: [
      'The achievement rate for this course, and how many apprentices it covers — a perfect rate across a handful of them is not evidence of much',
      'Employer and apprentice reviews, and how many reviews are behind each rating',
      'How the training is delivered — at your workplace, day release or block release',
    ],
    employerAction: 'tell us which of those factors matter most to you.',
  },
  {
    title: 'You choose your provider',
    detail:
      'We put the shortlist in front of you with the reasoning behind it, and introduce you to the providers you want to speak to.',
    employerAction:
      'make the final decision. It is your programme, your budget and your choice.',
  },
  {
    title: 'We coordinate the setup',
    detail:
      'We work between you and the provider through the paperwork, the training plan and the account setup, so neither side is sitting waiting on the other.',
    employerAction:
      'sign what needs signing, and give us the details only you can provide.',
  },
];

export default function HowItWorks() {
  return (
    <>
      <Section
        eyebrow="How it works"
        heading="Six steps, in this order."
        headingLevel={1}
      >
        <p className="max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          The order matters. We work out what the funding means for you before we compare
          providers, and you choose the provider before anything gets set up. Each step
          says what we do and what it asks of you.
        </p>
      </Section>

      <Section divided>
        {/* h2: the steps sit directly under the page's h1, with no section
            heading between. h3 here would skip a level. */}
        <StepSequence steps={STEPS} headingLevel={2} />
      </Section>

      {/* The Content Spec permits elapsed times only where they can be honestly
          estimated. None of these can be, so rather than leaving an unexplained
          gap the page states why. */}
      <Section divided width="narrow" tone="mist">
        <Notice tone="info" title="Timings depend on your situation.">
          How long each one takes depends on the standard, on when providers next have an
          intake, and on how quickly decisions get made at your end. We will give you
          realistic dates for your programme once we know those things, rather than
          printing an average that turns out to be wrong.
        </Notice>
      </Section>

      <Section
        divided
        eyebrow="Who does what"
        heading="You employ. They train. We handle the rest."
      >
        <p className="max-w-[62ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          Through all six steps the split stays the same. You employ and manage the
          apprentice. An approved training provider delivers the training and assessment.
          We handle the process between the two.
        </p>
        <div className="mt-[var(--spacing-ag-12)]">
          <RelayBand />
        </div>
      </Section>

      <Section divided width="narrow" tone="mist">
        <h2 className="max-w-[20ch] text-[length:var(--text-ag-2xl)] font-semibold text-balance text-[color:var(--color-ag-ink)] md:text-[length:var(--text-ag-3xl)]">
          Start at step one.
        </h2>
        <p className="mt-[var(--spacing-ag-4)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          Tell us the roles you are trying to fill and we will tell you whether an
          apprenticeship is a sensible route for them.
        </p>
        <div className="mt-[var(--spacing-ag-8)] flex flex-col gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
          <ButtonLink href={ROUTES.contact}>Book a call</ButtonLink>
          <ButtonLink href={ROUTES.funding} variant="secondary">
            How funding works
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
