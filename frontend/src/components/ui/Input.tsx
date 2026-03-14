import { forwardRef, useId } from "react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Helper text shown below the input when there is no error */
  helperText?: string;
  /** @deprecated use helperText */
  hint?: string;
  /** Error message — shows red border + message when truthy */
  error?: string | null;
  /** Node rendered inside the input on the left (e.g. a Lucide icon element) */
  leftIcon?: React.ReactNode;
  /** Node rendered inside the input on the right */
  rightIcon?: React.ReactNode;
  /** className forwarded to the outer wrapper div */
  containerClassName?: string;
  /** className forwarded directly to the <input> element */
  inputClassName?: string;
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

/**
 * Controlled/uncontrolled text input with label, helper text, error, and icon support.
 *
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   leftIcon={<Mail size={16} />}
 *   error={errors.email}
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      hint,
      error,
      leftIcon,
      rightIcon,
      containerClassName,
      inputClassName,
      // native props
      id,
      disabled,
      required,
      className, // maps to containerClassName if user passes className at top level
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const resolvedHelper = helperText ?? hint;
    const hasError = !!error;

    return (
      <div className={cn("w-full space-y-1.5", containerClassName ?? className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
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

        {/* Input wrapper (positions icons) */}
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

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? errorId
                : resolvedHelper
                  ? helperId
                  : undefined
            }
            className={cn(
              // Base
              "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition",
              "placeholder:text-gray-400",
              // Normal
              "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              // Error
              hasError && "border-red-300 focus:ring-red-500 focus:border-transparent",
              // Disabled
              disabled && "bg-gray-50 text-gray-500 cursor-not-allowed opacity-80",
              // Icon padding
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              inputClassName
            )}
            {...rest}
          />

          {/* Right icon */}
          {rightIcon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              {rightIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p id={errorId} role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Helper text (only shown when no error) */}
        {!hasError && resolvedHelper && (
          <p id={helperId} className="text-xs text-gray-500">
            {resolvedHelper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
