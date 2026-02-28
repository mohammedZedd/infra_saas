import React from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "../../utils/cn"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  isLoading?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500",
  secondary: "bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 focus:ring-gray-500",
  outline: "bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-none shadow-none focus:ring-gray-500",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500",
}

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
}

const iconSizeClasses: Record<NonNullable<ButtonProps["size"]>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      isLoading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const iconSize = iconSizeClasses[size]
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? <Spinner /> : LeftIcon ? <LeftIcon size={iconSize} aria-hidden="true" /> : null}
        {children}
        {!isLoading && RightIcon ? <RightIcon size={iconSize} aria-hidden="true" /> : null}
      </button>
    )
  }
)

Button.displayName = "Button"
export default Button
