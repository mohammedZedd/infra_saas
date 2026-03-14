import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BadgeVariant =
  | "default"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "gray"
  // Semantic aliases (kept for backward-compat with existing callsites)
  | "success"
  | "warning"
  | "error"
  | "info"
  | "purple"
  | "indigo";

type DotColor = "blue" | "green" | "yellow" | "red" | "gray";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  /** Border radius — "full" (pill) or "md" (square-ish). Default: "full" */
  rounded?: "full" | "md";
  /** Render a small colored circle before the label text */
  dot?: boolean;
  /**
   * Explicit dot color. When omitted the dot inherits the badge variant color.
   */
  dotColor?: DotColor;
  className?: string;
}

// ---------------------------------------------------------------------------
// Variant maps
// ---------------------------------------------------------------------------

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  // Primary named variants
  default: "bg-gray-50 border border-gray-200 text-gray-700",
  blue:    "bg-blue-50 border border-blue-200 text-blue-700",
  green:   "bg-green-50 border border-green-200 text-green-700",
  yellow:  "bg-yellow-50 border border-yellow-200 text-yellow-800",
  red:     "bg-red-50 border border-red-200 text-red-700",
  gray:    "bg-gray-100 border border-gray-200 text-gray-700",
  // Semantic aliases
  success: "bg-green-50 border border-green-200 text-green-700",
  warning: "bg-yellow-50 border border-yellow-200 text-yellow-800",
  error:   "bg-red-50 border border-red-200 text-red-700",
  info:    "bg-blue-50 border border-blue-200 text-blue-700",
  purple:  "bg-purple-50 border border-purple-200 text-purple-700",
  indigo:  "bg-indigo-50 border border-indigo-200 text-indigo-700",
};

/** Dot color derived from variant when no explicit dotColor given */
const VARIANT_DOT_CLASS: Record<BadgeVariant, string> = {
  default: "bg-gray-400",
  blue:    "bg-blue-500",
  green:   "bg-green-500",
  yellow:  "bg-yellow-500",
  red:     "bg-red-500",
  gray:    "bg-gray-400",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error:   "bg-red-500",
  info:    "bg-blue-500",
  purple:  "bg-purple-500",
  indigo:  "bg-indigo-500",
};

const DOT_COLOR_CLASS: Record<DotColor, string> = {
  blue:   "bg-blue-500",
  green:  "bg-green-500",
  yellow: "bg-yellow-500",
  red:    "bg-red-500",
  gray:   "bg-gray-400",
};

const SIZE_CLASS: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
};

const ROUNDED_CLASS: Record<NonNullable<BadgeProps["rounded"]>, string> = {
  full: "rounded-full",
  md:   "rounded-md",
};

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

/**
 * Stateless status pill / label used for plan badges, run statuses, and tags.
 *
 * @example
 * <Badge variant="green" dot>Running</Badge>
 * <Badge variant="red" size="sm">Failed</Badge>
 * <Badge variant="blue" rounded="md">Pro</Badge>
 */
export function Badge({
  children,
  variant = "default",
  size = "md",
  rounded = "full",
  dot = false,
  dotColor,
  className,
}: BadgeProps) {
  const resolvedDotClass = dotColor
    ? DOT_COLOR_CLASS[dotColor]
    : VARIANT_DOT_CLASS[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium whitespace-nowrap",
        SIZE_CLASS[size],
        ROUNDED_CLASS[rounded],
        VARIANT_CLASS[variant],
        className
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn("mr-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0", resolvedDotClass)}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
