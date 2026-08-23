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
  /** `full` shows the roles beneath each label; `rule` is the divider variant. */
  readonly variant?: 'full' | 'rule';
  readonly className?: string;
}

export function RelayBand({ variant = 'full', className }: RelayBandProps) {
  const isRule = variant === 'rule';

  return (
    <div
      className={className}
      role="group"
      aria-label="How the three parties relate: the employer employs and manages the apprentice, ApprentiGate handles the process in between, and an approved training provider delivers the training."
    >
      <ol className="grid list-none grid-cols-1 gap-[var(--spacing-ag-6)] sm:grid-cols-3 sm:gap-[var(--spacing-ag-4)]">
        {NODES.map((node, index) => {
          const isCentre = index === 1;
          return (
            <li key={node.label} className="relative flex flex-col">
              {/* The rule. Hidden on the last node so the band ends cleanly,
                  and only drawn from small screens up where the layout is
                  horizontal. */}
              <div
                aria-hidden="true"
                className="mb-[var(--spacing-ag-4)] flex items-center"
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
      </ol>
    </div>
  );
}
