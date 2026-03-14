import { useState, useCallback } from "react"
import { Copy, Download, Zap } from "lucide-react"
import toast from "react-hot-toast"
import CodeEditor from "../ui/CodeEditor"
import FileExplorer, { type FileNode } from "../ui/FileExplorer"
import { Button } from "../ui/Button"
import type { Project } from "../../types/project.types"

interface ProjectCodeEditorProps {
  project: Project
  onEditInDesigner?: () => void
}

function getBadge(path: string): string {
  if (path.endsWith(".tfvars")) return "tfvars"
  if (path.endsWith(".tf") || path.endsWith(".hcl")) return "hcl"
  if (path.endsWith(".gitignore")) return "ignore"
  return path.split(".").pop() ?? "text"
}

export function ProjectCodeEditor({
  project,
  onEditInDesigner,
}: ProjectCodeEditorProps) {
  const [selectedFile, setSelectedFile] = useState<string>("terragrunt.hcl")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("hcl")
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    "terragrunt.hcl": generateRootTerragruntHcl(project),
    "stack.hcl": generateStackHcl(project),
    "modules/variables.tf": generateVariablesTf(),
    "modules/outputs.tf": generateOutputsTf(),
    "services/main.tf": generateMainTf(project),
    "stacks/dev/terragrunt.hcl": generateEnvTerragruntHcl("dev", "t3.micro"),
    "stacks/dev/terraform.tfvars": generateEnvTfvars("dev"),
    "stacks/dev/backend.tf": generateBackendTf("dev"),
    "stacks/staging/terragrunt.hcl": generateEnvTerragruntHcl("staging", "t3.small"),
    "stacks/staging/terraform.tfvars": generateEnvTfvars("staging"),
    "stacks/staging/backend.tf": generateBackendTf("staging"),
    "stacks/prod/terragrunt.hcl": generateEnvTerragruntHcl("prod", "t3.medium"),
    "stacks/prod/terraform.tfvars": generateEnvTfvars("prod"),
    "stacks/prod/backend.tf": generateBackendTf("prod"),
  })

  const files: FileNode[] = [
    { name: "terragrunt.hcl", path: "terragrunt.hcl", type: "file", language: "hcl" },
    { name: "stack.hcl",      path: "stack.hcl",      type: "file", language: "hcl" },
    {
      name: "modules",
      path: "modules",
      type: "folder",
      children: [
        { name: "variables.tf", path: "modules/variables.tf", type: "file", language: "hcl" },
        { name: "outputs.tf",   path: "modules/outputs.tf",   type: "file", language: "hcl" },
      ],
    },
    {
      name: "services",
      path: "services",
      type: "folder",
      children: [
        { name: "main.tf", path: "services/main.tf", type: "file", language: "hcl" },
      ],
    },
    {
      name: "stacks",
      path: "stacks",
      type: "folder",
      children: [
        {
          name: "dev",
          path: "stacks/dev",
          type: "folder",
          children: [
            { name: "terragrunt.hcl",    path: "stacks/dev/terragrunt.hcl",    type: "file", language: "hcl" },
            { name: "terraform.tfvars",  path: "stacks/dev/terraform.tfvars",  type: "file", language: "hcl" },
            { name: "backend.tf",        path: "stacks/dev/backend.tf",        type: "file", language: "hcl" },
          ],
        },
        {
          name: "staging",
          path: "stacks/staging",
          type: "folder",
          children: [
            { name: "terragrunt.hcl",   path: "stacks/staging/terragrunt.hcl",   type: "file", language: "hcl" },
            { name: "terraform.tfvars", path: "stacks/staging/terraform.tfvars", type: "file", language: "hcl" },
            { name: "backend.tf",       path: "stacks/staging/backend.tf",       type: "file", language: "hcl" },
          ],
        },
        {
          name: "prod",
          path: "stacks/prod",
          type: "folder",
          children: [
            { name: "terragrunt.hcl",   path: "stacks/prod/terragrunt.hcl",   type: "file", language: "hcl" },
            { name: "terraform.tfvars", path: "stacks/prod/terraform.tfvars", type: "file", language: "hcl" },
            { name: "backend.tf",       path: "stacks/prod/backend.tf",       type: "file", language: "hcl" },
          ],
        },
      ],
    },
  ]

  const handleSelectFile = useCallback((path: string, language = "hcl") => {
    setSelectedFile(path)
    setSelectedLanguage(language)
  }, [])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(fileContents[selectedFile] || "")
    toast.success("Copied to clipboard!")
  }, [fileContents, selectedFile])

  const handleDownload = useCallback(() => {
    const element = document.createElement("a")
    element.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(
        fileContents[selectedFile] || ""
      )}`
    )
    element.setAttribute("download", selectedFile.split("/").pop() ?? selectedFile)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("File downloaded!")
  }, [fileContents, selectedFile])

  const handleCodeChange = useCallback((newValue: string) => {
    setFileContents((prev) => ({
      ...prev,
      [selectedFile]: newValue,
    }))
  }, [selectedFile])

  const lineCount = fileContents[selectedFile]?.split("\n").length || 0
  const fileSize = new Blob([fileContents[selectedFile] || ""]).size
  const badge = getBadge(selectedFile)
  const filename = selectedFile.split("/").pop() ?? selectedFile

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">
              {filename}
            </h3>
            <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {badge}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {selectedFile} &nbsp;·&nbsp; {lineCount} lines &nbsp;·&nbsp; {(fileSize / 1024).toFixed(2)} KB
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={Copy}
            onClick={handleCopy}
          >
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={Download}
            onClick={handleDownload}
          >
            Download
          </Button>
          {onEditInDesigner && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={Zap}
              onClick={onEditInDesigner}
            >
              Edit in Designer
            </Button>
          )}
        </div>
      </div>

      {/* Main Content: File Explorer + Editor */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 flex-shrink-0 overflow-hidden bg-gray-800">
          <FileExplorer
            files={files}
            onSelectFile={handleSelectFile}
            selectedPath={selectedFile}
            defaultExpandedPaths={new Set(["modules", "services", "stacks", "stacks/dev"])}
          />
        </div>

        <div className="flex-1 overflow-hidden bg-gray-900">
          <CodeEditor
            value={fileContents[selectedFile] || ""}
            language={selectedLanguage}
            onChange={handleCodeChange}
            height="100%"
            readOnly={false}
            theme="dark"
          />
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="border-t border-gray-200 bg-white px-6 py-3 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <span>{badge.toUpperCase()}</span>
            <span>UTF-8</span>
            <span>LF</span>
          </div>
          <div className="flex gap-4">
            <span>{lineCount} lines</span>
            <span>{(fileSize / 1024).toFixed(2)} KB</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Generator Functions ─────────────────────────────────────────────────────

function generateRootTerragruntHcl(project: Project): string {
  const slug = project.name.toLowerCase().replace(/\s+/g, "-")
  return `# Root terragrunt.hcl — shared configuration inherited by all stacks
# Project: ${project.name}  |  Region: ${project.region}

locals {
  project_name = "${slug}"
  aws_region   = "${project.region}"
  org          = "cloudforge"
}

# Generate a shared AWS provider block for all child modules
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "aws" {
  region = "\${local.aws_region}"

  default_tags {
    tags = {
      Project   = "\${local.project_name}"
      ManagedBy = "Terragrunt"
    }
  }
}
EOF
}

