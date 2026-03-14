import React from "react"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FeatureCardProps {
  /** Any React icon component, e.g. a Lucide icon: `<Cloud className="h-5 w-5" />` */
  icon: React.ReactNode
  /** Feature headline */
  title: string
  /** Short supporting description */
  description: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      {/* Icon container */}
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
    </div>
  )
}
