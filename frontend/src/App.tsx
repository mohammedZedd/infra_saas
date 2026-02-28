import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { ProtectedRoute } from "./components/layout/ProtectedRoute"
import { CreateProjectModal } from "./components/modals/CreateProjectModal"
import { EditProjectModal } from "./components/modals/EditProjectModal"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Pricing from "./pages/Pricing"
import NotFound from "./pages/NotFound"

import Dashboard from "./pages/Dashboard"
import ProjectDetail from "./pages/ProjectDetail"
import Editor from "./pages/Editor"
import Profile from "./pages/Profile"
import Billing from "./pages/Billing"
import Marketplace from "./pages/Marketplace"

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #fecaca",
            borderLeft: "4px solid #ef4444",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 8px 32px rgba(239, 68, 68, 0.15)",
            maxWidth: "420px",
            padding: "12px 16px",
          },
          error: {
            icon: "❌",
            style: {
              background: "#ffffff",
              color: "#0f172a",
              borderLeft: "4px solid #ef4444",
            },
          },
          success: {
            icon: "✅",
            style: {
              background: "#ffffff",
              color: "#0f172a",
              borderLeft: "4px solid #22c55e",
              border: "1px solid #bbf7d0",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/pricing" element={<Pricing />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        <Route path="/editor/:projectId" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
        <Route path="/projects/:projectId/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <CreateProjectModal />
      <EditProjectModal />
    </BrowserRouter>
  )
}

export default App
