from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Location(BaseModel):
    district: str
    city: str

class AdvertisementBase(BaseModel):
    shop_name: str
    lender_name: str
    contact_number: str
    description: str
    location: Location
    loan_types: List[str]
    interest_rate: float

class AdvertisementCreate(AdvertisementBase):
    pass

class AdvertisementUpdate(BaseModel):
    shop_name: Optional[str] = None
    lender_name: Optional[str] = None
    contact_number: Optional[str] = None
    description: Optional[str] = None
    location: Optional[Location] = None
    loan_types: Optional[List[str]] = None
    interest_rate: Optional[float] = None

class Advertisement(AdvertisementBase):
    id: str = Field(..., alias="_id")
    lender_id: str
    created_at: datetime
    updated_at: datetime
    photos: List[str] = []

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True