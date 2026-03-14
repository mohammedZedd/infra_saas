import axios from "axios"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"

interface ApiErrorBody {
  message?: string
  error?: string
  detail?: string
  errors?: Record<string, string[]>
}

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

type NavigateFn = (to: string, options?: { replace?: boolean }) => void
export const navigationRef: { current: NavigateFn | null } = { current: null }

const STORAGE_KEYS = {
  access: "cf_access_token",
  refresh: "cf_refresh_token",
  user: "cf_user",
}

function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEYS.access)
  localStorage.removeItem(STORAGE_KEYS.refresh)
  localStorage.removeItem(STORAGE_KEYS.user)
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorBody>

    if (axiosErr.response) {
      const status = axiosErr.response.status

      if (status === 404) {
        const method = axiosErr.config?.method?.toUpperCase() ?? "REQUEST"
        const url = (axiosErr.config?.baseURL ?? "") + (axiosErr.config?.url ?? "")
        return `Endpoint not found: ${method} ${url}. Check backend route and baseURL.`
      }

      const body = axiosErr.response.data as ApiErrorBody | undefined
      const serverMessage = body?.message ?? body?.error ?? body?.detail ?? null

      if (typeof serverMessage === "string" && serverMessage.trim()) {
        return serverMessage.trim()
      }

      if (status === 400) return "Invalid request. Please check your input."
      if (status === 401) return "Invalid credentials. Please try again."
      if (status === 403) return "You do not have permission to perform this action."
      if (status === 409) return "An account with this email already exists."
      if (status === 422) return "Validation failed. Please check your input."
      if (status >= 500) return "Server error. Please try again later."
      return `Request failed (HTTP ${status}).`
    }

    const baseURL = axiosErr.config?.baseURL ?? import.meta.env.VITE_API_URL ?? "/api/v1"
    const isRelative = baseURL.startsWith("/")
    const hint = isRelative
      ? `Vite proxy is forwarding \"${baseURL}\" to the backend. Make sure backend is running and proxy target in vite.config.ts is correct.`
      : `Check backend at ${baseURL}, VITE_API_URL value, and CORS configuration.`
    return `Cannot reach API server. ${hint}`
  }

  if (error instanceof Error) return error.message
  return "An unexpected error occurred."
}

function isAuthEndpoint(url?: string) {
  return Boolean(url?.includes("/auth/"))
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else if (token) resolve(token)
  })
  failedQueue = []
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem(STORAGE_KEYS.access)
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const config = error.config

    if (status === 401 && config) {
      if (isAuthEndpoint(config.url)) {
        clearAuthStorage()
        navigationRef.current?.("/login", { replace: true })
        return Promise.reject(error)
      }

      if (config._retry) {
        clearAuthStorage()
        navigationRef.current?.("/login", { replace: true })
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newToken) => {
            if (config.headers) config.headers.Authorization = `Bearer ${newToken}`
            return api(config)
          })
          .catch((queueError) => Promise.reject(queueError))
      }

      const refreshToken = localStorage.getItem(STORAGE_KEYS.refresh)
      if (!refreshToken) {
        clearAuthStorage()
        navigationRef.current?.("/login", { replace: true })
        return Promise.reject(error)
      }

      config._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post<{ access_token?: string; accessToken?: string; refresh_token?: string; refreshToken?: string }>(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh_token: refreshToken, refreshToken },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        )

        const nextAccessToken = data.access_token ?? data.accessToken
        const nextRefreshToken = data.refresh_token ?? data.refreshToken ?? refreshToken

        if (!nextAccessToken) throw new Error("Missing access token in refresh response")

        localStorage.setItem(STORAGE_KEYS.access, nextAccessToken)
        localStorage.setItem(STORAGE_KEYS.refresh, nextRefreshToken)

        api.defaults.headers.common.Authorization = `Bearer ${nextAccessToken}`
        if (config.headers) config.headers.Authorization = `Bearer ${nextAccessToken}`

        processQueue(null, nextAccessToken)
        return api(config)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthStorage()
        navigationRef.current?.("/login", { replace: true })
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export async function apiGet<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
  const { data } = await api.get<T>(url, config)
  return data
}

export async function apiPost<T>(url: string, body?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
  const { data } = await api.post<T>(url, body, config)
  return data
}

export async function apiPut<T>(url: string, body?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
  const { data } = await api.put<T>(url, body, config)
  return data
}

export async function apiPatch<T>(url: string, body?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
  const { data } = await api.patch<T>(url, body, config)
  return data
}

export async function apiDelete<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
  const { data } = await api.delete<T>(url, config)
  return data
}

export async function listProjectRuns<T = unknown>(projectId: string): Promise<T> {
  return apiGet(`/projects/${projectId}/runs`)
}

export async function getRunDetails<T = unknown>(projectId: string, runId: string): Promise<T> {
  return apiGet(`/projects/${projectId}/runs/${runId}`)
}

export async function getRunLogs<T = unknown>(projectId: string, runId: string): Promise<T> {
  return apiGet(`/projects/${projectId}/runs/${runId}/logs`)
}

export async function triggerTerraformPlan<T = unknown>(projectId: string, options?: Record<string, unknown>): Promise<T> {
  return apiPost(`/projects/${projectId}/runs/plan`, options)
}

export async function triggerTerraformApply<T = unknown>(projectId: string, options?: Record<string, unknown>): Promise<T> {
  return apiPost(`/projects/${projectId}/runs/apply`, options)
}

export async function triggerTerraformDestroy<T = unknown>(projectId: string, options?: Record<string, unknown>): Promise<T> {
  return apiPost(`/projects/${projectId}/runs/destroy`, options)
}

export async function retryTerraformRun<T = unknown>(projectId: string, runId: string): Promise<T> {
  return apiPost(`/projects/${projectId}/runs/${runId}/retry`)
}

export async function cancelTerraformRun<T = unknown>(projectId: string, runId: string): Promise<T> {
  return apiPost(`/projects/${projectId}/runs/${runId}/cancel`)
}

export default api
