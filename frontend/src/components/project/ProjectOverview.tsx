import React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  Box, Calendar, CheckCircle2, Clock, Cloud,
  Database, Edit, FileText,
  GitBranch, Globe, Info, Loader2, MapPin,
  Rocket, Shield,
  XCircle, Zap, ExternalLink, Share2, Server, Archive,
} from "lucide-react"
import type { Node, Edge } from "@xyflow/react"
import useAuthStore from "@/stores/useAuthStore"
import type { TerraformRun } from "../../types/project.types"
import { ReactFlow, Background, BackgroundVariant, ReactFlowProvider } from "@xyflow/react"
import { nodeTypes } from "../canvas/nodes/nodeTypes"

// ── Helpers ────────────────────────────────────────────────────────────────────

// Activité factice pour la démo (à remplacer par des données dynamiques)
const ACTIVITY = [
  { id: "a1", type: "deploy",   message: "Deployed infrastructure", user: "Alice", timestamp: "2026-03-13T10:00:00Z" },
  { id: "a2", type: "plan",     message: "Planned changes",        user: "Bob",   timestamp: "2026-03-12T15:30:00Z" },
  { id: "a3", type: "edit",     message: "Edited variables",       user: "Alice", timestamp: "2026-03-12T12:00:00Z" },
  { id: "a4", type: "security", message: "Updated IAM policy",     user: "Eve",   timestamp: "2026-03-11T09:45:00Z" },
  { id: "a5", type: "git",      message: "Pushed to main — a3f9b2c", user: "Current User", timestamp: "2025-01-20T12:45:00Z" },
];

// Valeur factice pour Project Info (à remplacer par des données dynamiques)
const PROJ = {
  region: "us-east-1",
  provider: "aws",
  createdAt: "2025-01-01T12:00:00Z",
  updatedAt: "2026-03-10T09:00:00Z",
  nodeCount: 8,
  edgeCount: 4,
};

// Valeurs factices pour la démo (à remplacer par des props ou données dynamiques)
const COST_TOTAL = 249.50;
const COST_PREV = 200.00;
const COST_ITEMS = [
  { icon: "server", service: "EC2", count: 2, cost: 120.00 },
  { icon: "database", service: "RDS", count: 1, cost: 60.00 },
  { icon: "archive", service: "S3", count: 3, cost: 40.00 },
  { icon: "network", service: "VPC", count: 1, cost: 20.00 },
  { icon: "zap", service: "Lambda", count: 4, cost: 6.50 },
  { icon: "globe", service: "CloudFront", count: 1, cost: 3.00 },
];

function getRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours   = Math.floor(diff / 3600000)
  const days    = Math.floor(diff / 86400000)
  if (minutes < 1)  return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24)   return `${hours}h ago`
  return `${days}d ago`
}

function formatCost(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(amount)
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}



// ── Service icons ──────────────────────────────────────────────────────────────

const SVC_BG: Record<string, string> = {
  server:   "bg-orange-50 text-orange-500",
  database: "bg-blue-50 text-blue-500",
  archive:  "bg-green-50 text-green-500",
  network:  "bg-purple-50 text-purple-500",
  zap:      "bg-yellow-50 text-yellow-500",
  globe:    "bg-pink-50 text-pink-500",
}

function SvcIcon({ icon, cls = "w-4 h-4" }: { icon: string; cls?: string }) {
  switch (icon) {
    case "server":   return <Server   className={cls} />
    case "database": return <Database className={cls} />
    case "archive":  return <Archive  className={cls} />
    case "network":  return <Share2   className={cls} />
    case "zap":      return <Zap      className={cls} />
    case "globe":    return <Globe    className={cls} />
    default:         return <Box      className={cls} />
  }
}

// ── Activity icons ─────────────────────────────────────────────────────────────

