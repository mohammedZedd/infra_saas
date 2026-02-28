import type { UserPlan } from "../../../../types/auth.types"

export interface CreateProjectFormData {
  name: string
  description: string
  region: string
  template_id: string
}

export type CreateProjectErrors = Partial<Record<"name" | "description" | "region", string>>

export interface StepComponentProps {
  data: CreateProjectFormData
  updateData: (updates: Partial<CreateProjectFormData>) => void
  errors: CreateProjectErrors
}

export interface ProjectTemplateOption {
  id: string
  name: string
  description: string
  badge: string
  requiredPlan?: UserPlan
  estimate: number
}

export const PROJECT_TEMPLATE_OPTIONS: ProjectTemplateOption[] = [
  {
    id: "blank",
    name: "Blank Project",
    description: "Start with an empty canvas",
    badge: "Free",
    estimate: 0,
  },
  {
    id: "basic-vpc",
    name: "Basic VPC",
    description: "VPC with public and private subnets",
    badge: "Free",
    estimate: 24,
  },
  {
    id: "web-app",
    name: "Web Application",
    description: "VPC + EC2 + ALB + RDS",
    badge: "Free",
    estimate: 68,
  },
  {
    id: "serverless-api",
    name: "Serverless API",
    description: "API Gateway + Lambda + DynamoDB",
    badge: "Pro",
    requiredPlan: "pro",
    estimate: 32,
  },
  {
    id: "static-website",
    name: "Static Website",
    description: "S3 + CloudFront + Route 53",
    badge: "Free",
    estimate: 12,
  },
]

export function getTemplateById(templateId: string): ProjectTemplateOption {
  return PROJECT_TEMPLATE_OPTIONS.find((template) => template.id === templateId) ?? PROJECT_TEMPLATE_OPTIONS[0]
}

export { ProjectDetailsStep } from "./ProjectDetailsStep"
export { ProjectTemplateStep } from "./ProjectTemplateStep"
export { ProjectReviewStep } from "./ProjectReviewStep"
