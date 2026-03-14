import { useState } from "react"
import { useParams } from "react-router-dom"
import {
  Shield,
  Key,
  Webhook,
  ClipboardList,
  Eye,
  EyeOff,
  Plus,
  Save,
  Copy,
} from "lucide-react"
import toast from "react-hot-toast"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiKey {
  id: string
  name: string
  maskedKey: string
  createdAt: string
}

interface AuditEntry {
  id: string
  message: string
  timestamp: string
}

interface AccessControl {
  requireAuth: boolean
  allowPublicAccess: boolean
  ipAllowlist: boolean
}

interface WebhookConfig {
  url: string
  enabled: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length: 32 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("")
}

function maskKey(raw: string): string {
  return `sk_${raw.slice(0, 4)}${"*".repeat(12)}`
}

function now(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold text-gray-900 mb-4">{children}</h2>
  )
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="min-w-0 flex-1 pr-4">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

// ─── Access Control ───────────────────────────────────────────────────────────

function AccessControlSection() {
  const [settings, setSettings] = useState<AccessControl>({
    requireAuth: true,
    allowPublicAccess: false,
    ipAllowlist: false,
  })

  function patch(key: keyof AccessControl, value: boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    toast.success("Access control updated")
  }

  return (
    <SectionCard>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <SectionTitle>Access Control</SectionTitle>
      </div>
      <ToggleRow
        label="Require authentication"
        description="All requests must include a valid API token."
        checked={settings.requireAuth}
        onChange={(v) => patch("requireAuth", v)}
      />
      <ToggleRow
        label="Allow public access"
        description="Unauthenticated users can read project resources."
        checked={settings.allowPublicAccess}
        onChange={(v) => patch("allowPublicAccess", v)}
      />
      <ToggleRow
        label="IP allowlist"
        description="Restrict access to a defined list of IP ranges."
        checked={settings.ipAllowlist}
        onChange={(v) => patch("ipAllowlist", v)}
      />
    </SectionCard>
  )
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

interface ApiKeyRowProps {
  apiKey: ApiKey
  onRevoke: (id: string) => void
}

function ApiKeyRow({ apiKey, onRevoke }: ApiKeyRowProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{apiKey.name}</p>
        <p className="text-xs font-mono text-gray-500 mt-0.5">
          {visible ? `sk_${apiKey.maskedKey.slice(3)}` : apiKey.maskedKey}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Created {apiKey.createdAt}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          title={visible ? "Hide key" : "Show key"}
          onClick={() => setVisible((v) => !v)}
          className="border border-gray-200 rounded p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          title="Copy key"
          onClick={() => {
            void navigator.clipboard.writeText(apiKey.maskedKey)
            toast.success("Key copied to clipboard")
          }}
          className="border border-gray-200 rounded p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onRevoke(apiKey.id)}
          className="border border-red-200 rounded px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Revoke
        </button>
      </div>
    </div>
  )
}

const INITIAL_KEYS: ApiKey[] = [
  {
    id: "key-1",
    name: "Production API Key",
    maskedKey: "sk_prod***********",
    createdAt: "Feb 12, 2026",
  },
  {
    id: "key-2",
    name: "CI/CD Deploy Key",
    maskedKey: "sk_ci_***********",
    createdAt: "Jan 28, 2026",
  },
]

function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS)
  const [newKeyName, setNewKeyName] = useState("")
  const [creating, setCreating] = useState(false)

  function handleCreate() {
    const trimmed = newKeyName.trim()
    if (!trimmed) return

    const raw = generateKey()
    const next: ApiKey = {
      id: `key-${Date.now()}`,
      name: trimmed,
      maskedKey: maskKey(raw),
      createdAt: now(),
    }
    setKeys((prev) => [next, ...prev])
    setNewKeyName("")
    setCreating(false)
    toast.success(`API key "${trimmed}" created`)
  }

  function handleRevoke(id: string) {
    setKeys((prev) => prev.filter((k) => k.id !== id))
    toast.success("API key revoked")
  }

  return (
    <SectionCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          <SectionTitle>API Keys</SectionTitle>
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create API Key
          </button>
        )}
      </div>

      {creating && (
        <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="text"
            placeholder="Key name (e.g. Production)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newKeyName.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => { setCreating(false); setNewKeyName("") }}
            className="border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {keys.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">No API keys yet. Create one to get started.</p>
      ) : (
        keys.map((k) => (
          <ApiKeyRow key={k.id} apiKey={k} onRevoke={handleRevoke} />
        ))
      )}
    </SectionCard>
  )
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

function WebhooksSection() {
  const [config, setConfig] = useState<WebhookConfig>({
    url: "",
    enabled: false,
  })
  const [saved, setSaved] = useState<WebhookConfig>({ url: "", enabled: false })

  function handleSave() {
    if (config.url && !/^https?:\/\/.+/.test(config.url)) {
      toast.error("Please enter a valid URL starting with http:// or https://")
      return
    }
    setSaved(config)
    toast.success("Webhook settings saved")
  }

  const isDirty = config.url !== saved.url || config.enabled !== saved.enabled

  return (
    <SectionCard>
      <div className="flex items-center gap-2 mb-4">
        <Webhook className="w-5 h-5 text-blue-600" />
        <SectionTitle>Webhooks</SectionTitle>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="webhook-url"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Webhook URL
          </label>
          <input
            id="webhook-url"
            type="url"
            placeholder="https://your-server.com/webhook"
            value={config.url}
            onChange={(e) => setConfig((prev) => ({ ...prev, url: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <ToggleRow
          label="Enable webhook"
          description="Send event notifications to the URL above."
          checked={config.enabled}
          onChange={(v) => setConfig((prev) => ({ ...prev, enabled: v }))}
        />

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Save webhook
          </button>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

const INITIAL_AUDIT: AuditEntry[] = [
  { id: "a1", message: "API key created: Production API Key", timestamp: "Feb 12, 2026 09:14" },
  { id: "a2", message: "Security setting updated: Require authentication enabled", timestamp: "Feb 10, 2026 15:32" },
  { id: "a3", message: "Webhook enabled", timestamp: "Feb 08, 2026 11:05" },
  { id: "a4", message: "API key revoked: Staging Key", timestamp: "Feb 06, 2026 20:47" },
  { id: "a5", message: "IP allowlist setting changed", timestamp: "Jan 29, 2026 08:22" },
]

function AuditLogSection() {
  const [entries] = useState<AuditEntry[]>(INITIAL_AUDIT)

  return (
    <SectionCard>
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-blue-600" />
        <SectionTitle>Audit Log</SectionTitle>
      </div>

      <ul className="divide-y divide-gray-100">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-start justify-between gap-4 py-3">
            <p className="text-sm text-gray-700">{entry.message}</p>
            <span className="text-xs text-gray-400 shrink-0 mt-0.5">{entry.timestamp}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectSecurity() {
  // projectId available for future API calls
  const { projectId } = useParams<{ projectId: string }>()

  // Suppress unused-variable warning until API calls are wired up
  void projectId

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <AccessControlSection />
      <ApiKeysSection />
      <WebhooksSection />
      <AuditLogSection />
    </div>
  )
}
