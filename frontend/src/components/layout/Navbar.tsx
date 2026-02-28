import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="text-xl font-bold text-gray-900">
          CloudForge
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Features
          </a>
          <a href="#docs" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Docs
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            Sign in
          </Link>
          <Link to="/register" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
