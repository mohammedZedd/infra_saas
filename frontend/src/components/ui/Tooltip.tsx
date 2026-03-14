import React, {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

export interface TooltipProps {
  /** Tooltip text or rich content */
  content: React.ReactNode;
  /** Single React element used as the anchor */
  children: React.ReactElement;
  /** Which side of the anchor to place the tooltip. Default: "top" */
  side?: Side;
  /** @deprecated use `side` */
  placement?: Side;
  /** Alignment along the cross-axis. Default: "center" */
  align?: Align;
  /** Delay in ms before the tooltip opens on hover/focus. Default: 200 */
  delayMs?: number;
  /** When true the tooltip never shows */
  disabled?: boolean;
  /** Extra classes forwarded to the tooltip panel */
  className?: string;
  /** Max-width class. Default: "max-w-xs" */
  maxWidthClassName?: string;
  /** Gap in pixels between the anchor edge and the tooltip panel. Default: 8 */
  offset?: number;
}

// ---------------------------------------------------------------------------
// Position helpers
// ---------------------------------------------------------------------------

/**
 * Returns absolute-positioning classes that place the tooltip on `side`
 * and align it along the cross-axis according to `align`.
 */
function getPositionClasses(side: Side, align: Align, offset: number): string {
  // offset is intentionally unused; prefix with _ to avoid TS6133
  void offset;

  // Translate adjustments for alignment
  const crossStart: Record<Side, string> = {
    top: "left-0 -translate-x-0",
    bottom: "left-0 -translate-x-0",
    left: "top-0 -translate-y-0",
    right: "top-0 -translate-y-0",
  };
  const crossCenter: Record<Side, string> = {
    top: "left-1/2 -translate-x-1/2",
    bottom: "left-1/2 -translate-x-1/2",
    left: "top-1/2 -translate-y-1/2",
    right: "top-1/2 -translate-y-1/2",
  };
  const crossEnd: Record<Side, string> = {
    top: "right-0 translate-x-0",
    bottom: "right-0 translate-x-0",
    left: "bottom-0 translate-y-0",
    right: "bottom-0 translate-y-0",
  };

  const crossClass =
    align === "start"
      ? crossStart[side]
      : align === "end"
        ? crossEnd[side]
        : crossCenter[side];

  // Axis placement — we use inline style for offset to keep Tailwind safe
  const axisClass: Record<Side, string> = {
    top: "bottom-full",
    bottom: "top-full",
    left: "right-full",
    right: "left-full",
  };

  // Margin for offset (applied inline in the component)
  return cn(axisClass[side], crossClass);
}

/** Returns the inline style for the axis offset gap */
function getOffsetStyle(side: Side, offset: number): React.CSSProperties {
  const gap = `${offset}px`;
  if (side === "top") return { marginBottom: gap };
  if (side === "bottom") return { marginTop: gap };
  if (side === "left") return { marginRight: gap };
  return { marginLeft: gap };
}

// Arrow classes per side
const ARROW_CLASS: Record<Side, string> = {
  top: "bottom-[-4px] left-1/2 -translate-x-1/2",
  bottom: "top-[-4px] left-1/2 -translate-x-1/2",
  left: "right-[-4px] top-1/2 -translate-y-1/2",
  right: "left-[-4px] top-1/2 -translate-y-1/2",
};

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

/**
 * Lightweight tooltip with hover + focus support, open delay, and axis/align control.
 *
 * @example
 * <Tooltip content="Copy to clipboard" side="bottom">
 *   <button>Copy</button>
 * </Tooltip>
 */
export function Tooltip({
  content,
  children,
  side: sideProp,
  placement,       // legacy alias
  align = "center",
  delayMs = 200,
  disabled = false,
  className,
  maxWidthClassName = "max-w-xs",
  offset = 8,
}: TooltipProps) {
  const side: Side = sideProp ?? placement ?? "top";
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    if (disabled) return;
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), delayMs);
  }, [disabled, delayMs, clearTimer]);

  const hide = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer]);

  // Clean up on unmount
  useEffect(() => clearTimer, [clearTimer]);

  // ---- Clone child to inject event handlers + aria-describedby ----
  const child = children as React.ReactElement<Record<string, unknown>>;
  const existingProps = child.props as Record<string, unknown>;

  const cloned = cloneElement(child, {
    "aria-describedby": open ? tooltipId : existingProps["aria-describedby"],
    onMouseEnter: (e: React.MouseEvent) => {
      show();
      (existingProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      (existingProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      show();
      (existingProps.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      (existingProps.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(e);
    },
  });

  const positionClass = getPositionClasses(side, align, offset);
  const offsetStyle = getOffsetStyle(side, offset);

  return (
    <span className="relative inline-flex">
      {cloned}

      <span
        id={tooltipId}
        role="tooltip"
        style={offsetStyle}
        className={cn(
          // Layout
          "pointer-events-none absolute z-50",
          positionClass,
          maxWidthClassName,
          // Panel style
          "rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs leading-snug text-white shadow-lg",
          // Transition
          "transition-opacity duration-150",
          open ? "opacity-100" : "opacity-0",
          className
        )}
      >
        {content}
        {/* Arrow */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute h-2 w-2 rotate-45 bg-gray-900",
            ARROW_CLASS[side]
          )}
        />
      </span>
    </span>
  );
}

export default Tooltip;