function ActIcon({ type }: { type: string }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center"
  switch (type) {
    case "deploy":   return <div className={`${base} bg-green-50`}> <Rocket    className="w-4 h-4 text-green-600"  /></div>
    case "edit":     return <div className={`${base} bg-blue-50`}>  <Edit      className="w-4 h-4 text-blue-600"   /></div>
    case "plan":     return <div className={`${base} bg-purple-50`}><FileText  className="w-4 h-4 text-purple-600" /></div>
    case "security": return <div className={`${base} bg-yellow-50`}><Shield    className="w-4 h-4 text-yellow-600" /></div>
    case "git":      return <div className={`${base} bg-gray-100`}> <GitBranch className="w-4 h-4 text-gray-600"  /></div>
    default:         return <div className={`${base} bg-gray-100`}> <Box       className="w-4 h-4 text-gray-500"  /></div>
  }
}

// ── ArchNode ───────────────────────────────────────────────────────────────────

function ArchNode({
  label, Icon, delay,
}: {
  label: string
  Icon: React.ComponentType<{ className?: string }>
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-sm text-xs font-medium text-gray-700 flex items-center gap-1.5 relative"
    >
      <Icon className="w-3 h-3 text-gray-500" />
      {label}
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 absolute -top-0.5 -right-0.5" />
    </motion.div>
  )
}

// ── DestroyConfirmModal ────────────────────────────────────────────────────────

function DestroyConfirmModal({
  onCancel,
  onConfirm,
  isTriggering,
}: {
  onCancel: () => void
  onConfirm: () => Promise<void>
  isTriggering: boolean
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Confirm Destroy</h2>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          This will destroy <strong>ALL</strong> infrastructure resources in this project.
        </p>
        <p className="text-sm text-red-600 font-medium mb-6">
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isTriggering}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isTriggering}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isTriggering && <Loader2 className="w-4 h-4 animate-spin" />}
            Destroy
          </button>
        </div>
      </div>
    </div>
  )
}


// ── Architecture Card ──────────────────────────────────────────────────────────

function ArchitectureCard({ onNavigateToEditor, nodes, edges }: { onNavigateToEditor: () => void; nodes: Node[]; edges: Edge[] }) {
  const isEmpty = nodes.length === 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Architecture</h3>
        <button
          onClick={onNavigateToEditor}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          Open editor <ExternalLink className="w-4 h-4" />
        </button>
      </div>
      <div style={{ height: 400, position: "relative" }}>
        {isEmpty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-center">
            <p className="text-sm font-medium text-gray-500">No architecture designed yet</p>
            <button onClick={onNavigateToEditor} className="mt-3 text-sm text-blue-600 hover:underline">
              Open the editor to start building →
            </button>
          </div>
        ) : (
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            fitView
            fitViewOptions={{ padding: 0.2, minZoom: 0.3, maxZoom: 1 }}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
              style: { stroke: "#94A3B8", strokeWidth: 2, strokeDasharray: "5,5" },
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#94a3b8" />
          </ReactFlow>
        </ReactFlowProvider>
        )}
      </div>
    </div>
  )
}

// ── Last Run Card (real runs data) ─────────────────────────────────────────────

const RUN_STATUS_COLOR: Record<string, string> = {
  success:   "bg-green-50 border-green-200 text-green-800",
  failed:    "bg-red-50 border-red-200 text-red-800",
  running:   "bg-blue-50 border-blue-200 text-blue-800",
  cancelled: "bg-gray-100 border-gray-200 text-gray-700",
}

const RUN_STATUS_ICON: Record<string, React.ReactNode> = {
  success:   <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />,
  failed:    <XCircle      className="w-5 h-5 text-red-600   flex-shrink-0" />,
  running:   <Loader2      className="w-5 h-5 text-blue-600  flex-shrink-0 animate-spin" />,
  cancelled: <Clock        className="w-5 h-5 text-gray-500  flex-shrink-0" />,
}

