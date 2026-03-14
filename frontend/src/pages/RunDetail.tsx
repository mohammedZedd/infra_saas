import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Terminal,
  GitCompare,
  Server,
  RefreshCw,
  Copy,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "../utils/cn"
import { ProjectTabs } from "../components/ProjectTabs"
import { getRunDetails } from "@/lib/api"
import type { TerraformRun } from "../types/project.types"

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle,
    label: "Success",
    className: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
    iconClass: "text-green-600",
  },
  failed: {
    icon: AlertCircle,
    label: "Failed",
    className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
    iconClass: "text-red-600",
  },
  running: {
    icon: Clock,
    label: "Running",
    className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
    iconClass: "text-blue-600",
  },
  cancelled: {
    icon: AlertCircle,
    label: "Cancelled",
    className: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/20",
    iconClass: "text-gray-500",
  },
} as const

const COMMAND_COLORS = {
  plan: "text-purple-700 bg-purple-50 ring-1 ring-inset ring-purple-600/20",
  apply: "text-green-700 bg-green-50 ring-1 ring-inset ring-green-600/20",
  destroy: "text-red-700 bg-red-50 ring-1 ring-inset ring-red-600/20",
  init: "text-blue-700 bg-blue-50 ring-1 ring-inset ring-blue-600/20",
} as const

type Tab = "logs" | "changes" | "resources"

// ── Helper: derive resource changes from plan summary ──────────────────────

function buildChangeLines(run: TerraformRun): { action: "add" | "change" | "destroy"; label: string }[] {
  const lines: { action: "add" | "change" | "destroy"; label: string }[] = []
  const summary = run.planSummary
  if (!summary) return lines
  for (let i = 0; i < summary.add; i++) lines.push({ action: "add", label: `aws_resource.new_${i + 1}` })
  for (let i = 0; i < summary.change; i++) lines.push({ action: "change", label: `aws_resource.existing_${i + 1}` })
  for (let i = 0; i < summary.destroy; i++) lines.push({ action: "destroy", label: `aws_resource.removed_${i + 1}` })
  return lines
}

// ── Component ──────────────────────────────────────────────────────────────

