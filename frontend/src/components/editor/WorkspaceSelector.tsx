import { useState } from "react"
import useEditorStore from "../../stores/useEditorStore"

export default function WorkspaceSelector() {
  const settings = useEditorStore((s) => s.settings)
  const switchWorkspace = useEditorStore((s) => s.switchWorkspace)
  const addWorkspace = useEditorStore((s) => s.addWorkspace)
  const deleteWorkspace = useEditorStore((s) => s.deleteWorkspace)

  const [isOpen, setIsOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")

  const activeWorkspace = settings.workspaces.find(
    (w) => w.id === settings.activeWorkspaceId
  )

  const handleCreate = () => {
    if (!newName.trim()) return
    addWorkspace(newName.trim())
    setNewName("")
    setShowCreate(false)
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Current workspace button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          backgroundColor: "#F3F4F6",
          border: "1px solid #E5E7EB",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 500,
          color: "#374151",
        }}
      >
        <span style={{ color: "#22C55E" }}>●</span>
        {activeWorkspace?.name || "default"}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: 0,
              width: "220px",
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            {/* Workspaces list */}
            <div style={{ padding: "6px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", padding: "6px 8px", margin: 0 }}>
                WORKSPACES
              </p>
              {settings.workspaces.map((ws) => (
                <div
                  key={ws.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    backgroundColor: ws.id === settings.activeWorkspaceId ? "#EEF2FF" : "transparent",
                  }}
                  onClick={() => {
                    switchWorkspace(ws.id)
                    setIsOpen(false)
                  }}
                  onMouseEnter={(e) => {
                    if (ws.id !== settings.activeWorkspaceId) {
                      e.currentTarget.style.backgroundColor = "#F9FAFB"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (ws.id !== settings.activeWorkspaceId) {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: ws.id === settings.activeWorkspaceId ? "#22C55E" : "#D1D5DB" }}>
                      ●
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>
                      {ws.name}
                    </span>
                    {ws.isDefault && (
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 500,
                          color: "#9CA3AF",
                          backgroundColor: "#F3F4F6",
                          padding: "1px 4px",
                          borderRadius: "3px",
                        }}
                      >
                        default
                      </span>
                    )}
                  </div>
                  {!ws.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteWorkspace(ws.id)
                      }}
                      style={{
                        padding: "2px 6px",
                        fontSize: "11px",
                        color: "#DC2626",
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FEF2F2")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: "1px", backgroundColor: "#F3F4F6" }} />

            {/* Create new */}
            <div style={{ padding: "6px" }}>
              {showCreate ? (
                <div style={{ padding: "6px" }}>
                  <input
                    type="text"
                    placeholder="Workspace name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: "12px",
                      border: "1px solid #D1D5DB",
                      borderRadius: "4px",
                      outline: "none",
                      marginBottom: "6px",
                    }}
                  />
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={handleCreate}
                      style={{
                        flex: 1,
                        padding: "5px",
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "white",
                        backgroundColor: "#4F6EF7",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowCreate(false)
                        setNewName("")
                      }}
                      style={{
                        flex: 1,
                        padding: "5px",
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#6B7280",
                        backgroundColor: "white",
                        border: "1px solid #D1D5DB",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreate(true)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#4F6EF7",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#EEF2FF")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span>+</span>
                  New Workspace
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}