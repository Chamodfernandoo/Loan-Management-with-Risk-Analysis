from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user, get_password_hash, verify_password
from ..core.database import get_collection
from ..models.user import UserUpdate, PasswordChange

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(get_current_active_user)]
)

@router.get("/me", response_model=dict)
async def get_current_user_profile(current_user = Depends(get_current_active_user)):
     # make a shallow copy so we don't mutate the Mongo document in place
    user_doc = dict(current_user)
    # remove sensitive/internal fields
    user_doc.pop("hashed_password", None)
    # convert ObjectId to string
    user_doc["id"] = str(user_doc.pop("_id"))
    return user_doc

@router.put("/me", response_model=dict)
async def update_user_profile(
    user_update: UserUpdate,
    current_user = Depends(get_current_active_user)
):
    users_collection = get_collection("users")
    
    update_data = user_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data}
    )
    
    updated_user = await users_collection.find_one({"_id": ObjectId(current_user["_id"])})
    
    # Convert the document to a dict and handle ObjectId
    result = dict(updated_user)
    result["id"] = str(result.pop("_id"))  # Convert ObjectId to string
    result.pop("hashed_password", None)  # Remove sensitive information
    
    return result
@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    password_change: PasswordChange,
    current_user = Depends(get_current_active_user)
):
    users_collection = get_collection("users")
    
    # Verify current password
    if not verify_password(password_change.current_password, current_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Hash new password
    hashed_password = get_password_hash(password_change.new_password)
    
    # Update password
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {
            "$set": {
                "hashed_password": hashed_password,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return None

@router.put("/address", response_model=dict)
async def update_user_address(
    address_data: dict,
    current_user = Depends(get_current_active_user)
):
    """Update the user's address information"""
    users_collection = get_collection("users")
    
    # Ensure address has required fields
    required_fields = ["province", "district", "city", "address", "postalCode"]
    for field in required_fields:
        if field not in address_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required address field: {field}"
            )
    
    # Format address data to match database schema
    formatted_address = {
        "province": address_data["province"],
        "district": address_data["district"],
        "city": address_data["city"],
        "address": address_data["address"],
        "postal_code": address_data["postalCode"]
    }
    
    # Update address in user document
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {
            "address": formatted_address,
            "updated_at": datetime.utcnow()
        }}
    )
    
    # If user is a lender, also update address in lender profile
    if current_user["role"] == "lender":
        lenders_collection = get_collection("lenders")
        await lenders_collection.update_one(
            {"user_id": str(current_user["_id"])},
            {"$set": {
                "address": formatted_address,
                "updated_at": datetime.utcnow()
            }}
        )
    # If user is a borrower, also update address in borrower profile
    elif current_user["role"] == "borrower":
        borrowers_collection = get_collection("borrowers")
        await borrowers_collection.update_one(
            {"user_id": str(current_user["_id"])},
            {"$set": {
                "address": formatted_address,
                "updated_at": datetime.utcnow()
            }}
        )
    
    # Get updated user
    updated_user = await users_collection.find_one({"_id": ObjectId(current_user["_id"])})
    
    # Convert the document to a dict and handle ObjectId
    result = dict(updated_user)
    result["id"] = str(result.pop("_id"))  # Convert ObjectId to string
    result.pop("hashed_password", None)  # Remove sensitive information
    
    return result