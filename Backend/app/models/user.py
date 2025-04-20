from pydantic import BaseModel, Field, EmailStr , validator
from typing import Optional, List, Dict, Literal
from datetime import datetime, date
from enum import Enum

class UserRole(str, Enum):
    BORROWER = "borrower"
    LENDER = "lender"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr
    phone_number: str
    full_name: str
    role: UserRole

class Address(BaseModel):
    province: str
    district: str
    city: str
    address: str
    postal_code: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone_number: str
    full_name: str
    role: Literal["lender", "borrower"]
    address: Optional[Address] = None
    document_uploads: Optional[List[str]] = None
    nic_number: Optional[str]
    gender: Optional[str]
    date_of_birth: Optional[date]
    marital_status: Optional[str]
    housing_status: Optional[str]
    job_title: Optional[str]
    monthly_income: Optional[float]
    address: Optional[Address]
    document_type: Optional[str]
    document_uploads: Optional[List[str]]  # e.g. file URLs or base64 blobs
    terms_accepted: bool
    
class UserInDB(UserBase):
    id: str = Field(..., alias="_id")
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class User(BaseModel):
    id: str
    email: EmailStr
    phone_number: str
    full_name: str
    role: Literal["lender", "borrower"]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[Dict[str, str]] = None
    business_details: Optional[Dict[str, str]] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v