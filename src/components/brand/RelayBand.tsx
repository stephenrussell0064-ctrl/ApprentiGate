/**
 * The relay band — the signature element.
 *
 * Three nodes on a rule: the employer, ApprentiGate, and the training provider.
 * The middle node is filled; the outer two are outlined.
 *
 * It is the signature element because it is also the most important piece of
 * information on the site. The Content Spec is explicit that a visitor's default
 * assumption will be that ApprentiGate is a training provider or a recruiter,
 * and that correcting it is the main job of the page. Making that correction
 * into the recurring visual device means every repetition reinforces the
 * proposition instead of decorating it.
 *
 * Drawn from tokens as SVG, so it adds no image weight.
 */

const NODES = [
  { label: 'Employer', role: 'Employs and manages the apprentice' },
  { label: 'ApprentiGate', role: 'Handles the process in between' },
  { label: 'Training provider', role: 'Delivers the training' },
] as const;

interface RelayBandProps {
  /**
   * `full`   — horizontal, roles beneath each label. Used mid-page.
   * `rule`   — compact horizontal divider. Used in the footer.
   * `stacked` — vertical, one card per party. Used in the hero, where it has a
   *             column to itself and has to hold its own against display type.
   */
  readonly variant?: 'full' | 'rule' | 'stacked';
  readonly className?: string;
}

export function RelayBand({ variant = 'full', className }: RelayBandProps) {
  const isRule = variant === 'rule';

  /**
   * The vertical arrangement. Same three parties, same emphasis on the middle
   * one — but as a column of surfaces rather than a line, because in the hero
   * it sits beside 72px type and a hairline rule would simply disappear next
   * to it.
   */
  if (variant === 'stacked') {
    return (
      <ol
        className={['flex list-none flex-col gap-[var(--spacing-ag-3)] p-0', className]
          .filter(Boolean)
          .join(' ')}
        aria-label="How the three parties relate: the employer employs and manages the apprentice, ApprentiGate handles the process in between, and an approved training provider delivers the training."
      >
        {NODES.map((node, index) => {
          const isCentre = index === 1;
          return (
            <li
              key={node.label}
              className={[
                'relative flex flex-col gap-[var(--spacing-ag-1)]',
                'rounded-[var(--radius-ag-lg)] border p-[var(--spacing-ag-6)]',
                'transition-[transform,box-shadow] duration-[var(--duration-ag-standard)] ease-[var(--ease-ag-enter)]',
                isCentre
                  ? 'border-[var(--color-ag-signal)] bg-[var(--color-ag-paper)] shadow-[var(--shadow-ag-lifted)] lg:-translate-x-[var(--spacing-ag-2)]'
                  : 'border-[var(--color-ag-mist)] bg-[var(--color-ag-paper)] shadow-[var(--shadow-ag-raised)]',
              ].join(' ')}
            >
              <span
                className={[
                  'font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] uppercase',
                  isCentre
                    ? 'text-[color:var(--color-ag-signal)]'
                    : 'text-[color:var(--color-ag-slate)]',
                ].join(' ')}
              >
                {node.label}
              </span>
              <span className="text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
                {node.role}
              </span>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div
      className={className}
      role="group"
      /*
       * The compact variant recurs in the footer on every page, so it gets a
       * short label. Repeating the full sentence there would make a screen
       * reader recite the whole three-party explanation again at the foot of
       * every page, which is noise rather than information.
       */
      aria-label={
        isRule
          ? 'The three parties: employer, ApprentiGate, training provider.'
          : 'How the three parties relate: the employer employs and manages the apprentice, ApprentiGate handles the process in between, and an approved training provider delivers the training.'
      }
    >
      {/*
        A <ul>, not an <ol>. These are three parties holding roles at the same
        time, not three steps in a sequence — an ordered list would announce
        them to a screen reader as "1, 2, 3", which describes a progression the
        reader then has to unlearn. Left-to-right position carries the meaning
        visually and the group's label carries it in text.
      */}
      <ul
        className={`grid list-none grid-cols-1 sm:grid-cols-3 sm:gap-[var(--spacing-ag-4)] ${
          // The compact variant is tighter, so it reads as a closing rule
          // rather than as a second copy of the diagram above it.
          isRule ? 'gap-[var(--spacing-ag-3)]' : 'gap-[var(--spacing-ag-6)]'
        }`}
      >
        {NODES.map((node, index) => {
          const isCentre = index === 1;
          return (
            <li key={node.label} className="relative flex flex-col">
              {/* The rule. Hidden on the last node so the band ends cleanly,
                  and only drawn from small screens up where the layout is
                  horizontal. */}
              <div
                aria-hidden="true"
                className={`flex items-center ${
                  isRule ? 'mb-[var(--spacing-ag-2)]' : 'mb-[var(--spacing-ag-4)]'
                }`}
              >
                <span
                  className={
                    isCentre
                      ? 'size-[10px] shrink-0 rounded-full bg-[var(--color-ag-signal)]'
                      : 'size-[10px] shrink-0 rounded-full border-2 border-[var(--color-ag-slate)] bg-[var(--color-ag-paper)]'
                  }
                />
                {index < NODES.length - 1 && (
                  <span className="hidden h-px flex-1 bg-[var(--color-ag-mist)] sm:block" />
                )}
              </div>

              <span
                className={`font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] uppercase ${
                  isCentre
                    ? 'text-[color:var(--color-ag-signal)]'
                    : 'text-[color:var(--color-ag-slate)]'
                }`}
              >
                {node.label}
              </span>

              {!isRule && (
                <span className="mt-[var(--spacing-ag-1)] text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-slate)]">
                  {node.role}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