function LastRunCard({
  onNavigateToRuns,
  runs,
}: {
  onNavigateToRuns: () => void
  runs: TerraformRun[]
}) {
  const latest = runs.length > 0
    ? [...runs].sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())[0]
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Last Run</h3>
        <button onClick={onNavigateToRuns} className="text-xs text-blue-600 hover:underline">
          View all runs &rarr;
        </button>
      </div>

      {!latest ? (
        <div className="text-sm text-gray-500 py-4 text-center">
          No runs yet — trigger a plan to get started.
        </div>
      ) : (
        <>
          <div className={`border rounded-lg p-3 mb-4 flex items-center gap-3 ${RUN_STATUS_COLOR[latest.status] ?? RUN_STATUS_COLOR.cancelled}`}>
            {RUN_STATUS_ICON[latest.status] ?? RUN_STATUS_ICON.cancelled}
            <span className="text-sm font-medium capitalize">
              {latest.command} {latest.status === "running" ? "in progress…" : latest.status}
            </span>
            {latest.completedAt && (
              <span className="text-xs ml-auto whitespace-nowrap opacity-70">
                {formatDuration(
                  Math.round(
                    (new Date(latest.completedAt).getTime() - new Date(latest.triggeredAt).getTime()) / 1000
                  )
                )}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Command</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{latest.command}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Triggered by</p>
              <p className="text-sm font-medium text-gray-900 truncate">{latest.triggeredBy}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Started</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(latest.triggeredAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Run ID</p>
              <p className="text-xs font-mono text-gray-600 bg-gray-100 rounded px-1.5 py-0.5 inline-block">
                {latest.id.slice(0, 8)}
              </p>
            </div>
          </div>

          {latest.planSummary && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-100  text-green-700  rounded-full px-2 py-0.5">+{latest.planSummary.add} added</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5">~{latest.planSummary.change} changed</span>
              <span className="text-xs bg-red-50    text-red-600    rounded-full px-2 py-0.5">-{latest.planSummary.destroy} destroyed</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Cost Card ──────────────────────────────────────────────────────────────────

function CostCard() {
  const pct = ((COST_TOTAL - COST_PREV) / COST_PREV) * 100
  const up  = pct > 0
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center mb-4">
        <h3 className="text-base font-semibold text-gray-900">Cost Estimate</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{formatCost(COST_TOTAL)}/mo</span>
          <span className={`text-xs rounded-full px-2 py-0.5 border ${up ? "text-red-500 bg-red-50 border-red-100" : "text-green-600 bg-green-50 border-green-100"}`}>
            {up ? "+" : ""}{pct.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {COST_ITEMS.map((item, i) => (
          <div key={item.service} className="flex items-center gap-3 py-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${SVC_BG[item.icon] ?? "bg-gray-50 text-gray-500"}`}>
              <SvcIcon icon={item.icon} cls="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.service}</p>
              <p className="text-xs text-gray-400">{item.count} {item.count === 1 ? "instance" : "instances"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{formatCost(item.cost)}</p>
              <div className="bg-gray-100 rounded-full h-1 w-16 mt-1 overflow-hidden">
                <motion.div
                  className="bg-blue-600 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.cost / COST_TOTAL) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Info className="w-3 h-3" />Estimates based on AWS us-east-1 pricing
        </p>
        <button className="text-xs text-blue-600 hover:underline">View full breakdown &rarr;</button>
      </div>
    </div>
  )
}

// ── Project Info Card ──────────────────────────────────────────────────────────

function ProjectInfoCard({ projectId }: { projectId: string }) {
  const rows = [
    { label: "Region",   value: PROJ.region,                     icon: <MapPin    className="w-4 h-4 text-gray-400" /> },
    { label: "Provider", value: PROJ.provider.toUpperCase(),     icon: <Cloud     className="w-4 h-4 text-blue-500" /> },
    { label: "Created",  value: formatDate(PROJ.createdAt),      icon: <Calendar  className="w-4 h-4 text-gray-400" /> },
    { label: "Updated",  value: getRelativeTime(PROJ.updatedAt), icon: <Clock     className="w-4 h-4 text-gray-400" /> },
    { label: "Nodes",    value: `${PROJ.nodeCount} nodes`,       icon: <Box       className="w-4 h-4 text-gray-400" /> },
    { label: "Edges",    value: `${PROJ.edgeCount} connections`, icon: <GitBranch className="w-4 h-4 text-gray-400" /> },
  ]
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4" data-project-id={projectId}>
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Project Info</p>
      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2 min-w-0">
            {r.icon}
            <div className="min-w-0">
              <p className="text-xs text-gray-400">{r.label}</p>
              <p className="text-xs text-gray-600 font-medium truncate">{r.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


// ── Activity Feed ──────────────────────────────────────────────────────────────

function ActivityFeed({ currentUserName }: { currentUserName: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center">
        <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-xs text-blue-600 hover:underline ml-auto">View all &rarr;</button>
      </div>
      {ACTIVITY.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.35, ease: "easeOut" }}
          className="px-5 py-4 border-b border-gray-50 last:border-0 flex gap-3"
        >
          <div className="flex flex-col items-center">
            <ActIcon type={item.type} />
            {i < ACTIVITY.length - 1 && (
              <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[16px]" />
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <p className="text-sm text-gray-900">{item.message}</p>
            <p className="text-xs text-gray-400 mt-0.5">by {item.user === "Current User" ? currentUserName : item.user}</p>
          </div>
          <p className="text-xs text-gray-400 whitespace-nowrap pt-0.5">{getRelativeTime(item.timestamp)}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ── ProjectOverview ────────────────────────────────────────────────────────────

interface ProjectOverviewProps {
  projectId?: string
  onNavigateToEditor: () => void
  onNavigateToRuns: () => void
  onTriggerPlan: () => Promise<void>
  onTriggerApply: () => Promise<void>
  onTriggerDestroy: () => Promise<void>
  isTriggering: boolean
  runs: TerraformRun[]
  onRefreshRuns: () => void
  architectureNodes: Node[]
  architectureEdges: Edge[]
}

export default function ProjectOverview({
  projectId,
  onNavigateToEditor,
  onNavigateToRuns,
  onTriggerPlan,
  onTriggerApply,
  onTriggerDestroy,
  isTriggering,
  runs,
  onRefreshRuns,
  architectureNodes,
  architectureEdges,
}: ProjectOverviewProps) {
  const user = useAuthStore((s) => s.user)
  const currentUserName = user?.name?.trim() || "Unknown User"
  const [showDestroyModal, setShowDestroyModal] = useState(false)


  // Auto-refresh every 3s while any run is still "running"
  useEffect(() => {
    const hasRunning = runs.some((r) => r.status === "running")
    if (!hasRunning) return;
    const interval = setInterval(() => {
      onRefreshRuns();
    }, 3000);
    return () => clearInterval(interval);
  }, [runs, onRefreshRuns]);

  function handleDestroyConfirm() {
    return onTriggerDestroy().then(() => setShowDestroyModal(false));
  }

  return (
    <div className="p-6">
      {showDestroyModal && (
        <DestroyConfirmModal
          onCancel={() => setShowDestroyModal(false)}
          onConfirm={handleDestroyConfirm}
          isTriggering={isTriggering}
        />
      )}

      {/* Layout 2 lignes, 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Colonne gauche : Architecture pleine hauteur */}
        <div className="flex flex-col min-h-0">
          <ArchitectureCard
            onNavigateToEditor={onNavigateToEditor}
            nodes={architectureNodes}
            edges={architectureEdges}
          />
        </div>

        {/* Colonne droite : Project Info + Last Run empilés */}
        <div className="flex flex-col gap-6">
          <ProjectInfoCard projectId={projectId ?? ""} />
          <LastRunCard onNavigateToRuns={onNavigateToRuns} runs={runs} />
        </div>

        {/* LIGNE 2 */}
        <div>
          <CostCard />
        </div>
        <div>
          <ActivityFeed currentUserName={currentUserName} />
        </div>
      </div>
    </div>
  );
}
