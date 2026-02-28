import { cn } from "../../utils/cn"

export interface ProgressBarProps {
  value: number
  label?: string
  annotation?: string
  variant?: "indigo" | "green" | "yellow" | "red"
  size?: "sm" | "md" | "lg"
  animated?: boolean
  className?: string
}

const fillVariant: Record<NonNullable<ProgressBarProps["variant"]>, string> = {
  indigo: "bg-indigo-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
}

const trackSize: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
}

export function ProgressBar({ value, label, annotation, variant = "indigo", size = "md", animated = false, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || annotation) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {annotation && <span className="text-sm text-gray-500">{annotation}</span>}
        </div>
      )}

      <div className={cn("overflow-hidden rounded-full bg-gray-200", trackSize[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", fillVariant[variant], animated && "animate-pulse")}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
