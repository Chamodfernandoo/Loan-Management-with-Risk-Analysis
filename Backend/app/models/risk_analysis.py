from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class RiskFactor(BaseModel):
    name: str
    importance: float
    impact: str  # "low", "medium", "high"
    description: str

class RiskAnalysisRequest(BaseModel):
    borrower_id: str
    age: Optional[int] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    job: Optional[str] = None
    monthly_income: Optional[float] = None
    housing_status: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    no_of_previous_loans: Optional[int] = None
    no_of_available_loans: Optional[int] = None
    total_on_time_payments: Optional[int] = None
    total_late_payments: Optional[int] = None
    loan_amount_requested: Optional[float] = None
    loan_term_months: Optional[int] = None

class RiskAnalysisResponse(BaseModel):
    borrower_id: str
    #risk_score: float
    risk_level: RiskLevel
    factors: List[RiskFactor]
    recommendations: List[str]
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True