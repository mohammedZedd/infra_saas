import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { cn } from "../../utils/cn"

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface DropdownContextValue {
  isOpen: boolean
  toggle: () => void
  close: () => void
  align: "left" | "right"
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

function useDropdown(): DropdownContextValue {
  const ctx = useContext(DropdownContext)
  if (!ctx) throw new Error("Dropdown sub-components must be used inside <Dropdown>")
  return ctx
}

// ---------------------------------------------------------------------------
// Dropdown (root)
// ---------------------------------------------------------------------------

export interface DropdownProps {
  /** If provided the component is controlled; call onOpenChange to update. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "left" | "right"
  className?: string
  children: React.ReactNode
}

export function Dropdown({
  open: controlledOpen,
  onOpenChange,
  align = "right",
  className,
  children,
}: DropdownProps) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = isControlled ? (controlledOpen as boolean) : internalOpen
  const containerRef = useRef<HTMLDivElement>(null)

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value)
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange],
  )

  const toggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen])
  const close = useCallback(() => setOpen(false), [setOpen])

  // Outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isOpen, close])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, close])

  return (
    <DropdownContext.Provider value={{ isOpen, toggle, close, align }}>
      <div ref={containerRef} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// DropdownTrigger
// ---------------------------------------------------------------------------

export interface DropdownTriggerProps {
  children: React.ReactElement<any>
}

export function DropdownTrigger({ children }: DropdownTriggerProps) {
  const { isOpen, toggle } = useDropdown()
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      if (typeof children.props.onClick === 'function') {
        children.props.onClick(e)
      }
      toggle()
    },
    "aria-expanded": isOpen,
    "aria-haspopup": "menu" as const,
  })
}

// ---------------------------------------------------------------------------
// DropdownContent
// ---------------------------------------------------------------------------

const WIDTH_CLASS: Record<"sm" | "md" | "lg", string> = {
  sm: "min-w-[140px]",
  md: "min-w-[180px]",
  lg: "min-w-[220px]",
}

export interface DropdownContentProps {
  width?: "sm" | "md" | "lg"
  className?: string
  children: React.ReactNode
}

export function DropdownContent({ width = "md", className, children }: DropdownContentProps) {
  const { isOpen, align } = useDropdown()
  if (!isOpen) return null
  return (
    <div
      role="menu"
      aria-orientation="vertical"
      className={cn(
        "absolute z-50 mt-1.5 rounded-xl border border-gray-200 bg-white py-1 shadow-lg",
        WIDTH_CLASS[width],
        align === "right" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DropdownItem
// ---------------------------------------------------------------------------

export interface DropdownItemProps {
  label: string
  onSelect?: () => void
  href?: string
  icon?: React.ReactNode
  disabled?: boolean
  variant?: "default" | "danger"
  rightSlot?: React.ReactNode
  closeOnSelect?: boolean
}

export function DropdownItem({
  label,
  onSelect,
  href,
  icon,
  disabled = false,
  variant = "default",
  rightSlot,
  closeOnSelect = true,
}: DropdownItemProps) {
  const { close } = useDropdown()

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) {
        e.preventDefault()
        return
      }
      onSelect?.()
      if (closeOnSelect) close()
    },
    [disabled, onSelect, closeOnSelect, close],
  )

  const baseClass = cn(
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
    variant === "danger"
      ? "text-red-600 hover:bg-red-50"
      : "text-gray-700 hover:bg-gray-50",
    disabled
      ? "cursor-not-allowed opacity-50 hover:bg-transparent"
      : "cursor-pointer",
  )

  const content = (
    <>
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      <span className="flex-1">{label}</span>
      {rightSlot && <span className="shrink-0 text-xs text-gray-400">{rightSlot}</span>}
    </>
  )

  if (href && !disabled) {
    return (
      <a
        href={href}
        role="menuitem"
        onClick={handleClick}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={baseClass}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={baseClass}
    >
      {content}
    </button>
  )
}

// ---------------------------------------------------------------------------
// DropdownDivider
// ---------------------------------------------------------------------------

export function DropdownDivider() {
  return <div role="separator" className="my-1 border-t border-gray-200" />
}

export default Dropdown
