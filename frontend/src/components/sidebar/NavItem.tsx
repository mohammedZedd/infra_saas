import { NavLink } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { cn } from "../../utils/cn"

// ─── Types ─────────────────────────────────────────────────────────────────

export interface NavItemDef {
  label: string
  /** Absolute route path OR undefined for non-routed items */
  to?: string
  icon: LucideIcon
}

interface NavItemProps {
  item: NavItemDef
  /** Invoked after the user clicks (e.g. close mobile sidebar) */
  onClick?: () => void
}

// ─── Shared classes ─────────────────────────────────────────────────────────

const base =
  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 w-full text-left"
const inactive = "text-gray-700 hover:bg-gray-100"
const active   = "bg-gray-100 text-gray-900 font-medium"

// ─── Component ──────────────────────────────────────────────────────────────

export default function NavItem({ item, onClick }: NavItemProps) {
  const { to, icon: Icon, label } = item

  if (to) {
    return (
      <NavLink
        to={to}
        onClick={onClick}
        end={to === "/"}
        className={({ isActive }) => cn(base, isActive ? active : inactive)}
      >
        <Icon size={16} className="shrink-0" />
        {label}
      </NavLink>
    )
  }

  // Non-routed item — no navigation side-effects
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
      className={cn(base, inactive)}
      aria-disabled="true"
    >
      <Icon size={16} className="shrink-0" />
      {label}
    </a>
  )
}
