
import "@xyflow/react/dist/style.css"
import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  BackgroundVariant,
} from "@xyflow/react"
import { ExternalLink } from "lucide-react"
import { nodeTypes } from "../canvas/nodes/nodeTypes"
import { DeleteableEdge } from "../canvas/nodes/DeleteableEdge"
import type { Node, Edge } from "@xyflow/react"

const edgeTypes = {
  default: DeleteableEdge,
  smoothstep: DeleteableEdge,
}

type ArchitecturePreviewCanvasProps = {
  nodes?: Node[];
  edges?: Edge[];
  onOpenEditor: () => void;
};

export function ArchitecturePreviewCanvas({ nodes = [], edges = [], onOpenEditor }: ArchitecturePreviewCanvasProps) {
  const isEmpty = nodes.length === 0
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Architecture</h3>
        <button
          onClick={onOpenEditor}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          Open editor <ExternalLink className="w-4 h-4" />
        </button>
      </div>
      {/* Canvas */}
      <div className="flex-1 min-h-0 relative">
        {isEmpty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-center">
            <p className="text-sm font-medium text-gray-500">No architecture designed yet</p>
            <button
              onClick={onOpenEditor}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Open the editor to start building →
            </button>
          </div>
        ) : (
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={false}
              zoomOnScroll={false}
              preventScrolling={false}
              defaultEdgeOptions={{
                type: "smoothstep",
                animated: true,
                style: { stroke: "#94A3B8", strokeWidth: 2, strokeDasharray: "5,5" },
              }}
              fitView
              fitViewOptions={{ padding: 0.2, minZoom: 0.3, maxZoom: 1 }}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="#94a3b8"
              />
            </ReactFlow>
          </ReactFlowProvider>
        )}
      </div>
    </div>
  )
}
