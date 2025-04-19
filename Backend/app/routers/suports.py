from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.support import SupportTicket, SupportTicketCreate, TicketReply

router = APIRouter(
    prefix="/support",
    tags=["support"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/tickets", response_model=SupportTicket)
async def create_support_ticket(
    ticket: SupportTicketCreate,
    current_user = Depends(get_current_active_user)
):
    tickets_collection = get_collection("support_tickets")
    
    ticket_dict = ticket.dict(exclude_unset=True)
    ticket_dict["user_id"] = str(current_user["_id"])
    ticket_dict["status"] = "open"
    ticket_dict["created_at"] = datetime.utcnow()
    ticket_dict["updated_at"] = datetime.utcnow()
    ticket_dict["replies"] = []
    
    result = await tickets_collection.insert_one(ticket_dict)
    created_ticket = await tickets_collection.find_one({"_id": result.inserted_id})
    
    return created_ticket

@router.get("/tickets", response_model=List[SupportTicket])
async def get_support_tickets(
    status: Optional[str] = None,
    current_user = Depends(get_current_active_user)
):
    tickets_collection = get_collection("support_tickets")
    
    query = {"user_id": str(current_user["_id"])}
    if status:
        query["status"] = status
    
    cursor = tickets_collection.find(query).sort("updated_at", -1)
    tickets = await cursor.to_list(length=100)
    
    return tickets

@router.get("/tickets/{ticket_id}", response_model=SupportTicket)
async def get_support_ticket(
    ticket_id: str,
    current_user = Depends(get_current_active_user)
):
    tickets_collection = get_collection("support_tickets")
    ticket = await tickets_collection.find_one({"_id": ObjectId(ticket_id)})
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Only the ticket creator or admin/support staff can view tickets
    if ticket["user_id"] != str(current_user["_id"]) and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own tickets"
        )
    
    return ticket

@router.post("/tickets/{ticket_id}/reply", response_model=SupportTicket)
async def reply_to_ticket(
    ticket_id: str,
    reply: TicketReply,
    current_user = Depends(get_current_active_user)
):
    tickets_collection = get_collection("support_tickets")
    ticket = await tickets_collection.find_one({"_id": ObjectId(ticket_id)})
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Only the ticket creator or admin/support staff can reply to tickets
    if ticket["user_id"] != str(current_user["_id"]) and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot reply to this ticket"
        )
    
    # Add the reply
    reply_dict = reply.dict(exclude_unset=True)
    reply_dict["user_id"] = str(current_user["_id"])
    reply_dict["timestamp"] = datetime.utcnow()
    
    await tickets_collection.update_one(
        {"_id": ObjectId(ticket_id)},
        {
            "$push": {"replies": reply_dict},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    updated_ticket = await tickets_collection.find_one({"_id": ObjectId(ticket_id)})
    return updated_ticket

@router.patch("/tickets/{ticket_id}/close", response_model=SupportTicket)
async def close_ticket(
    ticket_id: str,
    current_user = Depends(get_current_active_user)
):
    tickets_collection = get_collection("support_tickets")
    ticket = await tickets_collection.find_one({"_id": ObjectId(ticket_id)})
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Only the ticket creator or admin/support staff can close tickets
    if ticket["user_id"] != str(current_user["_id"]) and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot close this ticket"
        )
    
    await tickets_collection.update_one(
        {"_id": ObjectId(ticket_id)},
        {
            "$set": {
                "status": "closed",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    updated_ticket = await tickets_collection.find_one({"_id": ObjectId(ticket_id)})
    return updated_ticket