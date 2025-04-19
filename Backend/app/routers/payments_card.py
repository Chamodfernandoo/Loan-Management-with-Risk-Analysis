from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.card import Card, CardCreate

router = APIRouter(
    prefix="/cards",
    tags=["cards"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=Card)
async def add_card(card: CardCreate, current_user = Depends(get_current_active_user)):
    # In a real app, you would validate and encrypt the card details
    cards_collection = get_collection("cards")
    
    card_dict = card.dict(exclude_unset=True)
    card_dict["user_id"] = str(current_user["_id"])
    card_dict["created_at"] = datetime.utcnow()
    
    # If this is the first card or is_default is true, 
    # update all existing cards to set is_default to false
    if card.is_default:
        await cards_collection.update_many(
            {"user_id": str(current_user["_id"])},
            {"$set": {"is_default": False}}
        )
    
    result = await cards_collection.insert_one(card_dict)
    created_card = await cards_collection.find_one({"_id": result.inserted_id})
    
    # Mask card number for response
    created_card["card_number"] = f"**** **** **** {created_card['card_number'][-4:]}"
    
    return created_card

@router.get("/", response_model=List[Card])
async def get_cards(current_user = Depends(get_current_active_user)):
    cards_collection = get_collection("cards")
    cursor = cards_collection.find({"user_id": str(current_user["_id"])})
    cards = await cursor.to_list(length=100)
    
    # Mask card numbers for response
    for card in cards:
        card["card_number"] = f"**** **** **** {card['card_number'][-4:]}"
    
    return cards

@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(card_id: str, current_user = Depends(get_current_active_user)):
    cards_collection = get_collection("cards")
    card = await cards_collection.find_one({"_id": ObjectId(card_id)})
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    if card["user_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own cards"
        )
    
    await cards_collection.delete_one({"_id": ObjectId(card_id)})
    
    # If this was the default card, set another card as default if one exists
    if card.get("is_default", False):
        another_card = await cards_collection.find_one({"user_id": str(current_user["_id"])})
        if another_card:
            await cards_collection.update_one(
                {"_id": another_card["_id"]},
                {"$set": {"is_default": True}}
            )
    
    return None

@router.patch("/{card_id}/set-default", response_model=Card)
async def set_default_card(card_id: str, current_user = Depends(get_current_active_user)):
    cards_collection = get_collection("cards")
    card = await cards_collection.find_one({"_id": ObjectId(card_id)})
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    if card["user_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own cards"
        )
    
    # Set all cards to not default
    await cards_collection.update_many(
        {"user_id": str(current_user["_id"])},
        {"$set": {"is_default": False}}
    )
    
    # Set this card as default
    await cards_collection.update_one(
        {"_id": ObjectId(card_id)},
        {"$set": {"is_default": True}}
    )
    
    updated_card = await cards_collection.find_one({"_id": ObjectId(card_id)})
    
    # Mask card number for response
    updated_card["card_number"] = f"**** **** **** {updated_card['card_number'][-4:]}"
    
    return updated_card