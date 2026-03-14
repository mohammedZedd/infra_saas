import { useState } from "react"
import { GitBranch, MoreVertical, ExternalLink, Pencil, Trash2, Folder, FileText, Plus, Download, Upload } from "lucide-react"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import useGitStore from "../../stores/useGitStore"
import type { GitConnection } from "../../stores/useGitStore"
import GitConnectModal from "./GitConnectModal"
import GitEditModal from "./GitEditModal"
import toast from "react-hot-toast"
import { cn } from "../../utils/cn"

// ── Provider helpers ─────────────────────────────────────────────────────────

function providerColor(provider: string): string {
  const p = provider.toLowerCase()
  if (p.includes("github")) return "#000000"
  if (p.includes("gitlab")) return "#FC6D26"
  if (p.includes("bitbucket")) return "#0052CC"
  if (p.includes("azure")) return "#0078D4"
  if (p.includes("aws") || p.includes("codecommit")) return "#FF9900"
  return "#6366F1"
}

function ProviderIcon({ provider, size = 32 }: { provider: string; size?: number }) {
  const color = providerColor(provider)
  const p = provider.toLowerCase()

  if (p.includes("github")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    )
  }

  if (p.includes("gitlab")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
      </svg>
    )
  }

  if (p.includes("bitbucket")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646l3.27-20.03a.768.768 0 0 0-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
      </svg>
    )
  }

  // Fallback: letter avatar
  return (
    <div
      style={{ width: size, height: size, background: color }}
      className="flex items-center justify-center rounded-lg text-white font-bold text-sm"
    >
      {provider[0]?.toUpperCase() ?? "G"}
    </div>
  )
}

// ── Mock file browser data ───────────────────────────────────────────────────

const MOCK_FILES = [
  { name: "modules/", type: "Folder", modified: "Oct 28, 2025", isFolder: true },
  { name: "main.tf", type: "File", modified: "Oct 28, 2025", isFolder: false },
  { name: "variables.tf", type: "File", modified: "Oct 27, 2025", isFolder: false },
  { name: "outputs.tf", type: "File", modified: "Oct 27, 2025", isFolder: false },
  { name: "terraform.tfvars", type: "File", modified: "Oct 26, 2025", isFolder: false },
]

// ── Sub-components ──────────────────────────────────────────────────────────

