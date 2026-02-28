import { cn } from "../../utils/cn"

interface FeatureCardProps {
  icon: string
  color: string
  title: string
  description: string
}

export default function FeatureCard({ icon, color, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-transparent bg-gray-50 p-8 transition-all duration-300 hover:border-gray-200 hover:bg-white hover:shadow-lg">
      <div className={cn("mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-xl")} style={{ backgroundColor: color }}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  )
}
