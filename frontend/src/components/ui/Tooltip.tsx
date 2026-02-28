import React, { useId, useState } from "react"
import { cn } from "../../utils/cn"

export interface TooltipProps {
  children: React.ReactElement
  content: string
  placement?: "top" | "bottom" | "left" | "right"
  className?: string
}

const placementClasses: Record<NonNullable<TooltipProps["placement"]>, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
}

export function Tooltip({ children, content, placement = "top", className }: TooltipProps) {
  const tooltipId = useId()
  const [visible, setVisible] = useState(false)
  const child = children as React.ReactElement<Record<string, unknown>>
  const childProps = child.props as {
    onMouseEnter?: (e: React.MouseEvent) => void
    onMouseLeave?: (e: React.MouseEvent) => void
    onFocus?: (e: React.FocusEvent) => void
    onBlur?: (e: React.FocusEvent) => void
  }

  return (
    <span className="relative inline-flex">
      {React.cloneElement(child, {
        "aria-describedby": visible ? tooltipId : undefined,
        onMouseEnter: (e: React.MouseEvent) => {
          setVisible(true)
          childProps.onMouseEnter?.(e)
        },
        onMouseLeave: (e: React.MouseEvent) => {
          setVisible(false)
          childProps.onMouseLeave?.(e)
        },
        onFocus: (e: React.FocusEvent) => {
          setVisible(true)
          childProps.onFocus?.(e)
        },
        onBlur: (e: React.FocusEvent) => {
          setVisible(false)
          childProps.onBlur?.(e)
        },
      })}

      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 max-w-xs whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg",
            placementClasses[placement],
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}

export default Tooltip
