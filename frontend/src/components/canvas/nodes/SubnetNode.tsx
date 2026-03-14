import { Handle, Position, type NodeProps, NodeResizer } from "@xyflow/react"
import useEditorStore from "../../../stores/useEditorStore"
import AwsIcon from "./AwsIcon"

export default function SubnetNode({ id, data, selected }: NodeProps) {
  const selectNode = useEditorStore((s) => s.selectNode)
  const properties = (data?.properties as Record<string, string>) || {}
  const color = "#3B82F6"

  // Error handling: fallback UI if data is missing
  if (!data) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation()
          selectNode(id)
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FEE2E2",
          border: "2px dashed #DC2626",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "12px",
          color: "#991B1B",
          textAlign: "center",
        }}
      >
        ⚠️ Subnet Data Invalid
      </div>
    )
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={150}
        handleStyle={{
          width: "8px",
          height: "8px",
          background: color,
          border: "2px solid white",
          borderRadius: "50%",
          zIndex: 9999,
        }}
        lineStyle={{ border: "1px dashed #3B82F6" }}
      />

      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 8, height: 8, backgroundColor: color, border: "2px solid white", borderRadius: "50%", pointerEvents: "all" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 8, height: 8, backgroundColor: color, border: "2px solid white", borderRadius: "50%", pointerEvents: "all" }}
      />

      {/* Header — absolute, always on top, always clickable */}
      <div
        className="subnet-header"
        onClick={(e) => { e.stopPropagation(); selectNode(id) }}
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          zIndex: 10,
          pointerEvents: "all",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 12px",
          borderBottom: "1px dashed #93C5FD",
          backgroundColor: "rgba(59, 130, 246, 0.06)",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <AwsIcon type="subnet" size={16} />
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#2563EB" }}>
          Subnet
        </span>
        <span style={{ fontSize: "10px", color: "#9CA3AF" }}>
          {properties.cidr_block || "10.0.1.0/24"}
        </span>
        <span style={{ fontSize: "9px", fontWeight: 500, color: "#9CA3AF", backgroundColor: "#F3F4F6", padding: "1px 5px", borderRadius: "3px", marginLeft: "auto" }}>
          {properties.availability_zone || "us-east-1a"}
        </span>
      </div>

      {/* Body — visual overlay only; pointer-events:none so edges/nodes inside always get mouse events */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "10px",
          border: selected ? `2px solid ${color}` : `2px dashed ${color}`,
          backgroundColor: selected ? "rgba(59,130,246,0.05)" : "rgba(59,130,246,0.03)",
          boxShadow: selected ? "0 0 0 3px rgba(59,130,246,0.2)" : undefined,
          transition: "border 0.15s ease, box-shadow 0.15s ease",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}