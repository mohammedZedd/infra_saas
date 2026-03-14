import { useEffect, Component } from "react"
import type { ReactNode } from "react"
import { Routes, Route, useLocation } from "react-router-dom"

import Landing        from "@/pages/Landing"
import Login          from "@/pages/Login"
import Register       from "@/pages/Register"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import ResetPassword       from "@/pages/ResetPassword"
import Pricing        from "@/pages/Pricing"
import Terms          from "@/pages/Terms"
import Privacy        from "@/pages/Privacy"
import Dashboard      from "@/pages/Dashboard"
import Profile        from "@/pages/Profile"
import Billing        from "@/pages/Billing"
import Marketplace    from "@/pages/Marketplace"
import ProjectDetail  from "@/pages/ProjectDetail"
import RunDetail      from "@/pages/RunDetail"
import Editor         from "@/pages/Editor"
import NotificationDetail from "@/pages/NotificationDetail";
import NotificationList from "@/pages/NotificationList";

import AuthLayout     from "@/layouts/AuthLayout"
import PublicLayout   from "@/layouts/PublicLayout"
import AppLayout      from "@/layouts/AppLayout"
import ProfileLayout  from "@/layouts/ProfileLayout"
import EditorLayout   from "@/layouts/EditorLayout"
import NotFound        from "@/components/router/NotFound"
import ProtectedRoute  from "@/components/router/ProtectedRoute"

// ── Error boundary ─────────────────────────────────────────────────────────

interface EBState { hasError: boolean; error: Error | null }

class RouterErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-4">
            {this.state.error?.message ?? "Unknown error"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.href = "/dashboard"
            }}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Scroll-to-top ──────────────────────────────────────────────────────────

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// ── AppRouter ──────────────────────────────────────────────────────────────

export function AppRouter() {
  return (
    <RouterErrorBoundary>
      <ScrollToTop />
      <Routes>
        {/* Public routes — accessible without authentication */}
        <Route element={<PublicLayout />}>
          <Route path="/"         element={<Landing  />} />
          <Route path="/pricing"  element={<Pricing  />} />
          <Route path="/terms"    element={<Terms    />} />
          <Route path="/privacy"  element={<Privacy  />} />
        </Route>

        {/* Auth pages — centered card + CloudForge brand, no app chrome */}
        <Route element={<AuthLayout />}>
          <Route path="/login"           element={<Login              />} />
          <Route path="/register"        element={<Register           />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPassword      />} />
        </Route>

        {/* Protected app pages — redirect to /login if not authenticated */}
        <Route element={<ProtectedRoute />}>

          {/* Main app shell — includes the main sidebar */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard"               element={<Dashboard    />} />
            <Route path="/marketplace"             element={<Marketplace  />} />
            <Route path="/projects/:projectId"                   element={<ProjectDetail />} />
            <Route path="/projects/:projectId/runs/:runId"     element={<RunDetail />} />
            <Route path="/notifications"           element={<NotificationList />} />
            <Route path="/notifications/:id"       element={<NotificationDetail />} />
          </Route>

          {/* Settings shell — NO main sidebar; Profile renders its own */}
          <Route element={<ProfileLayout />}>
            <Route path="/profile"  element={<Profile />} />
            <Route path="/billing"  element={<Billing />} />
          </Route>

          <Route element={<EditorLayout />}>
            <Route path="/editor/:projectId"          element={<Editor />} />
            <Route path="/projects/:projectId/editor" element={<Editor />} />
          </Route>

        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </RouterErrorBoundary>
  )
}
