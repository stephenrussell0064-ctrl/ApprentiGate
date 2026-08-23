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

const BASE =
  'inline-flex items-center justify-center gap-[var(--spacing-ag-2)] rounded-[var(--radius-ag-lg)] ' +
  'font-semibold whitespace-nowrap ' +
  'transition-[opacity,background-color,border-color] duration-[var(--duration-ag-micro)] ' +
  'ease-[var(--ease-ag-enter)] ' +
  'disabled:cursor-not-allowed disabled:opacity-45';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-ag-signal)] text-[color:var(--color-ag-paper)] hover:not-disabled:opacity-90',
  secondary:
    'border border-[var(--color-ag-mist)] text-[color:var(--color-ag-ink)] ' +
    'hover:not-disabled:bg-[var(--color-ag-mist)]',
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
