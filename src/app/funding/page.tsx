import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Section } from '@/components/ui/Section';
import { FUNDING_RULES_REVIEWED } from '@/lib/funding';
import { ROUTES } from '@/lib/navigation';

/**
 * Funding Explained — Content Spec 4.5.
 *
 * The most claim-dense page on the site, and the one the brief singles out as
 * not shipping on secondary sources. Every figure here traces to a GOV.UK
 * primary source recorded in CONTENT-SOURCES.md: S1 and S2 for the band
 * maximum, S3 for the age split, S4 and S13 for wages, S9 for the levy
 * threshold, S10 for the hiring payment, S11 for transfers, S12 for the fees
 * statement.
 *
 * Three deliberate omissions, each because the detail could not be traced or
 * would go stale faster than the review cycle:
 *
 *   - The hiring payment's instalment schedule. GOV.UK confirms it is "paid in
 *     instalments" and does not say how many or when. The Content Spec's "two
 *     instalments, first after 90 days" is therefore not claimed here.
 *   - The apprentice minimum wage figure, which is linked rather than printed.
 *     Rates change every April; a printed number is the likeliest thing on this
 *     page to go stale between quarterly reviews.
 *   - Which standards have had funding restricted. The Content Spec is explicit
 *     that listing them would go stale, so the page says eligibility changes and
 *     is checked per engagement.
 *
 * England only. Apprenticeship funding is devolved and the other nations differ.
 */

export const metadata: Metadata = {
  title: 'Funding explained',
  description:
    'How apprenticeship funding works in England for smaller employers: the two routes, funding band maximums, what government may cover, and what you always pay.',
};

const EMPLOYER_ALWAYS_PAYS = [
  {
    title: 'The wage',
    body: 'Apprentices are employees and are paid like employees. Apprenticeship funding cannot be used for wages.',
  },
  {
    title: 'Employer National Insurance and pension',
    body: 'The same employment costs that come with any other member of staff.',
  },
  {
    title: 'Equipment and the cost of your own time',
    body: 'Kit, workspace, and the management time to supervise someone who is learning.',
  },
  {
    title: 'Anything above the funding band maximum',
    body: 'If the price you agree with a provider is higher than the band maximum for that standard, the difference is yours.',
  },
];

