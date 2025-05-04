from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import json

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.advertiesment import Advertisement, AdvertisementCreate, AdvertisementUpdate, Location
from ..utils.cloudinary_utils import upload_image, delete_image

router = APIRouter(
    prefix="/advertisements",
    tags=["advertisements"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=Advertisement)
async def create_advertisement(
    shop_name: str = Form(...),
    lender_name: str = Form(...),
    contact_number: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    interest_rate: float = Form(...),
    loan_types: List[str] = Form(...),
    photos: List[UploadFile] = File(None),
    current_user = Depends(get_current_active_user)
):
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can create advertisements"
        )
    
    ads_collection = get_collection("advertisements")
    
    # Parse location
    try:
        location_obj = json.loads(location)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid location format"
        )
    
    # Prepare ad dictionary
    ad_dict = {
        "shop_name": shop_name,
        "lender_name": lender_name,
        "contact_number": contact_number,
        "description": description,
        "location": location_obj,
        "interest_rate": float(interest_rate),
        "loan_types": loan_types,
        "lender_id": str(current_user["_id"]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "photos": []
    }
    
    # Upload photos to Cloudinary
    if photos:
        photo_urls = []
        for photo in photos:
            try:
                contents = await photo.read()
                result = upload_image(contents)
                photo_urls.append(result["url"])
            except Exception as e:
                # If an error occurs, continue with the next photo
                print(f"Error uploading photo: {str(e)}")
                continue
        
        ad_dict["photos"] = photo_urls
    
    # Insert ad into database
    result = await ads_collection.insert_one(ad_dict)
    
    # Convert ObjectId to string for response
    ad_dict["_id"] = str(result.inserted_id)
    ad_dict["is_owner"] = True
    
    return ad_dict

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
    
    # Add is_owner field and convert ObjectId to string
    for ad in advertisements:
        ad["is_owner"] = ad["lender_id"] == str(current_user["_id"])
        ad["_id"] = str(ad["_id"])
    
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
    
    # Add is_owner field and convert ObjectId to string
    for ad in advertisements:
        ad["is_owner"] = True
        ad["_id"] = str(ad["_id"])
    
    return advertisements

@router.get("/{ad_id}", response_model=Advertisement)
async def get_advertisement(ad_id: str, current_user = Depends(get_current_active_user)):
    ads_collection = get_collection("advertisements")
    
    try:
        ad = await ads_collection.find_one({"_id": ObjectId(ad_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advertisement not found"
        )
    
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advertisement not found"
        )
    
    # Add is_owner field and convert ObjectId to string
    ad["is_owner"] = ad["lender_id"] == str(current_user["_id"])
    ad["_id"] = str(ad["_id"])
    
    return ad

@router.put("/{ad_id}", response_model=Advertisement)
async def update_advertisement(
    ad_id: str,
    shop_name: Optional[str] = Form(None),
    lender_name: Optional[str] = Form(None),
    contact_number: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    interest_rate: Optional[float] = Form(None),
    loan_types: Optional[List[str]] = Form(None),
    existing_photos: Optional[str] = Form(None),
    photos: List[UploadFile] = File(None),
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
    
    # Prepare update data
    update_data = {}
    
    if shop_name:
        update_data["shop_name"] = shop_name
    if lender_name:
        update_data["lender_name"] = lender_name
    if contact_number:
        update_data["contact_number"] = contact_number
    if description:
        update_data["description"] = description
    if location:
        try:
            location_obj = json.loads(location)
            update_data["location"] = location_obj
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid location format"
            )
    if interest_rate is not None:
        update_data["interest_rate"] = float(interest_rate)
    if loan_types:
        update_data["loan_types"] = loan_types
    
    # Handle photos
    if existing_photos is not None:
        # Parse existing photos JSON
        try:
            existing_photo_urls = json.loads(existing_photos)
            
            # If existing photos are provided, use them
            if isinstance(existing_photo_urls, list):
                # Find photos to delete (those in ad["photos"] but not in existing_photo_urls)
                if "photos" in ad:
                    photos_to_delete = [p for p in ad["photos"] if p not in existing_photo_urls]
                    
                    # Delete removed photos from Cloudinary
                    for photo_url in photos_to_delete:
                        try:
                            # Extract public_id from URL
                            parts = photo_url.split('/')
                            filename = parts[-1].split('.')[0]
                            folder = parts[-2]
                            public_id = f"{folder}/{filename}"
                            delete_image(public_id)
                        except Exception as e:
                            print(f"Error deleting photo: {str(e)}")
                
                # Set the existing photos
                update_data["photos"] = existing_photo_urls
        except:
            # If parsing fails, ignore existing_photos
            pass
    
    # Upload new photos if provided
    if photos:
        photo_urls = []
        
        # Start with existing photos if they were provided
        if "photos" in update_data:
            photo_urls = update_data["photos"]
        elif "photos" in ad:
            photo_urls = ad["photos"]
        
        # Add new photos
        for photo in photos:
            try:
                contents = await photo.read()
                result = upload_image(contents)
                photo_urls.append(result["url"])
            except Exception as e:
                print(f"Error uploading photo: {str(e)}")
                continue
        
        # Update photos list
        update_data["photos"] = photo_urls
    
    update_data["updated_at"] = datetime.utcnow()
    
    await ads_collection.update_one(
        {"_id": ObjectId(ad_id)},
        {"$set": update_data}
    )
    
    updated_ad = await ads_collection.find_one({"_id": ObjectId(ad_id)})
    updated_ad["is_owner"] = True
    updated_ad["_id"] = str(updated_ad["_id"])
    
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
    
    # Delete associated photos from Cloudinary
    if "photos" in ad and ad["photos"]:
        for photo_url in ad["photos"]:
            try:
                # Extract public_id from URL
                # This is a simplified approach - you might need to adjust based on your Cloudinary setup
                parts = photo_url.split('/')
                filename = parts[-1].split('.')[0]
                folder = parts[-2]
                public_id = f"{folder}/{filename}"
                delete_image(public_id)
            except Exception as e:
                print(f"Error deleting photo: {str(e)}")
    
    await ads_collection.delete_one({"_id": ObjectId(ad_id)})
    
    return None