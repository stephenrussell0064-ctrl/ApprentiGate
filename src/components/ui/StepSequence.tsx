/**
 * The step sequence, for How It Works (WP4).
 *
 * An ordered list, because the order carries meaning: the funding position is
 * explained before providers are compared, and the employer chooses the
 * provider before setup is coordinated. Marked up as <ol> so that is true for
 * screen readers as well as visually — numbered markers that are only
 * decoration would be worse than none.
 *
 * Each step carries what happens and, separately, what is required from the
 * employer. That second column is the honest part: it stops the sequence
 * reading as though the service does everything.
 */

export interface Step {
  readonly title: string;
  /** What ApprentiGate does at this step. */
  readonly detail: string;
  /**
   * Items the detail introduces, rendered as a list.
   *
   * Added for the provider-comparison step, whose detail had grown to name
   * every published measure a shortlist is built from. As one sentence-chain
   * that ran to sixteen unbroken lines at 320px — correct, and unreadable on a
   * phone. The content was a list; it now looks like one.
   *
   * A real <ul>, so a screen reader announces the count and lets the user step
   * through the items, rather than reading one long run-on sentence.
   *
   * Use only where the items are genuinely parallel. A step whose detail is
   * prose should stay prose — bullets that carry no list structure make text
   * harder to read, not easier.
   */
  readonly points?: readonly string[];
  /** What the employer has to do. Omit only where nothing is required. */
  readonly employerAction?: string;
}

interface StepSequenceProps {
  readonly steps: readonly Step[];
  /**
   * Heading level for the step titles. Must follow whatever heading precedes
   * the sequence: `2` when the steps sit directly under the page's h1, `3` when
   * they sit under a section heading. Getting this wrong skips a level, which
   * breaks heading-order navigation for screen reader users.
   */
  readonly headingLevel?: 2 | 3;
  readonly className?: string;
}

export function StepSequence({ steps, headingLevel = 3, className }: StepSequenceProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3';

  return (
    <ol
      className={['flex list-none flex-col gap-[var(--spacing-ag-8)] p-0', className]
        .filter(Boolean)
        .join(' ')}
    >
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="grid grid-cols-[auto_1fr] gap-x-[var(--spacing-ag-4)] gap-y-[var(--spacing-ag-2)]"
        >
          {/* The rail: number plus a connecting line, so the sequence reads as
              a progression rather than as a stack of separate cards. */}
          <div
            aria-hidden="true"
            className="flex flex-col items-center gap-[var(--spacing-ag-2)]"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-ag-mist)] font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] font-medium text-[color:var(--color-ag-signal)]">
              {index + 1}
            </span>
            {index < steps.length - 1 && (
              <span className="w-px flex-1 bg-[var(--color-ag-mist)]" />
            )}
          </div>

          {/*
            Stacked on a phone, side by side from `lg`.

            Prose wants a 62ch measure and will not use more, so on a wide
            display a single column leaves half the page empty and the sequence
            reads as an unfinished draft. Setting the title against the detail
            spends that width on structure instead: the titles form a scannable
            column of their own, which is how someone deciding whether this
            process suits them actually reads it.
          */}
          <div className="grid gap-x-[var(--spacing-ag-8)] gap-y-[var(--spacing-ag-2)] pb-[var(--spacing-ag-2)] lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
            <Heading className="text-[length:var(--text-ag-xl)] font-semibold text-balance text-[color:var(--color-ag-ink)]">
              {step.title}
            </Heading>
            <div className="flex flex-col gap-[var(--spacing-ag-2)]">
              <p className="max-w-[62ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
                {step.detail}
              </p>
              {step.points && (
                <ul className="mt-[var(--spacing-ag-1)] flex max-w-[62ch] list-none flex-col gap-[var(--spacing-ag-2)] p-0">
                  {step.points.map((point) => (
                    <li
                      key={point}
                      className="border-l-2 border-[color:var(--color-ag-mist)] pl-[var(--spacing-ag-4)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              )}
              {step.employerAction && (
                <p className="max-w-[62ch] text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-slate)]">
                  <span className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-ink)] uppercase">
                    You
                  </span>{' '}
                  {step.employerAction}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
