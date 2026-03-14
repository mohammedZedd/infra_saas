import type { GitBranch } from "../../types/git"
import { GitBranch as GitBranchIcon, Plus } from "lucide-react"
import { cn } from "../../utils/cn"

interface BranchGraphProps {
  branches: GitBranch[]
  currentBranch: string
  onSwitchBranch: (name: string) => void
  onCreateBranch: () => void
  syncStatus?: Record<string, "synced" | "ahead" | "behind">
}

type BranchType = "main" | "staging" | "feature"

// ── SVG layout ─────────────────────────────────────────────────────────────
const VW = 720          // viewBox width
const ROW_H = 80        // vertical gap between branch rows
const PAD = { t: 40, b: 42, l: 52, r: 28 }
const NODE_R = 13       // circle radius
const TRACK_W = 3       // stroke width for branch lines

// ── Colours ─────────────────────────────────────────────────────────────────
const TRACK_CLR: Record<BranchType, string> = {
  main: "#93C5FD", staging: "#6EE7B7", feature: "#C4B5FD",
}
const NODE_CLR: Record<BranchType, string> = {
  main: "#3B82F6", staging: "#10B981", feature: "#8B5CF6",
}
const PILL_ACTIVE = "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
const PILL_IDLE   = "bg-gray-50 text-gray-600 hover:bg-gray-100"

const DISPLAY_ORDER: Partial<Record<BranchType, number>> = { main: 0, staging: 1, feature: 2 }

function branchType(b: GitBranch): BranchType {
  return (b.branchType as BranchType) ?? "feature"
}

export default function BranchGraph({
  branches,
  currentBranch,
  onSwitchBranch,
  onCreateBranch,
  syncStatus = {},
}: BranchGraphProps) {
  const mainBranch = branches.find(b => branchType(b) === "main" || b.isDefault)
  const childBranches = branches
    .filter(b => b !== mainBranch)
    .sort((a, b) => (DISPLAY_ORDER[branchType(a)] ?? 2) - (DISPLAY_ORDER[branchType(b)] ?? 2))

  const svgH = PAD.t + childBranches.length * ROW_H + PAD.b
  const mainY = svgH - PAD.b
  const trackEnd = VW - PAD.r

  // 3 commit nodes spread across the main branch line
  const span = trackEnd - PAD.l - 20
  const mainNodes = [0.15, 0.50, 0.85].map(r => PAD.l + span * r)

  // One row per child branch; each forks from a different main-branch node
  const childRows = childBranches.map((branch, idx) => {
    const y = mainY - (idx + 1) * ROW_H
    const forkX = mainNodes[Math.min(idx, mainNodes.length - 2)]
    const lineStart = forkX + 50
    const branchSpan = trackEnd - lineStart - 10
    const nodes = [lineStart + branchSpan * 0.40, lineStart + branchSpan * 0.82]
    return { branch, y, forkX, lineStart, nodes }
  })

  // Where is the HEAD indicator?
  const headPos = (() => {
    if (mainBranch?.name === currentBranch) return { x: mainNodes[2], y: mainY }
    const row = childRows.find(r => r.branch.name === currentBranch)
    return row ? { x: row.nodes[1], y: row.y } : null
  })()

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranchIcon size={14} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">Branch Timeline</span>
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">{branches.length}</span>
        </div>
        <button onClick={onCreateBranch} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:border-gray-300">
          <Plus size={12} /> New branch
        </button>
      </div>

      {/* SVG Graph */}
      <svg viewBox={`0 0 ${VW} ${svgH}`} className="w-full" style={{ height: svgH }}>
        {/* Main branch track */}
        <line x1={PAD.l} y1={mainY} x2={trackEnd} y2={mainY} stroke={TRACK_CLR.main} strokeWidth={TRACK_W} strokeLinecap="round" />
        {/* → start arrow */}
        <polygon points={`${PAD.l - 2},${mainY - 6} ${PAD.l + 14},${mainY} ${PAD.l - 2},${mainY + 6}`} fill={TRACK_CLR.main} />

        {/* Child branches */}
        {childRows.map(({ branch, y, forkX, lineStart, nodes }) => {
          const type = branchType(branch)
          const tc = TRACK_CLR[type]
          const isCur = branch.name === currentBranch
          // S-curve: departs horizontally from main, arrives horizontally at branch row
          const bezier = `M ${forkX} ${mainY} C ${forkX} ${y} ${lineStart} ${mainY} ${lineStart} ${y}`
          return (
            <g key={branch.name} onClick={() => onSwitchBranch(branch.name)} style={{ cursor: "pointer" }}>
              <path d={bezier} fill="none" stroke={tc} strokeWidth={TRACK_W} strokeLinecap="round" />
              <line x1={lineStart} y1={y} x2={trackEnd} y2={y} stroke={tc} strokeWidth={TRACK_W} strokeLinecap="round" />
              {nodes.map((x, ni) => {
                const isHead = ni === nodes.length - 1 && isCur
                return <circle key={ni} cx={x} cy={y} r={isHead ? NODE_R + 2 : NODE_R} fill={isHead ? "#60A5FA" : NODE_CLR[type]} stroke="white" strokeWidth={isHead ? 3 : 2.5} />
              })}
              <text x={lineStart + 12} y={y + NODE_R + 16} fontSize={11} fill="#9CA3AF" fontFamily="system-ui,sans-serif">{branch.name}</text>
            </g>
          )
        })}

        {/* Main branch nodes */}
        <g onClick={() => mainBranch && onSwitchBranch(mainBranch.name)} style={{ cursor: "pointer" }}>
          {mainNodes.map((x, i) => {
            const isHead = i === mainNodes.length - 1 && mainBranch?.name === currentBranch
            return <circle key={i} cx={x} cy={mainY} r={isHead ? NODE_R + 2 : NODE_R} fill={isHead ? "#60A5FA" : NODE_CLR.main} stroke="white" strokeWidth={isHead ? 3 : 2.5} />
          })}
          <text x={PAD.l + 10} y={mainY + NODE_R + 16} fontSize={11} fill="#9CA3AF" fontFamily="system-ui,sans-serif">{mainBranch?.name ?? "main"}</text>
        </g>

        {/* ▼ current-HEAD indicator */}
        {headPos && (
          <>
            <text x={headPos.x} y={headPos.y - NODE_R - 22} fontSize={9} fill="#3B82F6" textAnchor="middle" fontWeight="600" fontFamily="system-ui,sans-serif">Current</text>
            <polygon points={`${headPos.x - 5},${headPos.y - NODE_R - 18} ${headPos.x + 5},${headPos.y - NODE_R - 18} ${headPos.x},${headPos.y - NODE_R - 8}`} fill="#3B82F6" />
          </>
        )}
      </svg>

      {/* Branch pills */}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
        {branches.map(branch => {
          const type = branchType(branch)
          const isCur = branch.name === currentBranch
          const status = syncStatus[branch.name] ?? "synced"
          return (
            <button key={branch.name} onClick={() => onSwitchBranch(branch.name)}
              className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all", isCur ? PILL_ACTIVE : PILL_IDLE)}>
              <span className="h-2 w-2 rounded-full" style={{ background: NODE_CLR[type] }} />
              {branch.name}
              {status === "ahead" && <span className="text-amber-500">↑</span>}
              {status === "behind" && <span className="text-gray-400">↓</span>}
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
