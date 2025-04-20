from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.encoders import jsonable_encoder
from datetime import timedelta, datetime
from bson import ObjectId

from ..core.auth import create_access_token, get_password_hash, verify_password
from ..core.config import settings
from ..core.database import get_collection
from ..models.user import UserCreate, User

router = APIRouter(tags=["authentication"])

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    users_collection = get_collection("users")
    user = await users_collection.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=User)
async def register_user(user_data: UserCreate):
    users_collection = get_collection("users")
    
     # 1) ensure email is unique
    if await users_collection.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

     # 2) convert Pydantic model to JSON‑safe dict (dates → ISO strings)
    user_dict = jsonable_encoder(user_data, exclude={"password"})
    user_dict["hashed_password"] = get_password_hash(user_data.password)
    user_dict.update({
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })

    # 3) insert into MongoDB
    result = await users_collection.insert_one(user_dict)

    # 4) fetch & return as Pydantic model
    created = await users_collection.find_one({"_id": result.inserted_id})
    created["id"] = str(created["_id"])
    return User(**created)