export default function RunDetail() {
  const { projectId, runId } = useParams<{ projectId: string; runId: string }>()
  const navigate = useNavigate()

  // ── Debug: log params on every render ─────────────────────────────────
  console.log("[RunDetail] params:", { projectId, runId })

  const [run, setRun] = useState<TerraformRun | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("logs")
  const [logsCopied, setLogsCopied] = useState(false)

  useEffect(() => {
    console.log("[RunDetail] useEffect fired:", { projectId, runId })

    if (!projectId || !runId) {
      console.warn("[RunDetail] missing params — skipping fetch")
      setError("Missing project or run ID in URL.")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    getRunDetails<TerraformRun>(projectId, runId)
      .then((data) => {
        console.log("[RunDetail] API response:", data)
        setRun(data)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load run"
        console.error("[RunDetail] API error:", err)
        setError(msg)
      })
      .finally(() => setIsLoading(false))
  }, [projectId, runId])

  const handleCopyLogs = () => {
    if (!run?.logs) return
    void navigator.clipboard.writeText(run.logs).then(() => {
      setLogsCopied(true)
      setTimeout(() => setLogsCopied(false), 2000)
    })
  }

  // ── Loading ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="h-8 w-72 rounded bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-200" />
        </div>
      </div>
    )
  }

  if (error !== null || !run) {
    const message = error ?? "Run not found — it may have been deleted or the ID is invalid."
    return (
      <div className="p-6 lg:p-8">
        <button
          onClick={() => navigate(`/projects/${projectId}?tab=runs`)}
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={16} />
          Back to Runs
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto mb-3 text-red-400" size={32} />
          <p className="text-sm font-medium text-red-700">{message}</p>
          <button
            onClick={() => navigate(`/projects/${projectId}?tab=runs`)}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Back to Runs
          </button>
        </div>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.cancelled
  const StatusIcon = statusCfg.icon
  const changeLines = buildChangeLines(run)
  const logLines = (run.logs ?? "No logs available.").split("\n")
  const duration =
    run.completedAt
      ? Math.round((new Date(run.completedAt).getTime() - new Date(run.triggeredAt).getTime()) / 1000)
      : null

  return (
    <div className="p-6 lg:p-8">

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate(`/projects/${projectId}?tab=runs`)}
        className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft size={16} />
        Back to Runs
      </button>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">

          {/* Left: ID + badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                  COMMAND_COLORS[run.command] ?? COMMAND_COLORS.plan
                )}
              >
                {run.command}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  statusCfg.className
                )}
              >
                <StatusIcon size={12} />
                {statusCfg.label}
              </span>
            </div>
            <p className="mt-2 font-mono text-sm text-gray-500">
              Run&nbsp;
              <span className="select-all font-semibold text-gray-800">{run.id}</span>
            </p>
          </div>

          {/* Right: Plan summary */}
          {run.planSummary && (
            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
              <span className="text-sm font-semibold text-green-700">
                +{run.planSummary.add} to add
              </span>
              <span className="text-sm font-semibold text-blue-700">
                ~{run.planSummary.change} to change
              </span>
              <span className="text-sm font-semibold text-red-700">
                -{run.planSummary.destroy} to destroy
              </span>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap gap-6 border-t border-gray-100 pt-4 text-sm text-gray-500">
          <div>
            <span className="font-medium text-gray-700">Triggered by</span>
            <span className="ml-2">{run.triggeredBy}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Started</span>
            <span className="ml-2">{format(new Date(run.triggeredAt), "MMM dd, yyyy 'at' HH:mm:ss")}</span>
          </div>
          {run.completedAt && (
            <div>
              <span className="font-medium text-gray-700">Finished</span>
              <span className="ml-2">{format(new Date(run.completedAt), "MMM dd, yyyy 'at' HH:mm:ss")}</span>
            </div>
          )}
          {duration !== null && (
            <div>
              <span className="font-medium text-gray-700">Duration</span>
              <span className="ml-2">{duration}s</span>
            </div>
          )}
        </div>

        {/* Error message */}
        {run.errorMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{run.errorMessage}</p>
          </div>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">

        {/* Tab bar */}
        <ProjectTabs
          tabs={[
            { key: "logs" as Tab,      label: "Logs",      icon: Terminal },
            { key: "changes" as Tab,   label: "Changes",   icon: GitCompare, badge: changeLines.length },
            { key: "resources" as Tab, label: "Resources", icon: Server },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* ── Logs tab — VS Code style ──────────────────────────────────── */}
        {activeTab === "logs" && (
          <div>
            {/* Terminal title bar */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ backgroundColor: "#1e1e1e", borderBottom: "1px solid #333" }}
            >
              <div className="flex items-center gap-2">
                <Terminal size={13} style={{ color: "#858585" }} />
                <span style={{ color: "#858585", fontSize: "12px", fontFamily: "'Courier New', monospace" }}>
                  TERMINAL &nbsp;·&nbsp; {logLines.length} lines
                </span>
              </div>
              <button
                onClick={handleCopyLogs}
                className="inline-flex items-center gap-1.5 rounded px-2 py-1 transition-colors"
                style={{ color: "#858585", fontSize: "12px" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#d4d4d4")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#858585")}
              >
                {logsCopied ? (
                  <>
                    <CheckCircle size={13} style={{ color: "#4ec9b0" }} />
                    <span style={{ color: "#4ec9b0" }}>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Terminal body */}
            <div
              style={{
                backgroundColor: "#1e1e1e",
                fontFamily: "'Courier New', monospace",
                fontSize: "13px",
                lineHeight: "1.6",
                padding: "16px",
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              {logLines.map((line, i) => {
                // Classify each line — order matters (most specific first)
                let color = "#d4d4d4"
                if (/^\[/.test(line))                      color = "#6a9955" // [timestamp]
                else if (/error:/i.test(line))             color = "#f44747" // Error:
                else if (/warning:/i.test(line))           color = "#ce9178" // Warning:
                else if (/^Plan:|^Apply:/i.test(line))     color = "#569cd6" // Plan: / Apply:
                else if (/^\s*\+|added/i.test(line))       color = "#4ec9b0" // + / added
                else if (/^\s*~|changed/i.test(line))      color = "#dcdcaa" // ~ / changed
                else if (/^\s*-|destroyed/i.test(line))    color = "#f44747" // - / destroyed

                return (
                  <div key={i} style={{ display: "flex", gap: "16px" }}>
                    <span
                      style={{
                        color: "#858585",
                        minWidth: "32px",
                        textAlign: "right",
                        userSelect: "none",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                      {line || " "}
                    </span>
                  </div>
                )
              })}

              {/* Blinking cursor on last line */}
              <div style={{ display: "flex", gap: "16px", marginTop: "2px" }}>
                <span
                  style={{
                    color: "#858585",
                    minWidth: "32px",
                    textAlign: "right",
                    userSelect: "none",
                    flexShrink: 0,
                  }}
                >
                  {logLines.length + 1}
                </span>
                <span className="animate-pulse" style={{ color: "#d4d4d4" }}>▋</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Changes tab ──────────────────────────────────────────────── */}
        {activeTab === "changes" && (
          <div className="p-6">
            {changeLines.length === 0 ? (
              <div className="py-12 text-center">
                <RefreshCw size={28} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No resource changes recorded for this run.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Summary bar */}
                <div className="mb-4 flex gap-4 rounded-lg bg-gray-50 px-4 py-3 text-sm">
                  {run.planSummary && (
                    <>
                      <span className="font-medium text-green-700">+{run.planSummary.add} to add</span>
                      <span className="font-medium text-blue-700">~{run.planSummary.change} to change</span>
                      <span className="font-medium text-red-700">-{run.planSummary.destroy} to destroy</span>
                    </>
                  )}
                </div>
                {changeLines.map((ch, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 font-mono text-sm"
                  >
                    <span
                      className={cn(
                        "w-6 shrink-0 text-center text-base font-bold",
                        ch.action === "add"     ? "text-green-600"
                        : ch.action === "change"  ? "text-blue-600"
                        : "text-red-600"
                      )}
                    >
                      {ch.action === "add" ? "+" : ch.action === "change" ? "~" : "-"}
                    </span>
                    <span className="text-gray-700">{ch.label}</span>
                    <span
                      className={cn(
                        "ml-auto rounded px-2 py-0.5 text-xs font-medium capitalize",
                        ch.action === "add"     ? "bg-green-50 text-green-700"
                        : ch.action === "change"  ? "bg-blue-50 text-blue-700"
                        : "bg-red-50 text-red-700"
                      )}
                    >
                      {ch.action}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Resources tab ────────────────────────────────────────────── */}
        {activeTab === "resources" && (
          <div className="p-6">
            {(!run.planSummary || (run.planSummary.add + run.planSummary.change + run.planSummary.destroy === 0)) ? (
              <div className="py-12 text-center">
                <Server size={28} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No AWS resources were affected by this run.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="mb-4 text-sm text-gray-500">
                  AWS resources affected by this <span className="font-medium capitalize">{run.command}</span> run.
                </p>
                {run.planSummary.add > 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">+</span>
                      <span className="text-sm font-semibold text-green-800">
                        {run.planSummary.add} resource{run.planSummary.add !== 1 ? "s" : ""} to create
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-green-700">
                      These resources will be provisioned in your AWS account.
                    </p>
                  </div>
                )}
                {run.planSummary.change > 0 && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">~</span>
                      <span className="text-sm font-semibold text-blue-800">
                        {run.planSummary.change} resource{run.planSummary.change !== 1 ? "s" : ""} to update
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-blue-700">
                      These resources will be modified in-place without replacement.
                    </p>
                  </div>
                )}
                {run.planSummary.destroy > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-600">-</span>
                      <span className="text-sm font-semibold text-red-800">
                        {run.planSummary.destroy} resource{run.planSummary.destroy !== 1 ? "s" : ""} to destroy
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-red-700">
                      These resources will be permanently removed from your AWS account.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
