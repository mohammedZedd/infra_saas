import React, { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "../../utils/cn"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  disableBackdropClose?: boolean
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  "2xl": "max-w-5xl",
}

export function Modal({ isOpen, onClose, title, subtitle, children, footer, size = "md", disableBackdropClose = false }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) dialogRef.current?.focus()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50"
        onClick={disableBackdropClose ? undefined : onClose}
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn("relative z-[60] w-full overflow-hidden rounded-2xl bg-white shadow-2xl focus:outline-none", sizeClasses[size])}
      >
        <div className="px-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
            <button
              type="button"
              aria-label="Close modal"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50/50 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  )
}

export default Modal
