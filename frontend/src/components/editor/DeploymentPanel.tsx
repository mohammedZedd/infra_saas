import { useMemo, useState } from "react"
import { AlertTriangle, Loader2, Rocket, Wand2 } from "lucide-react"
import toast from "react-hot-toast"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import useProjectStore from "../../stores/useProjectStore"
import { useTerraformStore } from "../../stores/useTerraformStore"

export function DeploymentPanel() {
  const [isDestroyModalOpen, setIsDestroyModalOpen] = useState(false)

  const currentProject = useProjectStore((state) => state.currentProject)
  const isExecuting = useTerraformStore((state) => state.isExecuting)
  const currentExecution = useTerraformStore((state) => state.currentExecution)
  const runTerraformAction = useTerraformStore((state) => state.runTerraformAction)

  const runs = currentProject?.runs ?? []
  const lastSuccessfulRun = useMemo(() => runs.find((run) => run.status === "success"), [runs])
  const canApply = !isExecuting && lastSuccessfulRun?.command === "plan"

  const execute = async (command: "plan" | "apply" | "destroy") => {
    try {
      await runTerraformAction(command)
      toast.success(`Terraform ${command} finished`)
    } catch (error) {
      const message = error instanceof Error ? error.message : `Unable to run terraform ${command}`
      toast.error(message)
    }
  }

  const handlePlan = async () => {
    await execute("plan")
  }

  const handleApply = async () => {
    if (!canApply) {
      toast.error("Run a successful plan before apply")
      return
    }
    await execute("apply")
  }

  const handleDestroyConfirm = async () => {
    setIsDestroyModalOpen(false)
    await execute("destroy")
  }

  return (
    <>
      <Card className="space-y-4" padding="md">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Deployment</h3>
          <p className="mt-1 text-sm text-gray-600">Trigger Terraform actions for the current project.</p>
        </div>

        {!currentProject && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Select a project before triggering Terraform operations.
          </div>
        )}

        {isExecuting && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            <Loader2 size={16} className="animate-spin" />
            <span>Running terraform {currentExecution?.command ?? "operation"}...</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            variant="secondary"
            leftIcon={Wand2}
            onClick={handlePlan}
            disabled={isExecuting || !currentProject}
            isLoading={isExecuting && currentExecution?.command === "plan"}
          >
            Plan
          </Button>

          <Button
            variant="primary"
            leftIcon={Rocket}
            onClick={handleApply}
            disabled={!canApply || !currentProject}
            isLoading={isExecuting && currentExecution?.command === "apply"}
          >
            Apply
          </Button>

          <Button
            variant="danger"
            leftIcon={AlertTriangle}
            onClick={() => setIsDestroyModalOpen(true)}
            disabled={isExecuting || !currentProject}
            isLoading={isExecuting && currentExecution?.command === "destroy"}
          >
            Destroy
          </Button>
        </div>

        {!canApply && currentProject && !isExecuting && (
          <p className="text-xs text-amber-700">Apply is enabled only after the latest successful run is a plan.</p>
        )}
      </Card>

      <ConfirmDialog
        open={isDestroyModalOpen}
        onCancel={() => setIsDestroyModalOpen(false)}
        onConfirm={handleDestroyConfirm}
        title="Confirm Terraform destroy"
        description="This action will destroy project infrastructure resources. Are you sure you want to continue?"
        confirmText="Yes, destroy"
        cancelText="Cancel"
        variant="danger"
        isLoading={isExecuting}
      />
    </>
  )
}

export default DeploymentPanel