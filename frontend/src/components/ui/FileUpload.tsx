import { useCallback, useRef, useState } from "react"
import { CloudUpload, FileText, X } from "lucide-react"
import { cn } from "../../utils/cn"
import { formatBytes } from "../../utils/format"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FileUploadProps {
  /** Controlled list of selected files */
  value: File[]
  onChange: (files: File[]) => void
  /** e.g. ".png,.jpg,image/*" */
  accept?: string
  /** Allow more than one file. Default false. */
  multiple?: boolean
  /** Max number of files (only relevant when multiple=true). Default 1. */
  maxFiles?: number
  /** Per-file size limit in bytes. Default 10 MB. */
  maxSizeBytes?: number
  disabled?: boolean
  /** Label rendered above the dropzone */
  label?: string
  /** Helper text inside the dropzone (accepts/limits reminder) */
  helperText?: string
  /** External validation error (takes priority over internal errors) */
  error?: string | null
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse an `accept` string (e.g. "image/*,.pdf") into a list of tokens
 * for quick membership checks.
 */
function parseAccept(accept: string): string[] {
  return accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Returns true if the file is allowed by the accept string.
 * Handles exact mime types ("image/png"), wildcard mime types ("image/*"),
 * and extensions (".tf").
 */
function fileMatchesAccept(file: File, tokens: string[]): boolean {
  if (tokens.length === 0) return true
  const ext = "." + file.name.split(".").pop()!.toLowerCase()
  const mime = file.type.toLowerCase()
  const mimeBase = mime.split("/")[0] ?? ""
  return tokens.some((token) => {
    if (token === ext) return true                        // ".tf"
    if (token === mime) return true                       // "image/png"
    if (token.endsWith("/*") && token.startsWith(mimeBase + "/")) return true // "image/*"
    return false
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FileUpload({
  value,
  onChange,
  accept,
  multiple = false,
  maxFiles,
  maxSizeBytes = 10 * 1024 * 1024,
  disabled = false,
  label,
  helperText,
  error,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  // Use a counter instead of boolean to handle nested dragEnter/Leave pairs.
  const dragCounterRef = useRef(0)
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const limit = multiple ? (maxFiles ?? Infinity) : 1
  const acceptTokens = accept ? parseAccept(accept) : []

  /** Validate + deduplicate against current value, then call onChange. */
  const processFiles = useCallback(
    (incoming: File[]) => {
      const errors: string[] = []

      // Type check
      if (acceptTokens.length > 0) {
        const rejected = incoming.filter((f) => !fileMatchesAccept(f, acceptTokens))
        if (rejected.length > 0) {
          errors.push(
            `${rejected.map((f) => f.name).join(", ")} — unsupported file type`,
          )
        }
      }

      // Size check
      const oversized = incoming.filter((f) => f.size > maxSizeBytes)
      if (oversized.length > 0) {
        errors.push(
          `${oversized.map((f) => f.name).join(", ")} exceed the ${formatBytes(maxSizeBytes)} limit`,
        )
      }

      // Keep only valid files
      const valid = incoming.filter(
        (f) =>
          fileMatchesAccept(f, acceptTokens) && f.size <= maxSizeBytes,
      )

      if (errors.length > 0) {
        setLocalError(errors.join(" • "))
      } else {
        setLocalError(null)
      }

      if (valid.length === 0) return

      // Merge with existing + cap at limit
      const names = new Set(value.map((f) => f.name))
      const deduped = valid.filter((f) => !names.has(f.name))
      const merged = [...value, ...deduped].slice(0, limit === Infinity ? undefined : limit)

      onChange(merged)
    },
    [acceptTokens, maxSizeBytes, value, limit, onChange],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : []
      // Reset the native input so the same file can be re-selected
      e.target.value = ""
      processFiles(files)
    },
    [processFiles],
  )

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled) return
      dragCounterRef.current += 1
      if (dragCounterRef.current === 1) setDragActive(true)
    },
    [disabled],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current -= 1
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0
        setDragActive(false)
      }
    },
    [],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      setDragActive(false)
      if (disabled) return
      const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : []
      processFiles(files)
    },
    [disabled, processFiles],
  )

  const handleDropzoneClick = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const handleDropzoneKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [disabled],
  )

  const removeFile = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index))
    },
    [value, onChange],
  )

  const displayedError = error ?? localError

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <span className="mb-1.5 text-sm font-medium text-gray-700">{label}</span>
      )}

      {/* Dropzone */}
      <div
        role="button"
        aria-label="File upload dropzone"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleDropzoneClick}
        onKeyDown={handleDropzoneKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "cursor-pointer select-none rounded-xl border-2 border-dashed bg-white p-6 text-center transition-colors",
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-300",
          disabled && "cursor-not-allowed opacity-60 hover:border-gray-200",
        )}
      >
        <CloudUpload
          className={cn(
            "mx-auto h-9 w-9 transition-colors",
            dragActive ? "text-blue-500" : "text-gray-300",
          )}
          aria-hidden="true"
        />
        <p className="mt-2 text-sm font-medium text-gray-700">
          Drag and drop or click to upload
        </p>
        {(helperText ?? accept) && (
          <p className="mt-1 text-xs text-gray-400">
            {helperText ?? `Accepted: ${accept}`}
          </p>
        )}
        {maxSizeBytes && (
          <p className="mt-0.5 text-xs text-gray-400">
            Max {formatBytes(maxSizeBytes)} per file
            {limit !== Infinity ? ` • up to ${limit} file${limit === 1 ? "" : "s"}` : ""}
          </p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        aria-label="File input"
        className="sr-only"
        disabled={disabled}
        onChange={handleInputChange}
      />

      {/* Error message */}
      {displayedError && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {displayedError}
        </div>
      )}

      {/* File list */}
      {value.length > 0 && (
        <ul className="mt-4 space-y-2" aria-label="Selected files">
          {value.map((file, i) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2 text-gray-700">
                <FileText
                  size={14}
                  className="shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                <span className="truncate font-medium">{file.name}</span>
                <span className="shrink-0 text-gray-400">
                  {formatBytes(file.size)}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(i)}
                disabled={disabled}
                className="ml-2 rounded p-0.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FileUpload
