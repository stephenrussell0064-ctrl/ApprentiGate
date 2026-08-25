import type { ReactNode } from 'react';

/**
 * A content card. Deliberately flat — a hairline border rather than a shadow,
 * because the direction is whitespace-led and stacked shadows are the fastest
 * route from "operations tooling" to "generic B2B template".
 */

interface CardProps {
  readonly children?: ReactNode;
  readonly title?: string;
  /** Monospace label above the title, for a step number or a category. */
  readonly label?: string;
  readonly className?: string;
}

export function Card({ children, title, label, className }: CardProps) {
  return (
    <div
      className={[
        'flex flex-col gap-[var(--spacing-ag-3)] rounded-[var(--radius-ag-lg)]',
        'border border-[var(--color-ag-mist)] bg-[var(--color-ag-paper)]',
        'p-[var(--spacing-ag-6)]',
        // A card that responds to the cursor reads as built rather than drawn.
        // Two pixels and a softer shadow; anything more becomes a toy.
        'transition-[transform,box-shadow,border-color]',
        'duration-[var(--duration-ag-standard)] ease-[var(--ease-ag-enter)]',
        'hover:-translate-y-0.5 hover:border-[var(--color-ag-slate)]',
        'hover:shadow-[var(--shadow-ag-lifted)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label && (
        <p className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-slate)] uppercase">
          {label}
        </p>
      )}
      {title && (
        <h3 className="text-[length:var(--text-ag-xl)] font-semibold text-[color:var(--color-ag-ink)]">
          {title}
        </h3>
      )}
      {children && (
        <div className="text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          {children}
        </div>
      )}
    </div>
  );
}

interface CardGridProps {
  readonly children: ReactNode;
  /** Columns at the widest breakpoint. */
  readonly columns?: 2 | 3;
}

export function CardGrid({ children, columns = 3 }: CardGridProps) {
  return (
    <div
      className={`grid gap-[var(--spacing-ag-4)] sm:grid-cols-2 ${
        columns === 3 ? 'lg:grid-cols-3' : ''
      }`}
    >
      {children}
    </div>
  );
}
