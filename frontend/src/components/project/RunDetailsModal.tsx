import { useState } from "react"
import { format } from "date-fns"
import type { TerraformRun } from "../../types/project.types"
import { X, Copy, Download, ExternalLink, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { cn } from "../../utils/cn"
import { Button } from "../ui/Button"
import toast from "react-hot-toast"

interface RunDetailsModalProps {
  run: TerraformRun
  isOpen: boolean
  onClose: () => void
}

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Success",
  },
  failed: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Failed",
  },
  running: {
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Running",
  },
  cancelled: {
    icon: AlertCircle,
    color: "text-gray-600",
    bg: "bg-gray-50",
    label: "Cancelled",
  },
}

// Mock logs for demonstration
const MOCK_LOGS = `
[INFO] Terraform initialized in /tmp/terraform
[INFO] Loading configuration from project files...
[INFO] Validating configuration syntax...
✓ Configuration is valid

[INFO] Running terraform plan...
[DEBUG] Planning AWS infrastructure changes...

Terraform will perform the following actions:

+ aws_vpc.main
    create
    + cidr_block           = "10.0.0.0/16"
    + enable_dns_hostnames = true
    + enable_dns_support   = true
    + tags                 = { Name = "main-vpc" }

+ aws_subnet.public
    create
    + availability_zone       = "us-east-1a"
    + cidr_block              = "10.0.1.0/24"
    + map_public_ip_on_launch = true
    + vpc_id                  = aws_vpc.main.id

+ aws_internet_gateway.main
    create
    + vpc_id = aws_vpc.main.id
    + tags   = { Name = "main-igw" }

Plan: 3 to add, 0 to change, 0 to destroy.

[INFO] Terraform plan completed successfully
`

export function RunDetailsModal({
  run,
  isOpen,
  onClose,
}: RunDetailsModalProps) {
  const [logsCopied, setLogsCopied] = useState(false)
  const statusConfig = STATUS_CONFIG[run.status]
  const StatusIcon = statusConfig.icon

  const handleCopyLogs = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_LOGS)
      setLogsCopied(true)
      toast.success("Logs copied to clipboard")
      setTimeout(() => setLogsCopied(false), 2000)
    } catch {
      toast.error("Failed to copy logs")
    }
  }

  const handleDownloadLogs = () => {
    const element = document.createElement("a")
    const file = new Blob([MOCK_LOGS], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `terraform-run-${run.id}.log`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Logs downloaded")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <StatusIcon size={20} className={statusConfig.color} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Terraform Run Details
              </h2>
              <p className="text-sm text-gray-500">
                Run ID: {run.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Status
              </p>
              <p className={cn("text-sm font-semibold", statusConfig.color)}>
                {statusConfig.label}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Command
              </p>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {run.command}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Triggered By
              </p>
              <p className="text-sm font-medium text-gray-900">
                {run.triggeredBy}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Start Time
              </p>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(run.triggeredAt), "MMM dd, HH:mm")}
              </p>
            </div>
          </div>

          {/* Plan Summary */}
          {run.planSummary && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Plan Summary
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-semibold text-green-700 uppercase">
                    Resources to Add
                  </p>
                  <p className="text-2xl font-bold text-green-700 mt-2">
                    +{run.planSummary.add}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-semibold text-blue-700 uppercase">
                    Resources to Change
                  </p>
                  <p className="text-2xl font-bold text-blue-700 mt-2">
                    ~{run.planSummary.change}
                  </p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-semibold text-red-700 uppercase">
                    Resources to Destroy
                  </p>
                  <p className="text-2xl font-bold text-red-700 mt-2">
                    -{run.planSummary.destroy}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {run.errorMessage && (
            <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-2">
                Error Message
              </h3>
              <p className="text-sm text-red-800">
                {run.errorMessage}
              </p>
            </div>
          )}

          {/* Logs Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Execution Logs
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLogs}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors",
                    logsCopied
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <Copy size={14} />
                  {logsCopied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownloadLogs}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-900 p-4 overflow-hidden">
              <pre className="text-xs font-mono text-gray-100 overflow-x-auto">
                {MOCK_LOGS}
              </pre>
            </div>
          </div>

          {/* Additional Links */}
          {run.logUrl && (
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink size={14} className="text-gray-400" />
              <a
                href={run.logUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 underline"
              >
                View full logs in provider console
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RunDetailsModal
