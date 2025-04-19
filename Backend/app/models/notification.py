from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    payment_due = "payment_due"
    payment_received = "payment_received"
    payment_overdue = "payment_overdue"
    loan_approved = "loan_approved"
    loan_rejected = "loan_rejected"
    system_update = "system_update"

class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str
    related_id: Optional[str] = None
    related_data: Optional[Dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    user_id: str

class Notification(NotificationBase):
    id: str = Field(..., alias="_id")
    user_id: str
    timestamp: datetime
    read: bool = False

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True