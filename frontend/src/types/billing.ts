/** Plan limits configuration. */
export interface PlanLimits {
  /** Maximum number of projects (-1 = unlimited) */
  projects: number
  /** Maximum nodes per project (-1 = unlimited) */
  nodesPerProject: number
  /** Number of supported AWS services */
  services: number
  /** Maximum deploys per month (-1 = unlimited) */
  deploys: number
  /** Maximum collaborators on a project */
  collaborators: number
}

/** A subscription plan definition. */
export interface Plan {
  id: string
  name: string
  monthlyPrice: number
  yearlyPrice: number
  limits: PlanLimits
  features: string[]
}

/** Plan type identifier */
export type PlanId = 'free' | 'pro' | 'team' | 'enterprise'

/** Billing usage metrics */
export interface BillingUsage {
  projects: number
  activeDeployments: number
  collaborators: number
  estimatedMonthlyCost: number
}

/** Invoice/Bill information */
export interface Invoice {
  id: string
  date: string
  dueDate: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  planId: PlanId
  itemsUrl: string
}
