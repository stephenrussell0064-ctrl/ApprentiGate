import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardGrid } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { Section } from '@/components/ui/Section';
import { ROUTES } from '@/lib/navigation';

/**
 * For Employers — Content Spec 4.3.
 *
 * Four things on this page are non-negotiable and are asserted in tests:
 *
 *   1. The hiring statement is explicit and prominent, not buried. It sits
 *      immediately under the introduction, before the service blocks, because
 *      a visitor who thinks we might be picking their staff will read
 *      everything after it differently.
 *   2. The provider-comparison methodology is stated, including that any
 *      commercial arrangement carries zero weight. Without that sentence the
 *      independence claim is worthless — it is the whole answer to "how do we
 *      know your recommendation is not bought?" (risk R6).
 *   3. The KSB section is the most genuinely expert thing on the site and rests
 *      on real sources, not assertion. See CONTENT-SOURCES.md S7 and S8.
 *   4. The concept dashboard is rendered as an obvious diagram and never as a
 *      simulated screenshot, with its caption adjacent rather than a footnote.
 */

export const metadata: Metadata = pageMetadata({
  title: 'For employers',
  description:
    'What ApprentiGate does for an employer setting up apprenticeships: standard assessment, funding guidance, provider comparison, setup and ongoing support.',
  path: ROUTES.forEmployers,
});

const SERVICES = [
  {
    label: '01',
    title: 'Role and standard assessment',
    body: 'We work out whether the role suits an apprenticeship at all, and which standard genuinely matches the work — not just the job title.',
  },
  {
    label: '02',
    title: 'Funding guidance',
    body: 'What government funding may cover for this apprentice and this standard, what falls to you, and which parts still need confirming.',
  },
  {
    label: '03',
    title: 'Provider comparison',
    body: 'A shortlist of approved training providers who can actually deliver for your location and intake, with the reasoning set out.',
  },
  {
    label: '04',
    title: 'Setup coordination',
    body: 'The paperwork, the training plan and the account setup, handled between you and the provider so neither side stalls.',
  },
  {
    label: '05',
    title: 'Recruitment logistics support',
    body: 'Job description structure, advertising coordination, application administration and interview scheduling. You interview and you select.',
  },
  {
    label: '06',
    title: 'Ongoing programme support',
    body: 'Tracking reviews and deadlines, keeping you ahead of what you are required to do, and raising problems while they are still small.',
  },
];

const COMPARISON_FACTORS = [
  'Training quality and outcomes',
  'Fit with what you actually need',
  'Support for you as the employer',
  'Support for the apprentice',
  'Delivery model and location',
  'Relevant experience of this standard',
  'Progression opportunities afterwards',
];

