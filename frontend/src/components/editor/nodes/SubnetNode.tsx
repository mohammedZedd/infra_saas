import { Handle, Position, type NodeProps, NodeResizer } from "@xyflow/react"
import useEditorStore from "../../../stores/useEditorStore"
import AwsIcon from "./AwsIcon"

export default function SubnetNode({ id, data, selected }: NodeProps) {
  const selectNode = useEditorStore((s) => s.selectNode)
  const properties = (data.properties as Record<string, string>) || {}
  const isPublic = properties.map_public_ip === "true"
  const color = isPublic ? "#22C55E" : "#3B82F6"

  return (
    <>
      {/* Resizer */}
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={150}
        lineStyle={{
          borderColor: color,
          borderWidth: 1,
        }}
        handleStyle={{
          width: "8px",
          height: "8px",
          backgroundColor: color,
          borderRadius: "2px",
          border: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          border: `2px ${selected ? "solid" : "dashed"} ${color}`,
          borderRadius: "10px",
          backgroundColor: isPublic ? "rgba(34, 197, 94, 0.03)" : "rgba(59, 130, 246, 0.03)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: color,
            border: "2px solid white",
            boxShadow: "0 0 0 1px #E5E7EB",
          }}
        />

        {/* Header */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            selectNode(id)
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            borderBottom: `1px dashed ${isPublic ? "#86EFAC" : "#93C5FD"}`,
            backgroundColor: isPublic ? "rgba(34, 197, 94, 0.06)" : "rgba(59, 130, 246, 0.06)",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <AwsIcon type="subnet" size={16} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: isPublic ? "#16A34A" : "#2563EB",
            }}
          >
            {isPublic ? "Public" : "Private"} Subnet
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

        {/* Body */}
        <div
          style={{
            flex: 1,
            padding: "12px",
            pointerEvents: "none",
          }}
        ></div>

        <Handle
          type="source"
          position={Position.Right}
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: color,
            border: "2px solid white",
            boxShadow: "0 0 0 1px #E5E7EB",
          }}
        />
      </div>
    </>
  )
}