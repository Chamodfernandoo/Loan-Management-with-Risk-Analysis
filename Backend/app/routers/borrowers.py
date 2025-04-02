from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.borrower import BorrowerProfile, RiskAnalysis

router = APIRouter(
    prefix="/borrowers",
    tags=["borrowers"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/profile", response_model=BorrowerProfile)
async def create_borrower_profile(profile: BorrowerProfile, current_user = Depends(get_current_active_user)):
    if current_user["role"] != "borrower":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only borrowers can create profiles"
        )
    
    borrowers_collection = get_collection("borrower_profiles")
    
    # Check if profile already exists
    existing_profile = await borrowers_collection.find_one({"user_id": current_user["_id"]})
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists"
        )
    
    profile_dict = profile.dict()
    profile_dict["user_id"] = str(current_user["_id"])
    
    result = await borrowers_collection.insert_one(profile_dict)
    created_profile = await borrowers_collection.find_one({"_id": result.inserted_id})
    
    return created_profile

@router.get("/profile/{borrower_id}", response_model=BorrowerProfile)
async def get_borrower_profile(borrower_id: str, current_user = Depends(get_current_active_user)):
    borrowers_collection = get_collection("borrower_profiles")
    
    profile = await borrowers_collection.find_one({"user_id": borrower_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Borrower profile not found"
        )
    
    return profile

@router.get("/risk-analysis/{borrower_id}", response_model=RiskAnalysis)
async def get_risk_analysis(borrower_id: str, current_user = Depends(get_current_active_user)):
    if current_user["role"] != "lender" and str(current_user["_id"]) != borrower_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this risk analysis"
        )
    
    risk_analysis_collection = get_collection("risk_analysis")
    
    analysis = await risk_analysis_collection.find_one({"borrower_id": borrower_id})
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk analysis not found"
        )
    
    return analysis