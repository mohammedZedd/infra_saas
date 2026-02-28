import { useNavigate } from "react-router-dom"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "../components/ui/Button"
import useAuthStore from "../stores/useAuthStore"

export default function NotFound() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-9xl font-bold text-gray-200">404</p>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-3 max-w-md text-gray-500">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button variant="outline" leftIcon={ArrowLeft} onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button leftIcon={Home} onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}>{isAuthenticated ? "Dashboard" : "Home"}</Button>
      </div>
    </div>
  )
}
