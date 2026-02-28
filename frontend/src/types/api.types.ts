/** Generic API response wrapper. */
export interface ApiResponse<T> {
  data: T
  message: string
  status: number
}

/** Structured error returned by the API. */
export interface ApiError {
  message: string
  code: string
  details?: Record<string, string[]>
}

/** Paginated response wrapper. */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

/** Optional config passed to API helper functions. */
export interface ApiRequestConfig {
  params?: Record<string, string | number | boolean>
  signal?: AbortSignal
}

/** Sort direction. */
export type SortOrder = "asc" | "desc"

/** Common pagination and sort query parameters. */
export interface PaginationParams {
  page: number
  per_page: number
  sort_by?: string
  sort_order?: SortOrder
}

