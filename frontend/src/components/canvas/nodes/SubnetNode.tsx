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
    <>
      <NodeResizer
        nodeId={id}
        isVisible={selected}
        minWidth={200}
        minHeight={150}
        lineStyle={{
          borderWidth: 0,
          background: "transparent",
        }}
        handleStyle={{
          width: "10px",
          height: "10px",
          backgroundColor: "transparent",
          border: "none",
          borderRadius: 0,
          boxShadow: "none",
          opacity: 0,
        }}
      />

      <div
        onClick={(e) => {
          e.stopPropagation()
          selectNode(id)
        }}
        style={{
          width: "100%",
          height: "100%",
          border: `2px ${selected ? "solid" : "dashed"} ${color}`,
          borderRadius: "10px",
          backgroundColor: "rgba(59, 130, 246, 0.03)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
          boxSizing: "border-box",
          // Body is always transparent to pointer events.
          // The header below overrides with pointerEvents: "all" so it stays clickable.
          // This ensures edges and child nodes inside the Subnet are always reachable.
          pointerEvents: "none",
          cursor: "default",
        }}
      >
        {/* Handles always interactive regardless of selection state */}
        <Handle
          type="target"
          position={Position.Left}
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: color,
            border: "2px solid white",
            boxShadow: "0 0 0 1px #E5E7EB",
            pointerEvents: "all",
          }}
        />

        {/* Header — always captures clicks even when node body is transparent to events */}
        <div
          className="subnet-header"
          onClick={(e) => {
            e.stopPropagation()
            selectNode(id)
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            borderBottom: "1px dashed #93C5FD",
            backgroundColor: "rgba(59, 130, 246, 0.06)",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            flexShrink: 0,
            // Override parent's pointerEvents: none so header is always clickable
            pointerEvents: "all",
          }}
        >
          <AwsIcon type="subnet" size={16} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#2563EB",
            }}
          >
            Subnet
          </span>
          <span style={{ fontSize: "10px", color: "#9CA3AF" }}>
            {properties.cidr_block || "10.0.1.0/24"}
          </span>
          <span
            style={{
              fontSize: "9px",
              fontWeight: 500,
              color: "#9CA3AF",
              backgroundColor: "#F3F4F6",
              padding: "1px 5px",
              borderRadius: "3px",
              marginLeft: "auto",
            }}
          >
            {properties.availability_zone || "us-east-1a"}
          </span>
        </div>

        {/* Body — inherits parent pointerEvents (none when selected → clicks reach EC2 inside) */}
        <div style={{ flex: 1, padding: "12px" }} />

        <Handle
          type="source"
          position={Position.Right}
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: color,
            border: "2px solid white",
            boxShadow: "0 0 0 1px #E5E7EB",
            pointerEvents: "all",
          }}
        />
      </div>
    </>
  )
}