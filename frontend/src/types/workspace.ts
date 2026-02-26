export interface TerraformVariable {
  name: string
  type: "string" | "number" | "bool" | "list" | "map"
  default?: string
  description?: string
  sensitive?: boolean
  validation?: string
}

export interface TerraformOutput {
  name: string
  value: string
  description?: string
  sensitive?: boolean
}

export interface TerraformBackend {
  type: "local" | "s3" | "remote" | "gcs" | "azurerm"
  config: Record<string, string>
}

export interface TerraformProvider {
  name: string
  version?: string
  region?: string
  profile?: string
  alias?: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  isDefault?: boolean
  variables: Record<string, string> // Variable values for this workspace
  createdAt: string
  updatedAt: string
}

export interface ProjectSettings {
  terraformVersion: string
  providers: TerraformProvider[]
  backend: TerraformBackend
  variables: TerraformVariable[]
  outputs: TerraformOutput[]
  workspaces: Workspace[]
  activeWorkspaceId: string
}

export const DEFAULT_BACKEND: TerraformBackend = {
  type: "local",
  config: {},
}

export const DEFAULT_AWS_PROVIDER: TerraformProvider = {
  name: "aws",
  version: "~> 5.0",
  region: "us-east-1",
}

export const DEFAULT_WORKSPACE: Workspace = {
  id: "default",
  name: "default",
  description: "Default workspace",
  isDefault: true,
  variables: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  terraformVersion: "1.6.0",
  providers: [DEFAULT_AWS_PROVIDER],
  backend: DEFAULT_BACKEND,
  variables: [],
  outputs: [],
  workspaces: [DEFAULT_WORKSPACE],
  activeWorkspaceId: "default",
}