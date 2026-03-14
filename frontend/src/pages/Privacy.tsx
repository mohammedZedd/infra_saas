import { Link } from "react-router-dom"
import { Cloud } from "lucide-react"

interface Section {
  heading: string
  body: string
}

const sections: Section[] = [
  {
    heading: "1. Information We Collect",
    body: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes your name, email address, billing information, and usage data related to your infrastructure designs.",
  },
  {
    heading: "2. How We Use Your Information",
    body: "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, respond to your comments and questions, and send you information about products and services.",
  },
  {
    heading: "3. Information Sharing",
    body: "We do not share your personal information with third parties except as described in this policy. We may share your information with vendors and service providers that support our business, such as cloud infrastructure providers, payment processors, and analytics services.",
  },
  {
    heading: "4. Data Security",
    body: "We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. All data is encrypted in transit using TLS and at rest using AES-256 encryption.",
  },
  {
    heading: "5. Your Rights",
    body: "You have the right to access, update, or delete your personal information at any time through your account settings. You may also contact us directly to request access to, correction of, or deletion of any personal information we hold about you.",
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

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mt-2">Last updated: January 2025</p>
        <p className="text-sm text-gray-600 leading-relaxed mt-6">
          CloudForge, Inc. ("CloudForge", "we", "us", or "our") is committed to
          protecting your privacy. This Privacy Policy explains how we collect,
          use, and share information about you when you use our services.
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
            Questions about our Privacy Policy?{" "}
            <a
              href="mailto:privacy@cloudforge.io"
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
