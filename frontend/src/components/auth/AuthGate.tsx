import { useEffect, type ReactNode } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import SplashScreen from "@/components/ui/SplashScreen"

// ── AuthGate ───────────────────────────────────────────────────────────────
//
// Mounts once at the top of the React tree (inside BrowserRouter so hooks
// that need router context still work, but above <Routes>).
//
// Responsibilities:
//   1. Call hydrateAuth() on first mount — validates the stored token
//      against /auth/me and sets isHydrated = true when done.
//   2. While hydration is in progress, render <SplashScreen /> instead of
//      children.  This prevents ProtectedRoute from flashing a redirect to
//      /login before we know whether the user is actually authenticated.
//
// After isHydrated is true, AuthGate is transparent — it just renders
// children with zero overhead.

interface AuthGateProps {
  children: ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const isHydrated   = useAuthStore((s) => s.isHydrated)
  const hydrateAuth  = useAuthStore((s) => s.hydrateAuth)

  useEffect(() => {
    // hydrateAuth is idempotent — safe to call even if already hydrated.
    void hydrateAuth()
    // hydrateAuth is a stable store action reference; it never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isHydrated) {
    return <SplashScreen />
  }

  return <>{children}</>
}
