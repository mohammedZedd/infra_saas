import React, { useEffect, useRef, useState } from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "../../utils/cn"

export interface DropdownItem {
  key: string
  label: string
  icon?: LucideIcon
  danger?: boolean
  disabled?: boolean
  divider?: boolean
  onClick?: () => void
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: "left" | "right"
}

export function Dropdown({ trigger, items, align = "right" }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open}>
        {trigger}
      </div>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 mt-1 min-w-[200px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black/5",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => {
            if (item.divider) {
              return <div key={item.key} role="separator" className="my-1 border-t border-gray-100" />
            }

            const Icon = item.icon
            return (
              <button
                key={item.key}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.()
                    setOpen(false)
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer",
                  item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50",
                  item.disabled && "cursor-not-allowed opacity-40"
                )}
              >
                {Icon && <Icon size={15} aria-hidden="true" />}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dropdown
