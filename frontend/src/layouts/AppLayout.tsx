import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Box,
  Cloud,
  CreditCard,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Store,
  User,
  X,
  Zap
} from "lucide-react";
import { NotificationBell } from "../components/layout/NotificationBell";
import useAuthStore from "@/stores/useAuthStore";
import useProjectStore from "@/stores/useProjectStore";

// ── Breadcrumb helper ──────────────────────────────────────────────────────

function getBreadcrumb(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard"
  if (pathname === "/profile") return "Profile"
  if (pathname === "/billing") return "Billing"
  if (pathname === "/marketplace") return "Marketplace"
  if (pathname.startsWith("/projects/")) return "Project"
  return "CloudForge"
}

// ── Nav item type ──────────────────────────────────────────────────────────

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

// ── Nav items config ───────────────────────────────────────────────────────

const mainNavItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/dashboard", icon: FolderOpen },
  { label: "Marketplace", path: "/marketplace", icon: Store },
]

const accountNavItems: NavItem[] = [
  { label: "Profile", path: "/profile", icon: User },
  { label: "Billing", path: "/billing", icon: CreditCard },
]

// ── AppLayout ──────────────────────────────────────────────────────────────

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const user = useAuthStore((s) => s.user)
  const isUserLoading = useAuthStore((s) => s.isLoading)
  const logout = useAuthStore((s) => s.logout)
  const projects = useProjectStore((s) => s.projects)
  const fetchProjects = useProjectStore((s) => s.fetchProjects)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ── Initials ─────────────────────────────────────────────────────────────

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U"

  // ── Click outside dropdown ────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === "k") {
        e.preventDefault()
        // Command palette placeholder — focus search
        document.getElementById("cf-search-btn")?.focus()
      }
      if (mod && e.key === "n") {
        e.preventDefault()
        navigate("/dashboard")
      }
      if (e.key === "Escape") {
        setIsDropdownOpen(false)
        setIsSidebarOpen(false)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [navigate])

  // ── Close sidebar on route change ─────────────────────────────────────────

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  // ── Active nav detection ──────────────────────────────────────────────────

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard"
    return location.pathname.startsWith(path)
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    navigate("/login")
  }

  const planName = (user?.plan ?? "free").toUpperCase()
  const projectLimit = user?.plan === "free" ? 2 : user?.plan === "pro" ? 25 : 100
  const usagePercent = Math.min(Math.round((projects.length / projectLimit) * 100), 100)

  // ── Sidebar content ───────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      {/* Main nav */}
      <div className="flex-1">
        <div className="space-y-0.5 px-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path) && item.label !== "Projects"
            return (
              <Link
                key={item.label}
                to={item.path}
                className={[
                  "flex items-center gap-3 px-4 py-2.5 text-sm mx-0 rounded-lg cursor-pointer transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                ].join(" ")}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Recent projects */}
        <div className="mt-2">
          <p className="text-xs text-gray-400 uppercase tracking-widest px-6 pt-5 pb-2">
            Recent Projects
          </p>
          <div className="space-y-0.5 px-2">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={[
                    "flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-colors",
                    location.pathname === `/projects/${project.id}`
                      ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  ].join(" ")}
                >
                  <Box className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-gray-400 px-4">No projects yet</p>
            )}
          </div>
        </div>

        {/* Account */}
        <div className="mt-2">
          <p className="text-xs text-gray-400 uppercase tracking-widest px-6 pt-5 pb-2">
            Account
          </p>
          <div className="space-y-0.5 px-2">
            {accountNavItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={[
                    "flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom: usage + upgrade */}
      <div className="mt-auto border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500 px-4 mb-2">{planName} Plan</p>
        <div className="px-4 mb-1">
          <div className="bg-gray-100 rounded h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-full rounded" style={{ width: `${usagePercent}%` }} />
          </div>
        </div>
        <p className="text-xs text-gray-400 px-4 mb-3">{projects.length} of {projectLimit} projects</p>
        <button className="mx-4 mb-2 w-[calc(100%-2rem)] bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-2 text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center">
          <Zap className="w-3 h-3 mr-1" />
          Upgrade to Pro
        </button>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Navbar ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16 px-4 md:px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-0">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 mr-2"
            onClick={() => setIsSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <Cloud className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-gray-900">CloudForge</span>
          </Link>

          {/* Breadcrumb */}
          <span className="text-gray-300 mx-3 hidden md:inline">/</span>
          <span className="text-sm text-gray-500 hidden md:inline">
            {getBreadcrumb(location.pathname)}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search */}
          <button
            id="cf-search-btn"
            className="hidden md:flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:border-gray-400 transition-colors w-48 cursor-pointer"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span>Search...</span>
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full hover:ring-2 hover:ring-blue-300 transition-all"
              aria-label="User menu"
            >
              <span className="text-white text-xs font-semibold">{isUserLoading && !user ? "…" : initials}</span>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name ?? "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email ?? ""}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="px-2 py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer w-full"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Profile
                    </Link>
                    <Link
                      to="/billing"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer w-full"
                    >
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      Billing
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer w-full"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Settings
                    </Link>

                    <div className="border-t border-gray-100 my-1" />

                    <a
                      href="https://docs.cloudforge.io"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer w-full"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      Help &amp; Docs
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── Mobile sidebar overlay ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      {/* Desktop: always visible */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
        <SidebarContent />
      </aside>

      {/* Mobile: slides in */}
      <motion.aside
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-50 md:hidden"
        style={{ x: "-100%" }}
      >
        <SidebarContent />
      </motion.aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="md:ml-64 mt-16 min-h-[calc(100vh-4rem)] bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
