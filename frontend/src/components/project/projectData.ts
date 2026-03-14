export interface ProjectRun {
  id: string
  command: string
  status: string
  duration: string
  at: string
  user: string
  output: string
  errorOutput: string | null
  planSummary: { add: number; change: number; destroy: number } | null
}

export interface Project {
  id: string
  name: string
  description: string
  cloud: string
  components: number
  status: string
  createdAt: string
  updatedAt: string
  lastRun: { status: string; command: string; duration: string; at: string } | null
  variables: number
  secrets: number
  runs: ProjectRun[]
  terraformCode: string
}

export type TabId = "overview" | "runs" | "code" | "variables" | "state" | "security" | "git" | "settings"

export const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "overview", label: "Overview", emoji: "📋" },
  { id: "runs", label: "Runs", emoji: "🚀" },
  { id: "code", label: "Code", emoji: "💻" },
  { id: "variables", label: "Variables", emoji: "{ }" },
  { id: "state", label: "State", emoji: "🗂️" },
  { id: "security", label: "Security", emoji: "🛡️" },
  { id: "git", label: "Git", emoji: "🐙" },
  { id: "settings", label: "Settings", emoji: "⚙️" },
]

export const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: "#10B981", bg: "#ECFDF5", label: "● Active" },
  idle: { color: "#6B7280", bg: "#F3F4F6", label: "○ Idle" },
  failed: { color: "#EF4444", bg: "#FEF2F2", label: "● Failed" },
  running: { color: "#3B82F6", bg: "#EFF6FF", label: "● Running" },
}

export const RUN_STATUS_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  success: { emoji: "✅", color: "#10B981", bg: "#ECFDF5" },
  failed: { emoji: "❌", color: "#EF4444", bg: "#FEF2F2" },
  running: { emoji: "🔄", color: "#3B82F6", bg: "#EFF6FF" },
  pending: { emoji: "⏳", color: "#F59E0B", bg: "#FFFBEB" },
}

export function highlightHCL(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(#.*)/g, '<span style="color:#6A9955">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#CE9178">$1</span>')
    .replace(
      /\b(resource|variable|output|provider|terraform|data|module|locals)\b/g,
      '<span style="color:#C586C0">$1</span>'
    )
    .replace(
      /\b(string|number|bool|list|map|object|set|any|true|false|null)\b/g,
      '<span style="color:#4EC9B0">$1</span>'
    )
    .replace(/^\s*(\w+)(\s*=)/gm, '<span style="color:#9CDCFE">$1</span>$2')
    .replace(/\b(\d+)\b/g, '<span style="color:#B5CEA8">$1</span>')
}

export function colorizeOutput(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(.*Creation complete.*)/g, '<span style="color:#4EC9B0">$1</span>')
    .replace(/(.*successfully initialized.*)/g, '<span style="color:#4EC9B0">$1</span>')
    .replace(/(Apply complete!.*)/g, '<span style="color:#4EC9B0;font-weight:600">$1</span>')
    .replace(/(No changes\..*)/g, '<span style="color:#4EC9B0">$1</span>')
    .replace(/(.*Still creating.*)/g, '<span style="color:#CCA700">$1</span>')
    .replace(/(.*Refreshing state.*)/g, '<span style="color:#6A9955">$1</span>')
    .replace(/(.*will be updated in-place.*)/g, '<span style="color:#CCA700">$1</span>')
    .replace(/(~ .*)/g, '<span style="color:#CCA700">$1</span>')
    .replace(/(\+ .*)/g, '<span style="color:#4EC9B0">$1</span>')
    .replace(/(- .*)/g, '<span style="color:#F44747">$1</span>')
}

export function colorizeError(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(Error:.*)/g, '<span style="color:#F44747;font-weight:600">$1</span>')
}

export function renderLineNumbers(text: string): string {
  return text
    .split("\n")
    .map((_, index) => index + 1)
    .join("\n")
}
