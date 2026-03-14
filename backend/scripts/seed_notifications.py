# Ensure all models are registered before any DB access
from db import base

import asyncio
from sqlalchemy import select
from db.session import AsyncSessionLocal
from db.models.user import User
from db.models.project import Project
from db.models.notification import Notification, NotificationType
from datetime import datetime, timedelta
import uuid

async def seed_notifications():
    async with AsyncSessionLocal() as db:
        users = (await db.execute(select(User))).scalars().all()
        projects = (await db.execute(select(Project))).scalars().all()
        now = datetime.utcnow()
        for user in users:
            for i in range(8):
                ntype = list(NotificationType)[i % len(NotificationType)]
                project = projects[i % len(projects)] if projects else None
                notif = Notification(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    type=ntype,
                    title=f"{ntype.value.replace('_', ' ').title()} for {project.name if project else 'N/A'}",
                    message=f"This is a sample {ntype.value.replace('_', ' ')} notification.",
                    read=(i % 3 == 0),
                    created_at=now - timedelta(hours=i * 3),
                    project_id=project.id if project else None,
                    project_name=project.name if project else None,
                    action_url=f"/projects/{project.id}" if project else None,
                )
                db.add(notif)
        await db.commit()
        print("Seeded notifications for all users.")

if __name__ == "__main__":
    asyncio.run(seed_notifications())
