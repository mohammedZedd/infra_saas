import { type NodeProps, NodeResizer, Handle, Position } from "@xyflow/react"
import useEditorStore from "../../../stores/useEditorStore"
import AwsIcon from "./AwsIcon"

export default function VpcNode({ id, data, selected }: NodeProps) {
  const selectNode = useEditorStore((s) => s.selectNode)
  const properties = (data?.properties as Record<string, string>) || {}

  if (!data) {
    return (
      <div
        onClick={(e) => { e.stopPropagation(); selectNode(id) }}
        style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: "#FEE2E2", border: "2px dashed #DC2626",
          borderRadius: "12px", cursor: "pointer", fontSize: "12px",
          color: "#991B1B", textAlign: "center",
        }}
      >
        VPC Data Invalid
      </div>
    )
  }

  return (
    <>
      <NodeResizer
        nodeId={id}
        isVisible={selected}
        minWidth={300}
        minHeight={200}
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
        onClick={(e) => { e.stopPropagation(); selectNode(id) }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "12px",
          border: selected ? "2px solid #15803d" : "2px solid #16a34a",
          backgroundColor: "rgba(22, 163, 74, 0.05)",
          boxShadow: selected ? "0 0 0 3px rgba(22, 163, 74, 0.2)" : undefined,
          display: "flex",
          flexDirection: "column" as const,
          transition: "border 0.15s ease, box-shadow 0.15s ease",
          position: "relative" as const,
          overflow: "visible",
          boxSizing: "border-box",
          // Body is always transparent to pointer events.
          // The header below overrides with pointerEvents: "all" so it stays clickable.
          // This ensures edges and child nodes inside the VPC are always reachable.
          pointerEvents: "none",
          cursor: "default",
        }}
      >
        {/* Handles always interactive regardless of selection state */}
        <Handle
          type="target"
          position={Position.Left}
          style={{
            width: 10, height: 10,
            background: "#16a34a",
            border: "2px solid white",
            borderRadius: "50%",
            pointerEvents: "all",
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{
            width: 10, height: 10,
            background: "#16a34a",
            border: "2px solid white",
            borderRadius: "50%",
            pointerEvents: "all",
          }}
        />

        {/* Header — always captures clicks even when node body is transparent to events */}
        <div
          className="vpc-header"
          onClick={(e) => { e.stopPropagation(); selectNode(id) }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            flexShrink: 0,
            cursor: "pointer",
            // Override parent's pointerEvents: none so header is always clickable
            pointerEvents: "all",
          }}
        >
          <AwsIcon type="vpc" size={18} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a" }}>
            {(data.label as string) || "VPC"}
          </span>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "#16a34a", opacity: 0.7 }}>
            {properties.cidr_block || "10.0.0.0/16"}
          </span>
        </div>

        {/* Body — inherits parent pointerEvents (none when selected → clicks reach nodes inside) */}
        <div
          style={{
            flex: 1,
            margin: "0 12px 12px 12px",
            border: "1px dashed rgba(22, 163, 74, 0.3)",
            borderRadius: "8px",
          }}
        />
      </div>
    </>
  )
}