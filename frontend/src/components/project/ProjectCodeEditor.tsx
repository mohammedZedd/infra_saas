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

export function ProjectCodeEditor({
  project,
  onEditInDesigner,
}: ProjectCodeEditorProps) {
  const [selectedFile, setSelectedFile] = useState<string>("main.tf")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("hcl")
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    "main.tf": generateMainTf(project),
    "variables.tf": generateVariablesTf(),
    "outputs.tf": generateOutputsTf(),
    "terraform.tfvars": generateTfvars(),
  })

  const files: FileNode[] = [
    {
      name: project.name.toLowerCase().replace(/\s+/g, "-"),
      path: project.name.toLowerCase().replace(/\s+/g, "-"),
      type: "folder",
      children: [
        { name: "main.tf", path: "main.tf", type: "file", language: "hcl" },
        {
          name: "variables.tf",
          path: "variables.tf",
          type: "file",
          language: "hcl",
        },
        {
          name: "outputs.tf",
          path: "outputs.tf",
          type: "file",
          language: "hcl",
        },
        {
          name: "terraform.tfvars",
          path: "terraform.tfvars",
          type: "file",
          language: "hcl",
        },
        {
          name: ".gitignore",
          path: ".gitignore",
          type: "file",
          language: "properties",
        },
        {
          name: "backend.tf",
          path: "backend.tf",
          type: "file",
          language: "hcl",
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
    element.setAttribute("download", selectedFile)
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

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">
              {selectedFile}
            </h3>
            <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {selectedLanguage}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {lineCount} lines • {(fileSize / 1024).toFixed(2)} KB
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
            <span>HCL</span>
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

// ── Helper Functions ───────────────────────────────────────────────────────

function generateMainTf(project: Project): string {
  return `# Auto-generated Terraform configuration for ${project.name}
# Created by CloudForge Infrastructure Designer
# Region: ${project.region}
# Project ID: ${project.id}

terraform {
  required_version = ">= 1.6"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Configure your backend (local, S3, Terraform Cloud, etc.)
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "${project.name.toLowerCase().replace(/\\s+/g, "-")}/terraform.tfstate"
  #   region         = "${project.region}"
  #   encrypt        = true
  #   dynamodb_table = "terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "${project.name}"
      Environment = var.environment
      ManagedBy   = "CloudForge"
      CreatedAt   = "${new Date().toISOString()}"
    }
  }
}

# ── Core Infrastructure Resources ──
# Add your AWS resources here based on your infrastructure design
# Example resources:
#
# resource "aws_vpc" "main" {
#   cidr_block           = var.vpc_cidr
#   enable_dns_hostnames = true
#   enable_dns_support   = true
#   tags = {
#     Name = "\${var.project_name}-vpc"
#   }
# }
#
# resource "aws_subnet" "public" {
#   vpc_id                  = aws_vpc.main.id
#   cidr_block              = var.public_subnet_cidr
#   availability_zone       = data.aws_availability_zones.available.names[0]
#   map_public_ip_on_launch = true
#   tags = {
#     Name = "\${var.project_name}-public-subnet"
#   }
# }
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
  default     = "dev"

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
    error_message = "Project name must be 3-50 characters, lowercase alphanumeric and hyphens only."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
`
}

function generateOutputsTf(): string {
  return `# ── Infrastructure Outputs ──
# These outputs expose important resource attributes for external use

# output "vpc_id" {
#   description = "The ID of the VPC"
#   value       = aws_vpc.main.id
# }

# output "public_subnet_ids" {
#   description = "List of public subnet IDs"
#   value       = aws_subnet.public[*].id
# }

# output "instance_public_ips" {
#   description = "Public IPs of EC2 instances"
#   value       = aws_instance.app[*].public_ip
# }

# Uncomment and customize outputs based on your infrastructure
`
}

function generateTfvars(): string {
  return `# Terraform Variables File
# Use this file to provide values for variables defined in variables.tf

aws_region  = "us-east-1"
environment = "dev"
project_name = "my-project"

vpc_cidr = "10.0.0.0/16"

tags = {
  Owner       = "DevTeam"
  CostCenter  = "Engineering"
  Managed     = "Terraform"
}
`
}

