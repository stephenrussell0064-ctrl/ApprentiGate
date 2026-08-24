import type { ReactNode } from 'react';
import { Section } from '@/components/ui/Section';
import { POLICY_UPDATED } from '@/lib/legal';

/**
 * Shell for the four compliance pages.
 *
 * They share a shape — a title, a last-reviewed date, and long-form prose at a
 * readable measure — so they share a component rather than four near-identical
 * layouts that slowly diverge.
 *
 * The date is shown at the top rather than the bottom. On a policy page the
 * reader's first question is how current it is, and burying that at the foot of
 * two thousand words answers it after they have already decided.
 */

interface LegalPageProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly children: ReactNode;
}

export function LegalPage({ eyebrow, title, intro, children }: LegalPageProps) {
  return (
    <Section eyebrow={eyebrow} heading={title} headingLevel={1} width="narrow">
      <p className="max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
        {intro}
      </p>

      <p className="mt-[var(--spacing-ag-6)] inline-flex flex-wrap items-baseline gap-[var(--spacing-ag-2)] rounded-[var(--radius-ag-lg)] bg-[var(--color-ag-mist)] px-[var(--spacing-ag-4)] py-[var(--spacing-ag-3)] font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.06em] text-[color:var(--color-ag-ink)] uppercase">
        Last reviewed: <time dateTime={POLICY_UPDATED.iso}>{POLICY_UPDATED.display}</time>
      </p>

      <div className="mt-[var(--spacing-ag-12)] flex flex-col gap-[var(--spacing-ag-12)]">
        {children}
      </div>
    </Section>
  );
}

interface LegalSectionProps {
  readonly heading: string;
  readonly children: ReactNode;
}

export function LegalSection({ heading, children }: LegalSectionProps) {
  return (
    <section className="flex flex-col gap-[var(--spacing-ag-4)]">
      <h2 className="text-[length:var(--text-ag-xl)] font-semibold text-[color:var(--color-ag-ink)] md:text-[length:var(--text-ag-2xl)]">
        {heading}
      </h2>
      <div className="flex max-w-[62ch] flex-col gap-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
        {children}
      </div>
    </section>
  );
}

/** A plain bulleted list at the same measure as the surrounding prose. */
export function LegalList({ items }: { readonly items: readonly ReactNode[] }) {
  return (
    <ul className="flex list-none flex-col gap-[var(--spacing-ag-3)] p-0">
      {items.map((item, index) => (
        <li
          // These are static, ordered content lines; there is no id to key on.
          key={index}
          className="flex gap-[var(--spacing-ag-3)]"
        >
          <span
            aria-hidden="true"
            className="mt-[10px] size-[5px] shrink-0 rounded-full bg-[var(--color-ag-signal)]"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
