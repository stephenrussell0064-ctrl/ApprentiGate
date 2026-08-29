/**
 * The ApprentiGate wordmark: the app mark followed by the name.
 *
 * The mark is the supplied brand logo — an ink disc carrying a white arch with
 * an amber chevron rising through it.
 *
 * This replaces a green rounded square with an offset slot. That earlier mark
 * existed because the Content Spec barred archway imagery, on the reasoning
 * that an arch reads as a gate and a gate implies gatekeeping. The owner has
 * since supplied an actual brand logo, and a real identity outranks a design
 * guideline written before one existed. The reasoning is recorded here rather
 * than deleted, because the constraint it came from still governs the *copy*:
 * nothing on the site describes ApprentiGate as controlling access to
 * apprenticeships, and the chevron is deliberately drawn passing up and out
 * through the arch rather than being contained by it.
 *
 * Colours are tokens, never literals — `pnpm guard:tokens` enforces that.
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
      <circle cx="16" cy="16" r="16" fill="var(--color-ag-ink)" />
      {/* The arch: two legs and a half-round head, drawn as a stroke so the
          disc shows through it. Round caps stop the legs ending in hard
          rectangles at the foot of the mark, which at 20px reads as ragged. */}
      <path
        d="M10.4 24.6V14.4a5.6 5.6 0 0 1 11.2 0v10.2"
        fill="none"
        stroke="var(--color-ag-paper)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* The chevron, rising through the arch rather than sitting under it. */}
      <path
        d="M12.5 19.4 16 15.9l3.5 3.5"
        fill="none"
        stroke="var(--color-ag-brand-accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      {/* Two weights, one word. The supplied logo sets "Apprenti" lighter than
          "Gate"; the spans are adjacent with no whitespace between them, so the
          accessible name and `textContent` are still exactly "ApprentiGate". */}
      <span
        className="font-[family-name:var(--font-display)] tracking-[-0.02em] text-[color:var(--color-ag-ink)]"
        style={{ fontSize: `${size * 0.68}px` }}
      >
        <span className="font-normal">Apprenti</span>
        <span className="font-bold">Gate</span>
      </span>
    </span>
  );
}
