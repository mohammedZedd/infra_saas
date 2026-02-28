import { useState } from "react"
import { getBezierPath, type EdgeProps } from "@xyflow/react"
import useEditorStore from "../../../stores/useEditorStore"

export function DeleteableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false)
  const deleteEdge = useEditorStore((s) => s.deleteEdge)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      {/* Invisible wide stroke for easier hover detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: "pointer", pointerEvents: "all" }}
      />

      {/* Visible edge line */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        strokeWidth={2}
        markerEnd={markerEnd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...style,
          stroke: style?.stroke ?? "#94A3B8",
          pointerEvents: "none",
        }}
      />

      {/* Delete button — always rendered, opacity-animated */}
      <foreignObject
        x={labelX - 10}
        y={labelY - 10}
        width={20}
        height={20}
        style={{
          overflow: "visible",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s",
          pointerEvents: hovered ? "all" : "none",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteEdge(id)
          }}
          title="Delete edge"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: hovered ? "#dc2626" : "#ef4444",
            color: "white",
            fontSize: "12px",
            lineHeight: "1",
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            transition: "background-color 0.15s",
          }}
        >
          ×
        </button>
      </foreignObject>
    </>
  )
}

