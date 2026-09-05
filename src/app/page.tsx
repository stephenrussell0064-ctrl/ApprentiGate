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
 *   - The independence section is the differentiator, and it has to sit
 *     immediately after that concession. Everything an employer can do alone,
 *     they can do alone; what they cannot get anywhere else is advice on which
 *     provider to use from someone with nothing riding on the answer.
 *
 * Claims trace to CONTENT-SOURCES.md: the funding paragraph rests on S1, S2 and
 * S4, the three-party split on S5, the provider comparison criteria on S14, and
 * the statement that our fee sits outside apprenticeship funding on S12. The
 * funding paragraph carries no percentages by design — the Content Spec holds
 * Home to the band-cap concept and puts the figures on the Funding page.
 *
 * The independence section observes the same restraint for the same reason: it
 * names *what* is compared and never prints a rate, a rating or a provider
 * name. Those are per-course and per-year, and a number frozen into this page
 * would be stale and unverifiable at the moment a prospect reads it.
 */

export const metadata: Metadata = pageMetadata({
  title: 'ApprentiGate — apprenticeships for growing businesses',
  // Under 155 characters, asserted by tests/e2e/seo.spec.ts, because Google
  // truncates past roughly that and a sentence cut mid-clause reads as neglect.
  description:
    'Independent apprenticeship help for smaller employers in England. We sell no training and take no commission, so the provider we recommend is the best one.',
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
  'Comparing approved providers on their published results, not on who we know',
  'Coordinating the setup between you and the provider',
];

/**
 * What a provider comparison is actually made of.
 *
 * Every item is something government publishes for that provider on that
 * course (S14), which is the whole basis on which the independence claim can
 * be made at all — an impartiality promise with nothing observable behind it
 * is worth no more than the provider's own sales pitch.
 *
 * The cohort-size line is not a caveat, it is the point. Find apprenticeship
 * training prints the achievement rate next to the number of apprentices it
 * covers, and the first result checked when this page was written was 100%
 * out of ten. Anyone comparing on the percentage alone is reading noise.
 */
const COMPARED_ON = [
  {
    title: 'The achievement rate for that provider on that course',
    body: 'Published by government, and read alongside the number of apprentices it is calculated over. A perfect rate across a handful of apprentices is not evidence of anything.',
  },
  {
    title: 'Employer and apprentice reviews, and how many there are',
    body: 'A rating drawn from four reviews and a rating drawn from forty are not the same rating, and we do not treat them as one.',
  },
  {
    title: 'How the training is actually delivered',
    body: 'At your workplace, day release or block release — checked against your rota, not against the brochure. This is the detail that decides whether a programme survives its first busy month.',
  },
  {
    title: 'Whether they are approved for the standard at all',
    body: 'Providers are approved for particular standards, not in general. A provider you like the sound of may simply not be able to deliver the one your role needs.',
  },
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
      {/* ------------------------------------------------------------ Hero
        Two columns from `lg`, and a single column below it.

        The old hero set its heading to an 18-character measure and left the
        right half of a 1440px viewport empty, which reads as an unfinished
        page rather than as deliberate space. The type now runs to a proper
        display size and the space to its right carries the relay band — the one
        piece of information a visitor most needs in the first seconds, since
        their working assumption is that we are the trainer or the recruiter.

        Filling that space with the proposition rather than with decoration is
        the point. There is no product screenshot to show and no photography
        that would be honest, so the strongest thing available is the structure
        of the offer itself.
      */}
      <Section>
        <div className="grid items-center gap-[var(--spacing-ag-16)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-[var(--spacing-ag-24)]">
          {/* `min-w-0`: a grid item's automatic minimum is its min-content, so
              without this any wide child sets the column's floor and overflows
              the container rather than being made to fit. */}
          <div className="ag-reveal min-w-0">
            <p className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-slate)] uppercase">
              Apprenticeships for growing businesses in England
            </p>

            <h1 className="mt-[var(--spacing-ag-6)] max-w-[19ch] text-[length:var(--text-ag-display)] leading-[var(--leading-ag-display)] font-semibold tracking-[var(--tracking-ag-display)] text-balance break-words text-[color:var(--color-ag-ink)]">
              Build your apprenticeship programme without the complexity.
            </h1>

            <p className="mt-[var(--spacing-ag-8)] max-w-[54ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
              We sell no training. We take no commission from providers. We work out which
              apprenticeship standard your role fits, compare the approved providers on
              their published results, and set the whole thing up — so the recommendation
              you get is the one we would pick if it were our own business.
            </p>

            {/* `flex-wrap` matters more than it looks. Without it the row
                squeezes both buttons until their labels break mid-phrase on a
                1440px display, which reads as a bug. With it, a button that
                does not fit takes its own row and keeps its label intact — and
                `sm:whitespace-nowrap` holds the label on one line from the
                width where that is possible, while still letting it wrap on a
                phone, where it must. */}
            <div className="mt-[var(--spacing-ag-8)] flex flex-col flex-wrap gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
              <ButtonLink
                href={ROUTES.contact}
                size="lg"
                className="sm:whitespace-nowrap"
              >
                Explore apprenticeships for your business
              </ButtonLink>
              <ButtonLink
                href={ROUTES.howItWorks}
                variant="secondary"
                size="lg"
                className="sm:whitespace-nowrap"
              >
                See how it works
              </ButtonLink>
            </div>
          </div>

          <div className="ag-reveal ag-reveal-delayed hidden lg:block">
            <RelayBand variant="stacked" />
          </div>
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
            </a>
            . You can search apprenticeship standards, see the funding band for each one,
            and compare approved providers yourself.
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

      {/* ---------------------------------------------- Independence
        This is the section the business is built on, and it belongs here
        rather than further down. "The problem" has just conceded that an
        employer can compare providers themselves on GOV.UK. The obvious next
        move — ask a provider — is the one that quietly fails, and saying why
        is what turns the concession into an argument for us.

        The claim is deliberately split in two, because the two halves have
        different standing and must not be blurred:

          - That our fee is separate from apprenticeship funding and cannot be
            paid out of it is a matter of published rule (S12: lead generation
            and first contact are ineligible costs, and financial inducements
            in relation to the apprenticeship unit are ineligible).
          - That we take no commission or referral fee from providers at all
            is a statement about our own commercial arrangements. It is ours to
            keep, not something the funding rules impose, and it is written as
            a commitment rather than dressed up as regulation.

        The comparison criteria then make impartiality falsifiable (S14). Note
        what is absent by design: no provider is named, and no rate, rating or
        league table is printed. Those change per course and per year, and a
        figure frozen into a marketing page is exactly the confidently stated
        number that CONTENT-SOURCES.md exists to prevent.
      */}
      <Section
        divided
        eyebrow="Why us"
        heading="Ask a training provider which provider to use, and you already know the answer."
      >
        <div className="flex max-w-[62ch] flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            That is not dishonesty on their part. A provider delivers its own courses, so
            the only apprenticeships it can put in front of you are the ones it runs. But
            it does mean the first advice most employers ever get — on which standard to
            choose and who should deliver it — comes from the one party whose answer is
            fixed before the question is asked.
          </p>
          <p>
            ApprentiGate delivers no training, so there is no answer that pays us better
            than another. We take no commission and no referral fee from any provider. You
            pay us a fixed fee, and it is the same fee whichever provider you go with.
          </p>
          <p>
            Our fee is also separate from apprenticeship funding and cannot be paid out of
            it &mdash; the funding rules put lead generation, first contact and financial
            inducements outside what apprenticeship funding may be spent on. So a provider
            cannot fund our recommendation, and we cannot be paid more for sending you to
            one rather than another.
          </p>
          <p className="font-semibold text-[color:var(--color-ag-ink)]">
            When we tell you a provider is the right one, that recommendation costs us
            nothing to make and earns us nothing to change.
          </p>
        </div>

        <div className="mt-[var(--spacing-ag-12)]">
          <h3 className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-ink)] uppercase">
            What we compare them on
          </h3>

          {/* A list rather than a table: there are no numbers to align, and a
              table would imply a scoreboard the page deliberately does not
              print. */}
          <ul className="mt-[var(--spacing-ag-6)] grid list-none gap-[var(--spacing-ag-8)] p-0 md:grid-cols-2 md:gap-x-[var(--spacing-ag-12)]">
            {COMPARED_ON.map((item) => (
              <li
                key={item.title}
                className="border-l-2 border-[color:var(--color-ag-signal)] pl-[var(--spacing-ag-5)]"
              >
                <p className="text-[length:var(--text-ag-base)] font-semibold text-[color:var(--color-ag-ink)]">
                  {item.title}
                </p>
                <p className="mt-[var(--spacing-ag-2)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-[var(--spacing-ag-8)] max-w-[62ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
            All of it is published by government, for every approved provider, on every
            course. You can check any of it yourself — and if our recommendation does not
            match what you find, ask us why. That question should always have an answer.
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
        <div className="mt-[var(--spacing-ag-8)] flex flex-col flex-wrap gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
          <ButtonLink href={ROUTES.contact}>Book a call</ButtonLink>
          <ButtonLink href={ROUTES.contact} variant="secondary">
            Send an enquiry
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
