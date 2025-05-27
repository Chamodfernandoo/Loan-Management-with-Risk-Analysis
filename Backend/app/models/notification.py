from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    payment_due = "payment_due"
    payment_received = "payment_received"
    payment_overdue = "payment_overdue"
    loan_application = "loan_application" 
    loan_approved = "loan_approved"
    loan_rejected = "loan_rejected"
    system_update = "system_update"
    customer_activity = "customer_activity"
    document_verification = "document_verification"

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
    timestamp: Union[datetime, str]
    read: bool = False

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        
    @validator('timestamp', pre=True)
    def parse_timestamp(cls, v):
        if isinstance(v, str):
            try:
                # Parse string to datetime, properly handling UTC indicator 'Z'
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except:
                return v
        # Convert datetime to ISO format with UTC indicator
        if isinstance(v, datetime):
            return v.replace(microsecond=0).isoformat() + 'Z'
        return v