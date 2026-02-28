import { subDays, subHours } from "date-fns"
import type { Project, ProjectStats } from "../types/project.types"

function isoDaysAgo(days: number): string {
  return subDays(new Date(), days).toISOString()
}

function isoHoursAgo(hours: number): string {
  return subHours(new Date(), hours).toISOString()
}

function generateRunId(): string {
  return `tf-run-${Math.random().toString(36).substr(2, 9)}`
}

export function getMockProjects(): Project[] {
  return [
    {
      id: "proj-1",
      name: "production-network",
      description: "Core VPC stack with private and public subnets for production workloads.",
      region: "us-east-1",
      status: "deployed",
      node_count: 18,
      estimated_cost: 214.35,
      created_at: isoDaysAgo(30),
      updated_at: isoDaysAgo(2),
      last_deployed_at: isoDaysAgo(3),
      runs: [
        {
          id: generateRunId(),
          projectId: "proj-1",
          command: "apply",
          status: "success",
          triggeredBy: "alice@company.com",
          triggeredAt: isoDaysAgo(3),
          completedAt: isoDaysAgo(3),
          planSummary: { add: 2, change: 0, destroy: 0 },
        },
        {
          id: generateRunId(),
          projectId: "proj-1",
          command: "plan",
          status: "success",
          triggeredBy: "bob@company.com",
          triggeredAt: isoDaysAgo(5),
          completedAt: isoDaysAgo(5),
          planSummary: { add: 2, change: 0, destroy: 0 },
        },
        {
          id: generateRunId(),
          projectId: "proj-1",
          command: "apply",
          status: "success",
          triggeredBy: "alice@company.com",
          triggeredAt: isoDaysAgo(10),
          completedAt: isoDaysAgo(10),
          planSummary: { add: 5, change: 1, destroy: 0 },
        },
      ],
    },
    {
      id: "proj-2",
      name: "serverless-checkout",
      description: "Event-driven checkout flow with API Gateway, Lambda, and DynamoDB.",
      region: "us-west-2",
      status: "active",
      node_count: 11,
      estimated_cost: 87.6,
      created_at: isoDaysAgo(20),
      updated_at: isoDaysAgo(4),
      last_deployed_at: null,
      runs: [
        {
          id: generateRunId(),
          projectId: "proj-2",
          command: "plan",
          status: "success",
          triggeredBy: "charlie@company.com",
          triggeredAt: isoDaysAgo(4),
          completedAt: isoDaysAgo(4),
          planSummary: { add: 3, change: 1, destroy: 0 },
        },
      ],
    },
    {
      id: "proj-3",
      name: "analytics-pipeline",
      description: "Ingestion and transformation pipeline using S3, Lambda, and Athena.",
      region: "eu-west-1",
      status: "deploying",
      node_count: 24,
      estimated_cost: 302.9,
      created_at: isoDaysAgo(15),
      updated_at: isoDaysAgo(1),
      last_deployed_at: null,
      runs: [
        {
          id: generateRunId(),
          projectId: "proj-3",
          command: "apply",
          status: "running",
          triggeredBy: "diana@company.com",
          triggeredAt: isoHoursAgo(2),
        },
        {
          id: generateRunId(),
          projectId: "proj-3",
          command: "plan",
          status: "success",
          triggeredBy: "diana@company.com",
          triggeredAt: isoHoursAgo(4),
          completedAt: isoHoursAgo(4),
          planSummary: { add: 8, change: 2, destroy: 0 },
        },
      ],
    },
    {
      id: "proj-4",
      name: "edge-static-platform",
      description: "Static web distribution with CloudFront, S3 origins, and Route 53 routing.",
      region: "us-east-1",
      status: "draft",
      node_count: 7,
      estimated_cost: 34.2,
      created_at: isoDaysAgo(10),
      updated_at: isoDaysAgo(8),
      last_deployed_at: null,
      runs: [],
    },
    {
      id: "proj-5",
      name: "data-warehouse-migration",
      description: "Migration blueprint with ECS workers, RDS, and SQS orchestration.",
      region: "eu-central-1",
      status: "failed",
      node_count: 29,
      estimated_cost: 428.15,
      created_at: isoDaysAgo(45),
      updated_at: isoDaysAgo(5),
      last_deployed_at: isoDaysAgo(6),
      runs: [
        {
          id: generateRunId(),
          projectId: "proj-5",
          command: "apply",
          status: "failed",
          triggeredBy: "eve@company.com",
          triggeredAt: isoDaysAgo(5),
          completedAt: isoDaysAgo(5),
          errorMessage: "RDS subnet group validation failed: invalid parameter",
        },
        {
          id: generateRunId(),
          projectId: "proj-5",
          command: "plan",
          status: "success",
          triggeredBy: "frank@company.com",
          triggeredAt: isoDaysAgo(7),
          completedAt: isoDaysAgo(7),
          planSummary: { add: 10, change: 3, destroy: 1 },
        },
      ],
    },
  ]
}

export function getMockProjectStats(projects: Project[] = getMockProjects()): ProjectStats {
  return {
    total_projects: projects.length,
    total_resources: projects.reduce((sum, project) => sum + project.node_count, 0),
    total_estimated_cost: projects.reduce((sum, project) => sum + project.estimated_cost, 0),
  }
}
