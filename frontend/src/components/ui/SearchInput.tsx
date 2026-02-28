import { Search, X } from "lucide-react"
import { cn } from "../../utils/cn"

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
}

export function SearchInput({ value, onChange, placeholder = "Search...", className, disabled, label = "Search" }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={16} aria-hidden="true" />
      </span>

      <input
        type="search"
        aria-label={label}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pl-10 pr-10 text-sm text-gray-900 shadow-sm",
          "placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none",
          disabled && "bg-gray-50 text-gray-500 cursor-not-allowed"
        )}
      />

      {value && !disabled && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default SearchInput
