import { Link } from "react-router-dom"
import { Cloud } from "lucide-react"

interface Section {
  heading: string
  body: string
}

const sections: Section[] = [
  {
    heading: "1. Acceptance of Terms",
    body: "By accessing or using CloudForge, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.",
  },
  {
    heading: "2. Use License",
    body: "Permission is granted to temporarily use CloudForge for personal or commercial infrastructure design purposes. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the service materials, use the service for any unlawful purpose, or attempt to reverse engineer any software contained in CloudForge.",
  },
  {
    heading: "3. Account Responsibilities",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify CloudForge immediately of any unauthorized use of your account or any other breach of security.",
  },
  {
    heading: "4. Service Availability",
    body: "CloudForge makes no warranties with respect to the availability or uptime of the service. We reserve the right to modify, suspend, or discontinue the service at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.",
  },
  {
    heading: "5. Limitation of Liability",
    body: "In no event shall CloudForge or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use CloudForge, even if CloudForge has been notified orally or in writing of the possibility of such damage.",
  },
]

function StaticNavbar() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-gray-900">CloudForge</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/login" className="text-gray-500 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 text-white rounded-lg px-4 py-1.5 hover:bg-blue-700 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="text-sm text-gray-400 mt-2">Last updated: January 2025</p>
        <p className="text-sm text-gray-600 leading-relaxed mt-6">
          Please read these Terms of Service carefully before using the CloudForge
          platform operated by CloudForge, Inc. Your access to and use of the
          service is conditioned on your acceptance of and compliance with these
          terms.
        </p>

        {sections.map((s) => (
          <div key={s.heading}>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-8">
              {s.heading}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
          </div>
        ))}

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Questions about the Terms of Service?{" "}
            <a
              href="mailto:legal@cloudforge.io"
              className="text-blue-600 hover:underline"
            >
              Contact us
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
