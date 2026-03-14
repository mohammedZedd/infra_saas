import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Cloud, MapPin } from "lucide-react"
import useAuthStore from "@/stores/useAuthStore"

export default function NotFound() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-10">
        <Cloud className="w-6 h-6 text-blue-600" />
        <span className="font-bold text-gray-900 text-lg">CloudForge</span>
      </Link>

      {/* Illustration */}
      <MapPin className="w-20 h-20 text-gray-200 mx-auto mb-6" />

      {/* 404 */}
      <motion.p
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="text-8xl font-black text-gray-200 leading-none select-none"
      >
        404
      </motion.p>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mt-4">
        Page not found
      </h1>

      {/* Description */}
      <p className="text-sm text-gray-500 mt-2 max-w-sm text-center">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8">
        <button
          onClick={() => navigate(-1)}
          className="border border-gray-300 text-gray-700 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Go back
        </button>
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {isAuthenticated ? "Go to Dashboard" : "Go to Home"}
        </Link>
      </div>
    </motion.div>
  )
}
