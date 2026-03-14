import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { Cloud, Menu, X } from "lucide-react"
import { cn } from "../../utils/cn"

// ─── Nav links config ────────────────────────────────────────────────────────

interface NavLinkDef {
  label: string
  to: string
}

const LINKS: NavLinkDef[] = [
  { label: "Home",     to: "/"         },
  { label: "Pricing",  to: "/pricing"  },
  { label: "Login",    to: "/login"    },
  { label: "Register", to: "/register" },
]

// ─── Shared class builders ───────────────────────────────────────────────────

const linkBase =
  "text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"

const desktopLink = (isActive: boolean) =>
  cn(
    linkBase,
    isActive
      ? "text-blue-600"
      : "text-gray-600 hover:text-gray-900"
  )

const mobileLink = (isActive: boolean) =>
  cn(
    "flex w-full items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
    isActive
      ? "bg-blue-50 text-blue-700"
      : "text-gray-700 hover:bg-gray-100"
  )

// ─── Component ───────────────────────────────────────────────────────────────

export default function PublicNavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header
        role="banner"
        className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* ── Brand ─────────────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2 text-base font-bold text-gray-900 hover:opacity-80 transition-opacity"
            aria-label="CloudForge home"
          >
            <Cloud className="h-6 w-6 text-blue-600" aria-hidden="true" />
            CloudForge
          </Link>

          {/* ── Desktop nav ────────────────────────────────────────────── */}
          <nav
            role="navigation"
            aria-label="Public navigation"
            className="hidden items-center gap-8 md:flex"
          >
            {LINKS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) => desktopLink(isActive)}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ── CTA (desktop) ─────────────────────────────────────────── */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Get started →
            </Link>
          </div>

          {/* ── Mobile hamburger ────────────────────────────────────────── */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 md:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            {mobileOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* ── Mobile dropdown ─────────────────────────────────────────── */}
        {mobileOpen && (
          <nav
            id="public-mobile-menu"
            role="navigation"
            aria-label="Mobile public navigation"
            className="border-t border-gray-200 bg-white px-4 pb-4 pt-2 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {LINKS.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => mobileLink(isActive)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  )
}
