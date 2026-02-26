import { useState } from "react"
import useGitStore from "../../stores/useGitStore"

interface Props {
  isOpen: boolean
  onClose: () => void
  files: string[]
}

export default function GitPushModal({ isOpen, onClose, files }: Props) {
  const repository = useGitStore((s) => s.repository)
  const branches = useGitStore((s) => s.branches)
  const currentBranch = useGitStore((s) => s.currentBranch)
  const isPushing = useGitStore((s) => s.isPushing)
  const pushToGit = useGitStore((s) => s.pushToGit)
  const createBranch = useGitStore((s) => s.createBranch)

  const [commitMessage, setCommitMessage] = useState("")
  const [selectedBranch, setSelectedBranch] = useState(currentBranch)
  const [isNewBranch, setIsNewBranch] = useState(false)
  const [newBranchName, setNewBranchName] = useState("")
  const [pushSuccess, setPushSuccess] = useState(false)

  if (!isOpen || !repository) return null

  const handlePush = async () => {
    if (!commitMessage.trim()) return

    const branch = isNewBranch ? newBranchName : selectedBranch

    if (isNewBranch && newBranchName.trim()) {
      createBranch(newBranchName.trim())
    }

    await pushToGit(commitMessage.trim(), branch, files)
    setPushSuccess(true)

    setTimeout(() => {
      setPushSuccess(false)
      setCommitMessage("")
      onClose()
    }, 1500)
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose} />

      <div style={{ position: "relative", width: 500, backgroundColor: "white", borderRadius: 16, boxShadow: "0 25px 50px rgba(0,0,0,0.15)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🚀</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Push to Git</h2>
              <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0" }}>{repository.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E5E7EB", backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#6B7280" }}>✕</button>
        </div>

        {/* Success state */}
        {pushSuccess ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <span style={{ fontSize: 48 }}>✅</span>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginTop: 16 }}>Pushed successfully!</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{files.length} files pushed to {selectedBranch}</p>
          </div>
        ) : (
          <>
            {/* Body */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Files to push */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Files to commit</label>
                <div style={{ backgroundColor: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB", padding: "10px 14px", maxHeight: 120, overflowY: "auto" }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
                      <span style={{ fontSize: 10, color: "#22C55E", fontWeight: 700 }}>M</span>
                      <span style={{ fontSize: 12, color: "#374151", fontFamily: "monospace" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch selector */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Branch</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button
                    onClick={() => setIsNewBranch(false)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: !isNewBranch ? "2px solid #4F46E5" : "1px solid #E5E7EB",
                      backgroundColor: !isNewBranch ? "#EEF2FF" : "white",
                      fontSize: 12,
                      fontWeight: !isNewBranch ? 600 : 400,
                      color: !isNewBranch ? "#4F46E5" : "#6B7280",
                      cursor: "pointer",
                    }}
                  >
                    Existing branch
                  </button>
                  <button
                    onClick={() => setIsNewBranch(true)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: isNewBranch ? "2px solid #4F46E5" : "1px solid #E5E7EB",
                      backgroundColor: isNewBranch ? "#EEF2FF" : "white",
                      fontSize: 12,
                      fontWeight: isNewBranch ? 600 : 400,
                      color: isNewBranch ? "#4F46E5" : "#6B7280",
                      cursor: "pointer",
                    }}
                  >
                    + New branch
                  </button>
                </div>

                {isNewBranch ? (
                  <input
                    type="text"
                    placeholder="feature/update-infrastructure"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 13,
                      fontFamily: "monospace",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 13,
                      outline: "none",
                      backgroundColor: "white",
                      boxSizing: "border-box",
                    }}
                  >
                    {branches.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name} {b.isDefault ? "(default)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Commit message */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Commit message</label>
                <textarea
                  placeholder="Update infrastructure — add monitoring and security groups"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  backgroundColor: "white",
                  fontSize: 13,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePush}
                disabled={!commitMessage.trim() || isPushing || (isNewBranch && !newBranchName.trim())}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: !commitMessage.trim() || isPushing ? "#9CA3AF" : "#4F46E5",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: !commitMessage.trim() || isPushing ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {isPushing ? (
                  <>⏳ Pushing...</>
                ) : (
                  <>🚀 Push to {isNewBranch ? newBranchName || "..." : selectedBranch}</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}