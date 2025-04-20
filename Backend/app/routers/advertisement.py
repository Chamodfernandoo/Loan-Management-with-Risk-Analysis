from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.advertiesment import Advertisement, AdvertisementCreate, AdvertisementUpdate

router = APIRouter(
    prefix="/advertisements",
    tags=["advertisements"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=Advertisement)
async def create_advertisement(
    advertisement: AdvertisementCreate,
    current_user = Depends(get_current_active_user)
):
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can create advertisements"
        )
    
    ads_collection = get_collection("advertisements")
    
    ad_dict = advertisement.dict(exclude_unset=True)
    ad_dict["lender_id"] = str(current_user["_id"])
    ad_dict["created_at"] = datetime.utcnow()
    ad_dict["updated_at"] = datetime.utcnow()
    
    result = await ads_collection.insert_one(ad_dict)
    created_ad = await ads_collection.find_one({"_id": result.inserted_id})
    
    return created_ad

@router.get("/", response_model=List[Advertisement])
async def get_advertisements(
    district: Optional[str] = None,
    city: Optional[str] = None,
    loan_type: Optional[str] = None,
    max_interest_rate: Optional[float] = None,
    current_user = Depends(get_current_active_user)
):
    ads_collection = get_collection("advertisements")
    
    query = {}
    if district:
        query["location.district"] = district
    if city:
        query["location.city"] = city
    if loan_type:
        query["loan_types"] = {"$in": [loan_type]}
    if max_interest_rate:
        query["interest_rate"] = {"$lte": max_interest_rate}
    
    cursor = ads_collection.find(query).sort("created_at", -1)
    advertisements = await cursor.to_list(length=100)
    
    return advertisements

@router.get("/my", response_model=List[Advertisement])
async def get_my_advertisements(current_user = Depends(get_current_active_user)):
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can view their advertisements"
        )
    
    ads_collection = get_collection("advertisements")
    cursor = ads_collection.find({"lender_id": str(current_user["_id"])})
    advertisements = await cursor.to_list(length=100)
    
    return advertisements

@router.get("/{ad_id}", response_model=Advertisement)
async def get_advertisement(ad_id: str, current_user = Depends(get_current_active_user)):
    ads_collection = get_collection("advertisements")
    ad = await ads_collection.find_one({"_id": ObjectId(ad_id)})
    
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advertisement not found"
        )
    
    return ad

@router.put("/{ad_id}", response_model=Advertisement)
async def update_advertisement(
    ad_id: str,
    advertisement: AdvertisementUpdate,
    current_user = Depends(get_current_active_user)
):
    ads_collection = get_collection("advertisements")
    ad = await ads_collection.find_one({"_id": ObjectId(ad_id)})
    
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advertisement not found"
        )
    
    if ad["lender_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own advertisements"
        )
    
    update_data = advertisement.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await ads_collection.update_one(
        {"_id": ObjectId(ad_id)},
        {"$set": update_data}
    )
    
    updated_ad = await ads_collection.find_one({"_id": ObjectId(ad_id)})
    return updated_ad

@router.delete("/{ad_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_advertisement(ad_id: str, current_user = Depends(get_current_active_user)):
    ads_collection = get_collection("advertisements")
    ad = await ads_collection.find_one({"_id": ObjectId(ad_id)})
    
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advertisement not found"
        )
    
    if ad["lender_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own advertisements"
        )
    
    await ads_collection.delete_one({"_id": ObjectId(ad_id)})
    
    return None