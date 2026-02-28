import { useState } from "react"
import { Play, AlertTriangle, Zap, Loader } from "lucide-react"
import type { TerraformRun } from "../../types/project.types"
import { Button } from "../ui/Button"
import { Card } from "../ui/Card"
import { cn } from "../../utils/cn"
import toast from "react-hot-toast"

interface DeploymentPanelProps {
  projectId: string
  lastRun?: TerraformRun
  isLoading?: boolean
  isTriggering?: boolean
  onTriggerPlan: () => Promise<void>
  onTriggerApply: () => Promise<void>
  onTriggerDestroy: () => Promise<void>
}

export function DeploymentPanel({
  lastRun,
  isLoading,
  isTriggering,
  onTriggerPlan,
  onTriggerApply,
  onTriggerDestroy,
}: DeploymentPanelProps) {
  const [showDestroyConfirm, setShowDestroyConfirm] = useState(false)

  const handleDestroyClick = async () => {
    if (!showDestroyConfirm) {
      setShowDestroyConfirm(true)
      toast.error("Click again to confirm destroy - this action cannot be undone!")
      return
    }
    setShowDestroyConfirm(false)
    try {
      await onTriggerDestroy()
    } catch {
      // Error is handled by the parent
    }
  }

  const statusColor: Record<string, string> = {
    success: "text-green-600 bg-green-50 border-green-200",
    failed: "text-red-600 bg-red-50 border-red-200",
    running: "text-blue-600 bg-blue-50 border-blue-200",
    cancelled: "text-gray-600 bg-gray-50 border-gray-200",
  }

  const getStatusMessage = () => {
    if (!lastRun) return "No runs yet"
    if (lastRun.status === "running") return "Deployment in progress..."
    if (lastRun.status === "success") return `Last deployment succeeded`
    if (lastRun.status === "failed") return "Last deployment failed"
    return "No recent status"
  }

  return (
    <Card className={cn(
      "border-2",
      lastRun ? statusColor[lastRun.status] || "border-gray-200" : "border-gray-200"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Deployment Actions</h3>
          <p className="text-sm text-gray-600 mt-1">
            {getStatusMessage()}
          </p>
        </div>
        {isTriggering && (
          <Loader size={20} className="animate-spin text-blue-600" />
        )}
      </div>

      {lastRun?.status === "failed" && lastRun?.errorMessage && (
        <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {lastRun.errorMessage}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
            Workflow
          </label>
          <div className="flex gap-2">
            <Button
              onClick={onTriggerPlan}
              disabled={isTriggering || isLoading}
              size="sm"
              variant="secondary"
              leftIcon={Zap}
              className="flex-1"
            >
              Plan
            </Button>
            <Button
              onClick={onTriggerApply}
              disabled={isTriggering || isLoading}
              size="sm"
              variant="primary"
              leftIcon={Play}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
            Danger Zone
          </label>
          <Button
            onClick={handleDestroyClick}
            disabled={isTriggering || isLoading}
            size="sm"
            variant="danger"
            leftIcon={AlertTriangle}
            className="w-full"
          >
            {showDestroyConfirm ? "Confirm Destroy" : "Destroy Infrastructure"}
          </Button>
          {showDestroyConfirm && (
            <p className="text-xs text-red-700 mt-2">
              ⚠️ Click the button again to confirm. This will destroy all infrastructure.
            </p>
          )}
        </div>
      </div>

      {/* Plan Summary */}
      {lastRun?.planSummary && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Latest Plan Summary
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded bg-green-50 p-2 text-center">
              <p className="text-xs text-green-700 font-medium">
                +{lastRun.planSummary.add}
              </p>
              <p className="text-xs text-green-600">Add</p>
            </div>
            <div className="rounded bg-blue-50 p-2 text-center">
              <p className="text-xs text-blue-700 font-medium">
                ~{lastRun.planSummary.change}
              </p>
              <p className="text-xs text-blue-600">Change</p>
            </div>
            <div className="rounded bg-red-50 p-2 text-center">
              <p className="text-xs text-red-700 font-medium">
                -{lastRun.planSummary.destroy}
              </p>
              <p className="text-xs text-red-600">Destroy</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default DeploymentPanel
