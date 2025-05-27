from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection

router = APIRouter(
    prefix="/borrowers",
    tags=["borrowers"],
    dependencies=[Depends(get_current_active_user)]
)

@router.get("/search")
async def search_borrower(
    nic_number: str, 
    current_user = Depends(get_current_active_user)
):
    """Search for a borrower by NIC number"""
    
    # Check if the current user is a lender
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can search for borrowers"
        )
    
    # Get the users collection
    users_collection = get_collection("users")
    
    # Find the user with the given NIC number
    user = await users_collection.find_one({"nic_number": nic_number})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No borrower found with NIC number {nic_number}"
        )
    
    # Get borrower details from borrowers collection
    borrowers_collection = get_collection("borrowers")
    borrower_profile = await borrowers_collection.find_one({"user_id": str(user["_id"])})
    
    # Combine user and borrower data
    result = {
        "id": str(user["_id"]),
        "full_name": user.get("full_name", ""),
        "email": user.get("email", ""),
        "phone_number": user.get("phone_number", ""),
        "nic_number": nic_number,
        "gender": user.get("gender", ""),
        "date_of_birth": user.get("date_of_birth", ""),
    }
    
    # Add borrower profile details if available
    if borrower_profile:
        result.update({
            "address": borrower_profile.get("address", {}),
            "job_title": borrower_profile.get("job_title", ""),
            "monthly_income": borrower_profile.get("monthly_income", 0),
            "marital_status": borrower_profile.get("marital_status", ""),
            "housing_status": borrower_profile.get("housing_status", ""),
        })
    
    return result

@router.get("/")
async def get_all_borrowers(
    current_user = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all borrowers (lenders only)"""
    
    if current_user["role"] != "lender" and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can view borrowers"
        )
    
    # Get all users with role 'borrower'
    users_collection = get_collection("users")
    cursor = users_collection.find({"role": "borrower"}).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    # Clean the data for response
    borrowers = []
    for user in users:
        borrowers.append({
            "id": str(user["_id"]),
            "full_name": user.get("full_name", ""),
            "email": user.get("email", ""),
            "phone_number": user.get("phone_number", ""),
            "nic_number": user.get("nic_number", ""),
            "created_at": user.get("created_at", datetime.utcnow())
        })
    
    return borrowers

@router.get("/{borrower_id}")
async def get_borrower_by_id(
    borrower_id: str,
    current_user = Depends(get_current_active_user)
):
    """Get borrower details by ID"""
    
    if current_user["role"] != "lender" and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can view borrower details"
        )
    
    # Get user with the given ID
    users_collection = get_collection("users")
    try:
        user = await users_collection.find_one({"_id": ObjectId(borrower_id), "role": "borrower"})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid borrower ID"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Borrower not found"
        )
    
    # Get borrower profile
    borrowers_collection = get_collection("borrowers")
    borrower_profile = await borrowers_collection.find_one({"user_id": str(user["_id"])})
    
    # Combine data
    result = {
        "id": str(user["_id"]),
        "full_name": user.get("full_name", ""),
        "email": user.get("email", ""),
        "phone_number": user.get("phone_number", ""),
        "nic_number": user.get("nic_number", ""),
        "gender": user.get("gender", ""),
        "date_of_birth": user.get("date_of_birth", ""),
        "created_at": user.get("created_at", datetime.utcnow())
    }
    
    if borrower_profile:
        result.update({
            "address": borrower_profile.get("address", {}),
            "job_title": borrower_profile.get("job_title", ""),
            "monthly_income": borrower_profile.get("monthly_income", 0),
            "marital_status": borrower_profile.get("marital_status", ""),
            "housing_status": borrower_profile.get("housing_status", ""),
        })
    
    return result

@router.get("/profile", response_model=dict)
async def get_borrower_profile(current_user = Depends(get_current_active_user)):
    """Get the current borrower's profile"""
    
    # Check if the current user is a borrower
    if current_user["role"] != "borrower":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only borrowers can access this endpoint"
        )
    
    # Get the borrower profile from collection
    borrowers_collection = get_collection("borrowers")
    borrower_profile = await borrowers_collection.find_one({"user_id": str(current_user["_id"])})
    
    if not borrower_profile:
        # Create an empty profile if it doesn't exist
        borrower_profile = {
            "user_id": str(current_user["_id"]),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await borrowers_collection.insert_one(borrower_profile)
    
    # Make a copy to avoid modifying the original document
    result = dict(borrower_profile)
    # Convert the ObjectId to string
    if "_id" in result:
        result["id"] = str(result.pop("_id"))
    
    return result

@router.put("/profile", response_model=dict)
async def update_borrower_profile(
    profile_update: dict,
    current_user = Depends(get_current_active_user)
):
    """Update the current borrower's profile"""
    
    # Check if the current user is a borrower
    if current_user["role"] != "borrower":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only borrowers can update their profile"
        )
    
    # Clean and validate the update data
    update_data = {k: v for k, v in profile_update.items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Get the borrower profile from collection
    borrowers_collection = get_collection("borrowers")
    borrower_profile = await borrowers_collection.find_one({"user_id": str(current_user["_id"])})
    
    if not borrower_profile:
        # Create a new profile if it doesn't exist
        update_data["user_id"] = str(current_user["_id"])
        update_data["created_at"] = datetime.utcnow()
        await borrowers_collection.insert_one(update_data)
        result = update_data
    else:
        # Update existing profile
        await borrowers_collection.update_one(
            {"user_id": str(current_user["_id"])},
            {"$set": update_data}
        )
        # Get updated document
        result = await borrowers_collection.find_one({"user_id": str(current_user["_id"])})
    
    # Make a copy to avoid modifying the original document
    result_copy = dict(result)
    # Convert the ObjectId to string
    if "_id" in result_copy:
        result_copy["id"] = str(result_copy.pop("_id"))
    
    return result_copy