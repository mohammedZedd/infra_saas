import type { Node, Edge } from "@xyflow/react"
import type { AwsNodeData } from "../types/aws"
import { slugify } from "./format"

type CanvasNode = Node<AwsNodeData>
type CanvasEdge = Edge

/** Convert a node label + index into a valid Terraform identifier. */
function tfId(node: CanvasNode, allNodes: CanvasNode[]): string {
  const sameType = allNodes.filter((n) => n.data.type === node.data.type)
  const idx = sameType.indexOf(node)
  const base = slugify(node.data.label).replace(/-/g, "_") || node.data.type
  return idx === 0 ? base : `${base}_${idx + 1}`
}

/** Get nodes connected to a given node via edges (both directions). */
function connectedNodes(
  nodeId: string,
  edges: CanvasEdge[],
  allNodes: CanvasNode[]
): CanvasNode[] {
  const ids = new Set<string>()
  for (const e of edges) {
    if (e.source === nodeId) ids.add(e.target)
    if (e.target === nodeId) ids.add(e.source)
  }
  return allNodes.filter((n) => ids.has(n.id))
}

function prop(node: CanvasNode, key: string, fallback = ""): string {
  return String(node.data.properties[key] ?? fallback)
}

function generateVpc(node: CanvasNode, allNodes: CanvasNode[]): string {
  const id = tfId(node, allNodes)
  const name = prop(node, "name", id)
  return [
    `# ${node.data.label}`,
    `resource "aws_vpc" "${id}" {`,
    `  cidr_block           = "${prop(node, "cidr_block", "10.0.0.0/16")}"`,
    `  enable_dns_hostnames = ${prop(node, "enable_dns_hostnames", "true")}`,
    `  enable_dns_support   = ${prop(node, "enable_dns_support", "true")}`,
    `  tags = { Name = "${name}" }`,
    `}`,
  ].join("\n")
}

function generateSubnet(node: CanvasNode, allNodes: CanvasNode[], edges: CanvasEdge[]): string {
  const id = tfId(node, allNodes)
  const connected = connectedNodes(node.id, edges, allNodes)
  const vpc = connected.find((n) => n.data.type === "vpc")
  const vpcRef = vpc ? `aws_vpc.${tfId(vpc, allNodes)}.id` : `# no VPC connected`
  return [
    `# ${node.data.label}`,
    `resource "aws_subnet" "${id}" {`,
    `  vpc_id                  = ${vpc ? vpcRef : `"${vpcRef}"`}`,
    `  cidr_block              = "${prop(node, "cidr_block", "10.0.1.0/24")}"`,
    `  availability_zone       = "${prop(node, "availability_zone", "us-east-1a")}"`,
    `  map_public_ip_on_launch = ${prop(node, "map_public_ip", "false")}`,
    `  tags = { Name = "${id}" }`,
    `}`,
  ].join("\n")
}

function generateSg(node: CanvasNode, allNodes: CanvasNode[], edges: CanvasEdge[]): string {
  const id = tfId(node, allNodes)
  const connected = connectedNodes(node.id, edges, allNodes)
  const vpc = connected.find((n) => n.data.type === "vpc")
  const vpcRef = vpc ? `aws_vpc.${tfId(vpc, allNodes)}.id` : `"# no VPC connected"`
  const port = prop(node, "ingress_port", "443")
  const proto = prop(node, "protocol", "tcp")
  const cidr = prop(node, "cidr", "0.0.0.0/0")
  return [
    `# ${node.data.label}`,
    `resource "aws_security_group" "${id}" {`,
    `  name        = "${prop(node, "name", id)}"`,
    `  description = "${prop(node, "description", "Managed by CloudForge")}"`,
    `  vpc_id      = ${vpcRef}`,
    ``,
    `  ingress {`,
    `    from_port   = ${port}`,
    `    to_port     = ${port}`,
    `    protocol    = "${proto}"`,
    `    cidr_blocks = ["${cidr}"]`,
    `  }`,
    ``,
    `  egress {`,
    `    from_port   = 0`,
    `    to_port     = 0`,
    `    protocol    = "-1"`,
    `    cidr_blocks = ["0.0.0.0/0"]`,
    `  }`,
    ``,
    `  tags = { Name = "${id}" }`,
    `}`,
  ].join("\n")
}

function generateEc2(node: CanvasNode, allNodes: CanvasNode[], edges: CanvasEdge[]): string {
  const id = tfId(node, allNodes)
  const connected = connectedNodes(node.id, edges, allNodes)
  const subnet = connected.find((n) => n.data.type === "subnet")
  const sgs = connected.filter((n) => n.data.type === "sg")
  const subnetRef = subnet ? `aws_subnet.${tfId(subnet, allNodes)}.id` : `"# no subnet connected"`
  const sgIds = sgs.length
    ? `[${sgs.map((s) => `aws_security_group.${tfId(s, allNodes)}.id`).join(", ")}]`
    : `[]`
  const volSize = prop(node, "root_volume_size", "20")
  const volType = prop(node, "root_volume_type", "gp3")
  return [
    `# ${node.data.label}`,
    `resource "aws_instance" "${id}" {`,
    `  ami           = "${prop(node, "ami", "ami-0c55b159cbfafe1f0")}"`,
    `  instance_type = "${prop(node, "instance_type", "t3.micro")}"`,
    `  subnet_id     = ${subnetRef}`,
    `  vpc_security_group_ids = ${sgIds}`,
    ``,
    `  root_block_device {`,
    `    volume_size = ${volSize}`,
    `    volume_type = "${volType}"`,
    `  }`,
    ``,
    `  tags = { Name = "${id}" }`,
    `}`,
  ].join("\n")
}

