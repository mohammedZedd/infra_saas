import { useState } from "react"
import useEditorStore from "../../stores/useEditorStore"

export default function OutputsPanel() {
  const settings = useEditorStore((s) => s.settings)
  const addOutput = useEditorStore((s) => s.addOutput)
  const deleteOutput = useEditorStore((s) => s.deleteOutput)

  const [showAdd, setShowAdd] = useState(false)
  const [newOutput, setNewOutput] = useState({ name: "", value: "", description: "" })

  const handleAdd = () => {
    if (!newOutput.name.trim() || !newOutput.value.trim()) return
    addOutput({
      name: newOutput.name.trim(),
      value: newOutput.value.trim(),
      description: newOutput.description,
    })
    setNewOutput({ name: "", value: "", description: "" })
    setShowAdd(false)
  }

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#111827", margin: 0 }}>Outputs</h3>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: "4px 10px",
            fontSize: "11px",
            fontWeight: 500,
            color: "#4F6EF7",
            backgroundColor: "#EEF2FF",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          + Add
        </button>
      </div>

      {showAdd && (
        <div style={{ padding: "12px", backgroundColor: "#F9FAFB", borderRadius: "8px", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Output name"
            value={newOutput.name}
            onChange={(e) => setNewOutput({ ...newOutput, name: e.target.value })}
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: "12px",
              border: "1px solid #D1D5DB",
              borderRadius: "4px",
              marginBottom: "8px",
              outline: "none",
            }}
          />
          <input
            type="text"
            placeholder="Value (e.g. aws_vpc.main.id)"
            value={newOutput.value}
            onChange={(e) => setNewOutput({ ...newOutput, value: e.target.value })}
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: "12px",
              border: "1px solid #D1D5DB",
              borderRadius: "4px",
              marginBottom: "8px",
              outline: "none",
              fontFamily: "'SF Mono', monospace",
            }}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newOutput.description}
            onChange={(e) => setNewOutput({ ...newOutput, description: e.target.value })}
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: "12px",
              border: "1px solid #D1D5DB",
              borderRadius: "4px",
              marginBottom: "8px",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={handleAdd} style={{ flex: 1, padding: "6px", fontSize: "11px", fontWeight: 500, color: "white", backgroundColor: "#4F6EF7", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Add Output
            </button>
            <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "6px", fontSize: "11px", fontWeight: 500, color: "#6B7280", backgroundColor: "white", border: "1px solid #D1D5DB", borderRadius: "4px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {settings.outputs.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#9CA3AF", textAlign: "center", padding: "20px" }}>
          No outputs defined yet
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {settings.outputs.map((o) => (
            <div key={o.name} style={{ padding: "10px", backgroundColor: "#F9FAFB", borderRadius: "6px", border: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{o.name}</span>
                <button onClick={() => deleteOutput(o.name)} style={{ fontSize: "11px", color: "#DC2626", backgroundColor: "transparent", border: "none", cursor: "pointer" }}>×</button>
              </div>
              <p style={{ fontSize: "11px", color: "#6B7280", fontFamily: "'SF Mono', monospace", margin: "4px 0 0", wordBreak: "break-all" }}>
                {o.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}