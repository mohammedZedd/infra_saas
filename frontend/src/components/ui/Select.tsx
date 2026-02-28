import React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../utils/cn"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
  required?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options, placeholder, required, id, className, disabled, ...props },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
    const hintId = selectId ? `${selectId}-hint` : undefined
    const errorId = selectId ? `${selectId}-error` : undefined

    return (
      <div className="flex flex-col">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              "w-full appearance-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 shadow-sm",
              "transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500",
              disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",
              className
            )}
            {...props}
          >
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

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ChevronDown size={16} aria-hidden="true" />
          </span>
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

Select.displayName = "Select"
export default Select
