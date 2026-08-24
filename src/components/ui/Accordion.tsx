import type { ReactNode } from 'react';

/**
 * A disclosure list, built on native <details> and <summary>.
 *
 * Native rather than custom, deliberately. <details> is keyboard operable,
 * announced correctly by screen readers, and works with no JavaScript at all —
 * which matters on a fully static site read over a poor mobile connection. The
 * header menu needed a custom disclosure because it has focus-return and
 * breakpoint behaviour that <details> cannot express; this does not.
 *
 * Answers stay in the DOM while collapsed, so search engines and assistive
 * technology can reach them whether or not the disclosure is open.
 */

export interface AccordionItem {
  readonly question: string;
  readonly answer: ReactNode;
}

interface AccordionProps {
  readonly items: readonly AccordionItem[];
  readonly className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  return (
    <div
      className={['border-t border-[var(--color-ag-mist)]', className]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((item) => (
        <details
          key={item.question}
          className="group border-b border-[var(--color-ag-mist)]"
        >
          <summary
            className={[
              'flex cursor-pointer list-none items-start justify-between gap-[var(--spacing-ag-4)]',
              'py-[var(--spacing-ag-6)] text-[length:var(--text-ag-lg)] font-semibold',
              'text-[color:var(--color-ag-ink)]',
              // The default triangle marker is inconsistent between browsers and
              // cannot be styled; the chevron below replaces it.
              '[&::-webkit-details-marker]:hidden',
            ].join(' ')}
          >
            {item.question}
            <svg
              viewBox="0 0 20 20"
              className="mt-[6px] size-4 shrink-0 text-[color:var(--color-ag-signal)] transition-transform duration-[var(--duration-ag-standard)] ease-[var(--ease-ag-enter)] group-open:-rotate-180"
              aria-hidden="true"
            >
              <path
                d="M4 7l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>

          <div className="max-w-[62ch] pb-[var(--spacing-ag-6)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
