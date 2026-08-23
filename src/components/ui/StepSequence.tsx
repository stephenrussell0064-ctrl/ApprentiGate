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
  /** What the employer has to do. Omit only where nothing is required. */
  readonly employerAction?: string;
}

interface StepSequenceProps {
  readonly steps: readonly Step[];
  readonly className?: string;
}

export function StepSequence({ steps, className }: StepSequenceProps) {
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

          <div className="flex flex-col gap-[var(--spacing-ag-2)] pb-[var(--spacing-ag-2)]">
            <h3 className="text-[length:var(--text-ag-xl)] font-semibold text-[color:var(--color-ag-ink)]">
              {step.title}
            </h3>
            <p className="max-w-[62ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
              {step.detail}
            </p>
            {step.employerAction && (
              <p className="max-w-[62ch] text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-slate)]">
                <span className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-ink)] uppercase">
                  You
                </span>{' '}
                {step.employerAction}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