export default function ForEmployers() {
  return (
    <>
      <Section
        eyebrow="For employers"
        heading="What we actually do for you."
        headingLevel={1}
      >
        <p className="max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          Six things, from working out whether a role suits an apprenticeship at all
          through to keeping the programme on track once your apprentices have started.
        </p>
      </Section>

      {/*
        Explicit, prominent, not buried. This sits before the service blocks
        because a reader who suspects we might be choosing their staff will read
        everything below it differently.
      */}
      <Section divided width="narrow">
        <div className="rounded-[var(--radius-ag-lg)] border-l-4 border-[var(--color-ag-signal)] bg-[var(--color-ag-mist)] p-[var(--spacing-ag-6)]">
          <p className="text-[length:var(--text-ag-xl)] font-semibold text-[color:var(--color-ag-ink)]">
            You interview, you select and you employ your apprentices.
          </p>
          <p className="mt-[var(--spacing-ag-3)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
            ApprentiGate does not make hiring decisions. We can structure the job
            description, coordinate advertising, administer applications and schedule
            interviews — but the people you take on are your choice and your employees.
          </p>
        </div>
      </Section>

      <Section divided eyebrow="The service" heading="Six things we take on">
        <CardGrid>
          {SERVICES.map((service) => (
            <Card key={service.title} label={service.label} title={service.title}>
              {service.body}
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ------------------------------------------------------------- KSBs */}
      <Section
        divided
        tone="mist"
        width="narrow"
        eyebrow="The part people get wrong"
        heading="A matching job title is not the same as a matching standard."
      >
        <div className="flex flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            Every apprenticeship is built on an occupational standard, and every standard
            is a description of the{' '}
            <strong className="font-semibold text-[color:var(--color-ag-ink)]">
              knowledge, skills and behaviours
            </strong>{' '}
            someone needs to be competent in that occupation. Those are what the
            apprentice is assessed against at the end — not the job title, and not the
            duties as written.
          </p>
          <p>
            So the question that matters is not whether the role sounds like the standard.
            It is whether the actual day-to-day work will give the apprentice enough
            exposure to develop each of those knowledge, skills and behaviours, and enough
            evidence to show it.
          </p>
          <p>
            This is where apprenticeships quietly go wrong. A role that looks like a
            perfect fit on paper, but never gives someone the chance to do part of what
            the standard requires, leaves an apprentice unable to evidence that part when
            it counts — and by then it is late to fix.
          </p>
          <p className="font-semibold text-[color:var(--color-ag-ink)]">
            Checking that properly, before anyone signs anything, is the single most
            useful thing we do.
          </p>
          <p className="text-[length:var(--text-ag-sm)]">
            Standards are published by Skills England, and you can{' '}
            <a
              href="https://skillsengland.education.gov.uk/apprenticeship-standards"
              className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
            >
              read any of them yourself
            </a>
            .
          </p>
        </div>
      </Section>

      {/* ------------------------------------------------ Provider comparison */}
      <Section
        divided
        eyebrow="Provider comparison"
        heading="How we decide what to put in front of you"
      >
        <div className="grid gap-[var(--spacing-ag-8)] md:grid-cols-2 md:gap-[var(--spacing-ag-12)]">
          <div className="flex flex-col gap-[var(--spacing-ag-4)]">
            <p className="max-w-[62ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
              We compare approved providers against one consistent set of factors, so a
              recommendation can be explained rather than just asserted:
            </p>
            <ul className="flex list-none flex-col gap-[var(--spacing-ag-2)] p-0">
              {COMPARISON_FACTORS.map((factor) => (
                <li
                  key={factor}
                  className="border-b border-[var(--color-ag-mist)] pb-[var(--spacing-ag-2)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]"
                >
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          {/*
            The independence statement. Without this the methodology above is
            worth nothing, because the obvious question is whether the
            recommendation was bought.
          */}
          <div className="flex flex-col gap-[var(--spacing-ag-4)]">
            <Notice tone="info" title="Commercial arrangements carry zero weight.">
              If we ever have a commercial arrangement with a provider, it counts for
              nothing in what we recommend to you. It is not a tie-breaker and it is not a
              thumb on the scale. You also see the reasoning, so you can disagree with it.
            </Notice>
            <p className="max-w-[62ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
              You make the final choice of provider. If you already work with one you
              like, we can work alongside them instead.
            </p>
          </div>
        </div>
      </Section>

      <Section divided tone="mist" width="narrow">
        <h2 className="max-w-[20ch] text-[length:var(--text-ag-2xl)] font-semibold text-balance text-[color:var(--color-ag-ink)] md:text-[length:var(--text-ag-3xl)]">
          Start with one role.
        </h2>
        <p className="mt-[var(--spacing-ag-4)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          Tell us about a job you are trying to fill and we will tell you whether an
          apprenticeship fits it — including if it does not.
        </p>
        <div className="mt-[var(--spacing-ag-8)] flex flex-col gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
          <ButtonLink href={ROUTES.contact}>Book a call</ButtonLink>
          <ButtonLink href={ROUTES.howItWorks} variant="secondary">
            See the seven steps
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
