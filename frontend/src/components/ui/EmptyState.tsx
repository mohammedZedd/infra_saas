import { type ReactNode, isValidElement } from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "../../utils/cn"
import Button from "./Button"

export interface EmptyStateAction {
  label: string
  onClick: () => void
  icon?: LucideIcon
}

export interface EmptyStateProps {
  /** Accept a Lucide icon component or any ReactNode (e.g. an already-rendered element) */
  icon?: LucideIcon | ReactNode
  title: string
  description?: string
  /** Simple shorthand — used when full EmptyStateAction is not needed */
  actionLabel?: string
  onAction?: () => void
  /** Rich action (takes precedence over actionLabel/onAction) */
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  className?: string
}

export function EmptyState({
  icon: iconProp,
  title,
  description,
  actionLabel,
  onAction,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  // Normalise: build a resolved action merging the simple and rich variants
  const resolvedAction: EmptyStateAction | undefined =
    action ?? (actionLabel ? { label: actionLabel, onClick: onAction ?? (() => {}) } : undefined)

  // Determine how to render the icon
  const renderIcon = () => {
    if (!iconProp) return null
    // Already a rendered element (ReactNode) — pass through directly
    if (isValidElement(iconProp)) return <>{iconProp}</>
    // Otherwise treat as a Lucide icon component (function or forwardRef object)
    const Icon = iconProp as LucideIcon
    return <Icon size={24} className="text-gray-400" aria-hidden="true" />
  }

  const icon = renderIcon()

  return (
    <div className={cn("rounded-xl border border-dashed border-gray-200 bg-white px-6 py-14", className)}>
      {icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
      )}

      <h3 className="mt-4 text-center text-base font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-center text-sm text-gray-500">{description}</p>
      )}

      {(resolvedAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {resolvedAction && (
            <Button variant="primary" leftIcon={resolvedAction.icon} onClick={resolvedAction.onClick}>
              {resolvedAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" leftIcon={secondaryAction.icon} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