# Remote state stored in S3 — each env uses its own key
remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    bucket         = "\${local.org}-terraform-state-\${local.aws_region}"
    key            = "\${local.project_name}/\${path_relative_to_include()}/terraform.tfstate"
    region         = local.aws_region
    encrypt        = true
    dynamodb_table = "\${local.org}-terraform-locks"
  }
}
`
}

function generateStackHcl(project: Project): string {
  const slug = project.name.toLowerCase().replace(/\s+/g, "-")
  return `# stack.hcl — defines which Terraform module each stack points to
# Included by stacks/*/terragrunt.hcl via find_in_parent_folders()

locals {
  root_vars = read_terragrunt_config(find_in_parent_folders("terragrunt.hcl"))
  env       = basename(get_terragrunt_dir())
}

terraform {
  source = "\${get_repo_root()}//services"
}

inputs = merge(
  local.root_vars.locals,
  {
    environment  = local.env
    project_name = "${slug}"
  }
)
`
}

function generateMainTf(project: Project): string {
  return `# services/main.tf — core AWS resources for ${project.name}
# Region: ${project.region}

terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ── VPC ──────────────────────────────────────────────────────────────────────

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "\${var.project_name}-\${var.environment}-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "\${var.project_name}-\${var.environment}-public"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}
`
}

function generateVariablesTf(): string {
  return `variable "aws_region" {
  description = "AWS region for resource deployment"
  type        = string
  default     = "us-east-1"

  validation {
    condition     = can(regex("^[a-z]{2}(-gov)?-[a-z]+-\\\\d{1}$", var.aws_region))
    error_message = "Must be a valid AWS region."
  }
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]{3,50}$", var.project_name))
    error_message = "Project name must be 3-50 chars, lowercase alphanumeric and hyphens only."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
`
}

function generateOutputsTf(): string {
  return `# modules/outputs.tf — expose key resource attributes

output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "The ID of the public subnet"
  value       = aws_subnet.public.id
}

output "aws_region" {
  description = "Deployed AWS region"
  value       = var.aws_region
}
`
}

function generateEnvTerragruntHcl(env: string, instanceType: string): string {
  return `# stacks/${env}/terragrunt.hcl — ${env} environment stack

include "root" {
  path   = find_in_parent_folders("terragrunt.hcl")
  expose = true
}

include "stack" {
  path   = find_in_parent_folders("stack.hcl")
  expose = true
}

inputs = {
  environment   = "${env}"
  instance_type = "${instanceType}"
  vpc_cidr      = "${env === "prod" ? "10.2.0.0/16" : env === "staging" ? "10.1.0.0/16" : "10.0.0.0/16"}"

  tags = {
    Environment = "${env}"
    CostCenter  = "Engineering"
  }
}
`
}

function generateEnvTfvars(env: string): string {
  const cidr = env === "prod" ? "10.2.0.0/16" : env === "staging" ? "10.1.0.0/16" : "10.0.0.0/16"
  const instance = env === "prod" ? "t3.medium" : env === "staging" ? "t3.small" : "t3.micro"
  return `# stacks/${env}/terraform.tfvars

environment   = "${env}"
vpc_cidr      = "${cidr}"
instance_type = "${instance}"

tags = {
  Environment = "${env}"
  Owner       = "DevTeam"
  CostCenter  = "Engineering"
}
`
}

function generateBackendTf(env: string): string {
  return `# stacks/${env}/backend.tf — remote state (auto-generated by Terragrunt root config)
# Do not edit manually — managed via root terragrunt.hcl remote_state block.

# Terragrunt will inject the backend configuration at plan/apply time.
# If running plain Terraform, configure manually:
#
# terraform {
#   backend "s3" {
#     bucket         = "cloudforge-terraform-state-us-east-1"
#     key            = "<project>/${env}/terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "cloudforge-terraform-locks"
#   }
# }
`
}
