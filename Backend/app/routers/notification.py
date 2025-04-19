from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.notification import Notification, NotificationCreate

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    dependencies=[Depends(get_current_active_user)]
)

@router.get("/", response_model=List[Notification])
async def get_notifications(
    read: Optional[bool] = None,
    current_user = Depends(get_current_active_user)
):
    notifications_collection = get_collection("notifications")
    
    query = {"user_id": str(current_user["_id"])}
    if read is not None:
        query["read"] = read
    
    cursor = notifications_collection.find(query).sort("timestamp", -1)
    notifications = await cursor.to_list(length=100)
    
    return notifications

@router.patch("/{notification_id}/read", response_model=Notification)
async def mark_notification_read(
    notification_id: str,
    current_user = Depends(get_current_active_user)
):
    notifications_collection = get_collection("notifications")
    notification = await notifications_collection.find_one({"_id": ObjectId(notification_id)})
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification["user_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own notifications"
        )
    
    await notifications_collection.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    
    updated_notification = await notifications_collection.find_one({"_id": ObjectId(notification_id)})
    return updated_notification

@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_read(current_user = Depends(get_current_active_user)):
    notifications_collection = get_collection("notifications")
    
    await notifications_collection.update_many(
        {"user_id": str(current_user["_id"]), "read": False},
        {"$set": {"read": True}}
    )
    
    return None