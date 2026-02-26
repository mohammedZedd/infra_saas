// src/components/editor/Canvas.tsx

import { useCallback, useRef, useState, type DragEvent } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type ReactFlowInstance,
  type Node,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { nodeTypes } from "./nodes/nodeTypes"
import useEditorStore from "../../stores/useEditorStore"
import { type AwsComponentType, type AwsNodeData } from "../../types/aws"
import ConnectionError from "./ConnectionError"
import SimulationOverlay from "./SimulationOverlay"

// ✅ FIX 1: Correct import path for new EC2Modal
import EC2Modal from "./modals/ec2/EC2Modal"
// ✅ FIX 2: Correct type import
import type { EC2FullConfig } from "./modals/ec2/types/ec2-config"

type AwsNode = Node<AwsNodeData>

export default function Canvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<ReactFlowInstance<AwsNode> | null>(null)

  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const onNodesChange = useEditorStore((s) => s.onNodesChange)
  const onEdgesChange = useEditorStore((s) => s.onEdgesChange)
  const onConnect = useEditorStore((s) => s.onConnect)
  const addNode = useEditorStore((s) => s.addNode)
  const selectNode = useEditorStore((s) => s.selectNode)
  const connectionError = useEditorStore((s) => s.connectionError)
  const clearConnectionError = useEditorStore((s) => s.clearConnectionError)

  const [modalNode, setModalNode] = useState<AwsNode | null>(null)

  const onInit = useCallback((instance: ReactFlowInstance<AwsNode>) => {
    reactFlowInstance.current = instance
  }, [])

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData("application/awstype") as AwsComponentType
      if (!type || !reactFlowInstance.current || !reactFlowWrapper.current) return

      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })
      addNode(type, position)
    },
    [addNode]
  )

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: AwsNode) => {
    setModalNode(node)
  }, [])

  // ✅ FIX 3: Safer type extraction
  const getNodeAwsType = (node: AwsNode | null): string => {
    if (!node?.data) return ""
    return String(node.data.type || "").toLowerCase()
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ FIX 4: EC2 save handler — mapped to EC2FullConfig
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleEC2Save = useCallback(
    (config: EC2FullConfig) => {
      if (!modalNode) return

      useEditorStore.setState({
        nodes: nodes.map((n): AwsNode => {
          if (n.id !== modalNode.id) return n
          return {
            ...n,
            data: {
              ...n.data,
              // Update label from config name
              label: config.name || n.data.label,

              // ✅ FIX 5: Store full config with proper casting
              ec2Config: config as unknown as Record<string, unknown>,

              // ✅ FIX 6: Flat properties mapped from EC2FullConfig (not config.advanced.xxx)
              properties: {
                instance_type: config.instanceType,
                ami: config.ami,
                key_name: config.keyName,                        // was: config.keyPair
                monitoring: String(config.monitoring),           // was: config.advanced.monitoring
                subnet_id: config.subnetId,                      // was: config.network.subnetId
                user_data: config.userData,                       // was: config.advanced.userData
                iam_instance_profile: config.iamInstanceProfile,  // was: config.advanced.iamInstanceProfile
                associate_public_ip_address: String(config.associatePublicIpAddress ?? ""),
                vpc_security_group_ids: config.vpcSecurityGroupIds.join(","),
                ebs_optimized: String(config.ebsOptimized),
                instance_count: String(config.numberOfInstances),
                tenancy: config.tenancy,
                availability_zone: config.availabilityZone,
              },
            },
          }
        }),
      })

      setModalNode(null)
    },
    [modalNode, nodes]
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ FIX 7: Extract initial config safely with casting
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const getEC2InitialConfig = (node: AwsNode): Partial<EC2FullConfig> | undefined => {
    const raw = node.data?.ec2Config
    if (!raw || typeof raw !== "object") return undefined
    return raw as unknown as Partial<EC2FullConfig>
  }

  const modalAwsType = getNodeAwsType(modalNode)
  const isEC2 = modalAwsType.includes("ec2")

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative">
      {connectionError && (
        <ConnectionError message={connectionError} onClose={clearConnectionError} />
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        style={{ backgroundColor: "#FAFBFC" }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "#94A3B8", strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: "#94A3B8", strokeWidth: 2 }}
      >
        <Background color="#E2E8F0" gap={20} size={1} />
        <Controls
          style={{
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        />
        <MiniMap
          style={{
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          nodeColor={(node) => {
            const data = node.data as AwsNodeData
            return data?.color || "#94A3B8"
          }}
          maskColor="rgba(250,251,252,0.7)"
        />
        <SimulationOverlay />
      </ReactFlow>

      {/* ✅ FIX 8: EC2 Modal — correct props */}
      {modalNode && isEC2 && (
        <EC2Modal
          isOpen={true}
          onClose={() => setModalNode(null)}
          onSave={handleEC2Save}
          initialConfig={getEC2InitialConfig(modalNode)}
          nodeName={modalNode.data?.label}           // ✅ was: nodeId={modalNode.id}
        />
      )}

      {/* Generic Modal for all non-EC2 nodes */}
      {modalNode && !isEC2 && (
        <GenericModal
          onClose={() => setModalNode(null)}
          nodeData={modalNode.data}
          awsType={modalAwsType}
        />
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Generic fallback modal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function GenericModal({
  onClose,
  nodeData,
  awsType,
}: {
  onClose: () => void
  nodeData: AwsNodeData
  awsType: string
}) {
  // ✅ FIX 9: Use skipKeys to filter what we show
  const skipKeys = new Set([
    "label", "color", "icon", "type", "category",
    "ec2Config", "properties", "config",
  ])

  const properties = nodeData.properties
    ? Object.entries(nodeData.properties).filter(([key]) => !skipKeys.has(key))
    : []

  // ✅ FIX 10: Also show extra data keys (for external services etc.)
  const extraEntries = Object.entries(nodeData)
    .filter(([key]) => !skipKeys.has(key) && key !== "properties")
    .filter(([, value]) => typeof value === "string" || typeof value === "number")

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50 }}
      className="flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-[480px] max-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{
                backgroundColor: `${nodeData.color || "#94A3B8"}20`,
                border: `1px solid ${nodeData.color || "#94A3B8"}`,
              }}
            >
              {nodeData.icon || "📦"}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {nodeData.label || "Service"}
              </h2>
              <p className="text-xs text-gray-400">{awsType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {properties.length > 0 || extraEntries.length > 0 ? (
            <div className="space-y-3">
              {/* Standard properties */}
              {properties.map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    {key}
                  </label>
                  <input
                    type="text"
                    readOnly
                    defaultValue={
                      typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value ?? "")
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none"
                  />
                </div>
              ))}

              {/* Extra data keys */}
              {extraEntries.map(([key, value]) => (
                <div key={`extra-${key}`}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    {key}
                  </label>
                  <input
                    type="text"
                    readOnly
                    defaultValue={String(value ?? "")}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">🔧</span>
              <p className="text-sm text-gray-500 mt-3">
                Detailed configuration for this service
                <br />
                is coming soon.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}