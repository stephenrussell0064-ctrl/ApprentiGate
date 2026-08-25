import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Buttons and button-shaped links.
 *
 * Two components rather than one polymorphic one: a link navigates and a button
 * acts, they take different attributes, and collapsing them into a single `as`
 * prop makes it easy to ship an anchor with no href or a button that navigates.
 *
 * Sizing: every variant clears a 48px target, above the 44px minimum, because
 * the primary audience is reading this on a phone.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';
export type ButtonSize = 'md' | 'lg';

/**
 * `active:translate-y-px` is the whole trick behind a button feeling physical:
 * one pixel of travel on press, fast enough to read as contact rather than as
 * animation. Transform and colour only — never width or height, which would
 * force layout on every hover.
 *
 * Labels wrap. They used to be `whitespace-nowrap`, which looks tidier right up
 * until a real label is longer than a phone is wide: nowrap makes the button's
 * min-content its full single-line width, and that minimum propagates up
 * through any grid or flex ancestor and blows out the layout. "Explore
 * apprenticeships for your business" is 41 characters and did exactly that at
 * 375px. `text-balance` keeps the wrap from stranding one word on a line.
 */
const BASE =
  'inline-flex items-center justify-center gap-[var(--spacing-ag-2)] rounded-[var(--radius-ag-lg)] ' +
  'font-semibold text-center text-balance select-none ' +
  'transition-[opacity,background-color,border-color,box-shadow,transform] ' +
  'duration-[var(--duration-ag-micro)] ease-[var(--ease-ag-enter)] ' +
  'active:not-disabled:translate-y-px ' +
  'disabled:cursor-not-allowed disabled:opacity-45';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-ag-signal)] text-[color:var(--color-ag-paper)] ' +
    'shadow-[var(--shadow-ag-raised)] ' +
    'hover:not-disabled:opacity-92 hover:not-disabled:shadow-[var(--shadow-ag-lifted)]',
  secondary:
    'border border-[var(--color-ag-mist)] text-[color:var(--color-ag-ink)] ' +
    'hover:not-disabled:border-[var(--color-ag-slate)] hover:not-disabled:bg-[var(--color-ag-mist)]',
  quiet:
    'text-[color:var(--color-ag-signal)] underline underline-offset-4 ' +
    'hover:not-disabled:opacity-80',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'min-h-[48px] px-[var(--spacing-ag-6)] text-[length:var(--text-ag-base)]',
  lg: 'min-h-[56px] px-[var(--spacing-ag-8)] text-[length:var(--text-ag-lg)]',
};

function classesFor(variant: ButtonVariant, size: ButtonSize, className?: string) {
  // `quiet` is a text link; the button padding would give it a misleading
  // hit area that extends well past the visible text.
  const sizing = variant === 'quiet' ? 'min-h-[48px]' : SIZES[size];
  return [BASE, VARIANTS[variant], sizing, className].filter(Boolean).join(' ');
}

interface ButtonOwnProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly children: ReactNode;
}

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={classesFor(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export type ButtonLinkProps = ButtonOwnProps & {
  readonly href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'>;

/**
 * A plain anchor, deliberately not next/link. The site is a fully static export
 * with no shared client state, so the client router earns nothing here, and
 * Link's prefetching fires a request for every linked route on page load —
 * which 404s for any route a later work package has not built yet.
 */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  href,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a href={href} className={classesFor(variant, size, className)} {...rest}>
      {children}
    </a>
  );
}
