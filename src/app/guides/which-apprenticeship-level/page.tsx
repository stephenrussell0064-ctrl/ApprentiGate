import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ButtonLink } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Section } from '@/components/ui/Section';
import { ROUTES } from '@/lib/navigation';

/**
 * Guide: which apprenticeship level a role needs.
 *
 * The first guide, and the shape the rest should follow: answer the question an
 * employer actually asks, in the words they ask it, and correct the premise
 * where the premise is wrong. Competence is inferred from useful work, never
 * claimed — this page exists to demonstrate that we know this, without a
 * sentence anywhere saying so.
 *
 * The premise correction is the whole point. "Level 3 or Level 4?" sounds like
 * a dial to be set, and it is not one: the level is part of the standard's
 * name. The published standard is titled "Business administrator (level 3)".
 * Choose the occupation and the level arrives with it.
 *
 * Claims trace to CONTENT-SOURCES.md: the level equivalences to S15 (the GOV.UK
 * list of qualification levels) and the naming convention to S14 (Find
 * apprenticeship training). Both are watched by `pnpm check:sources`.
 *
 * It prints no duration, no funding band and no provider name, for the reason
 * the home page gives for the same restraint: those are per-course and
 * per-year, and a number frozen into a guide is stale and unverifiable at the
 * moment somebody reads it. The one standard named is named for its title, not
 * for its numbers.
 */

export const metadata: Metadata = pageMetadata({
  title: 'Which apprenticeship level do you need?',
  description:
    'Level 3 or Level 4 is not a choice you make — it comes with the standard. How to work out which occupational standard a role fits, and what follows.',
  path: ROUTES.guideLevels,
});

/** Straight from S15. Levels 2 to 6; the site does not work above Level 5. */
const LEVELS = [
  {
    level: 'Level 2',
    apprenticeship: 'Intermediate apprenticeship',
    equivalent: 'GCSE grades 4 to 9',
  },
  {
    level: 'Level 3',
    apprenticeship: 'Advanced apprenticeship',
    equivalent: 'A level, or a T Level',
  },
  {
    level: 'Level 4',
    apprenticeship: 'Higher apprenticeship',
    equivalent: 'Higher national certificate (HNC), certificate of higher education',
  },
  {
    level: 'Level 5',
    apprenticeship: 'Higher apprenticeship',
    equivalent: 'Foundation degree, higher national diploma (HND)',
  },
  {
    level: 'Level 6',
    apprenticeship: 'Degree apprenticeship',
    equivalent: 'Bachelor’s degree with honours',
  },
] as const;

