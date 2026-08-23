import type { ReactNode } from 'react';

/**
 * Notices — the error and empty states.
 *
 * `error` carries role="alert" so it is announced when it appears, which is
 * what the enquiry form's failure state needs (WP10): if submission fails, the
 * person must be told and given the email address, so an enquiry is never
 * silently lost.
 *
 * Meaning is never carried by colour alone: each tone has its own icon and its
 * own heading text.
 */

export type NoticeTone = 'error' | 'info' | 'empty';

const TONES: Record<NoticeTone, { border: string; accent: string; role?: 'alert' }> = {
  error: {
    border: 'border-[var(--color-ag-alert)]',
    accent: 'text-[color:var(--color-ag-alert)]',
    role: 'alert',
  },
  info: {
    border: 'border-[var(--color-ag-mist)]',
    accent: 'text-[color:var(--color-ag-signal)]',
  },
  empty: {
    border: 'border-[var(--color-ag-mist)] border-dashed',
    accent: 'text-[color:var(--color-ag-slate)]',
  },
};

function NoticeIcon({ tone }: { readonly tone: NoticeTone }) {
  if (tone === 'error') {
    return (
      <svg viewBox="0 0 20 20" className="size-5 shrink-0" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 5.5v5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="10" cy="14.5" r="1.2" fill="currentColor" />
      </svg>
    );
  }
  if (tone === 'info') {
    return (
      <svg viewBox="0 0 20 20" className="size-5 shrink-0" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M10 9v5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="5.8" r="1.2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0" aria-hidden="true">
      <rect
        x="2"
        y="4"
        width="16"
        height="12"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3 2.5"
      />
    </svg>
  );
}

interface NoticeProps {
  readonly tone?: NoticeTone;
  readonly title: string;
  readonly children?: ReactNode;
  readonly className?: string;
}

export function Notice({ tone = 'info', title, children, className }: NoticeProps) {
  const styles = TONES[tone];
  return (
    <div
      {...(styles.role ? { role: styles.role } : {})}
      className={[
        'flex gap-[var(--spacing-ag-3)] rounded-[var(--radius-ag-lg)] border',
        'bg-[var(--color-ag-paper)] p-[var(--spacing-ag-4)]',
        styles.border,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles.accent}>
        <NoticeIcon tone={tone} />
      </span>
      <div className="flex flex-col gap-[var(--spacing-ag-1)]">
        <p
          className={`text-[length:var(--text-ag-base)] font-semibold ${
            tone === 'error' ? styles.accent : 'text-[color:var(--color-ag-ink)]'
          }`}
        >
          {title}
        </p>
        {children && (
          <div className="text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-slate)]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