export default function FundingExplained() {
  return (
    <>
      <Section
        eyebrow="Funding explained"
        heading="What government may pay for, and what you always will."
        headingLevel={1}
        width="narrow"
      >
        <p className="max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          Apprenticeship funding in England, in plain terms. It is not the whole rulebook
          — it is the part that decides what an apprentice actually costs you.
        </p>

        {/*
          The review date is visible and near the top, not in the footer. A
          reader deciding how much to trust a funding page needs to know how
          fresh it is before they read it, not after.
        */}
        <p className="mt-[var(--spacing-ag-6)] inline-flex flex-wrap items-baseline gap-[var(--spacing-ag-2)] rounded-[var(--radius-ag-lg)] bg-[var(--color-ag-mist)] px-[var(--spacing-ag-4)] py-[var(--spacing-ag-3)] font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.06em] text-[color:var(--color-ag-ink)] uppercase">
          Rules last reviewed:{' '}
          <time dateTime={FUNDING_RULES_REVIEWED.iso}>
            {FUNDING_RULES_REVIEWED.display}
          </time>
        </p>
      </Section>

      {/* --------------------------------------------------- The two routes */}
      <Section
        divided
        width="narrow"
        eyebrow="Where you sit"
        heading="There are two routes, and which one you are on depends on your pay bill"
      >
        <div className="flex flex-col gap-[var(--spacing-ag-6)]">
          <div className="rounded-[var(--radius-ag-lg)] border border-[var(--color-ag-mist)] p-[var(--spacing-ag-6)]">
            <h3 className="text-[length:var(--text-ag-xl)] font-semibold text-[color:var(--color-ag-ink)]">
              Annual pay bill under £3 million
            </h3>
            <p className="mt-[var(--spacing-ag-2)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
              You do not pay the apprenticeship levy. You share the cost of training with
              government, and this is where most smaller employers sit. Everything below
              is written for you.
            </p>
          </div>

          <div className="rounded-[var(--radius-ag-lg)] border border-[var(--color-ag-mist)] p-[var(--spacing-ag-6)]">
            <h3 className="text-[length:var(--text-ag-xl)] font-semibold text-[color:var(--color-ag-ink)]">
              Annual pay bill over £3 million
            </h3>
            <p className="mt-[var(--spacing-ag-2)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
              You pay the apprenticeship levy at 0.5% of your pay bill and draw training
              funds from a digital account.
            </p>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------- Funding band maximum */}
      <Section
        divided
        tone="mist"
        width="narrow"
        eyebrow="The thing to understand first"
        heading="A funding band maximum is a ceiling, not a payment."
      >
        <div className="flex flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            Every apprenticeship standard has a funding band maximum. It caps how much
            government will put towards the training and assessment for that standard. It
            is not a budget that gets handed over, and it is not a figure anyone receives.
          </p>
          <p>
            If the price you agree with a provider comes in{' '}
            <strong className="font-semibold text-[color:var(--color-ag-ink)]">
              under
            </strong>{' '}
            the band maximum, the difference is not paid out to anyone. If it comes in{' '}
            <strong className="font-semibold text-[color:var(--color-ag-ink)]">
              over
            </strong>
            , you pay the excess in full, on top of any share you already owe.
          </p>
          <p>
            Which is why the price agreed with the provider is worth attention, and why we
            look at it.
          </p>
        </div>
      </Section>

      {/* ------------------------------------------ What government may cover */}
      <Section
        divided
        width="narrow"
        eyebrow="If you do not pay the levy"
        heading="What government may cover"
      >
        <div className="flex flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            For apprenticeships starting from 1 August 2026, where you do not pay the levy
            and the apprentice is{' '}
            <strong className="font-semibold text-[color:var(--color-ag-ink)]">
              aged 16 to 24
            </strong>{' '}
            at the start of their training, government funds the eligible training and
            assessment in full, up to the funding band maximum. There is no contribution
            from you towards the training itself.
          </p>
          <p>
            Where the apprentice is{' '}
            <strong className="font-semibold text-[color:var(--color-ag-ink)]">
              25 or over
            </strong>{' '}
            at the start of training, government funds 95% of those costs up to the band
            maximum and you pay the remaining 5% directly to the training provider.
          </p>
          <p className="text-[length:var(--text-ag-sm)]">
            Eligibility also depends on the standard and on your circumstances, and some
            standards have had funding restricted. That changes, so it is checked for each
            engagement rather than assumed.
          </p>
        </div>
      </Section>

      {/* --------------------------------------- What the employer always pays */}
      <Section
        divided
        tone="mist"
        width="narrow"
        eyebrow="Always yours"
        heading="What you pay regardless"
      >
        <dl className="flex flex-col gap-[var(--spacing-ag-6)]">
          {EMPLOYER_ALWAYS_PAYS.map((item) => (
            <div key={item.title} className="flex flex-col gap-[var(--spacing-ag-1)]">
              <dt className="text-[length:var(--text-ag-base)] font-semibold text-[color:var(--color-ag-ink)]">
                {item.title}
              </dt>
              <dd className="m-0 max-w-[62ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
                {item.body}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-[var(--spacing-ag-8)] max-w-[62ch] text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-slate)]">
          On wages, one detail employers often miss: the apprentice minimum wage rate only
          applies while the apprentice is under 19, or in the first year of their
          apprenticeship. After that they move to the ordinary rate for their age, which
          changes what the role costs you in year two. Current rates are on{' '}
          <a
            href="https://www.gov.uk/national-minimum-wage-rates"
            className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
          >
            GOV.UK
          </a>
          .
        </p>
      </Section>

      {/* ------------------------------------------------- The hiring payment */}
      <Section
        divided
        width="narrow"
        eyebrow="From 1 October 2026"
        heading="A hiring payment of up to £2,000"
      >
        <div className="flex flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            Employers who do not pay the levy may receive a hiring payment of up to
            £2,000, paid in instalments, when they take on a new apprentice aged 16 to 24
            whose apprenticeship starts on or after 1 October 2026 and who has not been
            employed by them for more than 90 days before their training starts.
          </p>
          <Notice
            tone="info"
            title="Treat this as something to check, not something to count on."
          >
            It carries eligibility conditions that have to be met and confirmed. We would
            not build a business case on it before knowing it applies to you.
          </Notice>
        </div>
      </Section>

      {/* -------------------------------------------------- Levy transfer */}
      <Section
        divided
        tone="mist"
        width="narrow"
        eyebrow="Worth knowing"
        heading="Levy transfer"
      >
        <p className="max-w-[62ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          A levy-paying employer can transfer unused funds from their account to another
          employer to cover apprenticeship training, up to an annual maximum of half their
          funds — a route a lot of smaller employers do not know exists.
        </p>
      </Section>

      {/* ------------------------------------------------------- Our fees */}
      <Section
        divided
        width="narrow"
        eyebrow="Our fees"
        heading="Where we fit in all of this"
      >
        <div className="rounded-[var(--radius-ag-lg)] border-l-4 border-[var(--color-ag-signal)] bg-[var(--color-ag-mist)] p-[var(--spacing-ag-6)]">
          {/*
            Mandatory sentence, Content Spec 4.5, verbatim. The regulatory basis
            is CONTENT-SOURCES.md S12: the funding rules list lead generation and
            first contact activity among ineligible costs, so this work cannot be
            paid for out of apprenticeship funding by anyone.
          */}
          <p className="text-[length:var(--text-ag-lg)] font-semibold text-[color:var(--color-ag-ink)]">
            ApprentiGate&rsquo;s fees are commercial fees paid by you. They are separate
            from apprenticeship funding and are not paid from it.
          </p>
          <p className="mt-[var(--spacing-ag-3)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
            The funding rules list lead generation and first contact activity among the
            things apprenticeship funding cannot be spent on. So nobody — not you, not a
            provider — can put our work through apprenticeship money. Using us is not paid
            for by government.
          </p>
        </div>
      </Section>

      {/* ------------------------------------------------------- Closing */}
      <Section divided tone="mist" width="narrow" heading="These rules change.">
        <div className="flex flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          <p>
            The position above changed on 1 August 2026 and changes again on 1 October
            2026. This page carries the date it was last checked for that reason, and
            eligibility is confirmed for each employer rather than assumed from a page.
          </p>
          <p>
            <a
              href="https://www.gov.uk/employing-an-apprentice/get-funding"
              className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
            >
              GOV.UK is the authority on apprenticeship funding
            </a>
            , and where it disagrees with anything here, it is right and we will fix this
            page.
          </p>
          <p className="text-[length:var(--text-ag-sm)]">
            This covers England only. Apprenticeship funding is devolved, and Wales,
            Scotland and Northern Ireland run different systems.
          </p>
        </div>

        <div className="mt-[var(--spacing-ag-8)] flex flex-col gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
          <ButtonLink href={ROUTES.contact}>Ask us what applies to you</ButtonLink>
          <ButtonLink href={ROUTES.howItWorks} variant="secondary">
            See how it works
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
