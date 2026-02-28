import { Link, useLocation } from "react-router-dom"
import { cn } from "../../utils/cn"

interface NavItem {
  label: string
  href: string
  badge?: string
}

const navItems: NavItem[] = [
  { label: "Projects", href: "/dashboard" },
  { label: "Templates", href: "/templates", badge: "Soon" },
  { label: "Analytics", href: "/analytics", badge: "Pro" },
  { label: "Billing", href: "/billing" },
  { label: "Team", href: "/team" },
  { label: "Settings", href: "/settings" },
]

export default function DashboardSidebar() {
  const location = useLocation()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-100 px-5 text-base font-semibold text-gray-900">CloudForge</div>

      <div className="px-4 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Workspace</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">My Workspace</span>
          <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">Free</span>
        </div>
      </div>

      <nav className="mt-4 flex-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || (item.href === "/dashboard" && location.pathname === "/")
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "mb-1 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span>{item.label}</span>
              {item.badge && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{item.badge}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <button className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Upgrade to Pro</button>
      </div>
    </aside>
  )
}
