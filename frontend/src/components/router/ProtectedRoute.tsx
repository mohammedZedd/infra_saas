import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/useAuthStore"
import SplashScreen from "@/components/ui/SplashScreen"

/**
 * Layout-route guard for all authenticated routes (Outlet pattern).
 *
 * Hydration-aware — waits for AuthGate to finish validating the stored token
 * before making an allow-or-redirect decision:
 *
 *   isHydrated = false  →  <SplashScreen />  (never redirects prematurely)
 *   isHydrated = true
 *     isAuthenticated = false  →  <Navigate to="/login" />
 *     isAuthenticated = true   →  <Outlet />
 *
 * Preserves the intended destination in router state so Login can redirect
 * back after a successful sign-in:
 *   const { state } = useLocation()
 *   navigate(state?.from ?? "/dashboard", { replace: true })
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<AppLayout />}>
 *       <Route path="/dashboard" element={<Dashboard />} />
 *     </Route>
 *   </Route>
 */
export default function ProtectedRoute() {
  const isHydrated      = useAuthStore((s) => s.isHydrated)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location        = useLocation()

  // Hydration still in progress — do NOT redirect yet.
  if (!isHydrated) {
    return <SplashScreen />
  }

  // Hydrated but no valid session — send to login.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
