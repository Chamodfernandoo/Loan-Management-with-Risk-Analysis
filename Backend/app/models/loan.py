from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class LoanStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"
    DEFAULTED = "DEFAULTED"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    LATE = "LATE"
    MISSED = "MISSED"

class Payment(BaseModel):
    payment_id: Optional[str] = None
    amount: float
    status: PaymentStatus = PaymentStatus.PENDING
    payment_date: Optional[datetime] = None
    method: Optional[str] = None
    due_date: Optional[datetime] = None

class PaymentCreate(BaseModel):
    loan_id: str
    amount: float
    due_date: datetime
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING

class Loan(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    borrower_id: str
    lender_id: str
    amount: float
    interest_rate: float
    term_months: int
    status: LoanStatus = LoanStatus.PENDING
    purpose: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    payments: List[Payment] = []
    total_amount: float  # amount + interest
    total_paid: float = 0
    remaining_amount: float = 0  # total_amount - total_paid
    installment_amount: float  # total_amount / term_months
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Additional custom fields
    lender_name: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    borrower_nic: Optional[str] = None

    class Config:
        allow_population_by_field_name = True