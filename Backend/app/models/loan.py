from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class LoanStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ACTIVE = "active"
    COMPLETED = "completed"
    REJECTED = "rejected"
    DEFAULTED = "defaulted"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    LATE = "late"
    MISSED = "missed"

class Payment(BaseModel):
    amount: float
    due_date: datetime
    payment_date: Optional[datetime] = None
    status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None

class Loan(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    borrower_id: str
    lender_id: str
    amount: float
    interest_rate: float
    term_months: int
    status: LoanStatus = LoanStatus.PENDING
    purpose: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    payments: List[Payment] = []
    total_paid: float = 0
    remaining_amount: float = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True