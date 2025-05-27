from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.payments_card import Card, CardCreate

router = APIRouter(
    prefix="/cards",
    tags=["cards"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=Card)
async def add_card(card: CardCreate, current_user = Depends(get_current_active_user)):
    """Add a new payment card"""
    
    # In a real app, you would validate and encrypt the card details
    cards_collection = get_collection("cards")
    
    # Secure the card data (in a real app, you'd encrypt sensitive fields)
    card_dict = card.dict(exclude_unset=True)
    card_dict["user_id"] = str(current_user["_id"])
    card_dict["created_at"] = datetime.utcnow()
    
    # If this is marked as default, update all existing cards to set is_default to false
    if card.is_default:
        await cards_collection.update_many(
            {"user_id": str(current_user["_id"])},
            {"$set": {"is_default": False}}
        )
    
    result = await cards_collection.insert_one(card_dict)
    created_card = await cards_collection.find_one({"_id": result.inserted_id})
    
    # Convert _id to string for response
    created_card["_id"] = str(created_card["_id"])
    
    # For security, mask most of the card number in the response
    created_card["card_number"] = f"{'*' * (len(created_card['card_number']) - 4)}{created_card['card_number'][-4:]}"
    
    return created_card

@router.get("/", response_model=List[dict])
async def get_cards(current_user = Depends(get_current_active_user)):
    """Get all cards for the current user"""
    
    cards_collection = get_collection("cards")
    cursor = cards_collection.find({"user_id": str(current_user["_id"])})
    cards = await cursor.to_list(length=100)
    
    # Format cards for response
    formatted_cards = []
    for card in cards:
        card["id"] = str(card.pop("_id"))
        # Mask card number except last 4 digits
        card["cardNumber"] = f"{'*' * (len(card['card_number']) - 4)}{card['card_number'][-4:]}"
        
        # Convert to frontend expected format
        formatted_card = {
            "id": card["id"],
            "cardNumber": card["cardNumber"],
            "cardholderName": card["cardholder_name"],
            "expiryMonth": card["expiry_month"],
            "expiryYear": card["expiry_year"],
            "cardType": card["card_type"],
            "isDefault": card["is_default"],
        }
        
        if "nickname" in card:
            formatted_card["nickname"] = card["nickname"]
        
        formatted_cards.append(formatted_card)
    
    return formatted_cards

@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(card_id: str, current_user = Depends(get_current_active_user)):
    """Delete a payment card"""
    
    cards_collection = get_collection("cards")
    
    # Find the card first to verify ownership
    try:
        card = await cards_collection.find_one({"_id": ObjectId(card_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid card ID format"
        )
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    # Verify ownership
    if card["user_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own cards"
        )
    
    # Delete the card
    await cards_collection.delete_one({"_id": ObjectId(card_id)})
    
    # If this was the default card, make another card the default if available
    if card.get("is_default", False):
        # Find another card to make default
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