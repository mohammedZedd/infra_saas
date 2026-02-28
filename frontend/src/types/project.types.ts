/** Lifecycle status of an infrastructure project. */
export type ProjectStatus = "draft" | "active" | "deploying" | "deployed" | "failed"

/** Terraform run status enum */
export type TerraformRunStatus = "success" | "failed" | "running" | "cancelled"

/** Terraform command type */
export type TerraformCommand = "plan" | "apply" | "destroy" | "init"

/** Summary of changes from a Terraform plan/apply */
export interface TerriformPlanSummary {
  add: number
  change: number
  destroy: number
}

/** Terraform run history entry */
export interface TerraformRun {
  id: string
  projectId: string
  command: TerraformCommand
  status: TerraformRunStatus
  triggeredBy: string
  triggeredAt: string
  completedAt?: string
  planSummary?: TerriformPlanSummary
  errorMessage?: string
  logUrl?: string
}

/** Full project object returned by the API. */
export interface Project {
  id: string
  name: string
  description: string
  region: string
  status: ProjectStatus
  node_count: number
  estimated_cost: number
  created_at: string
  updated_at: string
  last_deployed_at: string | null
  runs?: TerraformRun[]
}

/** Request body for creating a new project. */
export interface CreateProjectRequest {
  name: string
  description: string
  region: string
  template_id?: string
}

/** Request body for updating an existing project. */
export interface UpdateProjectRequest {
  name?: string
  description?: string
  region?: string
}

/** Aggregated statistics shown on the dashboard. */
export interface ProjectStats {
  total_projects: number
  total_resources: number
  total_estimated_cost: number
}

