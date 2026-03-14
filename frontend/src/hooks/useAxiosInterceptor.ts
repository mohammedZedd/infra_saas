import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { navigationRef } from "@/lib/api"

/**
 * Wires React Router's navigate function into the Axios response interceptor
 * so that 401 responses can redirect to /login without window.location hacks.
 *
 * Must be called ONCE at the app root, inside <BrowserRouter>.
 */
export function useAxiosInterceptor() {
  const navigate = useNavigate()

  useEffect(() => {
    navigationRef.current = navigate
    return () => {
      navigationRef.current = null
    }
  }, [navigate])
}
