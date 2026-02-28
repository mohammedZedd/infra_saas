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

const FREE_FEATURES = [
  "Visual canvas builder",
  "5 AWS services",
  "Download .tf files",
  "Community support",
]

const PRO_FEATURES = [
  ...FREE_FEATURES,
  "Unlimited projects",
  "16 AWS services",
  "Deploy from canvas",
  "Import Terraform",
  "Budget tracking",
  "Email support",
]

const TEAM_FEATURES = [
  ...PRO_FEATURES,
  "Team collaboration",
  "Audit logs",
  "Priority support",
]

/** All available subscription plans. */
export const PLANS: Record<"free" | "pro" | "team", Plan> = {
  free: {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: { projects: 3, nodesPerProject: 20, services: 5, deploys: 0, collaborators: 1 },
    features: FREE_FEATURES,
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 278.4,
    limits: { projects: -1, nodesPerProject: 200, services: 16, deploys: -1, collaborators: 1 },
    features: PRO_FEATURES,
  },
  team: {
    id: "team",
    name: "Team",
    monthlyPrice: 79,
    yearlyPrice: 758.4,
    limits: { projects: -1, nodesPerProject: 500, services: 16, deploys: -1, collaborators: 10 },
    features: TEAM_FEATURES,
  },
}

/** Ordered list of plan tiers from lowest to highest. */
export const PLAN_ORDER: string[] = ["free", "pro", "team", "enterprise"]

/**
 * Returns true if the user's plan meets or exceeds the required plan tier.
 * @param userPlan - The plan the user currently has
 * @param requiredPlan - The minimum plan required
 */
export function isPlanSufficient(userPlan: string, requiredPlan: string): boolean {
  const userIndex = PLAN_ORDER.indexOf(userPlan)
  const requiredIndex = PLAN_ORDER.indexOf(requiredPlan)
  if (userIndex === -1 || requiredIndex === -1) return false
  return userIndex >= requiredIndex
}

