import { useState, useEffect } from "react"
import type { GitBranch, TimelineNode } from "../../types/git"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"

interface NewBranchModalProps {
  isOpen: boolean
  onClose: () => void
  currentBranch: string
  branches: GitBranch[]
  timelineNodes: TimelineNode[]
  onCreateBranch: (name: string, base: string, parentNodeId: string) => void
  selectedNode?: TimelineNode | null
  defaultBase?: string
}

export default function NewBranchModal({
  isOpen, onClose, currentBranch, branches, timelineNodes, onCreateBranch, selectedNode, defaultBase,
}: NewBranchModalProps) {
  const [name, setName] = useState("")
  const [base, setBase] = useState(defaultBase ?? currentBranch)
  const [baseNodeId, setBaseNodeId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setName("")
      setBaseNodeId(null)
      if (selectedNode) {
        setBase(selectedNode.branchName)
      } else {
        setBase(defaultBase ?? currentBranch)
      }
    }
  }, [isOpen, currentBranch, defaultBase, selectedNode])

  // Reset node picker when branch changes
  const handleBaseChange = (newBase: string) => {
    setBase(newBase)
    setBaseNodeId(null)
  }

  // Nodes for selected base branch, sorted newest first
  const nodesForBase = timelineNodes
    .filter(n => n.branchName === base)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleCreate = () => {
    const trimmed = name.trim()
    const nodeId = selectedNode?.id ?? baseNodeId
    if (!trimmed || !nodeId) return
    onCreateBranch(trimmed, selectedNode?.branchName ?? base, nodeId)
    onClose()
  }

  const isValid = name.trim().length > 0 && (selectedNode != null || baseNodeId != null)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create new branch"
      subtitle={
        selectedNode
          ? "Branching from a specific point in the timeline."
          : "Choose a base branch and the exact point to branch from."
      }
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!isValid}>
            Create branch
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Branch name input */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Branch name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && isValid && handleCreate()}
            placeholder="e.g. feature/my-change"
            autoFocus
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {selectedNode ? (
          /* Read-only base point when a timeline node was pre-selected */
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">Base point</p>
            <p className="text-sm font-medium text-gray-800 font-mono">{selectedNode.branchName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(selectedNode.date).toLocaleDateString()}
              {selectedNode.label ? ` · ${selectedNode.label}` : ""}
            </p>
          </div>
        ) : (
          <>
            {/* Base branch picker */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Base branch <span className="text-red-500">*</span>
              </label>
              <select
                value={base}
                onChange={e => handleBaseChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {branches.map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Base node picker — required */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Base point <span className="text-red-500">*</span>
              </label>
              {nodesForBase.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No timeline points for this branch.</p>
              ) : (
                <select
                  value={baseNodeId ?? ""}
                  onChange={e => setBaseNodeId(e.target.value || null)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">— select a point —</option>
                  {nodesForBase.map(n => (
                    <option key={n.id} value={n.id}>
                      {new Date(n.date).toLocaleDateString()}{n.label ? ` · ${n.label}` : ""}
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1.5 text-xs text-gray-500">
                The new branch will split exactly at this point.
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

