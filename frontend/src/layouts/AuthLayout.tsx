import { Link, Outlet } from "react-router-dom"
import { Cloud } from "lucide-react"

// ── AuthLayout ───────────────────────────────────────────────────────────
//
// Shared layout for all authentication pages:
//   /login  /register  /forgot-password  /reset-password
//
// Provides:
//   • Full-page centered background (min-h-screen bg-gray-50)
//   • Clickable CloudForge brand (→ /)
//   • White rounded card (max-w-md) wrapping <Outlet />
//
// Auth pages render ONLY their form content inside the Outlet.
// No page-level wrappers, no logo — the layout owns all of that.

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Brand — links back to the marketing landing page */}
      <Link
        to="/"
        className="flex items-center gap-2 mb-8 select-none group"
        aria-label="Go to CloudForge home"
      >
        <Cloud className="w-8 h-8 text-blue-600" aria-hidden="true" />
        <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          CloudForge
        </span>
      </Link>

      {/* Auth card — all auth pages render their form content here */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <Outlet />
      </div>

    </div>
  )
}
