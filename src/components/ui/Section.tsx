import type { ReactNode } from 'react';

/**
 * Section wrapper. Owns the page's vertical rhythm and horizontal measure so
 * that individual pages never set their own padding, which is how spacing
 * scales drift apart across a site.
 */

export type SectionTone = 'paper' | 'mist';
export type SectionWidth = 'default' | 'narrow';

interface SectionProps {
  readonly children: ReactNode;
  /** Small monospace label above the heading. Encodes what the section is. */
  readonly eyebrow?: string;
  readonly heading?: string;
  /** Heading level. `h1` only on a page's opening section. */
  readonly headingLevel?: 1 | 2 | 3;
  readonly tone?: SectionTone;
  /** `narrow` caps the measure for long-form prose such as the funding page. */
  readonly width?: SectionWidth;
  /** Draws a hairline above the section. */
  readonly divided?: boolean;
  readonly id?: string;
  readonly className?: string;
}

const TONES: Record<SectionTone, string> = {
  paper: 'bg-[var(--color-ag-paper)]',
  mist: 'bg-[var(--color-ag-mist)]',
};

/**
 * `narrow` constrains the measure of the content, it does not centre a narrower
 * container. Centring one would pull the section's left edge inward and break
 * the shared left margin that every other section sits on, giving the page a
 * ragged edge as it scrolls.
 */
const CONTENT_WIDTHS: Record<SectionWidth, string> = {
  default: '',
  narrow: 'max-w-3xl',
};

export function Section({
  children,
  eyebrow,
  heading,
  headingLevel = 2,
  tone = 'paper',
  width = 'default',
  divided = false,
  id,
  className,
}: SectionProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3';

  return (
    <section
      {...(id ? { id } : {})}
      className={[
        TONES[tone],
        divided ? 'border-t border-[var(--color-ag-mist)]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mx-auto max-w-6xl px-[var(--spacing-ag-6)] py-[var(--spacing-ag-16)] md:py-[var(--spacing-ag-24)]">
        <div className={CONTENT_WIDTHS[width]}>
          {(eyebrow ?? heading) && (
            <div className="mb-[var(--spacing-ag-8)] flex flex-col gap-[var(--spacing-ag-3)]">
              {eyebrow && (
                <p className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-slate)] uppercase">
                  {eyebrow}
                </p>
              )}
              {heading && (
                <Heading
                  className={[
                    'max-w-[24ch] font-semibold text-balance break-words text-[color:var(--color-ag-ink)]',
                    /*
                     * A page's own title carries display treatment; a section
                     * heading within that page does not. The gap between the
                     * two is what tells a reader where they are, and setting
                     * both at the same size is the single fastest way to make
                     * a site read as a flat pile of pages.
                     */
                    headingLevel === 1
                      ? 'text-[length:var(--text-ag-title)] leading-[var(--leading-ag-display)] tracking-[var(--tracking-ag-display)]'
                      : 'text-[length:var(--text-ag-2xl)] md:text-[length:var(--text-ag-3xl)]',
                  ].join(' ')}
                >
                  {heading}
                </Heading>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
