import { Cloud } from "lucide-react"
import { Link } from "react-router-dom"
import {
  LayoutDashboard,
  FolderOpen,
  Rocket,
  Settings,
} from "lucide-react"
import NavItem from "./NavItem"
import type { NavItemDef } from "./NavItem"

// ─── Nav config ─────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItemDef[] = [
  { label: "Dashboard",   to: "/dashboard", icon: LayoutDashboard },
  { label: "Projects",    to: "/dashboard", icon: FolderOpen      },
  { label: "Deployments", icon: Rocket                            }, // no dedicated route yet
  { label: "Settings",    to: "/profile",   icon: Settings        },
]

// ─── Props ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  /** Called after any nav click — used by mobile to close overlay */
  onNavClick?: () => void
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Sidebar({ onNavClick }: SidebarProps) {
  return (
    <nav
      role="navigation"
      aria-label="Primary navigation"
      className="flex h-full flex-col bg-white"
    >
      {/* Brand */}
      <Link
        to="/dashboard"
        className="flex h-16 shrink-0 items-center gap-2.5 border-b border-gray-200 px-5 hover:opacity-80 transition-opacity"
        onClick={onNavClick}
        aria-label="CloudForge home"
      >
        <Cloud className="h-6 w-6 shrink-0 text-blue-600" aria-hidden="true" />
        <span className="text-base font-bold text-gray-900">CloudForge</span>
      </Link>

      {/* Nav links */}
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.label} item={item} onClick={onNavClick} />
        ))}
      </div>
    </nav>
  )
}
