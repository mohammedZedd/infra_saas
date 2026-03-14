import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Option definitions rendered as <option> elements */
  options: SelectOption[];
  label?: string;
  /** Helper text shown below the select when there is no error */
  helperText?: string;
  /** @deprecated use helperText */
  hint?: string;
  /** Error message — shows red border + message when truthy */
  error?: string | null;
  /** First disabled option shown as prompt text (value="") */
  placeholder?: string;
  /** Node rendered inside the select on the left */
  leftIcon?: React.ReactNode;
  /** className forwarded to the outer wrapper div */
  containerClassName?: string;
  /** className forwarded directly to the <select> element */
  selectClassName?: string;
}

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

/**
 * Styled native <select> with label, helper text, error, placeholder, and icon support.
 *
 * @example
 * <Select
 *   label="Region"
 *   placeholder="Choose a region…"
 *   options={regions}
 *   value={region}
 *   onChange={(e) => setRegion(e.target.value)}
 *   error={errors.region}
 * />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      helperText,
      hint,
      error,
      placeholder,
      leftIcon,
      containerClassName,
      selectClassName,
      // native props
      id,
      disabled,
      required,
      className, // maps to containerClassName if caller passes top-level className
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const resolvedHelper = helperText ?? hint;
    const hasError = !!error;

    return (
      <div className={cn("w-full space-y-1.5", containerClassName ?? className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Select wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400"
            >
              {leftIcon}
            </span>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : resolvedHelper ? helperId : undefined
            }
            className={cn(
              // Base
              "w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-gray-900 outline-none transition",
              // Normal
              "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              // Error
              hasError && "border-red-300 focus:ring-red-500 focus:border-transparent",
              // Disabled
              disabled && "bg-gray-50 text-gray-500 cursor-not-allowed opacity-80",
              // Left icon padding
              leftIcon && "pl-10",
              selectClassName
            )}
            {...rest}
          >
            {/* Placeholder option */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Right chevron */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400"
          >
            <ChevronDown size={16} />
          </span>
        </div>

        {/* Error message */}
        {hasError && (
          <p id={errorId} role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Helper text (only when no error) */}
        {!hasError && resolvedHelper && (
          <p id={helperId} className="text-xs text-gray-500">
            {resolvedHelper}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
