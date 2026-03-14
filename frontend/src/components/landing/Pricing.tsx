import React from "react"
import { Link } from "react-router-dom"
import { Check, Zap } from "lucide-react"
import { PLANS } from "../../constants/pricing"
import { cn } from "../../utils/cn"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlanKey = "free" | "pro" | "team"

interface PricingCardProps {
  planKey: PlanKey
  highlighted?: boolean
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

const CTA_LABEL: Record<PlanKey, string> = {
  free: "Get Started",
  pro: "Upgrade to Pro",
  team: "Contact Sales",
}

const CTA_HREF: Record<PlanKey, string> = {
  free: "/register",
  pro: "/register",
  team: "/register",
}

function PricingCard({ planKey, highlighted = false }: PricingCardProps): React.ReactElement {
  const plan = PLANS[planKey]

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-white p-8 transition-shadow",
        highlighted
          ? "border-blue-500 shadow-xl shadow-blue-100/60"
          : "border-gray-200 shadow-sm hover:shadow-md"
      )}
    >
      {/* "Most Popular" badge */}
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            <Zap className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <p
        className={cn(
          "mb-2 text-sm font-semibold uppercase tracking-widest",
          highlighted ? "text-blue-600" : "text-gray-500"
        )}
      >
        {plan.name}
      </p>

      {/* Price */}
      <div className="mb-1 flex items-end gap-1">
        <span className="text-4xl font-bold tracking-tight text-gray-900">
          {plan.monthlyPrice === 0 ? "Free" : `$${plan.monthlyPrice}`}
        </span>
        {plan.monthlyPrice > 0 && (
          <span className="mb-1.5 text-sm text-gray-400">/month</span>
        )}
      </div>

      {plan.monthlyPrice > 0 && (
        <p className="mb-6 text-xs text-gray-400">
          or ${(plan.yearlyPrice / 12).toFixed(0)}/mo billed annually
        </p>
      )}
      {plan.monthlyPrice === 0 && <p className="mb-6 text-xs text-gray-400">Forever free</p>}

      {/* CTA */}
      <Link
        to={CTA_HREF[planKey]}
        className={cn(
          "mb-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all",
          highlighted
            ? "bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700"
            : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
        )}
      >
        {CTA_LABEL[planKey]}
      </Link>

      {/* Divider */}
      <div className="mb-5 h-px bg-gray-100" />

      {/* Feature list */}
      <ul className="flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                highlighted ? "text-blue-500" : "text-emerald-500"
              )}
            />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export default function Pricing(): React.ReactElement {
  return (
    <section id="pricing" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Pricing
          </p>
          <h2 className="mb-4 text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-gray-500">
            Start free. Scale as your team grows. No hidden fees, no surprise invoices.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          <PricingCard planKey="free" />
          <PricingCard planKey="pro" highlighted />
          <PricingCard planKey="team" />
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-center text-xs text-gray-400">
          All plans include a 14-day free trial of Pro features.
          <a href="mailto:hello@cloudforge.io" className="ml-1 text-blue-600 hover:underline">
            Questions? Contact us.
          </a>
        </p>
      </div>
    </section>
  )
}
