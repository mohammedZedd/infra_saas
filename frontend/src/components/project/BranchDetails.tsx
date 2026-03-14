import type { GitBranch, GitActivityLog, TimelineNode } from "../../types/git"
import { Shield, ArrowUp, ArrowDown, Clock, GitBranch as GitBranchIcon, RefreshCw } from "lucide-react"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { cn } from "../../utils/cn"

interface BranchDetailsProps {
  branch: GitBranch | undefined
  currentBranch: string
  branchSync: Record<string, { ahead: number; behind: number }>
  activityByBranch: Record<string, GitActivityLog[]>
  onSwitchBranch: (name: string) => void
  onCreateBranchFrom: (base: string) => void
  onPull: () => void
  onPublish: () => void
  isSyncing: boolean
  selectedNode?: TimelineNode | null
}

const ACTIVITY_LABELS: Record<string, string> = {
  push: "Published",
  pull: "Pulled",
  checkout: "Switched to",
  commit: "Committed",
  connect: "Connected",
  disconnect: "Disconnected",
  "branch-create": "Created branch",
  "branch-delete": "Deleted branch",
  "pull-request": "Pull request",
}

function relTime(iso: string | null | undefined) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

export default function BranchDetails({
  branch, currentBranch, branchSync, activityByBranch,
  onSwitchBranch, onCreateBranchFrom, onPull, onPublish, isSyncing,
  selectedNode,
}: BranchDetailsProps) {
  if (!branch) {
    return (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
        <GitBranchIcon size={28} className="mb-3 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">Select a branch</p>
        <p className="mt-1 text-xs text-gray-400">Click any branch in the timeline to see details</p>
      </div>
    )
  }

  const isCurrent = branch.name === currentBranch
  const sync = branchSync[branch.name] ?? { ahead: 0, behind: 0 }
  const activity = (activityByBranch[branch.name] ?? []).slice().reverse().slice(0, 3)

  // Primary action
  let primaryLabel = "Switch to this branch"
  let primaryAction = () => onSwitchBranch(branch.name)
  let primaryDisabled = false
  if (isCurrent) {
    if (sync.ahead > 0) {
      primaryLabel = isSyncing ? "Publishing…" : `Publish ${sync.ahead} change${sync.ahead !== 1 ? "s" : ""}`
      primaryAction = onPublish
    } else if (sync.behind > 0) {
      primaryLabel = isSyncing ? "Pulling…" : `Pull ${sync.behind} update${sync.behind !== 1 ? "s" : ""}`
      primaryAction = onPull
    } else {
      primaryLabel = "Everything synced"
      primaryDisabled = true
    }
  }

  const btype = (branch.branchType ?? "feature") as "main" | "staging" | "feature"
  const typeColors = { main: "blue", staging: "green", feature: "purple" } as const
  const typeBadge = typeColors[btype] ?? "gray"

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Selected point */}
      {selectedNode && (
        <div className="border-b border-gray-100 px-5 py-3 bg-blue-50/50">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Selected point</p>
          <p className="text-xs text-gray-700">Branch: <span className="font-mono">{selectedNode.branchName}</span></p>
          <p className="text-xs text-gray-700">Date: {new Date(selectedNode.date).toLocaleDateString()}</p>
          {selectedNode.label && <p className="text-xs text-gray-500 mt-0.5">{selectedNode.label}</p>}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-gray-900">{branch.name}</span>
          {isCurrent && <Badge variant="blue" size="sm">Current</Badge>}
          {branch.isProtected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
              <Shield size={10} /> Protected
            </span>
          )}
          <Badge variant={typeBadge} size="sm">{btype}</Badge>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
          {branch.parentBranch && (
            <>
              <span className="font-medium text-gray-500">Based on</span>
              <span className="font-mono text-gray-700">{branch.parentBranch}</span>
            </>
          )}
          <span className="font-medium text-gray-500">Ahead / Behind</span>
          <span className="flex items-center gap-2 text-gray-700">
            <span className={cn("flex items-center gap-0.5", sync.ahead > 0 ? "text-blue-600" : "text-gray-400")}>
              <ArrowUp size={10} />{sync.ahead}
            </span>
            <span className={cn("flex items-center gap-0.5", sync.behind > 0 ? "text-amber-600" : "text-gray-400")}>
              <ArrowDown size={10} />{sync.behind}
            </span>
          </span>
          {branch.lastPublishAt && (
            <>
              <span className="font-medium text-gray-500">Last published</span>
              <span className="text-gray-700">{relTime(branch.lastPublishAt)}</span>
            </>
          )}
          {branch.lastPullAt && (
            <>
              <span className="font-medium text-gray-500">Last pulled</span>
              <span className="text-gray-700">{relTime(branch.lastPullAt)}</span>
            </>
          )}
        </div>

        {/* Recent activity */}
        {activity.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <Clock size={10} /> Recent activity
            </p>
            <div className="space-y-2">
              {activity.map(entry => (
                <div key={entry.id} className="flex items-start gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
                  <RefreshCw size={10} className="mt-0.5 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700">{ACTIVITY_LABELS[entry.type] ?? entry.type}</p>
                    <p className="truncate text-[11px] text-gray-500">{entry.message}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[11px] text-gray-400">{relTime(entry.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary action */}
        <Button
          variant={isCurrent && !primaryDisabled ? "primary" : (primaryDisabled ? "ghost" : "secondary")}
          fullWidth
          disabled={primaryDisabled || isSyncing}
          onClick={primaryAction}
          size="md"
        >
          {primaryLabel}
        </Button>

        {/* Secondary */}
        <button
          onClick={() => onCreateBranchFrom(branch.name)}
          className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
        >
          + Create branch from <span className="font-semibold">{branch.name}</span>
        </button>
      </div>
    </div>
  )
}

