import { Handle, type NodeProps, NodeResizer, Position } from "@xyflow/react"
import type { AwsNodeData } from "../../../types/aws"
import useEditorStore from "../../../stores/useEditorStore"
import AwsIcon from "./AwsIcon"

type AwsNodeProps = NodeProps & {
  data: AwsNodeData
}

export default function AwsNode({ id, data, selected }: AwsNodeProps) {
  const selectNode = useEditorStore((s) => s.selectNode)
  const selectNodeWithHierarchy = useEditorStore((s) => s.selectNodeWithHierarchy)

  // Error handling: if data is missing critical properties, show fallback UI
  if (!data || !data.type || !data.color) {
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
          padding: "10px",
          cursor: "pointer",
          fontSize: "11px",
          color: "#991B1B",
          textAlign: "center",
        }}
      >
        ⚠️ Invalid Data
      </div>
    )
  }

  return (
    <>
      {/* Resizer invisible — keepAspectRatio pour garder les proportions */}
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={90}
        keepAspectRatio
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
        onMouseDown={(e) => {
          // Stop mousedown from reaching Subnet/VPC underneath.
          // React Flow resolves node selection on mousedown — without this,
          // the container node wins the event before onClick fires on EC2.
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.stopPropagation()
          // Single click uses hierarchical selection (container-first)
          selectNodeWithHierarchy(id, true)
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "10px",
          cursor: "pointer",
          borderRadius: "8px",
          border: selected ? `2px solid ${data.color}` : "2px solid transparent",
          backgroundColor: selected ? `${data.color}08` : "transparent",
          transition: "border 0.15s ease, background-color 0.15s ease",
          pointerEvents: "all",
          position: "relative",
          boxSizing: "border-box",
          overflow: "visible",
        }}
      >
        {/* Left = target (incoming), Right = source (outgoing) */}
        <Handle
          type="target"
          position={Position.Left}
          style={{
            width: 10,
            height: 10,
            background: data.color,
            border: "2px solid white",
            borderRadius: "50%",
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{
            width: 10,
            height: 10,
            background: data.color,
            border: "2px solid white",
            borderRadius: "50%",
          }}
        />

        {/* Icon — scale avec le container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: 0,
          }}
        >
          <AwsIcon type={data.type} size={48} />
        </div>

        {/* Label — ne wrape jamais */}
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#111827",
            textAlign: "center",
            whiteSpace: "nowrap",
            lineHeight: 1.3,
            flexShrink: 0,
          }}
        >
          {data.label}
        </span>
      </div>
    </>
  )
}