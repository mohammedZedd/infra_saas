import useEditorStore from "../../stores/useEditorStore"

export default function PropertiesPanel() {
  const nodes = useEditorStore((s) => s.nodes)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const updateNodeProperty = useEditorStore((s) => s.updateNodeProperty)
  const deleteNode = useEditorStore((s) => s.deleteNode)
  const selectNode = useEditorStore((s) => s.selectNode)

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  if (!selectedNode) {
    return (
      <div
        style={{
          width: "280px",
          backgroundColor: "white",
          borderLeft: "1px solid #E5E7EB",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "#F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </div>
        <p style={{ fontSize: "13px", color: "#9CA3AF", textAlign: "center" }}>
          Select a component to edit its properties
        </p>
      </div>
    )
  }

  const { data } = selectedNode
  const properties = data.properties as Record<string, string>

  return (
    <div
      style={{
        width: "280px",
        backgroundColor: "white",
        borderLeft: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: `${data.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            {data.icon}
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>
              {data.label}
            </p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>{data.type}</p>
          </div>
        </div>
        <button
          onClick={() => selectNode(null)}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#9CA3AF",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          ×
        </button>
      </div>

      {/* Properties */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#9CA3AF",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: 0,
          }}
        >
          Properties
        </p>

        {Object.entries(properties).map(([key, value]) => (
          <div key={key}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              {key}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => updateNodeProperty(selectedNode.id, key, e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px",
                fontSize: "13px",
                color: "#111827",
                backgroundColor: "#FAFBFC",
                border: "1px solid #D1D5DB",
                borderRadius: "6px",
                outline: "none",
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4F6EF7")}
              onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
            />
          </div>
        ))}
      </div>

      {/* Delete */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #F3F4F6",
        }}
      >
        <button
          onClick={() => deleteNode(selectedNode.id)}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#DC2626",
            backgroundColor: "white",
            border: "1px solid #FECACA",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FEF2F2")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
        >
          Delete Component
        </button>
      </div>
    </div>
  )
}