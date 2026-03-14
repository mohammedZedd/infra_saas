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
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={250}
        minHeight={200}
        handleStyle={{
          width: "8px",
          height: "8px",
          background: "#16a34a",
          border: "2px solid white",
          borderRadius: "50%",
          zIndex: 9999,
        }}
        lineStyle={{ border: "1px dashed #16a34a" }}
      />

      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 10, height: 10, background: "#16a34a", border: "2px solid white", borderRadius: "50%", pointerEvents: "all" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 10, height: 10, background: "#16a34a", border: "2px solid white", borderRadius: "50%", pointerEvents: "all" }}
      />

      {/* Header — absolute, always on top, always clickable */}
      <div
        className="vpc-header"
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

      {/* Body — visual overlay only; pointer-events:none so edges/nodes inside always get mouse events */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "12px",
          border: selected ? "2px solid #15803d" : "2px dashed #16a34a",
          backgroundColor: selected ? "rgba(22,163,74,0.05)" : "rgba(22,163,74,0.03)",
          boxShadow: selected ? "0 0 0 3px rgba(22,163,74,0.2)" : undefined,
          transition: "border 0.15s ease, box-shadow 0.15s ease",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}