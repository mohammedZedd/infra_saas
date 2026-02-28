import { useRef, useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { cn } from "../../utils/cn"

export interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  label?: string
  error?: string
  placeholder?: string
  maxTags?: number
  disabled?: boolean
  className?: string
}

export function TagsInput({ value, onChange, label, error, placeholder = "Add tag...", maxTags, disabled, className }: TagsInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase()
    if (!tag || value.includes(tag)) return
    if (maxTags !== undefined && value.length >= maxTags) return
    onChange([...value, tag])
    setInputValue("")
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const atLimit = maxTags !== undefined && value.length >= maxTags

  return (
    <div className={cn("flex flex-col", className)}>
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>}

      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex min-h-[2.75rem] flex-wrap gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm",
          "focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500",
          disabled && "cursor-not-allowed bg-gray-50",
          error && "border-red-300 focus-within:border-red-500 focus-within:ring-red-500"
        )}
      >
        {value.map((tag, i) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-sm text-indigo-700">
            {tag}
            {!disabled && (
              <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(i) }} className="text-indigo-400 hover:text-indigo-600">
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </span>
        ))}

        {!disabled && !atLimit && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            placeholder={value.length === 0 ? placeholder : ""}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (inputValue) addTag(inputValue) }}
            className="min-w-[8rem] flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        )}
      </div>

      {error ? <p className="mt-1.5 text-sm text-red-600">{error}</p> : maxTags !== undefined && <p className="mt-1.5 text-sm text-gray-500">{value.length}/{maxTags} tags</p>}
    </div>
  )
}

export default TagsInput
