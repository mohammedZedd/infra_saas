import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Sparkles } from "lucide-react"

export default function CTA(): React.ReactElement {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-2xl bg-blue-50 px-8 py-16 text-center md:px-16">
          {/* Icon */}
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>

          {/* Headline */}
          <h2 className="mb-4 text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight text-gray-900">
            Ready to stop writing Terraform by hand?
          </h2>

          {/* Subtext */}
          <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-gray-500">
            Join hundreds of teams that design, validate, and deploy cloud infrastructure
            visually — with zero boilerplate.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300"
            >
              Start building now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-7 py-3.5 text-sm font-semibold text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-50/60"
            >
              See pricing
            </a>
          </div>

          {/* Fine print */}
          <p className="mt-5 text-xs text-gray-400">
            No credit card required · Free plan available · Cancel any time
          </p>
        </div>
      </div>
    </section>
  )
}
