import React, { useEffect, useRef, useState } from "react"
import { Bell, ChevronDown, CreditCard, LogOut, Menu, User } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "../../utils/cn"
import useAuthStore from "../../stores/useAuthStore"
import useUIStore from "../../stores/useUIStore"
import { SearchInput } from "../ui/SearchInput"

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  marketplace: "Marketplace",
  profile: "Profile",
  billing: "Billing",
  editor: "Editor",
}

function useBreadcrumbs(): string[] {
  const { pathname } = useLocation()
  return pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => LABELS[seg] ?? seg)
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">{initials}</span>
}

export function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const breadcrumbs = useBreadcrumbs()

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={toggleSidebar} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 md:hidden" aria-label="Toggle sidebar">
          <Menu size={18} />
        </button>

        <nav className="hidden items-center gap-1.5 text-sm font-medium text-gray-600 md:flex" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={`${crumb}-${i}`}>
              {i > 0 && <span className="text-gray-300">/</span>}
              <span className={cn(i === breadcrumbs.length - 1 && "text-gray-900")}>{crumb}</span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search" className="hidden w-full max-w-md md:block" label="Search" />

        <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600" aria-label="Notifications">
          <Bell size={18} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar name={user?.name ?? "User"} />
            <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 md:block">{user?.name ?? "User"}</span>
            <ChevronDown size={14} className="hidden text-gray-400 md:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black/5">
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                <User size={15} />
                Profile
              </Link>
              <Link to="/billing" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                <CreditCard size={15} />
                Billing
              </Link>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={() => {
                  logout()
                  navigate("/login")
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
