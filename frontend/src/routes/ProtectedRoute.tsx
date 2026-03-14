import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/useAuthStore"
import SplashScreen from "@/components/ui/SplashScreen"

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children: ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Children-prop guard that redirects unauthenticated users to /login.
 *
 * Hydration-aware: waits for AuthGate to finish token validation before
 * making an allow-or-redirect decision so the user is never prematurely
 * sent to /login on a protected-route refresh.
 *
 * Usage (children pattern):
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 *
 * For layout-route (Outlet) usage see src/components/router/ProtectedRoute.tsx.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isHydrated      = useAuthStore((s) => s.isHydrated)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location        = useLocation()

  if (!isHydrated) {
    return <SplashScreen />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <>{children}</>
}
