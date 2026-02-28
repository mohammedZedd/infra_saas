import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Project } from "./projectData"
import useGitStore from "../../stores/useGitStore"
import GitConnectModal from "./GitConnectModal"
import GitPushModal from "./GitPushModal"
import { CodeEditor } from "../ui/CodeEditor"

interface Props {
  project: Project
}

interface FileItem {
  name: string
  type: "file" | "folder"
  icon: string
  children?: FileItem[]
  content?: string
}

function buildFileTree(project: Project): FileItem[] {
  return [
    {
      name: project.name.toLowerCase().replace(/\s+/g, "-"),
      type: "folder",
      icon: "📁",
      children: [
        {
          name: ".terraform",
          type: "folder",
          icon: "📂",
          children: [
            {
              name: "providers",
              type: "folder",
              icon: "📂",
              children: [
                {
                  name: "hashicorp",
                  type: "folder",
                  icon: "📂",
                  children: [{ name: "aws", type: "folder", icon: "📂", children: [] }],
                },
              ],
            },
            { name: ".terraform.lock.hcl", type: "file", icon: "🔒", content: '# This file is maintained automatically by "terraform init".' },
          ],
        },
        { name: "main.tf", type: "file", icon: "📄", content: project.terraformCode },
        {
          name: "variables.tf",
          type: "file",
          icon: "📄",
          content: `variable "aws_region" {\n  description = "AWS region"\n  type        = string\n  default     = "us-east-1"\n}\n\nvariable "environment" {\n  description = "Environment name"\n  type        = string\n  default     = "production"\n}\n\nvariable "instance_type" {\n  description = "EC2 instance type"\n  type        = string\n  default     = "t3.small"\n}\n\nvariable "db_password" {\n  description = "Database password"\n  type        = string\n  sensitive   = true\n}`,
        },
        {
          name: "outputs.tf",
          type: "file",
          icon: "📄",
          content: `output "vpc_id" {\n  description = "The ID of the VPC"\n  value       = aws_vpc.main.id\n}\n\noutput "instance_public_ip" {\n  description = "Public IP of the web instance"\n  value       = aws_instance.web.public_ip\n}\n\noutput "db_endpoint" {\n  description = "Database endpoint"\n  value       = aws_db_instance.postgres.endpoint\n  sensitive   = false\n}`,
        },
        { name: "terraform.tfvars", type: "file", icon: "⚙️", content: `aws_region    = "us-east-1"\nenvironment   = "production"\ninstance_type = "t3.small"` },
        {
          name: "backend.tf",
          type: "file",
          icon: "📄",
          content: `terraform {\n  backend "s3" {\n    bucket = "infradesigner-tfstate"\n    key    = "${project.name.toLowerCase().replace(/\s+/g, "-")}/terraform.tfstate"\n    region = "us-east-1"\n  }\n}`,
        },
        { name: ".gitignore", type: "file", icon: "📝", content: `.terraform/\n*.tfstate\n*.tfstate.*\n*.tfvars\n.terraform.lock.hcl` },
        {
          name: "README.md",
          type: "file",
          icon: "📖",
          content: `# ${project.name}\n\n${project.description}\n\n## Usage\n\n\`\`\`bash\nterraform init\nterraform plan\nterraform apply\n\`\`\`\n\n## Requirements\n\n- Terraform >= 1.6.0\n- AWS Provider ~> 5.0`,
        },
      ],
    },
  ]
}

