import { useMemo, useCallback, useState } from "react"
import type { Node } from "@xyflow/react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { ChevronRight, ExternalLink } from "lucide-react"
import useEditorStore from "../../stores/useEditorStore"
import { cn } from "../../utils/cn"
import { Button } from "../ui/Button"
import { nodeTypes } from "../canvas/nodes/nodeTypes"

interface ProjectArchitecturePreviewProps {
  projectId: string
  onNodeClick?: (nodeId: string) => void
  onOpenEditor?: () => void
  readOnly?: boolean
  compact?: boolean
}

export function ProjectArchitecturePreview({
  onNodeClick,
  onOpenEditor,
  readOnly = true,
  compact = false,
}: ProjectArchitecturePreviewProps) {
  const nodes = useEditorStore((state: any) => state.nodes)
  const edges = useEditorStore((state: any) => state.edges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id)
      onNodeClick?.(node.id)
    },
    [onNodeClick]
  )

  const handleNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    setHoveredNode(node)
  }, [])

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null)
  }, [])

  const nodeTypesMemo = useMemo(() => nodeTypes, [])
  const edgeTypes = useMemo(() => ({}), [])

  // If no nodes, show empty state
  if (nodes.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-gray-200 bg-white flex flex-col items-center justify-center",
          compact ? "h-64" : "h-96"
        )}
      >
        <div className="text-center px-6">
          <div className="mb-3 text-gray-400">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">
            No architecture yet
          </p>
          <p className="mt-1 text-sm text-gray-500 mb-4">
            Design your infrastructure in the editor to see it visualized here.
          </p>
          {onOpenEditor && (
            <Button
              onClick={onOpenEditor}
              size="sm"
              variant="primary"
              className="inline-flex items-center gap-2"
            >
              Open Editor
              <ExternalLink size={14} />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div
        className={cn(
          "relative",
          readOnly ? "bg-white" : "bg-gray-900",
          compact ? "h-64" : "h-96"
        )}
      >
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={readOnly ? undefined : handleNodeClick}
            onNodeMouseEnter={readOnly ? handleNodeMouseEnter : undefined}
            onNodeMouseLeave={readOnly ? handleNodeMouseLeave : undefined}
            nodeTypes={nodeTypesMemo}
            edgeTypes={edgeTypes}
            fitView
            zoomOnScroll={!readOnly}
            zoomOnPinch={!readOnly}
            zoomOnDoubleClick={!readOnly}
            panOnDrag={!readOnly}
            panOnScroll={!readOnly}
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable={!readOnly}
          >
            {!readOnly && <Background />}
            {!readOnly && <MiniMap />}
            {!readOnly && !compact && <Controls />}
          </ReactFlow>
        </ReactFlowProvider>

        {/* Overlay info panel */}
        {selectedNodeId && !compact && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 w-64 pointer-events-auto z-10">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Selected Node
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {selectedNodeId}
                </p>
              </div>
              {onOpenEditor && (
                <Button
                  onClick={onOpenEditor}
                  size="sm"
                  variant="primary"
                  className="w-full inline-flex items-center justify-center gap-2"
                >
                  Edit in Designer
                  <ChevronRight size={14} />
                </Button>
              )}
              <button
                onClick={() => setSelectedNodeId(null)}
                className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Hover tooltip */}
        {hoveredNode && !compact && (
          <div className="absolute top-4 right-4 bg-white rounded shadow-md p-2 text-xs z-20">
            <div className="font-semibold">
              {String(hoveredNode.data?.label || hoveredNode.id)}
            </div>
            <div className="text-gray-500">{hoveredNode.type}</div>
          </div>
        )}

        {/* Open Editor button for compact view */}
        {compact && onOpenEditor && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={onOpenEditor}
              size="sm"
              variant="secondary"
              className="inline-flex items-center gap-2"
            >
              Full View
              <ExternalLink size={14} />
            </Button>
          </div>
        )}
      </div>

      {/* Stats footer */}
      {!compact && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Resources
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {nodes.length}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Connections
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {edges.length}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Status
              </p>
              <p className="text-sm font-medium text-green-600 mt-1">
                Sync'd
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectArchitecturePreview
