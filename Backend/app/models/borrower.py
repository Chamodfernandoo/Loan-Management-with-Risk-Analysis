from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class Address(BaseModel):
    street: str
    city: str
    state: str
    postal_code: str
    country: str = "Sri Lanka"

class Document(BaseModel):
    doc_type: str
    doc_number: str
    doc_url: str
    verified: bool = False

class BorrowerProfile(BaseModel):
    user_id: str
    nic_number: str
    address: Address
    documents: List[Document] = []
    monthly_income: float
    employment_status: str
    employer_name: Optional[str] = None
    employment_duration: Optional[int] = None  # in months
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class RiskFactor(BaseModel):
    factor: str
    score: int
    impact: str  # positive, negative, neutral
    description: str

class RiskAnalysis(BaseModel):
    borrower_id: str
    risk_score: int
    credit_history: Dict
    financial_metrics: Dict
    risk_factors: List[RiskFactor]
    recommendations: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)