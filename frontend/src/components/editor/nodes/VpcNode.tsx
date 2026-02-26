import { type NodeProps, NodeResizer } from "@xyflow/react"
import useEditorStore from "../../../stores/useEditorStore"
import AwsIcon from "./AwsIcon"

export default function VpcNode({ id, data, selected }: NodeProps) {
  const selectNode = useEditorStore((s) => s.selectNode)
  const properties = (data.properties as Record<string, string>) || {}

  return (
    <>
      {/* Resizer — visible quand sélectionné */}
      <NodeResizer
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        lineStyle={{
          borderColor: "#8C4FFF",
          borderWidth: 1,
        }}
        handleStyle={{
          width: "8px",
          height: "8px",
          backgroundColor: "#8C4FFF",
          borderRadius: "2px",
          border: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          border: `2px ${selected ? "solid" : "dashed"} ${selected ? "#8C4FFF" : "#C4B5FD"}`,
          borderRadius: "12px",
          backgroundColor: "rgba(139, 92, 246, 0.03)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            selectNode(id)
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            borderBottom: `1px dashed ${selected ? "#8C4FFF" : "#DDD6FE"}`,
            backgroundColor: "rgba(139, 92, 246, 0.06)",
            borderRadius: "10px 10px 0 0",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <AwsIcon type="vpc" size={20} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#7C3AED" }}>
            {(data.label as string) || "VPC"}
          </span>
          <span style={{ fontSize: "11px", color: "#A78BFA" }}>
            {properties.cidr_block || "10.0.0.0/16"}
          </span>
        </div>

        {/* Body — children can be placed here */}
        <div
          style={{
            flex: 1,
            padding: "16px",
            pointerEvents: "none",
          }}
        ></div>
      </div>
    </>
  )
}