import { Link } from "react-router-dom"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  footerText: string
  footerLinkText: string
  footerLinkTo: string
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 text-xl font-bold text-gray-900">
            <img src="/images/logo.svg" alt="CloudForge" className="h-9 w-9" />
            CloudForge
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-200/50">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 text-center text-sm text-gray-500">
            {footerText}{" "}
            <Link to={footerLinkTo} className="font-medium text-indigo-600 hover:text-indigo-500">
              {footerLinkText}
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-500">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
