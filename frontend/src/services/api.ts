import axios from "axios"
import toast from "react-hot-toast"
import type { ApiRequestConfig } from "../types/api.types"
import useAuthStore from "../stores/useAuthStore"

/**
 * Configured Axios instance. Reads VITE_API_URL from the environment,
 * falling back to the local dev server.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
})

// ── Request interceptor — attach bearer token ──────────────────────────────
apiClient.interceptors.request.use((config) => {
  // Use getState() (not the hook) so this works outside React components
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// ── Response interceptor — global error handling ───────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number = error.response?.status

    if (status === 401) {
      useAuthStore.getState().logout()
      window.location.href = "/login"
    } else if (status === 403) {
      toast.error("You don't have permission to perform this action.")
    } else if (status === 422) {
      const details = error.response?.data?.details
      const first = details ? Object.values(details).flat()[0] : "Validation error."
      toast.error(String(first))
    } else if (status >= 500) {
      toast.error("Something went wrong. Please try again.")
    }

    return Promise.reject(error)
  }
)

// ── Typed helper functions ─────────────────────────────────────────────────

/** Performs a typed GET request. */
export async function apiGet<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  const { data } = await apiClient.get<T>(url, config)
  return data
}

/** Performs a typed POST request. */
export async function apiPost<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
  const { data } = await apiClient.post<T>(url, body, config)
  return data
}

/** Performs a typed PUT request. */
export async function apiPut<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
  const { data } = await apiClient.put<T>(url, body, config)
  return data
}

/** Performs a typed PATCH request. */
export async function apiPatch<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
  const { data } = await apiClient.patch<T>(url, body, config)
  return data
}

/** Performs a typed DELETE request. */
export async function apiDelete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  const { data } = await apiClient.delete<T>(url, config)
  return data
}

// ── File Management API ────────────────────────────────────────────────────

/** Lists files in a project. */
export async function listProjectFiles<T = any>(projectId: string): Promise<T> {
  return apiGet(`/projects/${projectId}/files`)
}

/** Gets the content of a specific file. */
export async function getFileContent<T = any>(
  projectId: string,
  filePath: string
): Promise<T> {
  return apiGet(`/projects/${projectId}/files/content`, {
    params: { path: filePath },
  })
}

/** Saves a file. */
export async function saveFile<T = any>(
  projectId: string,
  filePath: string,
  content: string,
  message?: string
): Promise<T> {
  return apiPost(`/projects/${projectId}/files/save`, {
    path: filePath,
    content,
    message,
  })
}

/** Downloads a file. */
export async function downloadFile(projectId: string, filePath: string): Promise<void> {
  try {
    const response = await apiClient.get(
      `/projects/${projectId}/files/download`,
      {
        params: { path: filePath },
        responseType: "blob",
      }
    )
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filePath.split("/").pop() || "download")
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
  } catch (error) {
    toast.error("Failed to download file")
    throw error
  }
}

// ── Terraform Run Management API ───────────────────────────────────────────

/** Lists all Terraform runs for a project. */
export async function listProjectRuns<T = any>(projectId: string): Promise<T> {
  return apiGet(`/projects/${projectId}/runs`)
}

/** Gets details of a specific Terraform run. */
export async function getRunDetails<T = any>(projectId: string, runId: string): Promise<T> {
  return apiGet(`/projects/${projectId}/runs/${runId}`)
}

/** Gets logs for a specific Terraform run. */
export async function getRunLogs<T = any>(projectId: string, runId: string): Promise<T> {
  return apiGet(`/projects/${projectId}/runs/${runId}/logs`)
}

/** Triggers a new Terraform plan. */
export async function triggerTerraformPlan<T = any>(
  projectId: string,
  options?: Record<string, unknown>
): Promise<T> {
  return apiPost(`/projects/${projectId}/runs/plan`, options)
}

/** Triggers a Terraform apply. */
export async function triggerTerraformApply<T = any>(
  projectId: string,
  options?: Record<string, unknown>
): Promise<T> {
  return apiPost(`/projects/${projectId}/runs/apply`, options)
}

/** Triggers a Terraform destroy. */
export async function triggerTerraformDestroy<T = any>(
  projectId: string,
  options?: Record<string, unknown>
): Promise<T> {
  return apiPost(`/projects/${projectId}/runs/destroy`, options)
}

/** Retries a failed Terraform run. */
export async function retryTerraformRun<T = any>(
  projectId: string,
  runId: string
): Promise<T> {
  return apiPost(`/projects/${projectId}/runs/${runId}/retry`)
}

/** Cancels an in-progress Terraform run. */
export async function cancelTerraformRun<T = any>(
  projectId: string,
  runId: string
): Promise<T> {
  return apiPost(`/projects/${projectId}/runs/${runId}/cancel`)
}

export default apiClient

