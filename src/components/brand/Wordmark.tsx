/**
 * The ApprentiGate wordmark: the app mark followed by the name.
 *
 * The mark is a rounded square with a vertical slot offset from centre. That is
 * the one permitted use of the "gate" idea — it reads as a way through rather
 * than a barrier. The Content Spec allows the idea once, lightly, and bars
 * building the site around a gate metaphor or implying gatekeeping, so there is
 * no archway imagery anywhere in the system.
 *
 * Colour comes from `currentColor` and the signal token, never a literal.
 */

interface WordmarkProps {
  /** Rendered height of the mark in pixels. The name scales with it. */
  readonly size?: number;
  /** Set when the wordmark is decorative because an adjacent link names it. */
  readonly decorative?: boolean;
  readonly className?: string;
}

export function AppMark({
  size = 28,
  className,
}: {
  readonly size?: number;
  readonly className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="var(--color-ag-signal)" />
      {/* The slot: cut clean through the block and offset right of centre, so
          the mark reads as an opening rather than a barrier. Two inset bars
          were tried first and read as a pause button. */}
      <rect x="19" y="0" width="5" height="32" fill="var(--color-ag-paper)" />
    </svg>
  );
}

export function Wordmark({ size = 28, decorative = false, className }: WordmarkProps) {
  return (
    <span
      className={`inline-flex items-center gap-[var(--spacing-ag-3)] ${className ?? ''}`}
      {...(decorative ? { 'aria-hidden': true } : {})}
    >
      <AppMark size={size} />
      <span
        className="font-[family-name:var(--font-display)] font-semibold tracking-[-0.02em] text-[color:var(--color-ag-ink)]"
        style={{ fontSize: `${size * 0.68}px` }}
      >
        ApprentiGate
      </span>
    </span>
  );
}
