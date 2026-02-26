interface CanvasNodeProps {
  color: string
  label: string
}

export default function CanvasNode({ color, label }: CanvasNodeProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backgroundColor: "white",
        padding: "10px 16px",
        borderRadius: "10px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: color,
        }}
      ></div>
      <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{label}</span>
    </div>
  )
}