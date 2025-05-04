from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Body
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Dict, List, Optional
from bson import ObjectId
from datetime import datetime
import json

from ..core.auth import get_password_hash, create_access_token, verify_password
from ..core.config import settings
from ..core.database import get_collection
from ..models.user import UserCreate, User, Address

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

@router.post("/token", response_model=Dict[str, str])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    users_collection = get_collection("users")
    user = await users_collection.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    email: str = Form(...),
    password: str = Form(...),
    phone_number: str = Form(...),
    full_name: str = Form(...),
    role: str = Form(...),
    terms_accepted: bool = Form(...),
    nic_number: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    date_of_birth: Optional[str] = Form(None),
    marital_status: Optional[str] = Form(None),
    housing_status: Optional[str] = Form(None),
    job_title: Optional[str] = Form(None),
    monthly_income: Optional[float] = Form(None),
    address: Optional[str] = Form(None),
    document_type: Optional[str] = Form(None),
    business_name: Optional[str] = Form(None),
    document_files: List[UploadFile] = File(None)
):
    """
    Register a new user with optional document uploads
    """
    users_collection = get_collection("users")
    
    # Check if email already exists
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Parse address if provided
    address_obj = None
    if address:
        try:
            address_dict = json.loads(address)
            address_obj = Address(**address_dict)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid address format: {str(e)}"
            )
    
    # Create user data dictionary
    user_data = {
        "email": email,
        "password": password,  # Will be hashed below
        "phone_number": phone_number,
        "full_name": full_name,
        "role": role,
        "terms_accepted": terms_accepted,
        "nic_number": nic_number,
        "gender": gender,
        "date_of_birth": date_of_birth,
        "marital_status": marital_status,
        "housing_status": housing_status,
        "job_title": job_title,
        "monthly_income": monthly_income,
        "address": address_obj.dict() if address_obj else None,
        "document_type": document_type,
        "business_name": business_name
    }
    
    # Create user dictionary for database
    user_dict = {k: v for k, v in user_data.items() if k != "password" and v is not None}
    user_dict["hashed_password"] = get_password_hash(password)
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    
    # Handle document uploads if provided
    document_paths = []
    if document_files:
        # Create directory for user documents if it doesn't exist
        import os
        upload_dir = f"uploads/documents/{email}"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save uploaded files
        for i, file in enumerate(document_files):
            if file.filename:  # Only process if filename exists
                file_extension = file.filename.split(".")[-1]
                file_path = f"{upload_dir}/document_{i}.{file_extension}"
                
                # Save file
                with open(file_path, "wb") as f:
                    content = await file.read()
                    f.write(content)
                
                document_paths.append(file_path)
    
    # Set document paths in user data
    user_dict["document_uploads"] = document_paths
    
    # Insert into database
    result = await users_collection.insert_one(user_dict)
    
    # Create user's profile based on role
    if role == "borrower":
        borrowers_collection = get_collection("borrowers")
        borrower_profile = {
            "user_id": str(result.inserted_id),
            "full_name": full_name,
            "gender": gender,
            "date_of_birth": date_of_birth,
            "marital_status": marital_status,
            "housing_status": housing_status,
            "job_title": job_title,
            "monthly_income": monthly_income,
            "address": address_obj.dict() if address_obj else None,
            "document_type": document_type,
            "document_uploads": document_paths,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await borrowers_collection.insert_one(borrower_profile)
    
    elif role == "lender":
        lenders_collection = get_collection("lenders")
        lender_profile = {
            "user_id": str(result.inserted_id),
            "full_name": full_name,
            "business_name": business_name,
            "address": address_obj.dict() if address_obj else None,
            "nic_number": nic_number,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await lenders_collection.insert_one(lender_profile)
    
    return {"message": "User registered successfully", "user_id": str(result.inserted_id)}
