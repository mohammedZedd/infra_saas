import { Outlet, useNavigate } from "react-router-dom"
import { ArrowLeft, Settings } from "lucide-react"

// ── ProfileLayout ──────────────────────────────────────────────────────────
//
// Dedicated layout for /profile (and /billing settings pages).
// Intentionally renders WITHOUT the main app sidebar so that the Profile
// page's own settings sidebar is the only sidebar visible.
//
// Structure:
//   <sticky header>
//     [← Back]   Settings
//   </sticky header>
//   <Outlet />          ← Profile page renders its own two-column layout

export default function ProfileLayout() {
  const navigate = useNavigate()

  function handleBack(): void {
    // React Router v6 stores history position in window.history.state.idx.
    // idx > 0 means there is a previous entry in the session history stack.
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) {
      navigate(-1)
    } else {
      navigate("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-14 flex items-center gap-3 px-4 md:px-6 shrink-0">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="w-px h-5 bg-gray-200 shrink-0" />

        <div className="flex items-center gap-2 text-gray-900">
          <Settings className="h-4 w-4 text-gray-500 shrink-0" />
          <span className="text-sm font-semibold">Settings</span>
        </div>
      </header>

      {/* ── Page content (Profile renders its own sidebar inside) ──── */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
