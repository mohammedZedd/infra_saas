import { useNavigate } from "react-router-dom"
import { useState } from "react"

interface ProjectCardProps {
  id: string
  name: string
  description: string
  updatedAt: string
  componentsCount: number
}

export default function ProjectCard({
  id,
  name,
  description,
  updatedAt,
  componentsCount,
}: ProjectCardProps) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => navigate(`/editor/${id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "white",
        border: `1px solid ${hovered ? "#C7D2FE" : "#E5E7EB"}`,
        borderRadius: "14px",
        padding: "0",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.02)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        overflow: "hidden",
      }}
    >
      {/* Preview area */}
      <div
        style={{
          height: "140px",
          background: "linear-gradient(135deg, #EEF2FF, #F5F3FF, #EFF6FF)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #F3F4F6",
          position: "relative",
        }}
      >
        {/* Fake mini nodes */}
        <div style={{ display: "flex", gap: "16px" }}>
          <MiniNode color="#3B82F6" />
          <MiniNode color="#8B5CF6" />
          <MiniNode color="#22C55E" />
          {componentsCount > 3 && <MiniNode color="#F59E0B" />}
        </div>

        {/* Component count badge */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "3px 8px",
            borderRadius: "6px",
            border: "1px solid #E5E7EB",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 500, color: "#6B7280" }}>
            {componentsCount} components
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px" }}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "4px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: "#9CA3AF",
            marginBottom: "12px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {description}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{updatedAt}</span>
        </div>
      </div>
    </div>
  )
}

function MiniNode({ color }: { color: string }) {
  return (
    <div
      style={{
        width: "36px",
        height: "36px",
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "3px",
          backgroundColor: color,
        }}
      ></div>
    </div>
  )
}