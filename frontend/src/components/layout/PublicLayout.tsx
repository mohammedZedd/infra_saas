import React from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../utils/cn"

interface PublicLayoutProps {
  children: React.ReactNode
}

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
]

export function PublicLayout({ children }: PublicLayoutProps) {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 h-16 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between h-full">
          <Link to="/" className="font-bold text-xl text-gray-900">
            CloudForge
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors",
                    pathname === link.href ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-lg font-bold text-white">CloudForge</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                Docs
              </a>
              <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                Contact
              </a>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} CloudForge</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
