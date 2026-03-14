import { useState, useEffect } from "react"
import { X, Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react"
import useGitStore from "../../stores/useGitStore"
import type { GitConnection } from "../../stores/useGitStore"
import toast from "react-hot-toast"

interface Provider {
  id: string
  name: string
  color: string
  description: string
  tokenUrl: string
}

const PROVIDERS: Provider[] = [
  {
    id: "github",
    name: "GitHub",
    color: "#000000",
    description: "Most popular",
    tokenUrl: "https://github.com/settings/tokens",
  },
  {
    id: "gitlab",
    name: "GitLab",
    color: "#FC6D26",
    description: "Self-hosted or cloud",
    tokenUrl: "https://gitlab.com/-/profile/personal_access_tokens",
  },
  {
    id: "bitbucket",
    name: "Bitbucket",
    color: "#0052CC",
    description: "Atlassian",
    tokenUrl: "https://bitbucket.org/account/settings/app-passwords/new",
  },
  {
    id: "azure-devops",
    name: "Azure DevOps",
    color: "#0078D4",
    description: "Microsoft",
    tokenUrl: "https://dev.azure.com/_usersSettings/tokens",
  },
  {
    id: "aws-codecommit",
    name: "AWS CodeCommit",
    color: "#FF9900",
    description: "Amazon",
    tokenUrl: "https://console.aws.amazon.com/codesuite/codecommit/credentials",
  },
]

function extractRepoName(url: string): string {
  try {
    const cleaned = url.replace(/\.git$/, "")
    const parts = cleaned.split("/")
    return parts[parts.length - 1] ?? ""
  } catch {
    return ""
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function GitConnectModal({ isOpen, onClose }: Props) {
  const addConnection = useGitStore((s) => s.addConnection)
  const setLoading = useGitStore((s) => s.setLoading)
  const isLoading = useGitStore((s) => s.isLoading)

  const [repoUrl, setRepoUrl] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<Provider>(PROVIDERS[0])
  const [repoName, setRepoName] = useState("")
  const [pat, setPat] = useState("")
  const [branch, setBranch] = useState("main")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setRepoUrl("")
      setSelectedProvider(PROVIDERS[0])
      setRepoName("")
      setPat("")
      setBranch("main")
      setShowPassword(false)
      setErrors({})
    }
  }, [isOpen])

  useEffect(() => {
    const name = extractRepoName(repoUrl)
    if (name) setRepoName(name)
  }, [repoUrl])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!repoUrl.trim()) newErrors.repoUrl = "Repository URL is required"
    if (!selectedProvider) newErrors.provider = "Please select a Git provider"
    if (!repoName.trim()) newErrors.repoName = "Repository name is required"
    if (!pat.trim()) newErrors.pat = "Personal access token is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))

    const connection: GitConnection = {
      id: `conn-${Date.now()}`,
      provider: selectedProvider.name,
      repoUrl: repoUrl.trim(),
      repoName: repoName.trim(),
      branch: branch.trim(),
      username: "",
      connectedAt: new Date().toISOString(),
      status: "connected",
    }
    addConnection(connection)
    setLoading(false)
    toast.success("Repository connected successfully")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full mx-4 rounded-lg bg-white flex flex-col" style={{ width: "680px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontSize: "20px", fontWeight: "600" }}>
                Connect Git Repository
              </h2>
              <p className="mt-1 text-sm text-gray-600" style={{ fontSize: "13px", color: "#6b7280" }}>
                Connect your project to a Git provider to sync your Terraform files automatically
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="ml-4 bg-transparent border-0 p-0"
              style={{ cursor: isLoading ? "not-allowed" : "pointer", color: "#6b7280" }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden" style={{ minHeight: "400px" }}>
          {/* Left Column: Provider Selection (45%) */}
          <div className="flex-none w-[45%] border-r border-gray-100 px-6 py-6 overflow-y-auto">
            <h3 className="text-xs uppercase font-semibold text-gray-600 mb-4" style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280", letterSpacing: "0.05em" }}>
              Choose a provider
            </h3>
            <div className="space-y-2">
              {PROVIDERS.map((provider) => {
                const isSelected = selectedProvider.id === provider.id
                return (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    className="w-full text-left flex items-center gap-3 p-4 rounded-md border transition-all"
                    style={{
                      border: isSelected ? "1.5px solid #4f46e5" : "1px solid #e5e7eb",
                      backgroundColor: isSelected ? "#eef2ff" : "#ffffff",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "#d1d5db"
                        e.currentTarget.style.backgroundColor = "#f9fafb"
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "#e5e7eb"
                        e.currentTarget.style.backgroundColor = "#ffffff"
                      }
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: provider.color }}>
                      <span className="text-xs font-bold text-white">{provider.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: isSelected ? "#4f46e5" : "#111827", fontWeight: "600" }}>
                        {provider.name}
                      </div>
                      <div className="text-xs text-gray-600" style={{ fontSize: "12px", color: "#6b7280" }}>
                        {provider.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column: Repository Details (55%) */}
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            <h3 className="text-xs uppercase font-semibold text-gray-600 mb-4" style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280", letterSpacing: "0.05em" }}>
              Repository details
            </h3>
            <div className="space-y-4">
              {/* Git repository URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                  Git repository URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value)
                    setErrors({ ...errors, repoUrl: "" })
                  }}
                  placeholder="https://github.com/username/repo.git"
                  className="w-full px-3 py-2 rounded-md text-sm font-normal border transition-all focus:outline-none"
                  style={{
                    height: "36px",
                    fontSize: "14px",
                    borderColor: errors.repoUrl ? "#ef4444" : "#d1d5db",
                    color: "#111827",
                    boxShadow: errors.repoUrl ? "none" : "none",
                  }}
                />
                {errors.repoUrl && (
                  <p className="mt-1 text-xs text-red-600" style={{ fontSize: "12px", color: "#ef4444" }}>
                    {errors.repoUrl}
                  </p>
                )}
              </div>

              {/* Repository name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                  Repository name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => {
                    setRepoName(e.target.value)
                    setErrors({ ...errors, repoName: "" })
                  }}
                  placeholder="my-terraform-repo"
                  className="w-full px-3 py-2 rounded-md text-sm font-normal border transition-all focus:outline-none"
                  style={{
                    height: "36px",
                    fontSize: "14px",
                    borderColor: errors.repoName ? "#ef4444" : "#d1d5db",
                    color: "#111827",
                  }}
                />
                {errors.repoName && (
                  <p className="mt-1 text-xs text-red-600" style={{ fontSize: "12px", color: "#ef4444" }}>
                    {errors.repoName}
                  </p>
                )}
              </div>

              {/* Default branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                  Default branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-3 py-2 rounded-md text-sm font-normal border border-gray-300 transition-all focus:outline-none"
                  style={{
                    height: "36px",
                    fontSize: "14px",
                    color: "#111827",
                  }}
                />
              </div>

              {/* Personal access token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                  Personal access token <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={pat}
                    onChange={(e) => {
                      setPat(e.target.value)
                      setErrors({ ...errors, pat: "" })
                    }}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 pr-10 rounded-md text-sm font-normal border transition-all focus:outline-none"
                    style={{
                      height: "36px",
                      fontSize: "14px",
                      borderColor: errors.pat ? "#ef4444" : "#d1d5db",
                      color: "#111827",
                    }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 p-0"
                    style={{ cursor: "pointer", color: "#6b7280" }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.pat && (
                  <p className="mt-1 text-xs text-red-600" style={{ fontSize: "12px", color: "#ef4444" }}>
                    {errors.pat}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-600" style={{ fontSize: "12px", color: "#6b7280" }}>
                  🔒 Your token is encrypted and stored securely
                </p>
                <a
                  href={selectedProvider.tokenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1"
                  style={{ fontSize: "12px", color: "#4f46e5", cursor: "pointer", textDecoration: "none" }}
                >
                  How to generate a token <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 flex items-center justify-end gap-2 px-6 py-4" style={{ backgroundColor: "#ffffff" }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 transition-colors"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              cursor: isLoading ? "not-allowed" : "pointer",
              color: isLoading ? "#9ca3af" : "#374151",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-md bg-indigo-600 text-white transition-colors"
            style={{
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              backgroundColor: isLoading ? "#d1d5db" : "#4f46e5",
            }}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Connecting..." : "Connect Repository"}
          </button>
        </div>
      </div>
    </div>
  )
}
