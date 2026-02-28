import { type LucideIcon } from "lucide-react"
import { cn } from "../../utils/cn"
import Button from "./Button"

export interface EmptyStateAction {
  label: string
  onClick: () => void
  icon?: LucideIcon
}

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, secondaryAction, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-xl border border-dashed border-gray-200 bg-white px-6 py-14", className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Icon size={24} className="text-gray-400" aria-hidden="true" />
      </div>

      <h3 className="mt-4 text-center text-base font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-center text-sm text-gray-500">{description}</p>

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {action && (
            <Button variant="primary" leftIcon={action.icon} onClick={action.onClick}>
              {action.label}
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
