import React from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "../../utils/cn"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  required?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      required,
      id,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
    const hintId = inputId ? `${inputId}-hint` : undefined
    const errorId = inputId ? `${inputId}-error` : undefined

    return (
      <div className="flex flex-col">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LeftIcon size={16} aria-hidden="true" />
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm",
              "placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none",
              LeftIcon && "pl-10",
              RightIcon && "pr-10",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500",
              disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",
              className
            )}
            {...props}
          />

          {RightIcon && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <RightIcon size={16} aria-hidden="true" />
            </span>
          )}
        </div>

        {error ? (
          <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1.5 text-sm text-gray-500">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = "Input"
export default Input
