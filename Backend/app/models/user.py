from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
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

class UserCreate(UserBase):
    password: str
    
class UserInDB(UserBase):
    id: str = Field(..., alias="_id")
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class User(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True