import { useCallback, useEffect, useState } from "react"
import type { TerraformRun } from "../types/project.types"
import {
  listProjectRuns,
  getRunLogs,
  triggerTerraformPlan,
  triggerTerraformApply,
  triggerTerraformDestroy,
  cancelTerraformRun,
  retryTerraformRun,
} from "../services/api"
import toast from "react-hot-toast"

export interface UseProjectRunsState {
  runs: TerraformRun[]
  isLoading: boolean
  isTriggering: boolean
  selectedRun: TerraformRun | null
  runLogs: string | null
  error: string | null
}

interface UseProjectRunsReturn extends UseProjectRunsState {
  fetchRuns: () => Promise<void>
  selectRun: (run: TerraformRun) => void
  clearSelection: () => void
  fetchRunLogs: (runId: string) => Promise<void>
  triggerPlan: () => Promise<void>
  triggerApply: () => Promise<void>
  triggerDestroy: () => Promise<void>
  cancelRun: (runId: string) => Promise<void>
  retryRun: (runId: string) => Promise<void>
}

/**
 * Custom hook for managing Terraform run history and operations.
 * Handles fetching, selecting, and triggering Terraform commands.
 *
 * @param projectId - The ID of the project
 * @returns Object with runs state and functions to manage them
 */
export function useProjectRuns(projectId: string): UseProjectRunsReturn {
  const [state, setState] = useState<UseProjectRunsState>({
    runs: [],
    isLoading: false,
    isTriggering: false,
    selectedRun: null,
    runLogs: null,
    error: null,
  })

  // Fetch all runs for the project
  const fetchRuns = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await listProjectRuns<TerraformRun[]>(projectId)
      setState((prev) => ({
        ...prev,
        runs: data || [],
        isLoading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch runs"
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      toast.error(message)
    }
  }, [projectId])

  // Select a run and fetch its logs
  const selectRun = useCallback((run: TerraformRun) => {
    setState((prev) => ({
      ...prev,
      selectedRun: run,
      runLogs: null,
    }))
  }, [])

  // Clear selected run
  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedRun: null,
      runLogs: null,
    }))
  }, [])

  // Fetch logs for a specific run
  const fetchRunLogs = useCallback(
    async (runId: string) => {
      setState((prev) => ({ ...prev, isLoading: true }))
      try {
        const logs = await getRunLogs<string>(projectId, runId)
        setState((prev) => ({
          ...prev,
          runLogs: logs,
          isLoading: false,
        }))
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch logs"
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }))
        toast.error(message)
      }
    },
    [projectId]
  )

  // Trigger a Terraform plan
  const triggerPlan = useCallback(async () => {
    setState((prev) => ({ ...prev, isTriggering: true, error: null }))
    try {
      await triggerTerraformPlan(projectId)
      toast.success("Plan triggered successfully")
      await fetchRuns()
      setState((prev) => ({ ...prev, isTriggering: false }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to trigger plan"
      setState((prev) => ({
        ...prev,
        isTriggering: false,
        error: message,
      }))
    }
  }, [projectId, fetchRuns])

  // Trigger a Terraform apply
  const triggerApply = useCallback(async () => {
    setState((prev) => ({ ...prev, isTriggering: true, error: null }))
    try {
      await triggerTerraformApply(projectId)
      toast.success("Apply triggered successfully")
      await fetchRuns()
      setState((prev) => ({ ...prev, isTriggering: false }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to trigger apply"
      setState((prev) => ({
        ...prev,
        isTriggering: false,
        error: message,
      }))
    }
  }, [projectId, fetchRuns])

  // Trigger a Terraform destroy
  const triggerDestroy = useCallback(async () => {
    setState((prev) => ({ ...prev, isTriggering: true, error: null }))
    try {
      await triggerTerraformDestroy(projectId)
      toast.success("Destroy triggered successfully")
      await fetchRuns()
      setState((prev) => ({ ...prev, isTriggering: false }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to trigger destroy"
      setState((prev) => ({
        ...prev,
        isTriggering: false,
        error: message,
      }))
    }
  }, [projectId, fetchRuns])

  // Cancel a running Terraform run
  const cancelRun = useCallback(
    async (runId: string) => {
      setState((prev) => ({ ...prev, isTriggering: true }))
      try {
        await cancelTerraformRun(projectId, runId)
        toast.success("Run cancelled")
        await fetchRuns()
        setState((prev) => ({ ...prev, isTriggering: false }))
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to cancel run"
        setState((prev) => ({
          ...prev,
          isTriggering: false,
          error: message,
        }))
        toast.error(message)
      }
    },
    [projectId, fetchRuns]
  )

  // Retry a failed Terraform run
  const retryRun = useCallback(
    async (runId: string) => {
      setState((prev) => ({ ...prev, isTriggering: true }))
      try {
        await retryTerraformRun(projectId, runId)
        toast.success("Run retried")
        await fetchRuns()
        setState((prev) => ({ ...prev, isTriggering: false }))
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to retry run"
        setState((prev) => ({
          ...prev,
          isTriggering: false,
          error: message,
        }))
        toast.error(message)
      }
    },
    [projectId, fetchRuns]
  )

  // Fetch runs on component mount
  useEffect(() => {
    fetchRuns()
  }, [fetchRuns])

  return {
    ...state,
    fetchRuns,
    selectRun,
    clearSelection,
    fetchRunLogs,
    triggerPlan,
    triggerApply,
    triggerDestroy,
    cancelRun,
    retryRun,
  }
}

export default useProjectRuns
