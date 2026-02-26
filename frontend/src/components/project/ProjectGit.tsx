import { useState } from "react"
import useGitStore from "../../stores/useGitStore"
import GitConnectModal from "./GitConnectModal"
import GitPushModal from "./GitPushModal"
import type { Project } from "./projectData"

interface Props {
  project: Project
}

export default function ProjectGit({ project }: Props) {
  const repository = useGitStore((s) => s.repository)
  const commits = useGitStore((s) => s.commits)
  const branches = useGitStore((s) => s.branches)
  const currentBranch = useGitStore((s) => s.currentBranch)
  const switchBranch = useGitStore((s) => s.switchBranch)
  const lastPushedAt = useGitStore((s) => s.lastPushedAt)
  const disconnectRepository = useGitStore((s) => s.disconnectRepository)

  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showPushModal, setShowPushModal] = useState(false)
  const [expandedCommit, setExpandedCommit] = useState<string | null>(null)
  const [filterBranch, setFilterBranch] = useState<string>("all")

  const filteredCommits = filterBranch === "all"
    ? commits
    : commits.filter((c) => c.branch === filterBranch)

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const allFiles = ["main.tf", "variables.tf", "outputs.tf", "backend.tf", "terraform.tfvars"]

  // ── Not connected state ──
  if (!repository) {
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", backgroundColor: "white", borderRadius: 14, border: "1px solid #E5E7EB" }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, #24292F, #444D56)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 24 }}>
            🐙
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Connect a Git Repository</h2>
          <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 24px", textAlign: "center", maxWidth: 400 }}>
            Push your Terraform code to Git and track every change to your infrastructure with full version history.
          </p>
          <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
            {[
              { icon: "📦", label: "Version Control", desc: "Track every infrastructure change" },
              { icon: "🔄", label: "Push & Sync", desc: "Push generated code to your repo" },
              { icon: "📜", label: "Full History", desc: "View diffs and rollback anytime" },
            ].map((f, i) => (
              <div key={i} style={{ padding: "16px 20px", borderRadius: 12, border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB", textAlign: "center", width: 160 }}>
                <span style={{ fontSize: 24 }}>{f.icon}</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: "8px 0 4px" }}>{f.label}</p>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowConnectModal(true)}
            style={{
              padding: "12px 32px",
              borderRadius: 10,
              border: "none",
              backgroundColor: "#24292F",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            🐙 Connect Repository
          </button>
        </div>
        <GitConnectModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
      </>
    )
  }

  // ── Connected state ──
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ════════ Repository Info Bar ════════ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#24292F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🐙
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>{repository.fullName}</p>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22C55E" }} />
                <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>Connected</span>
              </div>
              <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0" }}>
                {repository.url} • {commits.length} commits • {branches.length} branches
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setShowPushModal(true)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#22C55E",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              🚀 Push to Git
            </button>
            <button
              onClick={disconnectRepository}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                backgroundColor: "white",
                color: "#6B7280",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* ════════ Stats Row ════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          {[
            { label: "Current Branch", value: currentBranch, icon: "🌿", color: "#22C55E" },
            { label: "Total Commits", value: `${commits.length}`, icon: "📝", color: "#3B82F6" },
            { label: "Branches", value: `${branches.length}`, icon: "🔀", color: "#8B5CF6" },
            { label: "Last Push", value: lastPushedAt ? formatDate(lastPushedAt) : "Never", icon: "🕐", color: "#F59E0B" },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: "white", borderRadius: 12, border: "1px solid #E5E7EB", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{stat.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" }}>{stat.label}</span>
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ════════ Branches ════════ */}
        <div style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: "20px 24px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <span>🌿</span> Branches
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {branches.map((branch) => (
              <button
                key={branch.name}
                onClick={() => switchBranch(branch.name)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: currentBranch === branch.name ? "2px solid #4F46E5" : "1px solid #E5E7EB",
                  backgroundColor: currentBranch === branch.name ? "#EEF2FF" : "white",
                  fontSize: 12,
                  fontWeight: currentBranch === branch.name ? 600 : 400,
                  color: currentBranch === branch.name ? "#4F46E5" : "#374151",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "monospace",
                }}
              >
                {branch.isDefault && <span style={{ fontSize: 10 }}>⭐</span>}
                {branch.name}
                {currentBranch === branch.name && (
                  <span style={{ fontSize: 9, backgroundColor: "#4F46E5", color: "white", padding: "1px 6px", borderRadius: 4, fontFamily: "sans-serif" }}>current</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ════════ Commit History ════════ */}
        <div style={{ backgroundColor: "white", borderRadius: 14, border: "1px solid #E5E7EB", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>📜</span>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>Commit History</h3>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", backgroundColor: "#F3F4F6", padding: "2px 8px", borderRadius: 10 }}>
                {filteredCommits.length} commits
              </span>
            </div>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                fontSize: 12,
                outline: "none",
                backgroundColor: "white",
                color: "#374151",
              }}
            >
              <option value="all">All branches</option>
              {branches.map((b) => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Commits */}
          <div>
            {filteredCommits.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center" }}>
                <span style={{ fontSize: 36 }}>📭</span>
                <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 12 }}>No commits yet. Push your first version!</p>
              </div>
            ) : (
              filteredCommits.map((commit, i) => {
                const isExpanded = expandedCommit === commit.id
                const isLatest = i === 0

                return (
                  <div key={commit.id}>
                    <div
                      onClick={() => setExpandedCommit(isExpanded ? null : commit.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "14px 24px",
                        cursor: "pointer",
                        backgroundColor: isExpanded ? "#F9FAFB" : "white",
                        borderBottom: "1px solid #F3F4F6",
                        transition: "background-color 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isExpanded) e.currentTarget.style.backgroundColor = "#FAFBFC"
                      }}
                      onMouseLeave={(e) => {
                        if (!isExpanded) e.currentTarget.style.backgroundColor = "white"
                      }}
                    >
                      {/* Timeline dot */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: isLatest ? "#22C55E" : "#D1D5DB",
                          border: isLatest ? "3px solid #DCFCE7" : "3px solid #F3F4F6",
                        }} />
                      </div>

                      {/* Commit info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {commit.message}
                          </p>
                          {isLatest && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#22C55E", backgroundColor: "#DCFCE7", padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
                              LATEST
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 11, color: "#4F46E5", fontFamily: "monospace", fontWeight: 600 }}>{commit.shortHash}</span>
                          <span style={{ fontSize: 11, color: "#6B7280" }}>{commit.author}</span>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDate(commit.date)}</span>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#6B7280",
                            backgroundColor: "#F3F4F6",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontFamily: "monospace",
                          }}>
                            {commit.branch}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: "#22C55E", fontWeight: 600 }}>+{commit.additions}</span>
                        <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 600 }}>-{commit.deletions}</span>
                      </div>

                      {/* Expand indicator */}
                      <span style={{ fontSize: 10, color: "#9CA3AF", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}>▶</span>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div style={{ padding: "16px 24px 16px 56px", backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", margin: "0 0 4px", textTransform: "uppercase" }}>Full Hash</p>
                            <p style={{ fontSize: 11, color: "#374151", margin: 0, fontFamily: "monospace", wordBreak: "break-all" }}>{commit.hash}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", margin: "0 0 4px", textTransform: "uppercase" }}>Date</p>
                            <p style={{ fontSize: 11, color: "#374151", margin: 0 }}>{new Date(commit.date).toLocaleString()}</p>
                          </div>
                        </div>

                        <p style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", margin: "0 0 8px", textTransform: "uppercase" }}>
                          Files Changed ({commit.filesChanged.length})
                        </p>
                        <div style={{ backgroundColor: "white", borderRadius: 8, border: "1px solid #E5E7EB", padding: "10px 14px" }}>
                          {commit.filesChanged.map((f, j) => (
                            <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                              <span style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: "white",
                                backgroundColor: "#F59E0B",
                                padding: "1px 4px",
                                borderRadius: 3,
                              }}>M</span>
                              <span style={{ fontSize: 12, color: "#374151", fontFamily: "monospace" }}>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <GitPushModal isOpen={showPushModal} onClose={() => setShowPushModal(false)} files={allFiles} />
    </>
  )
}