function generateS3(node: CanvasNode, allNodes: CanvasNode[]): string {
  const id = tfId(node, allNodes)
  const bucket = prop(node, "bucket_name", id.replace(/_/g, "-"))
  const versioning = prop(node, "versioning", "false") === "true"
  const encryption = prop(node, "encryption", "none")
  const blocks: string[] = [
    `# ${node.data.label}`,
    `resource "aws_s3_bucket" "${id}" {`,
    `  bucket = "${bucket}"`,
    `  tags   = { Name = "${bucket}" }`,
    `}`,
  ]
  if (versioning) {
    blocks.push(
      ``,
      `resource "aws_s3_bucket_versioning" "${id}_versioning" {`,
      `  bucket = aws_s3_bucket.${id}.id`,
      `  versioning_configuration { status = "Enabled" }`,
      `}`
    )
  }
  if (encryption && encryption !== "none") {
    blocks.push(
      ``,
      `resource "aws_s3_bucket_server_side_encryption_configuration" "${id}_sse" {`,
      `  bucket = aws_s3_bucket.${id}.id`,
      `  rule {`,
      `    apply_server_side_encryption_by_default {`,
      `      sse_algorithm = "${encryption}"`,
      `    }`,
      `  }`,
      `}`
    )
  }
  return blocks.join("\n")
}

function generateOutputs(nodes: CanvasNode[], allNodes: CanvasNode[]): string {
  const blocks: string[] = []
  for (const node of nodes) {
    const id = tfId(node, allNodes)
    if (node.data.type === "vpc") {
      blocks.push(`output "${id}_id" { value = aws_vpc.${id}.id }`)
      blocks.push(`output "${id}_cidr" { value = aws_vpc.${id}.cidr_block }`)
    } else if (node.data.type === "subnet") {
      blocks.push(`output "${id}_id" { value = aws_subnet.${id}.id }`)
      blocks.push(`output "${id}_arn" { value = aws_subnet.${id}.arn }`)
    } else if (node.data.type === "ec2") {
      blocks.push(`output "${id}_id" { value = aws_instance.${id}.id }`)
      blocks.push(`output "${id}_public_ip" { value = aws_instance.${id}.public_ip }`)
      blocks.push(`output "${id}_private_ip" { value = aws_instance.${id}.private_ip }`)
    } else if (node.data.type === "s3") {
      blocks.push(`output "${id}_id" { value = aws_s3_bucket.${id}.id }`)
      blocks.push(`output "${id}_arn" { value = aws_s3_bucket.${id}.arn }`)
      blocks.push(`output "${id}_domain" { value = aws_s3_bucket.${id}.bucket_domain_name }`)
    } else if (node.data.type === "sg") {
      blocks.push(`output "${id}_id" { value = aws_security_group.${id}.id }`)
    }
  }
  return blocks.join("\n")
}

const SUPPORTED = new Set(["vpc", "subnet", "ec2", "s3", "sg"])

export interface TerraformFiles {
  "main.tf": string
  "variables.tf": string
  "outputs.tf": string
}

export function generateTerraform(nodes: CanvasNode[], edges: CanvasEdge[]): TerraformFiles {
  const region = String(nodes[0]?.data.properties["availability_zone"] ?? "us-east-1")
    .split("-")
    .slice(0, 2)
    .join("-") || "us-east-1"

  const variablesTf = [
    `terraform {`,
    `  required_providers {`,
    `    aws = {`,
    `      source  = "hashicorp/aws"`,
    `      version = "~> 5.0"`,
    `    }`,
    `  }`,
    `}`,
    ``,
    `variable "aws_region" {`,
    `  description = "AWS region to deploy resources"`,
    `  type        = string`,
    `  default     = "${region}"`,
    `}`,
    ``,
    `provider "aws" {`,
    `  region = var.aws_region`,
    `}`,
  ].join("\n")

  const supported = nodes.filter((n) => SUPPORTED.has(n.data.type))

  if (supported.length === 0) {
    return {
      "main.tf": `# No supported resources on canvas\n`,
      "variables.tf": variablesTf,
      "outputs.tf": `# No outputs\n`,
    }
  }

  const mainBlocks: string[] = []
  for (const node of supported) {
    switch (node.data.type) {
      case "vpc":
        mainBlocks.push(generateVpc(node, nodes))
        break
      case "subnet":
        mainBlocks.push(generateSubnet(node, nodes, edges))
        break
      case "sg":
        mainBlocks.push(generateSg(node, nodes, edges))
        break
      case "ec2":
        mainBlocks.push(generateEc2(node, nodes, edges))
        break
      case "s3":
        mainBlocks.push(generateS3(node, nodes))
        break
    }
  }

  return {
    "main.tf": mainBlocks.join("\n\n") + "\n",
    "variables.tf": variablesTf,
    "outputs.tf": generateOutputs(supported, nodes) + "\n",
  }
}

