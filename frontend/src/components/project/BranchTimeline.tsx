import type { GitBranch, TimelineNode, GitFilters } from "../../types/git"
import { GitBranch as GitBranchIcon, Plus } from "lucide-react"
import { cn } from "../../utils/cn"

interface BranchTimelineProps {
  branches: GitBranch[]
  currentBranch: string
  selectedBranch: string
  onSelectBranch: (name: string) => void
  onCreateBranch: () => void
  timelineNodes: TimelineNode[]
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
  filters: GitFilters
}

type BType = "main" | "staging" | "feature"

const VW = 640
const ROW_H = 76
const PAD = { t: 38, b: 36, l: 48, r: 20 }
const NR = 9
const TW = 2.5

const TC: Record<BType, string> = { main: "#BFDBFE", staging: "#A7F3D0", feature: "#DDD6FE" }
const NC: Record<BType, string> = { main: "#3B82F6", staging: "#10B981", feature: "#8B5CF6" }
const ORDER: Partial<Record<BType, number>> = { main: 0, staging: 1, feature: 2 }

function btype(b: GitBranch): BType { return (b.branchType as BType) ?? "feature" }

function nodeInRange(node: TimelineNode, dateFrom: string | null, dateTo: string | null) {
  const d = new Date(node.date).getTime()
  if (dateFrom && d < new Date(dateFrom).getTime()) return false
  if (dateTo) {
    const to = new Date(dateTo)
    to.setHours(23, 59, 59, 999)
    if (d > to.getTime()) return false
  }
  return true
}

