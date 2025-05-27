from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class TicketCategory(str, Enum):
    account = "account"
    payment = "payment"
    loan = "loan"
    technical = "technical"
    other = "other"

class TicketStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"

class TicketReplyBase(BaseModel):
    message: str

class TicketReply(TicketReplyBase):
    user_id: str
    timestamp: datetime

class SupportTicketBase(BaseModel):
    subject: str
    message: str
    category: TicketCategory

class SupportTicketCreate(SupportTicketBase):
    pass

class SupportTicket(SupportTicketBase):
    id: str = Field(..., alias="_id")
    user_id: str
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    replies: List[TicketReply] = []

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True