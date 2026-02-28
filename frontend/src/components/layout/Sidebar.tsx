import { Link, useLocation, useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, Circle, CreditCard, LayoutDashboard, Plus, Store } from "lucide-react"
import { cn } from "../../utils/cn"
import useUIStore from "../../stores/useUIStore"
import useProjectStore from "../../stores/useProjectStore"
import useAuthStore from "../../stores/useAuthStore"
import { truncate } from "../../utils/format"

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Billing", href: "/billing", icon: CreditCard },
]

const STATUS_COLOR: Record<string, string> = {
  deployed: "text-green-500",
  active: "text-blue-500",
  deploying: "text-yellow-500",
  draft: "text-gray-400",
  failed: "text-red-500",
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const openModal = useUIStore((s) => s.openModal)
  const projects = useProjectStore((s) => s.projects)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const navigate = useNavigate()

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  const plan = user?.plan ?? "free"

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b border-gray-100 px-5">
        <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5">
          <img src="/images/logo.svg" alt="CloudForge" className="h-8 w-8 shrink-0" />
          {!collapsed && <span className="truncate text-base font-bold text-gray-900">CloudForge</span>}
        </Link>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto py-4">
        {NAV_LINKS.map(({ label, href, icon: Icon }) => {
          const active = location.pathname === href
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "mx-3 mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}

        {!collapsed && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Projects</p>
              <button
                type="button"
                onClick={() => openModal("create-project")}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Create project"
              >
                <Plus size={14} />
              </button>
            </div>

            {recentProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="mx-3 mb-1 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <Circle size={7} className={cn("shrink-0 fill-current", STATUS_COLOR[project.status] ?? "text-gray-400")} />
                <span className="truncate">{truncate(project.name, 24)}</span>
              </button>
            ))}

            {recentProjects.length === 0 && <p className="px-3 py-1.5 text-sm italic text-gray-400">No projects</p>}

            <button
              type="button"
              onClick={() => openModal("create-project")}
              className="mx-3 mt-1 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              <Plus size={13} />
              New project
            </button>
          </div>
        )}
      </nav>

      <div className="mt-auto border-t border-gray-100 p-4">
        {!collapsed && (
          <span className="inline-flex rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </span>
        )}

        <button
          onClick={toggleSidebar}
          className="mt-3 flex w-full items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
