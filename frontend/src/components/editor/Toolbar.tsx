import useEditorStore from "../../stores/useEditorStore"

export default function Toolbar() {
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)

  const handleExport = () => {
    const data = { nodes, edges }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "project.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    if (window.confirm("Clear all components?")) {
      useEditorStore.setState({ nodes: [], edges: [], selectedNodeId: null })
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "white",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        padding: "6px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        zIndex: 10,
      }}
    >
      <ToolbarButton label="📋 Export JSON" onClick={handleExport} />
      <div style={{ width: "1px", height: "24px", backgroundColor: "#E5E7EB" }}></div>
      <ToolbarButton label="🗑️ Clear" onClick={handleClear} danger />
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  danger = false,
}: {
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        fontSize: "12px",
        fontWeight: 500,
        color: danger ? "#DC2626" : "#374151",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "background-color 0.1s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = danger ? "#FEF2F2" : "#F9FAFB")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      {label}
    </button>
  )
}