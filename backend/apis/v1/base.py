from fastapi import APIRouter

from apis.v1.route_auth import router as auth_router
from apis.v1.route_projects import router as projects_router
from apis.v1.route_notifications import router as notifications_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="", tags=["auth"])
api_router.include_router(projects_router, prefix="", tags=["projects"])
api_router.include_router(notifications_router, prefix="", tags=["notifications"])
