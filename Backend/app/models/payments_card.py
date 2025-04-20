from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class CardBase(BaseModel):
    card_number: str
    cardholder_name: str
    expiry_month: str
    expiry_year: str
    card_type: str
    is_default: bool = False
    nickname: Optional[str] = None

    @validator('card_number')
    def validate_card_number(cls, v):
        # Simple validation for demo purposes
        if not v.isdigit() or len(v) < 13 or len(v) > 19:
            raise ValueError('Invalid card number')
        return v

    @validator('expiry_month')
    def validate_expiry_month(cls, v):
        if not v.isdigit() or int(v) < 1 or int(v) > 12:
            raise ValueError('Invalid expiry month')
        return v

    @validator('expiry_year')
    def validate_expiry_year(cls, v):
        if not v.isdigit() or len(v) != 4:
            raise ValueError('Invalid expiry year')
        return v

class CardCreate(CardBase):
    pass

class Card(CardBase):
    id: str = Field(..., alias="_id")
    user_id: str
    created_at: datetime

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True