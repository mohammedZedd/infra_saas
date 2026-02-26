import { useState } from "react"

interface FeatureCardProps {
  icon: string
  color: string
  title: string
  description: string
}

export default function FeatureCard({ icon, color, title, description }: FeatureCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        padding: "28px",
        backgroundColor: "white",
        border: `1px solid ${hovered ? "#C7D2FE" : "#E5E7EB"}`,
        borderRadius: "14px",
        transition: "all 0.2s ease",
        cursor: "default",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.06)" : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          backgroundColor: color,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          marginBottom: "16px",
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7 }}>
        {description}
      </p>
    </div>
  )
}