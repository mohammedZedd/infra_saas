import { useState } from "react"
import useGitStore from "../../stores/useGitStore"
import type { GitRepository } from "../../types/git"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const MOCK_REPOS: GitRepository[] = [
  {
    id: "r1",
    name: "infra-production",
    fullName: "my-org/infra-production",
    url: "https://github.com/my-org/infra-production",
    provider: "github",
    defaultBranch: "main",
    isConnected: false,
  },
  {
    id: "r2",
    name: "terraform-modules",
    fullName: "my-org/terraform-modules",
    url: "https://github.com/my-org/terraform-modules",
    provider: "github",
    defaultBranch: "main",
    isConnected: false,
  },
  {
    id: "r3",
    name: "infra-staging",
    fullName: "my-org/infra-staging",
    url: "https://github.com/my-org/infra-staging",
    provider: "github",
    defaultBranch: "main",
    isConnected: false,
  },
]

export default function GitConnectModal({ isOpen, onClose }: Props) {
  const connectRepository = useGitStore((s) => s.connectRepository)
  const [selectedProvider, setSelectedProvider] = useState<"github" | "gitlab" | "bitbucket">("github")
  const [searchQuery, setSearchQuery] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)

  if (!isOpen) return null

  const filteredRepos = MOCK_REPOS.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleConnect = async (repo: GitRepository) => {
    setIsConnecting(true)
    setSelectedRepo(repo.id)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    connectRepository({ ...repo, isConnected: true })
    setIsConnecting(false)
    onClose()
  }

  const providers = [
    { id: "github" as const, label: "GitHub", icon: "🐙", color: "#24292F" },
    { id: "gitlab" as const, label: "GitLab", icon: "🦊", color: "#FC6D26" },
    { id: "bitbucket" as const, label: "Bitbucket", icon: "🪣", color: "#2684FF" },
  ]

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose} />

      <div style={{ position: "relative", width: 520, maxHeight: "80vh", backgroundColor: "white", borderRadius: 16, boxShadow: "0 25px 50px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Connect Git Repository</h2>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: "4px 0 0" }}>Push your Terraform code to a Git repository</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E5E7EB", backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#6B7280" }}>✕</button>
        </div>

        {/* Provider tabs */}
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 8 }}>
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(p.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: selectedProvider === p.id ? `2px solid ${p.color}` : "1px solid #E5E7EB",
                backgroundColor: selectedProvider === p.id ? `${p.color}08` : "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: selectedProvider === p.id ? 600 : 400,
                color: selectedProvider === p.id ? p.color : "#6B7280",
              }}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: "16px 24px" }}>
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Repo list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  backgroundColor: selectedRepo === repo.id ? "#F9FAFB" : "white",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📁</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{repo.fullName}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0" }}>Branch: {repo.defaultBranch}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleConnect(repo)}
                  disabled={isConnecting}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "none",
                    backgroundColor: isConnecting && selectedRepo === repo.id ? "#9CA3AF" : "#4F46E5",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: isConnecting ? "not-allowed" : "pointer",
                  }}
                >
                  {isConnecting && selectedRepo === repo.id ? "Connecting..." : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}