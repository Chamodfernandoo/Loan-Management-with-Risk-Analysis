from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class PaymentStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"

class PaymentMethod(str, Enum):
    card = "card"
    bank_transfer = "bank_transfer"
    cash = "cash"

class PaymentBase(BaseModel):
    amount: float
    method: PaymentMethod
    description: Optional[str] = None
    method_details: Optional[Dict[str, Any]] = None  # For card details, etc.

class PaymentCreate(PaymentBase):
    loan_id: str

class Payment(PaymentBase):
    id: str = Field(..., alias="_id")
    loan_id: str
    user_id: str
    status: PaymentStatus
    created_at: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True