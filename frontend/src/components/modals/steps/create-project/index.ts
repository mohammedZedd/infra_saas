/** Plans that may gate certain templates */
export type UserPlan = "free" | "pro" | "enterprise"

export type StartMode = "scratch" | "import" | "template"

export interface CreateProjectFormData {
  name: string
  description: string
  region: string
  template_id: string
  start_mode: StartMode
  importedFiles: File[]
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
  /** Components included in this template, displayed as tags */
  components?: string[]
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
    components: ["VPC", "Subnet", "IGW", "NAT"],
  },
  {
    id: "web-app",
    name: "Web Application",
    description: "EC2 + RDS + S3 with load balancer",
    badge: "Free",
    estimate: 68,
    components: ["EC2", "RDS", "S3", "ALB"],
  },
  {
    id: "serverless-api",
    name: "Serverless API",
    description: "Lambda + API Gateway + DynamoDB",
    badge: "Pro",
    requiredPlan: "pro",
    estimate: 32,
    components: ["Lambda", "API GW", "DynamoDB"],
  },
  {
    id: "static-website",
    name: "Static Website",
    description: "S3 + CloudFront + Route 53",
    badge: "Free",
    estimate: 12,
    components: ["S3", "CloudFront", "Route 53"],
  },
  {
    id: "microservices",
    name: "Microservices",
    description: "ECS Fargate + ALB + RDS",
    badge: "Pro",
    requiredPlan: "pro",
    estimate: 120,
    components: ["ECS", "ALB", "RDS", "ECR"],
  },
  {
    id: "kubernetes",
    name: "Kubernetes Cluster",
    description: "EKS + VPC + NAT Gateway",
    badge: "Pro",
    requiredPlan: "pro",
    estimate: 150,
    components: ["EKS", "VPC", "NAT", "IAM"],
  },
]

export function getTemplateById(templateId: string): ProjectTemplateOption {
  return PROJECT_TEMPLATE_OPTIONS.find((template) => template.id === templateId) ?? PROJECT_TEMPLATE_OPTIONS[0]
}

export { ProjectDetailsStep } from "./ProjectDetailsStep"
export { ProjectTemplateStep } from "./ProjectTemplateStep"
export { ProjectReviewStep } from "./ProjectReviewStep"
