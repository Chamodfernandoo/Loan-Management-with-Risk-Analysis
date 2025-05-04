from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.user import UserUpdate

router = APIRouter(
    prefix="/lenders",
    tags=["lenders"],
    dependencies=[Depends(get_current_active_user)]
)

@router.get("/profile", response_model=dict)
async def get_lender_profile(current_user = Depends(get_current_active_user)):
    """Get the lender profile for the current user"""
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can access lender profiles"
        )
    
    lenders_collection = get_collection("lenders")
    lender_profile = await lenders_collection.find_one({"user_id": str(current_user["_id"])})
    
    if not lender_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lender profile not found"
        )
    
    # Convert ObjectId to string
    if "_id" in lender_profile:
        lender_profile["id"] = str(lender_profile.pop("_id"))
    
    return lender_profile

@router.put("/business", response_model=dict)
async def update_lender_business(
    business_data: dict,
    current_user = Depends(get_current_active_user)
):
    """Update lender business details"""
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can update lender business details"
        )
    
    lenders_collection = get_collection("lenders")
    lender_profile = await lenders_collection.find_one({"user_id": str(current_user["_id"])})
    
    if not lender_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lender profile not found"
        )
    
    # Update business details
    update_data = {
        "business_name": business_data.get("business_name"),
        "business_registration_number": business_data.get("business_registration_number"),
        "updated_at": datetime.utcnow()
    }
    
    # Remove None values
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    await lenders_collection.update_one(
        {"user_id": str(current_user["_id"])},
        {"$set": update_data}
    )
    
    # Also update relevant fields in the user document
    users_collection = get_collection("users")
    if "business_name" in update_data:
        await users_collection.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": {"business_name": update_data["business_name"], "updated_at": datetime.utcnow()}}
        )
    
    # Get updated profile
    updated_profile = await lenders_collection.find_one({"user_id": str(current_user["_id"])})
    
    # Convert ObjectId to string
    if "_id" in updated_profile:
        updated_profile["id"] = str(updated_profile.pop("_id"))
    
    return updated_profile