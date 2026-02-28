import { useRef, useState } from "react"
import { FileText, Upload, X } from "lucide-react"
import { cn } from "../../utils/cn"
import { formatBytes } from "../../utils/format"

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function FileUpload({ onFilesSelected, accept, multiple = false, maxSize, label, error, disabled, className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [sizeError, setSizeError] = useState<string | null>(null)

  const processFiles = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    if (maxSize !== undefined) {
      const oversized = arr.filter((f) => f.size > maxSize)
      if (oversized.length > 0) {
        setSizeError(`File exceeds maximum size of ${formatBytes(maxSize)}.`)
        return
      }
    }
    setSizeError(null)
    setSelectedFiles(arr)
    onFilesSelected(arr)
  }

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(updated)
    onFilesSelected(updated)
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {label && <span className="mb-1.5 text-sm font-medium text-gray-700">{label}</span>}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (!disabled) processFiles(e.dataTransfer.files)
        }}
        className={cn(
          "rounded-xl border-2 border-dashed p-8 text-center transition-colors bg-white",
          dragOver ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-gray-700">Drop files here or click to browse</p>
        {accept && <p className="mt-1 text-xs text-gray-400">Accepted: {accept}</p>}
        {maxSize && <p className="mt-1 text-xs text-gray-400">Max size: {formatBytes(maxSize)}</p>}
      </div>

      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="sr-only" onChange={(e) => processFiles(e.target.files)} />

      {selectedFiles.length > 0 && (
        <ul className="mt-3 space-y-2">
          {selectedFiles.map((file, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-gray-700">
                <FileText size={14} className="shrink-0 text-gray-400" aria-hidden="true" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-gray-400">({formatBytes(file.size)})</span>
              </span>
              <button type="button" onClick={() => removeFile(i)} className="ml-2 text-gray-400 hover:text-red-500">
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {(error || sizeError) && <p className="mt-1.5 text-sm text-red-600">{error ?? sizeError}</p>}
    </div>
  )
}

export default FileUpload
