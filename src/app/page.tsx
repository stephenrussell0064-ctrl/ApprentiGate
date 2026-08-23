import { RelayBand } from '@/components/brand/RelayBand';
import { ButtonLink } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { ROUTES } from '@/lib/navigation';

/**
 * The hero, demonstrating the design system in place.
 *
 * All copy here is the approved Home hero from Content Spec 4.1, used verbatim.
 * Nothing on this page is invented and it makes no claim that would need a
 * source. The remaining Home sections are written at WP3.
 */
export default function Home() {
  return (
    <>
      <Section width="default">
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

      {/* The signature element, carrying the single most important correction
          the page has to make: ApprentiGate is neither the training provider
          nor the recruiter. */}
      <Section divided>
        <RelayBand />
      </Section>
    </>
  );
}
