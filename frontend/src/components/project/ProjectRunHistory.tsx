import { useState, useMemo } from "react"
import { format } from "date-fns"
import { CheckCircle, AlertCircle, Clock, ChevronRight } from "lucide-react"
import { cn } from "../../utils/cn"

export interface TerraformRun {
  id: string
  projectId: string
  command: "plan" | "apply" | "destroy" | "init"
  status: "success" | "failed" | "running" | "cancelled"
  triggeredBy: string
  triggeredAt: string
  completedAt?: string
  planSummary?: {
    add: number
    change: number
    destroy: number
  }
  errorMessage?: string
  logUrl?: string
}

interface ProjectRunHistoryProps {
  projectId?: string // optional because sometimes we just render runs list
  runs: TerraformRun[]
  onViewDetails?: (runId: string) => void
}

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Success",
  },
  failed: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Failed",
  },
  running: {
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Running",
  },
  cancelled: {
    icon: AlertCircle,
    color: "text-gray-600",
    bg: "bg-gray-50",
    label: "Cancelled",
  },
}

const COMMAND_COLORS = {
  plan: "text-purple-700 bg-purple-50",
  apply: "text-green-700 bg-green-50",
  destroy: "text-red-700 bg-red-50",
  init: "text-blue-700 bg-blue-50",
}

export function ProjectRunHistory({
  runs,
  onViewDetails,
}: ProjectRunHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TerraformRun
    direction: "asc" | "desc"
  } | null>(null)

  const sortedFilteredRuns = useMemo(() => {
    let result = runs

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase()
      result = result.filter((r) =>
        r.id.toLowerCase().includes(term) ||
        r.triggeredBy.toLowerCase().includes(term) ||
        r.command.toLowerCase().includes(term)
      )
    }

    if (sortConfig) {
      const { key, direction } = sortConfig
      result = [...result].sort((a, b) => {
        let aVal: any = a[key]
        let bVal: any = b[key]

        if (aVal === undefined) return 1
        if (bVal === undefined) return -1

        if (typeof aVal === "string") {
          aVal = aVal.toLowerCase()
          bVal = (bVal as string).toLowerCase()
        }

        if (aVal < bVal) return direction === "asc" ? -1 : 1
        if (aVal > bVal) return direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [runs, searchTerm, sortConfig])

  const requestSort = (key: keyof TerraformRun) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  if (sortedFilteredRuns.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
        <Clock size={32} className="mx-auto mb-3 text-gray-400" />
        <p className="text-sm font-medium text-gray-900">No runs yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Terraform runs will appear here once you deploy your infrastructure.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search runs…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {[
                { label: "ID", key: "id" },
                { label: "Command", key: "command" },
                { label: "Status", key: "status" },
                { label: "Summary", key: "planSummary" },
                { label: "Triggered By", key: "triggeredBy" },
                { label: "Date", key: "triggeredAt" },
              ].map((col) => {
                const active = sortConfig?.key === col.key
                const direction = active ? sortConfig?.direction : undefined
                return (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left font-semibold text-gray-900 cursor-pointer select-none"
                    onClick={() => requestSort(col.key as keyof TerraformRun)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {active && (
                        <span className="text-xs">
                          {direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </span>
                  </th>
                )
              })}
              <th className="px-6 py-3 text-left font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedFilteredRuns.map((run) => {
              const statusConfig = STATUS_CONFIG[run.status]
              const StatusIcon = statusConfig.icon

              return (
                <tr key={run.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {run.id.slice(0, 8)}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-block rounded-md px-2.5 py-1 text-xs font-medium capitalize",
                        COMMAND_COLORS[run.command]
                      )}
                    >
                      {run.command}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon size={16} className={statusConfig.color} />
                      <span className={cn("font-medium", statusConfig.color)}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {run.planSummary ? (
                      <div className="flex gap-3 text-xs">
                        <span className="text-green-700">
                          +{run.planSummary.add}
                        </span>
                        <span className="text-blue-700">
                          ~{run.planSummary.change}
                        </span>
                        <span className="text-red-700">
                          -{run.planSummary.destroy}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{run.triggeredBy}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {format(new Date(run.triggeredAt), "MMM dd, yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewDetails?.(run.id)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      View Details
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProjectRunHistory
