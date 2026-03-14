import { forwardRef } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  /** Lucide icon component rendered before the label */
  leftIcon?: LucideIcon;
  /** Lucide icon component rendered after the label */
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const VARIANT: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:   "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  outline:   "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
  ghost:     "bg-transparent text-gray-700 hover:bg-gray-100",
  danger:    "bg-red-600 text-white hover:bg-red-700",
};

const SIZE: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8  px-3 text-sm  gap-1.5",
  md: "h-10 px-4 text-sm  gap-2",
  lg: "h-12 px-5 text-base gap-2",
};

const ICON_SIZE: Record<NonNullable<ButtonProps["size"]>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-80"
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

/**
 * General-purpose button with variants, sizes, loading state, and icon support.
 *
 * @example
 * <Button variant="primary" leftIcon={Plus} onClick={open}>New Project</Button>
 * <Button variant="danger" isLoading={deleting}>Delete</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const iconSize = ICON_SIZE[size];
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={cn(
          // Base
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          // Variant + size
          VARIANT[variant],
          SIZE[size],
          // Full width
          fullWidth && "w-full",
          className
        )}
        {...rest}
      >
        {/* Loading spinner replaces left icon */}
        {isLoading ? (
          <Spinner />
        ) : LeftIcon ? (
          <LeftIcon size={iconSize} aria-hidden="true" />
        ) : null}

        {children}

        {/* Right icon hidden while loading to keep width stable */}
        {!isLoading && RightIcon ? (
          <RightIcon size={iconSize} aria-hidden="true" />
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
