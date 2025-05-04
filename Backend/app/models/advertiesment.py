from pydantic import BaseModel, Field, GetJsonSchemaHandler
from typing import List, Optional, Any, Annotated
from datetime import datetime
from bson import ObjectId
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema

# Updated PyObjectId class for Pydantic v2
class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        return core_schema.str_schema()

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
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    lender_id: str
    created_at: datetime
    updated_at: datetime
    photos: List[str] = []
    is_owner: bool = False

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }
    }