export default function ProjectCode({ project }: Props) {
  const navigate = useNavigate()
  const fileTree = buildFileTree(project)

  const [selectedFile, setSelectedFile] = useState<string>("main.tf")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([fileTree[0].name, ".terraform"]))

  const repository = useGitStore((s) => s.repository)
  const currentBranch = useGitStore((s) => s.currentBranch)
  const lastPushedAt = useGitStore((s) => s.lastPushedAt)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showPushModal, setShowPushModal] = useState(false)

  const findFileContent = (items: FileItem[], name: string): string | null => {
    for (const item of items) {
      if (item.type === "file" && item.name === name) return item.content || ""
      if (item.children) {
        const found = findFileContent(item.children, name)
        if (found !== null) return found
      }
    }
    return null
  }

  const getAllFileNames = (items: FileItem[]): string[] => {
    const names: string[] = []
    for (const item of items) {
      if (item.type === "file" && !item.name.startsWith(".terraform")) names.push(item.name)
      if (item.children) names.push(...getAllFileNames(item.children))
    }
    return names
  }

  const currentContent = findFileContent(fileTree, selectedFile) || "// No content"
  const allFiles = getAllFileNames(fileTree)

  const toggleFolder = (name: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const renderTree = (items: FileItem[], depth: number = 0) => {
    return items.map((item) => {
      const isExpanded = expandedFolders.has(item.name)
      const isSelected = item.type === "file" && item.name === selectedFile

      return (
        <div key={`${depth}-${item.name}`}>
          <div
            onClick={() => {
              if (item.type === "folder") toggleFolder(item.name)
              else setSelectedFile(item.name)
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px",
              paddingLeft: 8 + depth * 14,
              fontSize: 12,
              color: isSelected ? "#FFFFFF" : "#9CA3AF",
              backgroundColor: isSelected ? "#37415180" : "transparent",
              cursor: "pointer",
              borderRadius: 4,
              transition: "all 0.1s",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = "#1E293B"
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"
            }}
          >
            {item.type === "folder" && (
              <span style={{ fontSize: 8, color: "#64748B", transition: "transform 0.15s", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block", width: 10, flexShrink: 0 }}>▶</span>
            )}
            {item.type === "file" && <span style={{ width: 10, flexShrink: 0 }} />}
            <span style={{ fontSize: 13 }}>{item.icon}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: isSelected ? 500 : 400 }}>{item.name}</span>
          </div>
          {item.type === "folder" && isExpanded && item.children && <div>{renderTree(item.children, depth + 1)}</div>}
        </div>
      )
    })
  }

  const getFileExt = (name: string): string => {
    if (name.endsWith(".tf")) return "HCL"
    if (name.endsWith(".hcl")) return "HCL"
    if (name.endsWith(".md")) return "Markdown"
    if (name.endsWith(".tfvars")) return "HCL Variables"
    return "Text"
  }

  const getLanguage = (fileName: string) => {
    if (fileName.endsWith(".tf") || fileName.endsWith(".hcl") || fileName.endsWith(".tfvars")) return "hcl"
    if (fileName.endsWith(".json")) return "json"
    if (fileName.endsWith(".md")) return "markdown"
    if (fileName.endsWith(".js") || fileName.endsWith(".ts")) return "javascript"
    return "plaintext"
  }

  const formatPushedAt = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    return `${Math.floor(diffMins / 60)}h ago`
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", borderRadius: 12, overflow: "hidden", border: "1px solid #1E293B", height: "calc(100vh - 320px)", minHeight: 500 }}>
      {/* ════════ TOP BAR ════════ */}
      <div style={{ display: "flex", alignItems: "center", backgroundColor: "#1E293B", padding: "0 8px", flexShrink: 0, height: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", backgroundColor: "#0F172A", borderRadius: "6px 6px 0 0", marginTop: 4, cursor: "pointer" }}>
          <span style={{ fontSize: 12 }}>📄</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: "#E2E8F0", fontFamily: "monospace" }}>{selectedFile}</span>
        </div>

        <div style={{ flex: 1 }} />

        {repository && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22C55E" }} />
            <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>{currentBranch}</span>
            {lastPushedAt && (
              <span style={{ fontSize: 10, color: "#64748B" }}>• pushed {formatPushedAt(lastPushedAt)}</span>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => navigator.clipboard.writeText(currentContent)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", backgroundColor: "#334155", color: "#94A3B8", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            📋 Copy
          </button>
          <button
            onClick={() => {
              const blob = new Blob([currentContent], { type: "text/plain" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = selectedFile
              a.click()
              URL.revokeObjectURL(url)
            }}
            style={{ padding: "4px 10px", borderRadius: 6, border: "none", backgroundColor: "#334155", color: "#94A3B8", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            ⬇️ Download
          </button>

          {repository ? (
            <button onClick={() => setShowPushModal(true)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", backgroundColor: "#22C55E", color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              🚀 Push to Git
            </button>
          ) : (
            <button onClick={() => setShowConnectModal(true)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", backgroundColor: "#24292F", color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              🐙 Connect Git
            </button>
          )}

          <button onClick={() => navigate(`/editor/${project.id}`)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", backgroundColor: "#4F46E5", color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            🎨 Edit in Designer
          </button>
        </div>
      </div>

      {/* ════════ BODY ════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 220, minWidth: 220, backgroundColor: "#111827", borderRight: "1px solid #1E293B", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "10px 12px", fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "1px solid #1E293B" }}>
            Explorer
          </div>
          <div style={{ padding: "6px 0" }}>{renderTree(fileTree)}</div>
        </div>

        <div style={{ flex: 1, backgroundColor: "#1e1e1e", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <CodeEditor
            value={currentContent}
            language={getLanguage(selectedFile)}
            theme="dark"
            height="100%"
            readOnly={true}
            className="h-full w-full"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              lineHeight: 22,
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: "none",
            }}
          />
        </div>
      </div>

      {/* ════════ STATUS BAR ════════ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px", backgroundColor: "#4F46E5", flexShrink: 0, height: 24 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{getFileExt(selectedFile)}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>UTF-8</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{currentContent.split("\n").length} lines</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {repository && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 4 }}>
              🐙 {repository.fullName} • {currentBranch}
            </span>
          )}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>Terraform v1.6.4</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>AWS Provider v5.31.0</span>
        </div>
      </div>

      <GitConnectModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
      <GitPushModal isOpen={showPushModal} onClose={() => setShowPushModal(false)} files={allFiles} />
    </div>
  )
}