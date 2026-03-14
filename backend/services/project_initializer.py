from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from repository.file import ensure_folder, get_project_file_by_path, save_project_file



# --- Templates (from user spec) ---
ROOT_TERRAGRUNT = '''locals {
  env_vars    = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  
  environment = local.env_vars.locals.environment
  aws_region  = local.region_vars.locals.aws_region
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "aws" {
  region = "${local.aws_region}"
}
EOF
}

remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    bucket         = "terraform-state-${local.environment}"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = local.aws_region
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
'''

def env_hcl(env: str) -> str:
    return f'''locals {{
  environment = "{env}"
}}
'''

def region_hcl(region: str) -> str:
    return f'''locals {{
  aws_region = "{region}"
}}
'''

README_TEMPLATE = '''# Project Name

## Structure

- `modules/` - Reusable Terraform modules
- `services/` - Service compositions using modules  
- `stacks/` - Terragrunt environment deployments

## Environments

- `stacks/dev/` - Development environment
- `stacks/staging/` - Staging environment
- `stacks/prod/` - Production environment
'''


README_TEMPLATE = '''# Infrastructure Project

This repository follows enterprise Terraform/Terragrunt structure:

- `modules/` reusable Terraform modules
- `services/` module compositions
- `stacks/` Terragrunt deployments by environment and region
'''


async def _save_if_missing(db: AsyncSession, project_id: UUID, path: str, content: str) -> None:
    existing = await get_project_file_by_path(db, project_id, path)
    if existing is None:
        await save_project_file(db, project_id, path, content)


async def initialize_project_structure(db: AsyncSession, project_id: UUID, *, overwrite: bool = False) -> None:
    # --- Enterprise structure ---
    envs = ["prod", "staging", "dev"]
    regions = ["us-east-1"]  # Default region; can be expanded later

    folders = [
      "modules",
      "services",
      "stacks",
    ]
    # Add env and region folders
    for env in envs:
      folders.append(f"stacks/{env}")
      for region in regions:
        folders.append(f"stacks/{env}/{region}")

    for folder in folders:
      await ensure_folder(db, project_id, folder)

    files = {
      "modules/.gitkeep": "",
      "services/.gitkeep": "",
      "stacks/terragrunt.hcl": ROOT_TERRAGRUNT,
      "README.md": README_TEMPLATE,
    }
    # Add env.hcl and region.hcl files
    for env in envs:
      files[f"stacks/{env}/env.hcl"] = env_hcl(env)
      for region in regions:
        files[f"stacks/{env}/{region}/region.hcl"] = region_hcl(region)

    for path, content in files.items():
      if overwrite:
        await save_project_file(db, project_id, path, content)
      else:
        await _save_if_missing(db, project_id, path, content)
