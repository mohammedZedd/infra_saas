import React from "react"
import type { LucideIcon } from "lucide-react"
import {
  MousePointerClick,
  Code2,
  ShieldCheck,
  Rocket,
  GitMerge,
  BarChart3,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: FeatureItem[] = [
  {
    icon: MousePointerClick,
    title: "Visual Canvas",
    description:
      "Drag and drop AWS components onto a shared canvas. Connect services visually and see your architecture take shape in real time.",
  },
  {
    icon: Code2,
    title: "Instant Terraform Export",
    description:
      "Generate production-ready HCL the moment you design. Download or push to Git in one click — no manual coding required.",
  },
  {
    icon: ShieldCheck,
    title: "Built-in Best Practices",
    description:
      "Security rules and AWS Well-Architected checks run automatically. Catch misconfiguration before it ever reaches production.",
  },
  {
    icon: Rocket,
    title: "One-Click Deployments",
    description:
      "Trigger Terraform plan and apply directly from the canvas. Monitor live logs and rollback instantly if anything goes wrong.",
  },
  {
    icon: GitMerge,
    title: "Git Integration",
    description:
      "Push generated code to any GitHub or GitLab repository. Track infrastructure changes the same way you track application code.",
  },
  {
    icon: BarChart3,
    title: "Cost Estimation",
    description:
      "See a live AWS cost estimate as you design. Right-size resources and stay within budget before you commit a single dollar.",
  },
]

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

interface FeatureItemCardProps {
  item: FeatureItem
}

function FeatureItemCard({ item }: FeatureItemCardProps): React.ReactElement {
  const Icon = item.icon
  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <h3 className="mb-2 text-[15px] font-semibold text-gray-900">{item.title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{item.description}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export default function Features(): React.ReactElement {
  return (
    <section id="features" className="border-t border-gray-100 bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Features
          </p>
          <h2 className="mb-4 text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight text-gray-900">
            Everything you need to ship faster
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-gray-500">
            Stop writing boilerplate. Focus on architecture, not syntax —
            CloudForge handles the rest.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureItemCard key={feature.title} item={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
