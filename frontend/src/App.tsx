import { BrowserRouter } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AppRouter } from "@/router"
import { useAxiosInterceptor } from "@/hooks/useAxiosInterceptor"
import { CreateProjectModal } from "@/components/modals/CreateProjectModal"
import AuthGate from "@/components/auth/AuthGate"

// Must be rendered inside BrowserRouter so useAxiosInterceptor (useNavigate)
// can access the router context.
function AppContent() {
  useAxiosInterceptor()

  return (
    <>
      <AppRouter />
      <CreateProjectModal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#111827",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: "14px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          },
          success: {
            iconTheme: { primary: "#2563EB", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#EF4444", secondary: "#fff" },
          },
        }}
      />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <AppContent />
      </AuthGate>
    </BrowserRouter>
  )
}
