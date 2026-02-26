import { Handle, Position, type NodeProps, NodeResizer } from "@xyflow/react"
import type { AwsNodeData } from "../../../types/aws"
import useEditorStore from "../../../stores/useEditorStore"
import AwsIcon from "./AwsIcon"

type AwsNodeProps = NodeProps & {
  data: AwsNodeData
}

export default function AwsNode({ id, data, selected }: AwsNodeProps) {
  const selectNode = useEditorStore((s) => s.selectNode)

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
        onClick={(e) => {
          e.stopPropagation()
          selectNode(id)
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
        {/* Handle gauche — clair et visible */}
        <Handle
          type="target"
          position={Position.Left}
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: data.color,
            border: "2px solid white",
            boxShadow: `0 0 0 1.5px ${data.color}`,
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

        {/* Handle droite — clair et visible */}
        <Handle
          type="source"
          position={Position.Right}
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: data.color,
            border: "2px solid white",
            boxShadow: `0 0 0 1.5px ${data.color}`,
            borderRadius: "50%",
          }}
        />
      </div>
    </>
  )
}