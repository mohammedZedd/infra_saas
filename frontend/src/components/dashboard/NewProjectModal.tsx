import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      onClose()
      // Navigate to editor with fake ID for now
      navigate(`/editor/${Date.now()}`)
    }, 800)
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "440px",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>New Project</h2>
            <button
              onClick={onClose}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "#9CA3AF",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleCreate} style={{ padding: "24px" }}>
            {/* Name */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Project name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My AWS Architecture"
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "14px",
                  color: "#111827",
                  backgroundColor: "#FAFBFC",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4F6EF7")}
                onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Description{" "}
                <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your infrastructure..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "14px",
                  color: "#111827",
                  backgroundColor: "#FAFBFC",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "Inter, sans-serif",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4F6EF7")}
                onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "9px 18px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                  backgroundColor: "white",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || loading}
                style={{
                  padding: "9px 18px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "white",
                  backgroundColor: !name.trim() || loading ? "#93A3F8" : "#4F6EF7",
                  border: "none",
                  borderRadius: "8px",
                  cursor: !name.trim() || loading ? "not-allowed" : "pointer",
                  transition: "background-color 0.15s",
                  boxShadow: "0 2px 8px rgba(79, 110, 247, 0.25)",
                }}
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}