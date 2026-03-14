/** Central export of all domain types from the application. */

// API types
export * from './api.types'

// Authentication
export * from './auth.types'

// AWS resources and components
export * from './aws'
export * from './aws-resources'
export * from './cloud'

// Billing and plans
export * from './billing'

// Project management
export * from './project.types'

// Files and code
export * from './files'

// Git integration
export * from './git'

// Marketplace
export * from './marketplace'

// Security
export * from './security'

// Simulation
export * from './simulation'

// Terraform
export * from './terraform'

// Workspace (import selectively to avoid duplicate TerraformOutput)
export type {
  TerraformVariable,
  TerraformBackend,
  TerraformProvider,
  Workspace,
  ProjectSettings,
} from './workspace'

// Connections
export * from './connections'

// Terminal / streaming logs
export * from './terminal.types'
