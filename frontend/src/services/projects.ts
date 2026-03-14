import api from "@/lib/api"
import type { CreateProjectRequest, Project, UpdateProjectRequest } from "@/types/project.types"

export interface ProjectsQueryParams {
  page?: number
  page_size?: number
  status?: string
  region?: string
  sort_by?: string
  sort_order?: "asc" | "desc"
}

interface ProjectListResponse {
  items: Project[]
  total: number
  page: number
  page_size: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    id: String(project.id),
    architecture_data: project.architecture_data ?? null,
    created_at: String(project.created_at),
    updated_at: String(project.updated_at),
    last_deployed_at: project.last_deployed_at ? String(project.last_deployed_at) : null,
  }
}

export async function getProjects(params?: ProjectsQueryParams): Promise<ProjectListResponse> {
  const response = await api.get<ProjectListResponse>("/projects/", { params })
  return {
    ...response.data,
    items: (response.data.items ?? []).map(normalizeProject),
  }
}

export async function getProject(projectId: string): Promise<Project> {
  const response = await api.get<Project>(`/projects/${projectId}`)
  return normalizeProject(response.data)
}

export async function createProject(payload: CreateProjectRequest): Promise<Project> {
  const response = await api.post<Project>("/projects/", payload)
  return normalizeProject(response.data)
}

export async function updateProject(projectId: string, payload: UpdateProjectRequest): Promise<Project> {
  const response = await api.patch<Project>(`/projects/${projectId}`, payload)
  return normalizeProject(response.data)
}

export async function deleteProject(projectId: string): Promise<void> {
  await api.delete(`/projects/${projectId}`)
}
