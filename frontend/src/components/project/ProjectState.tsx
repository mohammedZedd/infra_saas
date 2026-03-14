import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  Play,
  Square,
  RefreshCw,
  MapPin,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import useProjectStore from "@/stores/useProjectStore"
import type { Project, ProjectStatus } from "@/types/project.types"

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionKind = "start" | "stop" | "redeploy"

interface StatusConfig {
  label: string
  className: string
}

interface EventEntry {
  id: string
  timestamp: string
  message: string
  type: "info" | "success" | "error"
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  draft:     { label: "Draft",      className: "bg-gray-100 text-gray-700" },
  active:    { label: "Active",     className: "bg-blue-100 text-blue-700" },
  deploying: { label: "Deploying",  className: "bg-yellow-100 text-yellow-700" },
  deployed:  { label: "Deployed",   className: "bg-green-100 text-green-700" },
  failed:    { label: "Failed",     className: "bg-red-100 text-red-700" },
}

const MOCK_EVENTS: EventEntry[] = [
  { id: "e1", timestamp: "Mar 04, 2026 09:12", message: "Deployment completed successfully.", type: "success" },
  { id: "e2", timestamp: "Mar 04, 2026 09:10", message: "Terraform apply started.", type: "info" },
  { id: "e3", timestamp: "Mar 03, 2026 17:45", message: "Terraform plan completed — 2 to add, 0 to change.", type: "info" },
  { id: "e4", timestamp: "Mar 02, 2026 11:30", message: "Deploy failed: timeout waiting for EC2 instance.", type: "error" },
  { id: "e5", timestamp: "Mar 01, 2026 08:00", message: "Project initialised.", type: "success" },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(raw: string | null | undefined): string {
  if (!raw) return "—"
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

// ─── Status Header ────────────────────────────────────────────────────────────

function StatusHeader({ project }: { project: Project }) {
  const meta: { icon: React.ReactNode; label: string; value: string }[] = [
    {
      icon: <MapPin className="w-3.5 h-3.5" />,
      label: "Region",
      value: project.region,
    },
    {
      icon: <Layers className="w-3.5 h-3.5" />,
      label: "Environment",
      value: project.environment ?? "—",
    },
    {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: "Last deployed",
      value: formatDate(project.last_deployed_at),
    },
  ]

  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{project.name}</h1>
          <p className="mt-1 text-sm text-gray-500 line-clamp-1">{project.description}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {meta.map((m) => (
          <div key={m.label} className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="text-gray-400">{m.icon}</span>
            <span className="font-medium text-gray-700">{m.label}:</span>
            <span>{m.value}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Controls ─────────────────────────────────────────────────────────────────

interface ControlsProps {
  project: Project
  updateProject: (id: string, data: Partial<Project>) => void
}

function Controls({ project, updateProject }: ControlsProps) {
  const [actionLoading, setActionLoading] = useState<ActionKind | null>(null)

  const canStart   = project.status === "draft" || project.status === "failed"
  const canStop    = project.status === "active" || project.status === "deployed"
  const canRedeploy = project.status !== "deploying"

  function runAction(kind: ActionKind, nextStatus: ProjectStatus) {
    if (actionLoading) return
    setActionLoading(kind)
    // Simulate async action — store update only inside the async callback, never during render
    setTimeout(() => {
      updateProject(project.id, { status: nextStatus })
      setActionLoading(null)
    }, 1500)
  }

  const buttons: {
    kind: ActionKind
    label: string
    icon: React.ReactNode
    disabled: boolean
    nextStatus: ProjectStatus
    variant: "primary" | "danger" | "secondary"
  }[] = [
    {
      kind: "start",
      label: "Start",
      icon: <Play className="w-4 h-4" />,
      disabled: !canStart,
      nextStatus: "deploying",
      variant: "primary",
    },
    {
      kind: "stop",
      label: "Stop",
      icon: <Square className="w-4 h-4" />,
      disabled: !canStop,
      nextStatus: "draft",
      variant: "danger",
    },
    {
      kind: "redeploy",
      label: "Redeploy",
      icon: <RefreshCw className="w-4 h-4" />,
      disabled: !canRedeploy,
      nextStatus: "deploying",
      variant: "secondary",
    },
  ]

  const variantClass: Record<"primary" | "danger" | "secondary", string> = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    danger:
      "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    secondary:
      "border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50",
  }

  return (
    <SectionCard>
      <h2 className="text-base font-semibold text-gray-900 mb-4">Controls</h2>
      <div className="flex flex-wrap gap-3">
        {buttons.map(({ kind, label, icon, disabled, nextStatus, variant }) => {
          const isLoading = actionLoading === kind
          return (
            <button
              key={kind}
              type="button"
              disabled={disabled || actionLoading !== null}
              onClick={() => runAction(kind, nextStatus)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClass[variant]}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                icon
              )}
              {isLoading ? `${label}ing…` : label}
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

const EVENT_ICON: Record<EventEntry["type"], React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />,
  error:   <XCircle      className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
  info:    <Info         className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />,
}

function Timeline({ events }: { events: EventEntry[] }) {
  return (
    <SectionCard>
      <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Events</h2>
      <ul className="space-y-3">
        {events.map((ev) => (
          <li key={ev.id} className="flex items-start gap-3">
            {EVENT_ICON[ev.type]}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700">{ev.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">{ev.timestamp}</p>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <XCircle className="mx-auto w-10 h-10 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Project not found</h2>
        <p className="text-sm text-gray-500 mb-6">
          The project you are looking for does not exist or has been deleted.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectState() {
  const { projectId } = useParams<{ projectId: string }>()

  const project     = useProjectStore((s) => s.projects.find((p) => p.id === projectId))
  const updateProject = useProjectStore((s) => s.updateProject)

  // Derive stable event list — replace with API data when backend is ready
  const events = useMemo<EventEntry[]>(() => MOCK_EVENTS, [])

  if (!project) {
    return <NotFound />
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <StatusHeader project={project} />
      <Controls project={project} updateProject={updateProject} />
      <Timeline events={events} />
    </div>
  )
}
