import React from "react"
import { cn } from "../../utils/cn"

export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
  noPadding?: boolean
  noBorder?: boolean
  elevated?: boolean
  clickable?: boolean
  padding?: "sm" | "md" | "lg"
}

const paddingClasses = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
}

export function Card({
  children,
  className,
  onClick,
  noPadding,
  noBorder,
  elevated = false,
  clickable,
  padding = "md",
}: CardProps) {
  const isClickable = clickable ?? !!onClick

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick(e as unknown as React.MouseEvent<HTMLDivElement>)
              }
            }
          : undefined
      }
      className={cn(
        "overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm",
        noBorder && "border-none",
        elevated && "shadow-md",
        !noPadding && paddingClasses[padding],
        isClickable && "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500",
        className
      )}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn("border-b border-gray-100 px-6 py-4", className)}>{children}</div>
}

export interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn("p-6", className)}>{children}</div>
}

export interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={cn("border-t border-gray-100 px-6 py-4", className)}>{children}</div>
}

export default Card
