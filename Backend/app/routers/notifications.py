from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime
import json

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.notification import Notification, NotificationCreate, NotificationType

# Custom JSON encoder to handle ObjectId and datetime
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

# Helper function to convert MongoDB document to JSON-serializable dict
def convert_mongo_doc_to_json(doc):
    if isinstance(doc, dict):
        return {k: convert_mongo_doc_to_json(v) for k, v in doc.items()}
    elif isinstance(doc, list):
        return [convert_mongo_doc_to_json(item) for item in doc]
    elif isinstance(doc, ObjectId):
        return str(doc)
    elif isinstance(doc, datetime):
        # Make sure to include 'Z' to indicate UTC
        return doc.replace(microsecond=0).isoformat() + 'Z'
    else:
        return doc

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    dependencies=[Depends(get_current_active_user)]
)

@router.get("/", response_model=Dict[str, Any])
async def get_notifications(
    read: Optional[bool] = None,
    type: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_active_user)
):
    """Get notifications for the current user"""
    try:
        print(f"Fetching notifications for user: {current_user['_id']}, params: limit={limit}, offset={offset}, read={read}, type={type}")
        
        notifications_collection = get_collection("notifications")
        
        query = {"user_id": str(current_user["_id"])}
        if read is not None:
            query["read"] = read
        if type is not None:
            query["type"] = type
        
        print(f"Query: {query}")
        
        # Count total notifications for pagination
        total = await notifications_collection.count_documents(query)
        print(f"Total matching notifications: {total}")
        
        # Get paginated notifications
        cursor = notifications_collection.find(query).sort("timestamp", -1).skip(offset).limit(limit)
        notifications = await cursor.to_list(length=limit)
        print(f"Retrieved {len(notifications)} notifications")
        
        # Convert all MongoDB objects to JSON-serializable formats
        serialized_notifications = [convert_mongo_doc_to_json(notification) for notification in notifications]
        
        return {
            "notifications": serialized_notifications,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        print(f"Error in get_notifications: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return an empty result rather than failing
        return {
            "notifications": [],
            "total": 0,
            "limit": limit,
            "offset": offset,
            "error": str(e)
        }

@router.get("/unread-count", response_model=Dict[str, int])
async def get_unread_count(current_user = Depends(get_current_active_user)):
    """Get count of unread notifications for the current user"""
    try:
        notifications_collection = get_collection("notifications")
        
        count = await notifications_collection.count_documents({
            "user_id": str(current_user["_id"]),
            "read": False
        })
        
        return {"count": count}
    except Exception as e:
        print(f"Error in get_unread_count: {str(e)}")
        return {"count": 0, "error": str(e)}

@router.patch("/{notification_id}/read", response_model=Dict[str, Any])
async def mark_notification_read(
    notification_id: str,
    current_user = Depends(get_current_active_user)
):
    """Mark a specific notification as read"""
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
    return convert_mongo_doc_to_json(updated_notification)

@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_read(current_user = Depends(get_current_active_user)):
    """Mark all notifications as read for the current user"""
    notifications_collection = get_collection("notifications")
    
    await notifications_collection.update_many(
        {"user_id": str(current_user["_id"]), "read": False},
        {"$set": {"read": True}}
    )
    
    return None

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    current_user = Depends(get_current_active_user)
):
    """Delete a specific notification"""
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
            detail="You can only delete your own notifications"
        )
    
    await notifications_collection.delete_one({"_id": ObjectId(notification_id)})
    
    return None

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_notifications(current_user = Depends(get_current_active_user)):
    """Delete all notifications for the current user"""
    notifications_collection = get_collection("notifications")
    
    await notifications_collection.delete_many({"user_id": str(current_user["_id"])})
    
    return None

@router.post("/check-reminders", status_code=status.HTTP_200_OK)
async def check_payment_reminders(
    current_user = Depends(get_current_active_user)
):
    """
    Manually trigger payment reminder checks (admin only)
    """
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can trigger manual payment checks"
        )
    
    # Import the check_payments function and run it
    from ..utils.scheduled_tasks import check_payments
    await check_payments()
    
    return {"message": "Payment reminder check triggered successfully"}

@router.post("/test", status_code=status.HTTP_201_CREATED)
async def create_test_notification(current_user = Depends(get_current_active_user)):
    """Create a test notification for current user (for debugging)"""
    try:
        from ..utils.notification_utils import create_notification, NotificationType
        
        notification_id = await create_notification(
            user_id=str(current_user["_id"]),
            type=NotificationType.system_update,
            title="Test Notification",
            message="This is a test notification to verify the notification system is working.",
            related_data={"test": True, "timestamp": datetime.utcnow().isoformat()}
        )
        
        return {"notification_id": notification_id, "message": "Test notification created successfully"}
    except Exception as e:
        print(f"Error creating test notification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create test notification: {str(e)}"
        )