import { forwardRef } from "react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Shared slot props type
// ---------------------------------------------------------------------------

interface SlotProps {
  children: React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Card (root)
// ---------------------------------------------------------------------------

export interface CardProps extends SlotProps {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** Remove default padding from the card root */
  noPadding?: boolean;
  /** Remove the border */
  noBorder?: boolean;
  /** Stronger shadow */
  elevated?: boolean;
  /** Show hover / focus styles and role="button" */
  clickable?: boolean;
  /** Root padding preset (only applied when noPadding is false) */
  padding?: "sm" | "md" | "lg";
}

const PADDING_CLASS: Record<NonNullable<CardProps["padding"]>, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      onClick,
      noPadding = false,
      noBorder = false,
      elevated = false,
      clickable,
      padding = "md",
    },
    ref
  ) => {
    const isClickable = clickable ?? !!onClick;

    return (
      <div
        ref={ref}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        className={cn(
          "bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden",
          noBorder && "border-none",
          elevated && "shadow-md",
          !noPadding && PADDING_CLASS[padding],
          isClickable &&
            "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          className
        )}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

// ---------------------------------------------------------------------------
// CardHeader
// ---------------------------------------------------------------------------

export const CardHeader = forwardRef<HTMLDivElement, SlotProps>(
  ({ children, className }, ref) => (
    <div ref={ref} className={cn("px-6 pt-6 space-y-1", className)}>
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

// ---------------------------------------------------------------------------
// CardTitle
// ---------------------------------------------------------------------------

export const CardTitle = forwardRef<HTMLHeadingElement, SlotProps>(
  ({ children, className }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

// ---------------------------------------------------------------------------
// CardDescription
// ---------------------------------------------------------------------------

export const CardDescription = forwardRef<HTMLParagraphElement, SlotProps>(
  ({ children, className }, ref) => (
    <p ref={ref} className={cn("text-sm text-gray-600", className)}>
      {children}
    </p>
  )
);
CardDescription.displayName = "CardDescription";

// ---------------------------------------------------------------------------
// CardBody / CardContent
// ---------------------------------------------------------------------------

export const CardBody = forwardRef<HTMLDivElement, SlotProps>(
  ({ children, className }, ref) => (
    <div ref={ref} className={cn("px-6 py-6", className)}>
      {children}
    </div>
  )
);
CardBody.displayName = "CardBody";

/** Alias for CardBody */
export const CardContent = CardBody;

// ---------------------------------------------------------------------------
// CardFooter
// ---------------------------------------------------------------------------

export interface CardFooterProps extends SlotProps {
  /** Show the top divider. Default: true */
  border?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, border = true }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-6 pb-6 flex items-center justify-end gap-3",
        border && "border-t border-gray-100 pt-4",
        className
      )}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export default Card;
