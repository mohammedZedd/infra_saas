import type { Node } from "@xyflow/react"
import type { AwsNodeData } from "../types/aws"

type CanvasNode = Node<AwsNodeData>

/** Monthly on-demand pricing for common EC2 instance types (USD). */
const EC2_PRICING: Record<string, number> = {
  "t3.nano": 3.8,
  "t3.micro": 8.47,
  "t3.small": 16.94,
  "t3.medium": 33.87,
  "t3.large": 67.74,
  "t3.xlarge": 135.49,
  "t2.nano": 4.18,
  "t2.micro": 9.5,
  "t2.small": 18.98,
  "t2.medium": 37.97,
  "t2.large": 75.94,
  "m5.large": 69.12,
  "m5.xlarge": 138.24,
}

const EC2_DEFAULT_COST = 50.0

/** EBS pricing per GB/month (USD). */
const EBS_PRICING: Record<string, number> = {
  gp3: 0.08,
  gp2: 0.1,
  io1: 0.125,
  io2: 0.125,
}

const EBS_DEFAULT_PRICE = 0.08

function prop(node: CanvasNode, key: string, fallback = ""): string {
  return String(node.data.properties[key] ?? fallback)
}

/**
 * Estimates the monthly cost in USD for a single canvas node.
 * Free-tier resources (VPC, Subnet, Security Group, S3) return 0.
 * EC2 cost = instance hourly × 730 hours + EBS volume cost.
 */
export function calculateNodeCost(node: CanvasNode): number {
  switch (node.data.type) {
    case "ec2": {
      const instanceType = prop(node, "instance_type", "t3.micro")
      const instanceCost = EC2_PRICING[instanceType] ?? EC2_DEFAULT_COST
      const volType = prop(node, "root_volume_type", "gp3")
      const volSize = parseFloat(prop(node, "root_volume_size", "20")) || 20
      const ebsPrice = EBS_PRICING[volType] ?? EBS_DEFAULT_PRICE
      return instanceCost + ebsPrice * volSize
    }
    case "rds": {
      // Rough estimate based on instance class
      const cls = prop(node, "instance_class", "db.t3.micro")
      const storage = parseFloat(prop(node, "allocated_storage", "20")) || 20
      const base = cls.includes("t3.micro") ? 15.33 : cls.includes("t3.small") ? 30.66 : 60.0
      return base + storage * 0.115
    }
    case "elasticache": {
      const nodeType = prop(node, "node_type", "cache.t3.micro")
      const numNodes = parseInt(prop(node, "num_cache_nodes", "1")) || 1
      const base = nodeType.includes("t3.micro") ? 12.24 : nodeType.includes("t3.small") ? 24.48 : 50.0
      return base * numNodes
    }
    case "lambda": {
      // Lambda is billed per invocation; return a modest baseline estimate
      return 5.0
    }
    case "nat_gateway": {
      // NAT Gateway: ~$32.40/mo fixed + data transfer
      return 32.4
    }
    case "cloudfront": {
      return 10.0
    }
    case "api_gateway": {
      return 3.5
    }
    case "dynamodb": {
      return 1.25
    }
    // Free / usage-based resources
    case "vpc":
    case "subnet":
    case "sg":
    case "s3":
    case "route_table":
    case "internet_gateway":
    case "elastic_ip":
    case "iam_role":
    case "iam_policy":
    case "iam_user":
    case "cloudwatch":
    case "sns":
    case "sqs":
      return 0.0
    default:
      return 0.0
  }
}

/**
 * Sums the estimated monthly cost for all nodes on the canvas.
 */
export function calculateTotalCost(nodes: CanvasNode[]): number {
  return nodes.reduce((sum, node) => sum + calculateNodeCost(node), 0)
}

