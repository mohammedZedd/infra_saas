from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from uuid import UUID
from db.models.notification import Notification, NotificationType
from schemas.notification import NotificationCreate

# Get all notifications for a user, with optional filters
def get_notifications_for_user(db: Session, user_id: UUID, read: Optional[bool] = None, type: Optional[str] = None) -> List[Notification]:
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if read is not None:
        query = query.filter(Notification.read == read)
    if type:
        query = query.filter(Notification.type == type)
    return query.order_by(desc(Notification.created_at)).all()

# Get a single notification by id for a user
def get_notification_by_id(db: Session, user_id: UUID, notification_id: UUID) -> Optional[Notification]:
    return db.query(Notification).filter(Notification.user_id == user_id, Notification.id == notification_id).first()

# Mark a single notification as read
def mark_notification_as_read(db: Session, user_id: UUID, notification_id: UUID) -> Optional[Notification]:
    notif = get_notification_by_id(db, user_id, notification_id)
    if notif:
        notif.read = True
        db.commit()
        db.refresh(notif)
    return notif

# Mark all notifications as read for a user
def mark_all_notifications_as_read(db: Session, user_id: UUID) -> int:
    updated = db.query(Notification).filter(Notification.user_id == user_id, Notification.read == False).update({"read": True})
    db.commit()
    return updated

# Delete a notification by id for a user
def delete_notification(db: Session, user_id: UUID, notification_id: UUID) -> bool:
    notif = get_notification_by_id(db, user_id, notification_id)
    if notif:
        db.delete(notif)
        db.commit()
        return True
    return False

# Create a notification
def create_notification(db: Session, notif_in: NotificationCreate) -> Notification:
    notif = Notification(**notif_in.dict())
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