export default function BranchTimeline({
  branches, currentBranch, selectedBranch, onSelectBranch, onCreateBranch,
  timelineNodes, selectedNodeId, onSelectNode, filters,
}: BranchTimelineProps) {
  // Apply date filters: only show branches that have at least one node in range
  const visibleBranches = branches.filter(b => {
    const branchNodes = timelineNodes.filter(n => n.branchName === b.name)
    if (branchNodes.length === 0) return true // no nodes = still show branch track
    return branchNodes.some(n => nodeInRange(n, filters.dateFrom, filters.dateTo))
  })

  // Nodes to show per branch (after date filter)
  function visibleNodesFor(branchName: string): TimelineNode[] {
    return timelineNodes
      .filter(n => n.branchName === branchName && nodeInRange(n, filters.dateFrom, filters.dateTo))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const mainB = visibleBranches.find(b => btype(b) === "main" || b.isDefault)
  const children = visibleBranches
    .filter(b => b !== mainB)
    .sort((a, b) => (ORDER[btype(a)] ?? 2) - (ORDER[btype(b)] ?? 2))

  const svgH = PAD.t + children.length * ROW_H + PAD.b
  const mainY = svgH - PAD.b
  const trackEnd = VW - PAD.r
  const span = trackEnd - PAD.l - 20

  // Positions for the main branch nodes (up to 3 from data, fallback to fixed positions)
  const mainNodeData = visibleNodesFor(mainB?.name ?? "main")
  const mainXPositions = mainNodeData.length > 0
    ? mainNodeData.map((_, i, arr) => PAD.l + span * (0.15 + (0.70 / Math.max(arr.length - 1, 1)) * i))
    : [0.15, 0.50, 0.85].map(r => PAD.l + span * r)

  const childRows = children.map((branch, idx) => {
    const y = mainY - (idx + 1) * ROW_H
    const forkX = mainXPositions[Math.min(idx, mainXPositions.length - 2)]
    const lineStart = forkX + 48
    const bSpan = trackEnd - lineStart - 10
    const nodeData = visibleNodesFor(branch.name)
    const xPositions = nodeData.length > 0
      ? nodeData.map((_, i, arr) => lineStart + bSpan * (0.28 + (0.54 / Math.max(arr.length - 1, 1)) * i))
      : [lineStart + bSpan * 0.38, lineStart + bSpan * 0.80]
    return { branch, y, forkX, lineStart, nodeData, xPositions }
  })

  const headPos = (() => {
    if (mainB?.name === currentBranch && mainXPositions.length > 0)
      return { x: mainXPositions[mainXPositions.length - 1], y: mainY }
    const row = childRows.find(r => r.branch.name === currentBranch)
    if (row && row.xPositions.length > 0)
      return { x: row.xPositions[row.xPositions.length - 1], y: row.y }
    return null
  })()

  function isSelBranch(name: string) { return name === selectedBranch }
  function isCurrent(name: string) { return name === currentBranch }
  function isSelNode(id: string) { return id === selectedNodeId }

  // Render a single node circle with click handler
  function renderNode(node: TimelineNode, x: number, y: number, type: BType, cur: boolean, isLast: boolean) {
    const isHead = isLast && cur
    const isSel = isSelNode(node.id)
    return (
      <g key={node.id} onClick={e => { e.stopPropagation(); onSelectNode(isSel ? null : node.id) }} style={{ cursor: "pointer" }}>
        {/* selection ring */}
        {isSel && <circle cx={x} cy={y} r={NR + 6} fill="none" stroke={NC[type]} strokeWidth={2} strokeDasharray="4 2" opacity={0.8} />}
        <circle cx={x} cy={y} r={isHead ? NR + 2 : NR}
          fill={isHead ? "#60A5FA" : NC[type]}
          stroke="white" strokeWidth={isHead ? 3 : 2}
          filter={isHead ? "url(#glow)" : undefined} />
      </g>
    )
  }


  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* ── Header ── */}
      <div className="relative flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <GitBranchIcon size={14} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">Branch Timeline</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {visibleBranches.length}/{branches.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Active date filter indicator */}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
              Filtered
            </span>
          )}
          {/* New branch */}
          <button
            onClick={onCreateBranch}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <Plus size={11} /> New branch
          </button>
        </div>
      </div>

      {/* ── SVG graph ── */}
      <div className="px-4 pt-3 pb-2">
        <svg viewBox={`0 0 ${VW} ${svgH}`} className="w-full" style={{ height: svgH }}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Child branches */}
          {childRows.map(({ branch, y, forkX, lineStart, nodeData, xPositions }) => {
            const type = btype(branch)
            const sel = isSelBranch(branch.name)
            const cur = isCurrent(branch.name)
            const tc = sel ? NC[type] : TC[type]
            const bezier = `M ${forkX} ${mainY} C ${forkX} ${y} ${lineStart} ${mainY} ${lineStart} ${y}`
            return (
              <g key={branch.name} onClick={() => onSelectBranch(branch.name)} style={{ cursor: "pointer" }}>
                <path d={bezier} fill="none" stroke="transparent" strokeWidth={20} />
                <line x1={lineStart} y1={y} x2={trackEnd} y2={y} stroke="transparent" strokeWidth={20} />
                <path d={bezier} fill="none" stroke={tc} strokeWidth={sel ? TW + 1 : TW} strokeLinecap="round" />
                <line x1={lineStart} y1={y} x2={trackEnd} y2={y} stroke={tc} strokeWidth={sel ? TW + 1 : TW} strokeLinecap="round" />
                {nodeData.map((node, ni) =>
                  renderNode(node, xPositions[ni], y, type, cur, ni === nodeData.length - 1)
                )}
                <text x={lineStart + 8} y={y + NR + 14} fontSize={10} fill="#9CA3AF" fontFamily="system-ui,sans-serif">{branch.name}</text>
              </g>
            )
          })}

          {/* Main track */}
          <line x1={PAD.l} y1={mainY} x2={trackEnd} y2={mainY}
            stroke={isSelBranch(mainB?.name ?? "") ? "#93C5FD" : TC.main}
            strokeWidth={isSelBranch(mainB?.name ?? "") ? TW + 1 : TW} strokeLinecap="round" />
          <polygon points={`${PAD.l - 2},${mainY - 5} ${PAD.l + 12},${mainY} ${PAD.l - 2},${mainY + 5}`} fill={TC.main} />

          {/* Main nodes */}
          <g onClick={() => mainB && onSelectBranch(mainB.name)} style={{ cursor: "pointer" }}>
            <line x1={PAD.l} y1={mainY} x2={trackEnd} y2={mainY} stroke="transparent" strokeWidth={20} />
            {mainNodeData.map((node, i) =>
              renderNode(node, mainXPositions[i], mainY, "main", isCurrent(mainB?.name ?? ""), i === mainNodeData.length - 1)
            )}
            <text x={PAD.l + 8} y={mainY + NR + 14} fontSize={10} fill="#9CA3AF" fontFamily="system-ui,sans-serif">{mainB?.name ?? "main"}</text>
          </g>

          {/* ▼ current HEAD indicator */}
          {headPos && (
            <>
              <polygon points={`${headPos.x - 5},${headPos.y - NR - 18} ${headPos.x + 5},${headPos.y - NR - 18} ${headPos.x},${headPos.y - NR - 8}`} fill="#3B82F6" />
              <text x={headPos.x} y={headPos.y - NR - 22} fontSize={9} fill="#3B82F6" textAnchor="middle" fontWeight="600" fontFamily="system-ui,sans-serif">Current</text>
            </>
          )}
        </svg>
      </div>

      {/* ── Branch pills ── */}
      <div className="flex flex-wrap gap-2 border-t border-gray-100 px-5 py-3">
        {visibleBranches.map(b => {
          const type = btype(b)
          const sel = isSelBranch(b.name)
          return (
            <button key={b.name} onClick={() => onSelectBranch(b.name)}
              className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
                sel ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: NC[type] }} />
              {b.name}
            </button>
          )
        })}
        <button onClick={onCreateBranch} className="flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100">
          <Plus size={10} /> New
        </button>
      </div>
    </div>
  )
}
