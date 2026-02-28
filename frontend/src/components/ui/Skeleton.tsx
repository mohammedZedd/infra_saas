import { cn } from "../../utils/cn"

export interface SkeletonProps {
  className?: string
  variant?: "text" | "rect" | "circle"
  lines?: number
}

export function Skeleton({ className, variant = "rect", lines = 1 }: SkeletonProps) {
  const base = "bg-gray-200 rounded-lg animate-pulse"

  if (variant === "circle") {
    return <div aria-hidden="true" className={cn(base, "rounded-full", className)} />
  }

  if (variant === "text") {
    return (
      <div aria-hidden="true" className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={cn(base, "h-4", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full", className)} />
        ))}
      </div>
    )
  }

  return <div aria-hidden="true" className={cn(base, className)} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton variant="circle" className="h-10 w-10" />
        <div className="flex-1">
          <Skeleton variant="text" className="mb-1 h-4 w-1/3" />
          <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton variant="text" lines={2} />
      <div className="mt-4 flex gap-2">
        <Skeleton variant="rect" className="h-6 w-16 rounded-full" />
        <Skeleton variant="rect" className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

export default Skeleton
