import React, { useCallback, useState } from "react"
import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
} from "@xyflow/react"
import useEditorStore from "../stores/useEditorStore"
import useUIStore from "../stores/useUIStore"
import { nodeTypes } from "../components/canvas/nodes/nodeTypes"
import { DeleteableEdge } from "../components/canvas/nodes/DeleteableEdge"

const edgeTypes = {
  default: DeleteableEdge,
  smoothstep: DeleteableEdge,
}
import { type AwsComponentType, type AwsNodeData } from "../types/aws"
import ModalSelector from "../components/canvas/modals/ModalSelector"
import CanvasErrorBoundary from "../components/canvas/CanvasErrorBoundary"

// CleanCanvas is now a pure canvas area — no sidebar or properties panel.
// The real Sidebar (canvas/Sidebar.tsx) and EditorTabs are rendered by Editor.tsx.
export default function CleanCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasErrorBoundary>
        <CanvasArea />
      </CanvasErrorBoundary>
    </ReactFlowProvider>
  )
}

function CanvasArea() {
  const { screenToFlowPosition } = useReactFlow()

  // All state comes from the single source of truth: useEditorStore
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const onNodesChange = useEditorStore((s) => s.onNodesChange)
  const onEdgesChange = useEditorStore((s) => s.onEdgesChange)
  const onConnect = useEditorStore((s) => s.onConnect)
  const addNode = useEditorStore((s) => s.addNode)
  const selectNode = useEditorStore((s) => s.selectNode)
  const updateNodeData = useEditorStore((s) => s.updateNodeData)
  const deleteNode = useEditorStore((s) => s.deleteNode)

  // Modal state for double-click config
  const [modalNode, setModalNode] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // The real Sidebar uses "application/awstype" — match that key here
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData("application/awstype") as AwsComponentType
      if (!type) return

      // screenToFlowPosition expects viewport-relative coordinates (clientX/Y)
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode(type, position)

      // Clear drag preview in UIStore
      useUIStore.getState().setDraggingType(null)
      useUIStore.getState().setDragPosition(null)
    },
    [addNode, screenToFlowPosition]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  // Handle DELETE/Backspace for selected nodes (including multi-selection).
  // We stop native event propagation so the global useKeyboard hook doesn't
  // double-fire deleteNode.  When no nodes are selected the event continues
  // to window, where useKeyboard handles edge deletion.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const selected = nodes.filter((n) => n.selected)
        if (selected.length > 0) {
          e.preventDefault()
          e.nativeEvent.stopPropagation()
          deleteNode(selected[0].id)
        }
      }
    },
    [nodes, deleteNode]
  )

  return (
    <div
      className="h-full w-full"
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={{ outline: "none" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultEdgeOptions={{
          animated: true,
          type: "smoothstep",
          style: { stroke: "#94A3B8", strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: "#6366F1", strokeWidth: 2, strokeDasharray: "5,5" }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDoubleClick={(_event, node) => {
          setModalNode(node)
          setModalOpen(true)
        }}
        onPaneClick={() => selectNode(null)}
        fitView
        minZoom={0.1}
        maxZoom={2}
        selectNodesOnDrag={false}
        nodesFocusable={true}
        elementsSelectable={true}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        selectionOnDrag={true}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#94a3b8" />
        <Controls />
      </ReactFlow>

      {/* AWS Config Modal — opens on node double-click */}
      {modalOpen && modalNode && (
        <ModalSelector
          node={modalNode}
          onClose={() => {
            setModalOpen(false)
            setModalNode(null)
          }}
          onSave={(updatedData) => {
            updateNodeData(modalNode.id, updatedData as Partial<AwsNodeData>)
            setModalOpen(false)
            setModalNode(null)
          }}
        />
      )}
    </div>
  )
}
