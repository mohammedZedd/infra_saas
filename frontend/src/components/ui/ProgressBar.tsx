import React from "react"
import { cn } from "../../utils/cn"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProgressBarProps {
  /** Current progress value */
  value: number
  /** Maximum value — defaults to 100 */
  max?: number
  /** Optional label rendered above the bar on the left */
  label?: string
  /**
   * Show the computed percentage or "value / max" on the right.
   * Defaults to true.
   */
  showValue?: boolean
  /** Visual colour variant */
  variant?: "default" | "success" | "warning" | "danger"
  /** Bar height */
  size?: "sm" | "md" | "lg"
  /** Extra classes applied to the outermost wrapper */
  className?: string
  /** Accessible label — falls back to `label` if omitted */
  ariaLabel?: string
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const FILL_CLASS: Record<NonNullable<ProgressBarProps["variant"]>, string> = {
  default: "bg-blue-600",
  success: "bg-green-600",
  warning: "bg-yellow-500",
  danger: "bg-red-600",
}

const TRACK_SIZE: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  variant = "default",
  size = "md",
  className,
  ariaLabel,
}: ProgressBarProps): React.ReactElement {
  const safeMax = max > 0 ? max : 100
  const clamped = Math.min(safeMax, Math.max(0, value))
  const percent = (clamped / safeMax) * 100

  // Value display: show "x%" when max is 100, "x / max" otherwise
  const valueLabel =
    safeMax === 100 ? `${Math.round(percent)}%` : `${clamped} / ${safeMax}`

  const accessibleLabel = ariaLabel ?? label ?? "Progress"

  return (
    <div className={cn("w-full", className)}>
      {/* Label row */}
      {(label !== undefined || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label !== undefined && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showValue && (
            <span className="ml-auto text-sm text-gray-500 tabular-nums">
              {valueLabel}
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={accessibleLabel}
        className={cn("w-full overflow-hidden rounded-full bg-gray-200", TRACK_SIZE[size])}
      >
        {/* Fill */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            FILL_CLASS[variant]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
