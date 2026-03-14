import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/stores/useAuthStore"

/**
 * Redirects already-authenticated users away from auth pages.
 * Store is synchronously initialized — no loading state needed.
 */
export default function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
