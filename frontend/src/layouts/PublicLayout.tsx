import { Outlet } from "react-router-dom"
import PublicNavBar from "../components/layout/PublicNavBar"

/**
 * Layout wrapper for all public-facing routes:
 * /  |  /login  |  /register  |  /pricing
 *
 * Renders the shared PublicNavBar on top, then the matched child route
 * via <Outlet>.  No authentication checks are performed here.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavBar />

      {/* Push content below the fixed 64 px nav bar */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}
