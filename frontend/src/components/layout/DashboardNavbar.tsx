import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

export default function DashboardNavbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link to="/dashboard" className="text-lg font-semibold text-gray-900">
          CloudForge
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
          >
            J
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-50 min-w-[200px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black/5">
              <button onClick={() => setMenuOpen(false)} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50">
                Settings
              </button>
              <button onClick={() => setMenuOpen(false)} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50">
                Billing
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button onClick={() => navigate("/")} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