function ConnectionCard({
  connection,
  onEdit,
  onDisconnect,
}: {
  connection: GitConnection
  onEdit: (c: GitConnection) => void
  onDisconnect: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Provider icon */}
        <div className="shrink-0">
          <ProviderIcon provider={connection.provider} size={36} />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-gray-900">
              {connection.repoName}
            </p>
            {connection.username && (
              <span className="text-sm text-gray-500">({connection.username})</span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            {connection.provider} · Personal access token
          </p>
          <p className="mt-0.5 font-mono text-xs text-gray-400 truncate">{connection.repoUrl}</p>
        </div>

        {/* Status + actions */}
        <div className="flex shrink-0 items-center gap-3">
          <Badge variant="success" dot>Connected</Badge>

          <Button
            variant="outline"
            size="sm"
            leftIcon={Pencil}
            onClick={() => onEdit(connection)}
          >
            Edit
          </Button>

          {/* Three-dot menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      window.open(connection.repoUrl, "_blank")
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink size={13} /> View on {connection.provider.split(" ")[0]}
                  </button>
                  <button
                    onClick={() => {
                      onDisconnect(connection.id)
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={13} /> Disconnect
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FileBrowser() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Repository Contents</h3>
        <p className="mt-0.5 text-xs text-gray-500">Files synced from the connected repository</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Type</th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Last modified</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {MOCK_FILES.map((file) => (
            <tr key={file.name} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  {file.isFolder
                    ? <Folder size={15} className="text-amber-400" />
                    : <FileText size={15} className="text-gray-400" />
                  }
                  <span className={cn("font-mono text-sm", file.isFolder ? "text-indigo-600 font-medium" : "text-gray-800")}>
                    {file.name}
                  </span>
                </div>
              </td>
              <td className="px-5 py-3 text-gray-500">{file.type}</td>
              <td className="px-5 py-3 text-gray-500">{file.modified}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Sync Status Section ──────────────────────────────────────────────────────

function SyncStatus() {
  const [pullLoading, setPullLoading] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [commitError, setCommitError] = useState("")

  const lastPulledAt = useGitStore((s) => s.lastPulledAt)
  const lastPushedAt = useGitStore((s) => s.lastPushedAt)
  const pendingPullFiles = useGitStore((s) => s.pendingPullFiles)
  const pendingPushFiles = useGitStore((s) => s.pendingPushFiles)
  const commitMessage = useGitStore((s) => s.commitMessage)
  const setCommitMessage = useGitStore((s) => s.setCommitMessage)
  const simulatePull = useGitStore((s) => s.simulatePull)
  const simulatePush = useGitStore((s) => s.simulatePush)

  const handlePull = async () => {
    setPullLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      simulatePull()
      toast.success(
        `✅ ${pendingPullFiles.length} ${pendingPullFiles.length === 1 ? "file" : "files"} pulled successfully`
      )
    } finally {
      setPullLoading(false)
    }
  }

  const handlePush = async () => {
    if (!commitMessage.trim()) {
      setCommitError("Commit message is required")
      return
    }
    setCommitError("")
    setPushLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      simulatePush()
      toast.success(
        `✅ ${pendingPushFiles.length} ${pendingPushFiles.length === 1 ? "file" : "files"} pushed successfully`
      )
    } finally {
      setPushLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Sync Status</h3>
        <p className="mt-0.5 text-xs text-gray-500">Pull changes from remote or push local changes</p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-5">
        {/* ── Pull Card ── */}
        <div className="rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Download size={16} className="text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Pull changes</h4>
              <p className="text-xs text-gray-500">Fetch latest from remote</p>
            </div>
          </div>

          <div className="mb-3 rounded bg-gray-50 p-2.5 text-xs text-gray-600">
            <div className="font-medium mb-1">Last pulled: {lastPulledAt}</div>
          </div>

          {pendingPullFiles.length > 0 && (
            <div className="mb-3 space-y-1">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Available ({pendingPullFiles.length})
              </div>
              <ul className="space-y-1 text-xs text-gray-600">
                {pendingPullFiles.map((file) => (
                  <li key={file} className="flex items-center gap-1.5">
                    <span className="text-gray-300">•</span>
                    <span className="font-mono">{file}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            isLoading={pullLoading}
            disabled={pendingPullFiles.length === 0}
            onClick={handlePull}
            className="w-full"
          >
            {pullLoading ? "Pulling..." : "Pull changes"}
          </Button>
        </div>

        {/* ── Push Card ── */}
        <div className="rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Upload size={16} className="text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Push changes</h4>
              <p className="text-xs text-gray-500">Send to remote repo</p>
            </div>
          </div>

          <div className="mb-3 rounded bg-gray-50 p-2.5 text-xs text-gray-600">
            <div className="font-medium mb-1">Last pushed: {lastPushedAt}</div>
          </div>

          {pendingPushFiles.length > 0 && (
            <div className="mb-3 space-y-1">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Local changes ({pendingPushFiles.length})
              </div>
              <ul className="space-y-1 text-xs text-gray-600">
                {pendingPushFiles.map((file) => (
                  <li key={file} className="flex items-center gap-1.5">
                    <span className="text-gray-300">•</span>
                    <span className="font-mono">{file}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <textarea
            placeholder="Describe your changes..."
            value={commitMessage}
            onChange={(e) => {
              setCommitMessage(e.target.value)
              setCommitError("")
            }}
            className={cn(
              "w-full resize-none rounded border p-2 text-xs font-mono focus:outline-none focus:ring-2 mb-2",
              commitError
                ? "border-red-200 focus:ring-red-200"
                : "border-gray-200 focus:ring-indigo-200"
            )}
            rows={3}
          />
          {commitError && <p className="text-xs text-red-600 mb-2">{commitError}</p>}

          <Button
            variant="primary"
            size="sm"
            isLoading={pushLoading}
            disabled={pendingPushFiles.length === 0}
            onClick={handlePush}
            className="w-full"
          >
            {pushLoading ? "Pushing..." : "Push changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Sync History Section ─────────────────────────────────────────────────────

function SyncHistory() {
  const syncHistory = useGitStore((s) => s.syncHistory)

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Sync History</h3>
        <p className="mt-0.5 text-xs text-gray-500">Recent pull and push activity</p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Action</th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Files</th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Message</th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {syncHistory.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3">
                <Badge
                  variant={entry.action === "push" ? "blue" : "success"}
                  dot
                >
                  {entry.action === "push" ? "Push" : "Pull"}
                </Badge>
              </td>
              <td className="px-5 py-3 text-gray-600 font-mono text-xs">
                {entry.filesCount} {entry.filesCount === 1 ? "file" : "files"}
              </td>
              <td className="px-5 py-3 text-gray-700 text-sm">{entry.message}</td>
              <td className="px-5 py-3 text-gray-500 text-xs">{entry.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  projectId?: string
}

export default function ProjectGit({ projectId: _projectId }: Props) {
  const connections = useGitStore((s) => s.connections)
  const removeConnection = useGitStore((s) => s.removeConnection)

  const [showConnect, setShowConnect] = useState(false)
  const [editTarget, setEditTarget] = useState<GitConnection | null>(null)

  const handleDisconnect = (id: string) => {
    removeConnection(id)
    toast.success("Repository disconnected")
  }

  const hasConnections = connections.length > 0

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Git Integration</h2>
          <p className="mt-1 text-sm text-gray-500">Connect your project to a Git repository</p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => setShowConnect(true)}>
          Add Git credential
        </Button>
      </div>

      {/* ── Empty state ── */}
      {!hasConnections && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/60 py-16 text-center">
          <div className="mb-4 rounded-full bg-indigo-100 p-4">
            <GitBranch className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No Git repository connected</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            Connect a Git provider to sync your Terraform files automatically.
          </p>
          <Button variant="primary" onClick={() => setShowConnect(true)} className="mt-6">
            Connect Git repository
          </Button>
        </div>
      )}

      {/* ── Connected repos ── */}
      {hasConnections && (
        <div className="space-y-4">
          {connections.map((conn) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              onEdit={(c) => setEditTarget(c)}
              onDisconnect={handleDisconnect}
            />
          ))}

          <FileBrowser />

          {/* ── Sync Status ── */}
          <SyncStatus />

          {/* ── Sync History ── */}
          <SyncHistory />
        </div>
      )}

      {/* ── Modals ── */}
      <GitConnectModal isOpen={showConnect} onClose={() => setShowConnect(false)} />
      {editTarget && (
        <GitEditModal
          isOpen={editTarget !== null}
          onClose={() => setEditTarget(null)}
          connection={editTarget}
        />
      )}
    </div>
  )
}

