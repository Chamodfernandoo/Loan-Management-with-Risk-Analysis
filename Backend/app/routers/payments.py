from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.payment import Payment, PaymentCreate, PaymentMethod

router = APIRouter(
    prefix="/payments",
    tags=["payments"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=Payment)
async def create_payment(
    payment: PaymentCreate,
    current_user = Depends(get_current_active_user)
):
    loans_collection = get_collection("loans")
    payments_collection = get_collection("payments")
    
    # Verify the loan exists
    loan = await loans_collection.find_one({"_id": ObjectId(payment.loan_id)})
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    # Verify the payment belongs to the user or the lender
    if current_user["role"] == "borrower" and loan["borrower_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only make payments for your own loans"
        )
    
    if current_user["role"] == "lender" and loan["lender_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only process payments for loans you've issued"
        )
    
    # Create the payment
    payment_dict = payment.dict(exclude_unset=True)
    payment_dict["user_id"] = str(current_user["_id"])
    payment_dict["status"] = "pending"  # Initial status
    payment_dict["created_at"] = datetime.utcnow()
    
    result = await payments_collection.insert_one(payment_dict)
    created_payment = await payments_collection.find_one({"_id": result.inserted_id})
    
    # Update loan payment status (in a real app, this might be handled by a payment processor callback)
    # This is simplified for demonstration
    await loans_collection.update_one(
        {"_id": ObjectId(payment.loan_id)},
        {"$inc": {"paid_amount": payment.amount}}
    )
    
    return created_payment

@router.get("/", response_model=List[Payment])
async def get_payments(
    loan_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user = Depends(get_current_active_user)
):
    payments_collection = get_collection("payments")
    
    # Build query based on user role
    query = {}
    
    if current_user["role"] == "borrower":
        query["user_id"] = str(current_user["_id"])
    elif current_user["role"] == "lender":
        # For lenders, get payments for loans they've issued
        loans_collection = get_collection("loans")
        cursor = loans_collection.find({"lender_id": str(current_user["_id"])})
        loans = await cursor.to_list(length=100)
        loan_ids = [str(loan["_id"]) for loan in loans]
        query["loan_id"] = {"$in": loan_ids}
    
    if loan_id:
        query["loan_id"] = loan_id
    
    if status:
        query["status"] = status
    
    cursor = payments_collection.find(query).sort("created_at", -1)
    payments = await cursor.to_list(length=100)
    
    return payments

@router.get("/{payment_id}", response_model=Payment)
async def get_payment(payment_id: str, current_user = Depends(get_current_active_user)):
    payments_collection = get_collection("payments")
    payment = await payments_collection.find_one({"_id": ObjectId(payment_id)})
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Verify the payment belongs to the user or the lender
    loans_collection = get_collection("loans")
    loan = await loans_collection.find_one({"_id": ObjectId(payment["loan_id"])})
    
    if current_user["role"] == "borrower" and payment["user_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own payments"
        )
    
    if current_user["role"] == "lender" and loan["lender_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view payments for loans you've issued"
        )
    
    return payment

@router.patch("/{payment_id}/status", response_model=Payment)
async def update_payment_status(
    payment_id: str,
    status: str,
    current_user = Depends(get_current_active_user)
):
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can update payment status"
        )
    
    payments_collection = get_collection("payments")
    payment = await payments_collection.find_one({"_id": ObjectId(payment_id)})
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Verify the payment is for a loan issued by this lender
    loans_collection = get_collection("loans")
    loan = await loans_collection.find_one({"_id": ObjectId(payment["loan_id"])})
    
    if loan["lender_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update status for payments on loans you've issued"
        )
    
    await payments_collection.update_one(
        {"_id": ObjectId(payment_id)},
        {"$set": {"status": status}}
    )
    
    updated_payment = await payments_collection.find_one({"_id": ObjectId(payment_id)})
    return updated_payment