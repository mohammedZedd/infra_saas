import { useId } from "react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToggleProps {
  checked: boolean;
  /** Called with the next boolean state when the user interacts */
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Label text rendered to the right of the switch */
  label?: string;
  /** Helper text rendered below the label */
  description?: string;
  size?: "sm" | "md";
  className?: string;
  /** Explicit id for the underlying input; auto-generated when omitted */
  id?: string;
}

// ---------------------------------------------------------------------------
// Size tokens
// ---------------------------------------------------------------------------

const TRACK: Record<NonNullable<ToggleProps["size"]>, string> = {
  sm: "w-9 h-5",
  md: "w-11 h-6",
};

const KNOB: Record<NonNullable<ToggleProps["size"]>, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
};

// Knob travel: track-width − knob-width − 2×2px inset = exact right-edge position
// sm: 36 − 16 − 4 = 16px = translate-x-4
// md: 44 − 20 − 4 = 20px = translate-x-5
const KNOB_ON: Record<NonNullable<ToggleProps["size"]>, string> = {
  sm: "translate-x-4",
  md: "translate-x-5",
};

// ---------------------------------------------------------------------------
// Toggle
// ---------------------------------------------------------------------------

/**
 * Accessible controlled toggle switch for boolean settings.
 *
 * @example
 * <Toggle
 *   checked={autoDeployEnabled}
 *   onCheckedChange={setAutoDeployEnabled}
 *   label="Auto-deploy"
 *   description="Deploy automatically on every push."
 * />
 */
export function Toggle({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  size = "md",
  className,
  id,
}: ToggleProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex items-start justify-between gap-4",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      {/* Left: label + description */}
      {(label || description) && (
        <span className="flex flex-col min-w-0">
          {label && (
            <span className="text-sm font-medium text-gray-900 leading-5">{label}</span>
          )}
          {description && (
            <span className="text-sm text-gray-500 mt-1 leading-5">{description}</span>
          )}
        </span>
      )}

      {/* Right: the switch (always last in DOM for justify-between) */}
      <span className="relative flex-shrink-0">
        {/* Hidden native checkbox — provides keyboard, focus, and screen-reader support */}
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className={cn(
            "sr-only",
            // Expose focus ring on the visible track via peer
            "peer"
          )}
        />

        {/* Track */}
        <span
          aria-hidden="true"
          className={cn(
            "relative inline-flex items-center rounded-full transition-colors duration-200",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2",
            TRACK[size],
            checked ? "bg-blue-600" : "bg-gray-200"
          )}
        >
          {/* Knob */}
          <span
            className={cn(
              "absolute left-0.5 top-1/2 -translate-y-1/2",
              "rounded-full bg-white shadow-sm transition-transform duration-200",
              KNOB[size],
              checked ? KNOB_ON[size] : "translate-x-0"
            )}
          />
        </span>
      </span>
    </label>
  );
}

export default Toggle;