export default function WhichLevelGuide() {
  return (
    <>
      <Section
        eyebrow="Guide"
        heading="Which level does your role need?"
        headingLevel={1}
      >
        <p className="max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          It is the question employers ask first, and it has an awkward answer: the level
          is not something you choose. It arrives attached to the standard you pick, and
          picking the standard is the decision that actually matters.
        </p>
      </Section>

      <Section
        divided
        tone="mist"
        eyebrow="The premise"
        heading="The level is in the name"
      >
        <div className="flex max-w-[62ch] flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            Every apprenticeship is built on an occupational standard, and every standard
            is published at a fixed level. That level is not a setting on the programme —
            it is part of the standard&rsquo;s identity, printed in its title. The
            standard for a business administrator is called, in full,{' '}
            <strong className="font-semibold text-[color:var(--color-ag-ink)]">
              Business administrator (level 3)
            </strong>
            .
          </p>
          <p>
            So there is no version of that occupation at Level 4 to move up to. If a role
            needs something beyond it, that is a different occupation with a different
            standard — not the same one turned up.
          </p>
          <p className="font-semibold text-[color:var(--color-ag-ink)]">
            Which means the useful question is not &ldquo;what level?&rdquo; It is
            &ldquo;which occupation is this job, actually?&rdquo;
          </p>
        </div>
      </Section>

      <Section
        divided
        eyebrow="For reference"
        heading="What the levels mean, if you need the map"
      >
        <p className="mb-[var(--spacing-ag-6)] max-w-[62ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          Worth knowing so you can read a standard&rsquo;s title, rather than for choosing
          between them.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[length:var(--text-ag-base)]">
            <caption className="sr-only">
              Apprenticeship levels in England and the qualifications they are equivalent
              to
            </caption>
            <thead>
              <tr className="border-b border-[var(--color-ag-slate)]">
                <th
                  scope="col"
                  className="py-[var(--spacing-ag-3)] pr-[var(--spacing-ag-4)] font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-ink)] uppercase"
                >
                  Level
                </th>
                <th
                  scope="col"
                  className="py-[var(--spacing-ag-3)] pr-[var(--spacing-ag-4)] font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-ink)] uppercase"
                >
                  Called
                </th>
                <th
                  scope="col"
                  className="py-[var(--spacing-ag-3)] font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-ink)] uppercase"
                >
                  Broadly equivalent to
                </th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((row) => (
                <tr key={row.level} className="border-b border-[var(--color-ag-mist)]">
                  <th
                    scope="row"
                    className="py-[var(--spacing-ag-3)] pr-[var(--spacing-ag-4)] align-top font-semibold whitespace-nowrap text-[color:var(--color-ag-ink)]"
                  >
                    {row.level}
                  </th>
                  <td className="py-[var(--spacing-ag-3)] pr-[var(--spacing-ag-4)] align-top text-[color:var(--color-ag-slate)]">
                    {row.apprenticeship}
                  </td>
                  <td className="py-[var(--spacing-ag-3)] align-top text-[color:var(--color-ag-slate)]">
                    {row.equivalent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-[var(--spacing-ag-6)] max-w-[62ch] text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-slate)]">
          Equivalences as published by GOV.UK. &ldquo;Broadly equivalent&rdquo; is doing
          real work in that heading: it describes the demand of the qualification, not an
          exchange rate. An advanced apprenticeship is not two A levels.
        </p>
      </Section>

      <Section
        divided
        eyebrow="The actual decision"
        heading="Match the work, not the job title"
      >
        <div className="flex max-w-[62ch] flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            A standard describes an occupation: the knowledge, skills and behaviours
            somebody needs to be competent in it. The apprentice is assessed against those
            at the end, not against your job description. So the test is whether the job
            you are offering will actually let someone develop and evidence them.
          </p>
          <p>Three questions that settle it faster than reading a catalogue:</p>
          <ul className="flex list-none flex-col gap-[var(--spacing-ag-3)] p-0">
            <li>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                What will they do in a normal week?
              </strong>{' '}
              Not the aspiration for year two — the work that exists now, that somebody
              would be doing on a Tuesday.
            </li>
            <li>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                How much of the standard does that cover?
              </strong>{' '}
              A role can look like a perfect fit and still never give someone the chance
              to do part of what the standard requires. That part still gets assessed.
            </li>
            <li>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                Who will supervise the learning?
              </strong>{' '}
              Somebody has to be close enough to the work to give them the harder tasks
              when they are ready.
            </li>
          </ul>
          <p>
            Where two adjacent standards could both plausibly fit, that is the one moment
            the level genuinely is a decision — and it is decided by which occupation the
            job is, not by which sounds more impressive.
          </p>
        </div>
      </Section>

      <Section
        divided
        tone="mist"
        eyebrow="What follows"
        heading="What the standard fixes"
      >
        <div className="flex max-w-[62ch] flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            Once the standard is settled, several things you might have expected to
            negotiate are already decided by it:
          </p>
          <ul className="flex list-none flex-col gap-[var(--spacing-ag-3)] p-0">
            <li>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                The funding band maximum
              </strong>{' '}
              — a ceiling on what government will put towards training and assessment for
              that standard. See{' '}
              <a
                href={ROUTES.funding}
                className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
              >
                how the funding works
              </a>
              .
            </li>
            <li>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                The minimum off-the-job training
              </strong>{' '}
              — published against the standard, and paid working time you have to release
              them for.
            </li>
            <li>
              <strong className="font-semibold text-[color:var(--color-ag-ink)]">
                Which providers can deliver it
              </strong>{' '}
              — providers are approved for particular standards, not in general.
            </li>
          </ul>
          <p>
            All of it is published, for every standard and every provider, and you can
            check any of it yourself.
          </p>
        </div>

        <div className="mt-[var(--spacing-ag-8)]">
          <Notice
            tone="info"
            title="This is general information, not advice on your role."
          >
            Which standard a particular job fits depends on the job. The rules also change
            — the funding position changed on 1 August 2026 and changes again on 1 October
            2026. Confirm the position before you commit to anything, and where GOV.UK
            disagrees with this page, GOV.UK is right.
          </Notice>
        </div>
      </Section>

      <Section divided width="narrow">
        <h2 className="max-w-[22ch] text-[length:var(--text-ag-2xl)] font-semibold text-balance text-[color:var(--color-ag-ink)] md:text-[length:var(--text-ag-3xl)]">
          Tell us the role and we will tell you the standard.
        </h2>
        <p className="mt-[var(--spacing-ag-4)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          Working out which standard a job actually fits is the first thing we do, and if
          an apprenticeship is not the right route for it, we will say so.
        </p>
        <div className="mt-[var(--spacing-ag-8)] flex flex-col flex-wrap gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
          <ButtonLink href={ROUTES.contact}>Book a call</ButtonLink>
          <ButtonLink href={ROUTES.howItWorks} variant="secondary">
            See the six steps
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
