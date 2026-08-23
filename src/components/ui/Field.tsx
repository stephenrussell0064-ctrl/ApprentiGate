import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

/**
 * Form controls.
 *
 * The accessibility rules these encode, so no individual form has to remember
 * them:
 *
 *   - Every control has a visible <label>, never a placeholder standing in for
 *     one. A placeholder disappears the moment someone types.
 *   - Helper text is persistent and sits below the label, wired through
 *     aria-describedby.
 *   - An error appears immediately below its own field, never only in a summary
 *     at the top, and is announced with role="alert".
 *   - aria-invalid is set alongside the visible error, so the state is not
 *     carried by colour alone.
 *   - Optional is marked rather than required, because on this site most fields
 *     are optional and marking the minority is quieter.
 *   - Inputs are at least 48px tall, above the 44px touch minimum.
 */

const CONTROL =
  'w-full min-h-[48px] rounded-[var(--radius-ag-lg)] border bg-[var(--color-ag-paper)] ' +
  'px-[var(--spacing-ag-4)] py-[var(--spacing-ag-3)] ' +
  'text-[length:var(--text-ag-base)] text-[color:var(--color-ag-ink)] ' +
  'transition-colors duration-[var(--duration-ag-micro)] ease-[var(--ease-ag-enter)] ' +
  'disabled:cursor-not-allowed disabled:opacity-45';

function controlClasses(hasError: boolean, className?: string) {
  return [
    CONTROL,
    hasError
      ? 'border-[var(--color-ag-alert)]'
      : 'border-[var(--color-ag-mist)] hover:border-[var(--color-ag-slate)]',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

interface FieldFrameProps {
  readonly id: string;
  readonly label: string;
  readonly optional?: boolean;
  readonly helper?: string;
  readonly error?: string;
  readonly children: ReactNode;
}

function FieldFrame({
  id,
  label,
  optional = false,
  helper,
  error,
  children,
}: FieldFrameProps) {
  return (
    <div className="flex flex-col gap-[var(--spacing-ag-2)]">
      <label
        htmlFor={id}
        className="text-[length:var(--text-ag-sm)] font-semibold text-[color:var(--color-ag-ink)]"
      >
        {label}
        {optional && (
          <span className="ml-[var(--spacing-ag-2)] font-normal text-[color:var(--color-ag-slate)]">
            Optional
          </span>
        )}
      </label>

      {helper && (
        <p
          id={`${id}-helper`}
          className="text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-slate)]"
        >
          {helper}
        </p>
      )}

      {children}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-[length:var(--text-ag-sm)] font-semibold text-[color:var(--color-ag-alert)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** Ties helper and error text to the control for screen readers. */
function describedBy(id: string, helper?: string, error?: string) {
  const ids = [helper ? `${id}-helper` : null, error ? `${id}-error` : null].filter(
    Boolean,
  );
  return ids.length > 0 ? ids.join(' ') : undefined;
}

interface SharedFieldProps {
  readonly id: string;
  readonly label: string;
  readonly optional?: boolean;
  readonly helper?: string;
  readonly error?: string;
}

export type TextFieldProps = SharedFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'aria-describedby' | 'aria-invalid'>;

export function TextField({
  id,
  label,
  optional,
  helper,
  error,
  className,
  ...rest
}: TextFieldProps) {
  const description = describedBy(id, helper, error);
  return (
    <FieldFrame
      id={id}
      label={label}
      {...(optional === undefined ? {} : { optional })}
      {...(helper === undefined ? {} : { helper })}
      {...(error === undefined ? {} : { error })}
    >
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        {...(description ? { 'aria-describedby': description } : {})}
        className={controlClasses(Boolean(error), className)}
        {...rest}
      />
    </FieldFrame>
  );
}

export type TextAreaFieldProps = SharedFieldProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'id' | 'aria-describedby' | 'aria-invalid'
  >;

export function TextAreaField({
  id,
  label,
  optional,
  helper,
  error,
  className,
  rows = 5,
  ...rest
}: TextAreaFieldProps) {
  const description = describedBy(id, helper, error);
  return (
    <FieldFrame
      id={id}
      label={label}
      {...(optional === undefined ? {} : { optional })}
      {...(helper === undefined ? {} : { helper })}
      {...(error === undefined ? {} : { error })}
    >
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        {...(description ? { 'aria-describedby': description } : {})}
        className={controlClasses(Boolean(error), className)}
        {...rest}
      />
    </FieldFrame>
  );
}

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export type SelectFieldProps = SharedFieldProps & {
  readonly options: readonly SelectOption[];
  /** First entry, selected by default. Submits as absent, never as a guess. */
  readonly placeholder?: string;
} & Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'id' | 'aria-describedby' | 'aria-invalid' | 'children'
  >;

export function SelectField({
  id,
  label,
  optional,
  helper,
  error,
  options,
  placeholder = 'Please choose',
  className,
  ...rest
}: SelectFieldProps) {
  const description = describedBy(id, helper, error);
  return (
    <FieldFrame
      id={id}
      label={label}
      {...(optional === undefined ? {} : { optional })}
      {...(helper === undefined ? {} : { helper })}
      {...(error === undefined ? {} : { error })}
    >
      <select
        id={id}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        {...(description ? { 'aria-describedby': description } : {})}
        className={controlClasses(Boolean(error), className)}
        {...rest}
      >
        {/* Empty value, so an untouched select submits as absent rather than
            silently defaulting to the first real option. */}
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}

export type CheckboxFieldProps = {
  readonly id: string;
  readonly label: ReactNode;
  readonly error?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type' | 'aria-describedby' | 'aria-invalid'
>;

/**
 * Never given a `checked` or `defaultChecked` default. The consent box must be
 * unticked until the person ticks it, and a default here would be the easiest
 * possible place to break that.
 */
export function CheckboxField({
  id,
  label,
  error,
  className,
  ...rest
}: CheckboxFieldProps) {
  return (
    <div className="flex flex-col gap-[var(--spacing-ag-2)]">
      <div className="flex items-start gap-[var(--spacing-ag-3)]">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          {...(error ? { 'aria-describedby': `${id}-error` } : {})}
          className={[
            'mt-[3px] size-[20px] shrink-0 rounded-[var(--radius-ag-sm)]',
            'accent-[var(--color-ag-signal)]',
            error ? 'outline-2 outline-[var(--color-ag-alert)]' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        <label
          htmlFor={id}
          className="text-[length:var(--text-ag-base)] text-[color:var(--color-ag-ink)]"
        >
          {label}
        </label>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-[length:var(--text-ag-sm)] font-semibold text-[color:var(--color-ag-alert)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
