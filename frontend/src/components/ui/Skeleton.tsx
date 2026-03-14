import type React from "react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RoundedValue = boolean | "full" | "lg" | "md" | "sm" | "none";

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: RoundedValue;
  animate?: boolean;
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  animate?: boolean;
}

export interface SkeletonAvatarProps {
  size?: number | "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

export interface SkeletonCardProps {
  className?: string;
  animate?: boolean;
  showButton?: boolean;
  lines?: number;
}

export interface SkeletonTableRowProps {
  cells?: number;
  className?: string;
  animate?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveRounded(rounded?: RoundedValue): string {
  if (rounded === undefined || rounded === true) return "rounded-md";
  if (rounded === false || rounded === "none") return "rounded-none";
  if (rounded === "full") return "rounded-full";
  if (rounded === "lg") return "rounded-lg";
  if (rounded === "md") return "rounded-md";
  if (rounded === "sm") return "rounded-sm";
  return "rounded-md";
}

function resolveSize(value: string | number): string {
  if (typeof value === "number") return `${value}px`;
  return value;
}

const AVATAR_SIZE_MAP: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 56,
};

// ---------------------------------------------------------------------------
// Base Skeleton
// ---------------------------------------------------------------------------

/**
 * Base skeleton block. All other skeleton variants are composed from this.
 *
 * @example
 * <Skeleton width={200} height={16} />
 * <Skeleton className="w-full h-4" rounded="lg" />
 */
export function Skeleton({
  className,
  width,
  height,
  rounded,
  animate = true,
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = resolveSize(width);
  if (height !== undefined) style.height = resolveSize(height);

  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn(
        "bg-gray-200 dark:bg-gray-700",
        animate && "animate-pulse",
        resolveRounded(rounded),
        className
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonText — stacked text-line placeholders
// ---------------------------------------------------------------------------

/**
 * Renders stacked skeleton rows that mimic a block of text.
 * The last line is rendered at ~75 % width to mimic natural text endings.
 *
 * @example
 * <SkeletonText lines={4} />
 */
export function SkeletonText({
  lines = 3,
  className,
  animate = true,
}: SkeletonTextProps) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height={12}
          animate={animate}
          className={cn("w-full", i === lines - 1 && lines > 1 && "w-3/4")}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkeletonAvatar — circular avatar placeholder
// ---------------------------------------------------------------------------

/**
 * Circular placeholder for avatars, profile pictures, and user icons.
 *
 * @example
 * <SkeletonAvatar size="md" />
 * <SkeletonAvatar size={48} />
 */
export function SkeletonAvatar({
  size = "md",
  className,
  animate = true,
}: SkeletonAvatarProps) {
  const px = typeof size === "number" ? size : AVATAR_SIZE_MAP[size];

  return (
    <Skeleton
      width={px}
      height={px}
      rounded="full"
      animate={animate}
      className={cn("flex-shrink-0", className)}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonCard — full card-shaped placeholder
// ---------------------------------------------------------------------------

/**
 * Card-shaped placeholder for dashboard lists and project grids.
 * Renders: avatar + heading, text body, optional action buttons.
 *
 * @example
 * <SkeletonCard />
 * <SkeletonCard showButton lines={4} />
 */
export function SkeletonCard({
  className,
  animate = true,
  showButton = false,
  lines = 3,
}: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-xl border border-gray-100 dark:border-gray-800",
        "bg-white dark:bg-gray-900 p-5 flex flex-col gap-4",
        className
      )}
    >
      {/* Header row: avatar + title */}
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" animate={animate} />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton height={14} animate={animate} className="w-2/5" />
          <Skeleton height={11} animate={animate} className="w-1/4" />
        </div>
      </div>

      {/* Body: text lines */}
      <SkeletonText lines={lines} animate={animate} />

      {/* Optional action buttons */}
      {showButton && (
        <div className="flex items-center gap-2 pt-1">
          <Skeleton height={32} animate={animate} className="w-24" rounded="md" />
          <Skeleton height={32} animate={animate} className="w-20" rounded="md" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkeletonTableRow — horizontal row of skeleton cells
// ---------------------------------------------------------------------------

/**
 * A horizontal row of skeleton cells for tables or data grids.
 *
 * @example
 * {Array.from({ length: 5 }).map((_, i) => (
 *   <SkeletonTableRow key={i} cells={4} />
 * ))}
 */
export function SkeletonTableRow({
  cells = 4,
  className,
  animate = true,
}: SkeletonTableRowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center gap-4 px-4 py-3", className)}
    >
      {Array.from({ length: cells }, (_, i) => (
        <Skeleton
          key={i}
          height={14}
          animate={animate}
          className={cn(
            i === 0 && "w-8",
            i === 1 && "flex-1",
            i === 2 && "w-24",
            i === 3 && "w-16",
            i >= 4 && "w-20"
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Convenience composites
// ---------------------------------------------------------------------------

type SimpleSkeletonProps = Pick<SkeletonProps, "className" | "animate">;

/**
 * A single line skeleton sized to look like a heading.
 *
 * @example
 * <SkeletonHeading />
 */
export function SkeletonHeading({ className, animate = true }: SimpleSkeletonProps) {
  return (
    <Skeleton height={22} animate={animate} className={cn("w-1/3", className)} />
  );
}

/**
 * A full-width image / banner placeholder.
 *
 * @example
 * <SkeletonImage className="h-48" />
 */
export function SkeletonImage({ className, animate = true }: SimpleSkeletonProps) {
  return (
    <Skeleton
      rounded="lg"
      animate={animate}
      className={cn("w-full h-40", className)}
    />
  );
}

/**
 * An inline row with an avatar and a short label — e.g. user list items.
 *
 * @example
 * <SkeletonAvatarRow />
 */
export function SkeletonAvatarRow({ className, animate = true }: SimpleSkeletonProps) {
  return (
    <div aria-hidden="true" className={cn("flex items-center gap-3", className)}>
      <SkeletonAvatar size="sm" animate={animate} />
      <div className="flex flex-col gap-1.5 flex-1">
        <Skeleton height={12} animate={animate} className="w-28" />
        <Skeleton height={10} animate={animate} className="w-20" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export — base Skeleton for convenience
// ---------------------------------------------------------------------------

export default Skeleton;
