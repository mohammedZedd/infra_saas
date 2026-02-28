import React from "react"
import { cn } from "../../utils/cn"

export interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "error" | "info" | "gray" | "blue" | "green" | "yellow" | "red" | "purple" | "indigo"
  size?: "sm" | "md"
  dot?: boolean
  className?: string
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  warning: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20",
  error: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  info: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  green: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  yellow: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  purple: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20",
  indigo: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20",
}

const dotVariantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-gray-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  gray: "bg-gray-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  purple: "bg-indigo-500",
  indigo: "bg-indigo-500",
}

const sizeClasses: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
}

export function Badge({ children, variant = "default", size = "md", dot = false, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full font-medium", sizeClasses[size], variantClasses[variant], className)}>
      {dot && <span aria-hidden="true" className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", dotVariantClasses[variant])} />}
      {children}
    </span>
  )
}

export default Badge
