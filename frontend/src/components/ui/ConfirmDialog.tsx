import { AlertTriangle, Info, TriangleAlert, type LucideIcon } from "lucide-react"
import { cn } from "../../utils/cn"
import Modal from "./Modal"
import Button from "./Button"

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning" | "info" | "primary"
  icon?: LucideIcon
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  icon,
  isLoading = false,
}: ConfirmDialogProps) {
  const Icon = icon ?? (variant === "danger" ? AlertTriangle : variant === "warning" ? TriangleAlert : Info)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant === "danger" ? "danger" : "primary"} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-full",
            variant === "danger" && "bg-red-100",
            variant === "warning" && "bg-yellow-100",
            (variant === "info" || variant === "primary") && "bg-blue-100"
          )}
          aria-hidden="true"
        >
          <Icon
            size={20}
            className={cn(
              variant === "danger" && "text-red-600",
              variant === "warning" && "text-yellow-600",
              (variant === "info" || variant === "primary") && "text-blue-600"
            )}
          />
        </div>
        <p className="pt-2 text-sm leading-relaxed text-gray-600">{message}</p>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
