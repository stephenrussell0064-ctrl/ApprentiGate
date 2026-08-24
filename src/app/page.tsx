import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { RelayBand } from '@/components/brand/RelayBand';
import { ButtonLink } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { ROUTES } from '@/lib/navigation';

/**
 * Home.
 *
 * Every section here comes from Content Spec 4.1, in its order, because the
 * order is the argument: establish what ApprentiGate is before describing what
 * it does, and state the problem honestly before offering to solve it.
 *
 * Two things on this page are load-bearing and should survive any later edit:
 *
 *   - The position section exists because a visitor's default assumption is
 *     that ApprentiGate is a training provider or a recruiter. Correcting that
 *     is the most important job the page has.
 *   - The problem section deliberately concedes that employers *can* find
 *     providers themselves. Claiming otherwise would be false, and a sceptical
 *     managing director who has used the GOV.UK service would catch it
 *     immediately.
 *
 * Claims trace to CONTENT-SOURCES.md: the funding paragraph rests on S1, S2 and
 * S4, and the three-party split on S5. The funding paragraph carries no
 * percentages by design — the Content Spec holds Home to the band-cap concept
 * and puts the figures on the Funding page.
 */

export const metadata: Metadata = pageMetadata({
  title: 'ApprentiGate — apprenticeships for growing businesses',
  description:
    'ApprentiGate helps smaller employers in England set up and run apprenticeship programmes, working between the employer and approved training providers.',
  path: ROUTES.home,
});

const YOURS = [
  'The job, and what it pays',
  'The interviews and the hiring decision',
  'Managing the apprentice day to day',
  'Giving them the work that builds the skills',
];

const OURS = [
  'Working out which standard the role actually fits',
  'Explaining what the funding means for your business',
  'Researching and comparing approved providers',
  'Coordinating the setup between you and the provider',
  'The ongoing administration once they have started',
];

function TickList({ items }: { readonly items: readonly string[] }) {
  return (
    <ul className="flex list-none flex-col gap-[var(--spacing-ag-3)] p-0">
      {items.map((item) => (
        <li key={item} className="flex gap-[var(--spacing-ag-3)]">
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
  );
}

export default function Home() {
  return (
    <>
      {/* ------------------------------------------------------------ Hero */}
      <Section>
        <p className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-slate)] uppercase">
          Apprenticeships for growing businesses in England
        </p>

        <h1 className="mt-[var(--spacing-ag-6)] max-w-[18ch] text-[length:var(--text-ag-3xl)] font-semibold text-balance text-[color:var(--color-ag-ink)] md:text-[length:var(--text-ag-4xl)] lg:text-[length:var(--text-ag-5xl)]">
          Build your apprenticeship programme without the complexity.
        </h1>

        <p className="mt-[var(--spacing-ag-6)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          ApprentiGate helps growing businesses identify suitable apprenticeship routes,
          compare approved training providers and coordinate programme setup — without
          needing a dedicated internal apprenticeship team.
        </p>

        <div className="mt-[var(--spacing-ag-8)] flex flex-col gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
          <ButtonLink href={ROUTES.contact}>
            Explore apprenticeships for your business
          </ButtonLink>
          <ButtonLink href={ROUTES.howItWorks} variant="secondary">
            See how it works
          </ButtonLink>
        </div>
      </Section>

      {/* -------------------------------------------------- The position */}
      <Section
        divided
        eyebrow="Where we sit"
        heading="We are not a training provider, and we are not a recruiter."
      >
        <p className="max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          Three organisations are involved in every apprenticeship. You employ the
          apprentice and manage their work. An approved training provider delivers the
          training and assessment. ApprentiGate sits between the two and handles the
          process that connects them.
        </p>

        <div className="mt-[var(--spacing-ag-12)]">
          <RelayBand />
        </div>
      </Section>

      {/* --------------------------------------------------- The problem */}
      <Section
        divided
        tone="mist"
        eyebrow="The problem"
        heading="The information is published. The time to work through it is what’s missing."
      >
        <div className="flex max-w-[62ch] flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            Most of what you need is on{' '}
            <a
              href="https://www.gov.uk/employing-an-apprentice"
              className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
            >
              GOV.UK
            </a>{' '}
            and it is genuinely useful. You can search apprenticeship standards, see the
            funding band for each one, and compare approved providers yourself. We are not
            going to pretend otherwise.
          </p>
          <p>
            What a 60-person firm does not have is someone whose job it is to work out
            whether a role fits a standard, whether Level 3 or Level 4 is right, whether a
            provider has capacity for a September intake, and what happens when an
            apprentice falls behind.
          </p>
          <p className="font-semibold text-[color:var(--color-ag-ink)]">
            That is the job we do.
          </p>
        </div>
      </Section>

      {/* ------------------------------- What you keep, what we take on */}
      <Section divided eyebrow="The split" heading="What you keep, what we take on">
        <div className="grid gap-[var(--spacing-ag-8)] md:grid-cols-2 md:gap-[var(--spacing-ag-12)]">
          <div className="flex flex-col gap-[var(--spacing-ag-4)]">
            <h3 className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-ink)] uppercase">
              Yours
            </h3>
            <TickList items={YOURS} />
          </div>

          <div className="flex flex-col gap-[var(--spacing-ag-4)]">
            <h3 className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-signal)] uppercase">
              Ours
            </h3>
            <TickList items={OURS} />
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------- The funding */}
      <Section
        divided
        width="narrow"
        eyebrow="Funding"
        heading="How the money works, briefly"
      >
        <div className="flex flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            Every apprenticeship standard has a funding band maximum. For eligible
            employers who do not pay the apprenticeship levy, government funding can cover
            the cost of training and assessment up to that maximum. Whether it applies
            depends on the apprentice, the employer and the standard, and any price agreed
            above the band maximum is yours to pay. The apprentice&rsquo;s wage is always
            yours.
          </p>
          <p>
            Eligibility is confirmed for each employer rather than assumed, and the rules
            change. We will tell you where you stand before you commit to anything.
          </p>
        </div>

        <div className="mt-[var(--spacing-ag-8)]">
          <ButtonLink href={ROUTES.funding} variant="secondary">
            How apprenticeship funding works
          </ButtonLink>
        </div>
      </Section>

      {/* ----------------------------------------------------- Closing CTA */}
      <Section divided tone="mist" width="narrow">
        <h2 className="max-w-[20ch] text-[length:var(--text-ag-2xl)] font-semibold text-balance text-[color:var(--color-ag-ink)] md:text-[length:var(--text-ag-3xl)]">
          Tell us the roles you are trying to fill.
        </h2>
        <p className="mt-[var(--spacing-ag-4)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          A short call is usually enough to tell whether an apprenticeship is the right
          route for the role. If it is not, we will say so.
        </p>
        <div className="mt-[var(--spacing-ag-8)] flex flex-col gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
          <ButtonLink href={ROUTES.contact}>Book a call</ButtonLink>
          <ButtonLink href={ROUTES.contact} variant="secondary">
            Send an enquiry
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
