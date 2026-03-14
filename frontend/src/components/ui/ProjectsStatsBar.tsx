import { useMemo } from "react"
import useProjectStore from "../../stores/useProjectStore"

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Read-only horizontal statistics bar.
 * Reads projects from the store and computes stats with useMemo.
 * No store writes, no side effects.
 */
export default function ProjectsStatsBar() {
  const projects = useProjectStore((state) => state.projects)

  const { total, active, deployed, failed } = useMemo(() => ({
    total:    projects.length,
    active:   projects.filter((p) => p.status === "active" || p.status === "deploying").length,
    deployed: projects.filter((p) => p.status === "deployed").length,
    failed:   projects.filter((p) => p.status === "failed").length,
  }), [projects])

  const stats: { label: string; value: number; accent?: string }[] = [
    { label: "Total Projects",  value: total    },
    { label: "Active",          value: active,   accent: "text-blue-600"  },
    { label: "Deployed",        value: deployed, accent: "text-green-600" },
    { label: "Failed",          value: failed,   accent: failed > 0 ? "text-red-500" : undefined },
  ]

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      {stats.map(({ label, value, accent }) => (
        <div
          key={label}
          className="flex min-w-[120px] flex-col rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
        >
          <span className="text-sm text-gray-500">{label}</span>
          <span className={`mt-1 text-2xl font-semibold ${accent ?? "text-gray-900"}`}>
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}
