import { X, Loader2 } from "lucide-react"
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
  type MouseEvent,
} from "react"
import { cn } from "../../utils/cn"

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "danger"
  isLoading?: boolean
  requireText?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  className?: string
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
  requireText,
  confirmLabel = "Type to confirm",
  onConfirm,
  onCancel,
  className,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("")
  const cancelRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset typed value whenever dialog closes.
  useEffect(() => {
    if (!open) {
      setTyped("")
    }
  }, [open])

  // Focus management: when dialog opens, focus input (if present) or cancel button.
  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      if (requireText && inputRef.current) {
        inputRef.current.focus()
      } else {
        cancelRef.current?.focus()
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [open, requireText])

  // Escape key closes dialog.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel()
      }
    },
    [isLoading, onCancel],
  )

  // Overlay click closes dialog.
  const handleOverlayClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !isLoading) {
        onCancel()
      }
    },
    [isLoading, onCancel],
  )

  const isConfirmAllowed =
    !isLoading && (requireText === undefined || typed === requireText)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-desc" : undefined}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl",
          className,
        )}
        // Prevent clicks inside the dialog from bubbling to the overlay.
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <h2
          id="confirm-dialog-title"
          className="pr-6 text-lg font-semibold text-gray-900"
        >
          {title}
        </h2>
        {description && (
          <p id="confirm-dialog-desc" className="mt-1 text-sm text-gray-600">
            {description}
          </p>
        )}

        {/* Typed confirmation input */}
        {requireText !== undefined && (
          <div className="mt-4 space-y-1.5">
            <label
              htmlFor="confirm-dialog-input"
              className="text-sm text-gray-700"
            >
              {confirmLabel}
            </label>
            <input
              ref={inputRef}
              id="confirm-dialog-input"
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
              spellCheck={false}
              aria-label={confirmLabel}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
            />
            <p className="text-xs text-gray-400">
              Type{" "}
              <span className="font-medium text-gray-600">{requireText}</span>{" "}
              to confirm
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            aria-label={cancelText}
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            aria-label={isLoading ? "Working…" : confirmText}
            onClick={onConfirm}
            disabled={!isConfirmAllowed}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700",
              !isConfirmAllowed && "cursor-not-allowed opacity-60",
            )}
          >
            {isLoading && (
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            )}
            {isLoading ? "Working…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
