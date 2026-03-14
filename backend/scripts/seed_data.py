from __future__ import annotations

import argparse
import asyncio

from db import base

from sqlalchemy import select

from core.hashing import get_password_hash
from db.models.plan import Plan
from db.models.project import Project, ProjectFile, TerraformRun
from db.models.user import User
from db.session import AsyncSessionLocal


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed CloudForge database with sample data")
    parser.add_argument("--scenario", choices=["minimal", "full"], default="full")
    return parser.parse_args()


async def get_or_create_plan(code: str, name: str, monthly: int, yearly: int) -> Plan:
    async with AsyncSessionLocal() as db:
        existing = await db.scalar(select(Plan).where(Plan.code == code))
        if existing:
            return existing

        plan = Plan(
            code=code,
            name=name,
            monthly_price_cents=monthly,
            yearly_price_cents=yearly,
            limits={"projects": 5 if code == "free" else 100},
            features=["community-support"] if code == "free" else ["priority-support", "team"],
            is_active=True,
        )
        db.add(plan)
        await db.commit()
        await db.refresh(plan)
        return plan


async def get_or_create_user(email: str, full_name: str, plan_id) -> User:
    async with AsyncSessionLocal() as db:
        existing = await db.scalar(select(User).where(User.email == email))
        if existing:
            return existing

        user = User(
            email=email,
            full_name=full_name,
            username=email.split("@")[0],
            hashed_password=get_password_hash("Password123!"),
            plan_id=plan_id,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user


async def seed_projects(owner_id, scenario: str) -> None:
    async with AsyncSessionLocal() as db:
        existing = await db.scalar(select(Project).where(Project.owner_id == owner_id, Project.name == "Demo Project"))
        if existing:
            return

        project = Project(
            owner_id=owner_id,
            name="Demo Project",
            description="Seeded demo project",
            region="eu-west-3",
            environment="dev",
            status="active",
            node_count=2,
            estimated_cost=12.50,
            metadata_json={"seeded": True},
        )
        db.add(project)
        await db.flush()


        # Add multiple realistic Terraform files
        tf_files = [
            {
                "filename": "main.tf",
                "content": 'resource "null_resource" "seed" {}',
                "language": "hcl",
            },
            {
                "filename": "variables.tf",
                "content": 'variable "example" { type = string }',
                "language": "hcl",
            },
            {
                "filename": "outputs.tf",
                "content": 'output "example" { value = "foo" }',
                "language": "hcl",
            },
            {
                "filename": "provider.tf",
                "content": 'provider "aws" { region = "us-west-2" }',
                "language": "hcl",
            },
        ]
        for tf in tf_files:
            db.add(
                ProjectFile(
                    project_id=project.id,
                    path=tf["filename"],
                    name=tf["filename"],
                    filename=tf["filename"],
                    parent_path=None,
                    file_type="file",
                    content_type="other",
                    is_directory=False,
                    language=tf["language"],
                    content=tf["content"],
                    size_bytes=len(tf["content"]),
                    is_deleted=False,
                )
            )

        db.add(
            TerraformRun(
                project_id=project.id,
                triggered_by="seed@cloudforge.local",
                command="plan",
                status="success",
                completed_at=None,
                plan_add=1,
                plan_change=0,
                plan_destroy=0,
                logs="[seed] terraform plan complete",
            )
        )

        if scenario == "full":
            db.add(
                Project(
                    owner_id=owner_id,
                    name="Demo Project 2",
                    description="Second seeded project",
                    region="us-east-1",
                    environment="staging",
                    status="draft",
                    node_count=1,
                    estimated_cost=4.25,
                    metadata_json={"seeded": True, "tier": "extended"},
                )
            )

        await db.commit()


async def seed(scenario: str) -> None:
    free_plan = await get_or_create_plan("free", "Free", 0, 0)
    await get_or_create_plan("pro", "Pro", 2900, 29000)

    user = await get_or_create_user("demo@cloudforge.local", "Demo User", free_plan.id)
    await seed_projects(user.id, scenario=scenario)

    print("Seed complete")


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(seed(args.scenario))
