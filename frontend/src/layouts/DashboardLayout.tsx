import { useState, useCallback } from "react"
import type { ReactNode } from "react"
import { Menu, X } from "lucide-react"
import Sidebar from "../components/sidebar/Sidebar"

// ─── Props ───────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: ReactNode
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const openSidebar  = useCallback(() => setMobileOpen(true),  [])
  const closeSidebar = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Desktop sidebar ────────────────────────────────────────────────
          hidden on mobile; fixed full-height panel on md+
      ─────────────────────────────────────────────────────────────────── */}
      <aside
        className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-gray-200 md:block"
        aria-label="Desktop sidebar"
      >
        <Sidebar />
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────────────────
          Only visible below md breakpoint
      ─────────────────────────────────────────────────────────────────── */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b border-gray-200 bg-white px-4 md:hidden">
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar-panel"
          onClick={openSidebar}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <span className="ml-3 text-sm font-semibold text-gray-900">CloudForge</span>
      </header>

      {/* ── Mobile sidebar overlay ────────────────────────────────────────
          Backdrop + sliding panel; only rendered when open
      ─────────────────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={closeSidebar}
          />

          {/* Panel */}
          <aside
            id="mobile-sidebar-panel"
            role="dialog"
            aria-label="Mobile navigation"
            aria-modal="true"
            className="fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-xl"
          >
            {/* Close button */}
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={closeSidebar}
              className="absolute right-3 top-3 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <Sidebar onNavClick={closeSidebar} />
          </aside>
        </div>
      )}

      {/* ── Main content area ─────────────────────────────────────────────
          Offset for fixed desktop sidebar (ml-64) and mobile top bar (pt-14)
      ─────────────────────────────────────────────────────────────────── */}
      <main className="pt-14 md:ml-64 md:pt-0">
        <div className="mx-auto max-w-7xl px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
