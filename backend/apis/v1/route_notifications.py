from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from db.session import get_db
from schemas.notification import NotificationResponse, NotificationListResponse, NotificationUpdate
from repository import notification as notification_repo
from core.deps import get_current_active_user
from db.models.user import User

router = APIRouter()

@router.get("/notifications", response_model=NotificationListResponse)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    read: Optional[bool] = Query(None),
    type: Optional[str] = Query(None),
):
    notifs = notification_repo.get_notifications_for_user(db, current_user.id, read, type)
    return {"notifications": notifs}

@router.get("/notifications/{id}", response_model=NotificationResponse)
def get_notification(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    notif = notification_repo.get_notification_by_id(db, current_user.id, id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.put("/notifications/{id}/read", response_model=NotificationResponse)
def mark_notification_read(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    notif = notification_repo.mark_notification_as_read(db, current_user.id, id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.put("/notifications/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    count = notification_repo.mark_all_notifications_as_read(db, current_user.id)
    return {"updated": count}

@router.delete("/notifications/{id}")
def delete_notification(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ok = notification_repo.delete_notification(db, current_user.id, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"deleted": True}
