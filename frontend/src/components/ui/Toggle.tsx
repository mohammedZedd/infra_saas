import { cn } from "../../utils/cn"

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  size?: "sm" | "md"
  id?: string
}

export function Toggle({ checked, onChange, label, description, disabled = false, size = "md", id }: ToggleProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
  const trackClass = size === "sm" ? "w-9 h-5" : "w-11 h-6"
  const thumbClass = size === "sm" ? "w-4 h-4" : "w-5 h-5"
  const onTranslate = size === "sm" ? "translate-x-4" : "translate-x-5.5"

  return (
    <label htmlFor={inputId} className={cn("flex items-start gap-3", disabled && "opacity-50 cursor-not-allowed")}> 
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />

      <span
        aria-hidden="true"
        className={cn("relative rounded-full transition-colors duration-200", trackClass, checked ? "bg-indigo-600" : "bg-gray-200")}
      >
        <span
          className={cn(
            "absolute left-0.5 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200",
            thumbClass,
            checked ? onTranslate : "translate-x-0"
          )}
        />
      </span>

      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {description && <span className="text-sm text-gray-500">{description}</span>}
        </span>
      )}
    </label>
  )
}

export default Toggle
