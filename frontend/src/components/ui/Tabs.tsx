import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TabsContextValue {
  /** Currently active tab value */
  active: string;
  /** Stable base id used to derive trigger/panel ids */
  baseId: string;
  /** Set the active tab (calls onValueChange in controlled mode) */
  select: (value: string) => void;
  /** All registered trigger values (for keyboard nav, insertion-ordered) */
  registerTrigger: (value: string) => void;
  unregisterTrigger: (value: string) => void;
  triggers: React.MutableRefObject<string[]>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(
      "<TabsList>, <TabsTrigger>, and <TabsContent> must be rendered inside <Tabs>."
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TabsProps {
  /** Controlled active value */
  value?: string;
  /** Initial value for uncontrolled mode */
  defaultValue?: string;
  /** Called when the active tab changes */
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export interface TabsListProps {
  className?: string;
  children: React.ReactNode;
  /** Accessible label for the tablist (optional) */
  "aria-label"?: string;
}

export interface TabsTriggerProps {
  /** Must match the value prop of the corresponding TabsContent */
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface TabsContentProps {
  /** Must match the value prop of the corresponding TabsTrigger */
  value: string;
  className?: string;
  children: React.ReactNode;
  /**
   * When true the panel stays mounted in the DOM even when inactive,
   * just hidden via CSS. Useful for panels with local state that should
   * survive tab switches. Default: false (unmount when inactive).
   */
  forceMount?: boolean;
}

// ---------------------------------------------------------------------------
// Tabs (root)
// ---------------------------------------------------------------------------

/**
 * Root container that manages active-tab state and provides context.
 *
 * @example
 * <Tabs defaultValue="overview">
 *   <TabsList>
 *     <TabsTrigger value="overview">Overview</TabsTrigger>
 *     <TabsTrigger value="settings">Settings</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="overview">…</TabsContent>
 *   <TabsContent value="settings">…</TabsContent>
 * </Tabs>
 */
export function Tabs({
  value,
  defaultValue = "",
  onValueChange,
  className,
  children,
}: TabsProps) {
  const baseId = useId();
  const [internal, setInternal] = useState<string>(defaultValue);
  // Stable ref holding registered trigger order (for keyboard nav).
  const triggers = useRef<string[]>([]);

  const active = value !== undefined ? value : internal;

  const select = useCallback(
    (next: string) => {
      if (value === undefined) {
        setInternal(next);
      }
      onValueChange?.(next);
    },
    [value, onValueChange]
  );

  const registerTrigger = useCallback((v: string) => {
    if (!triggers.current.includes(v)) {
      triggers.current = [...triggers.current, v];
    }
  }, []);

  const unregisterTrigger = useCallback((v: string) => {
    triggers.current = triggers.current.filter((t) => t !== v);
  }, []);

  return (
    <TabsContext.Provider
      value={{ active, baseId, select, registerTrigger, unregisterTrigger, triggers }}
    >
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// TabsList
// ---------------------------------------------------------------------------

/**
 * Flex container that wraps all tab triggers.
 * Renders with `role="tablist"` for ARIA compliance.
 */
export function TabsList({
  className,
  children,
  "aria-label": ariaLabel,
}: TabsListProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-6 border-b border-gray-200 overflow-x-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TabsTrigger
// ---------------------------------------------------------------------------

/**
 * Clickable tab button. Must be rendered inside `<TabsList>`.
 *
 * Keyboard support: ArrowLeft / ArrowRight / Home / End
 */
export function TabsTrigger({
  value,
  disabled = false,
  className,
  children,
}: TabsTriggerProps) {
  const { active, baseId, select, registerTrigger, unregisterTrigger, triggers } =
    useTabsContext();

  // Register/unregister this trigger so the keyboard handler has ordered list.
  const refCallback = useCallback(
    (el: HTMLButtonElement | null) => {
      if (el) {
        registerTrigger(value);
      } else {
        unregisterTrigger(value);
      }
    },
    [value, registerTrigger, unregisterTrigger]
  );

  const isActive = active === value;

  const handleClick = () => {
    if (!disabled) select(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const list = triggers.current.filter(Boolean);
    const idx = list.indexOf(value);
    if (idx === -1) return;

    let nextIdx: number | null = null;

    if (e.key === "ArrowRight") {
      nextIdx = (idx + 1) % list.length;
    } else if (e.key === "ArrowLeft") {
      nextIdx = (idx - 1 + list.length) % list.length;
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = list.length - 1;
    }

    if (nextIdx !== null) {
      e.preventDefault();
      const nextValue = list[nextIdx];
      select(nextValue);
      // Move DOM focus to the newly-activated trigger button.
      const el = document.getElementById(`${baseId}-tab-${nextValue}`);
      (el as HTMLButtonElement | null)?.focus();
    }
  };

  return (
    <button
      ref={refCallback}
      id={`${baseId}-tab-${value}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      aria-disabled={disabled}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base
        "inline-flex items-center gap-1.5 pb-3 text-sm transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-sm",
        // Active
        isActive
          ? "text-blue-600 border-b-2 border-blue-600 font-medium"
          : "text-gray-600 border-b-2 border-transparent hover:text-gray-900",
        // Disabled
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// TabsContent
// ---------------------------------------------------------------------------

/**
 * Content panel associated with a tab trigger.
 * Unmounts when inactive by default; set `forceMount` to keep it in the DOM.
 */
export function TabsContent({
  value,
  className,
  children,
  forceMount = false,
}: TabsContentProps) {
  const { active, baseId } = useTabsContext();
  const isActive = active === value;

  if (!isActive && !forceMount) return null;

  return (
    <div
      id={`${baseId}-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!isActive}
      tabIndex={0}
      className={cn(
        "focus:outline-none pt-6",
        !isActive && "hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export default Tabs;
