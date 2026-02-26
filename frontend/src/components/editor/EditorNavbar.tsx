import { Link, useParams } from "react-router-dom"
import useEditorStore from "../../stores/useEditorStore"
import { CLOUD_PROVIDERS } from "../../types/cloud"
import WorkspaceSelector from "./WorkspaceSelector"

export default function EditorNavbar() {
  const { projectId } = useParams()
  const nodes = useEditorStore((s) => s.nodes)
  const cloudProvider = useEditorStore((s) => s.cloudProvider)

  const providerConfig = CLOUD_PROVIDERS.find((p) => p.id === cloudProvider)

  return (
    <div
      style={{
        height: "52px",
        backgroundColor: "white",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        zIndex: 50,
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            border: "1px solid #E5E7EB",
            textDecoration: "none",
            color: "#6B7280",
            fontSize: "16px",
          }}
        >
          ←
        </Link>
        <div style={{ width: "1px", height: "24px", backgroundColor: "#E5E7EB" }}></div>

        <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>
          Project #{projectId}
        </p>

        {providerConfig && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              backgroundColor: `${providerConfig.color}10`,
              border: `1px solid ${providerConfig.color}30`,
              borderRadius: "4px",
            }}
          >
            <span style={{ fontSize: "11px" }}>{providerConfig.icon}</span>
            <span style={{ fontSize: "11px", fontWeight: 500, color: providerConfig.color }}>
              {providerConfig.id.toUpperCase()}
            </span>
          </div>
        )}

        {/* Workspace Selector */}
        <WorkspaceSelector />
      </div>

      {/* Center */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "#F9FAFB",
          padding: "4px 12px",
          borderRadius: "6px",
          border: "1px solid #E5E7EB",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: nodes.length > 0 ? "#22C55E" : "#9CA3AF",
          }}
        ></div>
        <span style={{ fontSize: "12px", color: "#6B7280" }}>
          {nodes.length} component{nodes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          style={{
            padding: "7px 14px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#374151",
            backgroundColor: "white",
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Save
        </button>
        <button
          style={{
            padding: "7px 14px",
            fontSize: "13px",
            fontWeight: 500,
            color: "white",
            backgroundColor: "#4F6EF7",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Export HCL
        </button>
      </div>
    </div>
  )
}