from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.payments import Payment, PaymentCreate, PaymentMethod
from ..utils.notification_utils import send_payment_notifications

router = APIRouter(
    prefix="/payments",
    tags=["payments"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=dict)
async def create_payment(
    payment_data: dict,
    current_user = Depends(get_current_active_user)
):
    """Create a new payment"""
    loans_collection = get_collection("loans")
    payments_collection = get_collection("payments")
    
    # Validate the loan exists
    loan_id = payment_data.get("loan_id")
    if not loan_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loan ID is required"
        )
    
    try:
        loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid loan ID format"
        )
        
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    # Verify authorization
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
    
    # Create payment document
    payment_document = {
        "loan_id": loan_id,
        "user_id": str(current_user["_id"]),
        "amount": float(payment_data.get("amount", 0)),
        "method": payment_data.get("method", "card"),
        "method_details": payment_data.get("method_details", {}),
        "status": "COMPLETED",  # For this implementation, assume payment is successful
        "description": payment_data.get("description", "Loan payment"),
        "created_at": datetime.utcnow()
    }
    
    # Insert payment record
    payment_result = await payments_collection.insert_one(payment_document)
    payment_document["_id"] = payment_result.inserted_id
    
    # Update loan payment status and remaining amount
    total_paid = loan.get("total_paid", 0) + payment_document["amount"]
    remaining_amount = loan["total_amount"] - total_paid if "total_amount" in loan else 0
    
    # If remaining amount is zero or negative, mark loan as completed
    new_status = loan["status"]
    if remaining_amount <= 0 and loan["status"] != "COMPLETED":
        new_status = "COMPLETED"
    
    # Update loan with payment information
    await loans_collection.update_one(
        {"_id": ObjectId(loan_id)},
        {
            "$set": {
                "total_paid": total_paid,
                "remaining_amount": remaining_amount,
                "status": new_status,
                "updated_at": datetime.utcnow()
            },
            "$push": {
                "payments": {
                    "payment_id": str(payment_result.inserted_id),
                    "amount": payment_document["amount"],
                    "status": "COMPLETED",
                    "payment_date": payment_document["created_at"]
                }
            }
        }
    )
    
    # Send payment notifications
    await send_payment_notifications(payment_document, loan)
    
    # Return the created payment with id
    payment_document["_id"] = str(payment_result.inserted_id)
    return payment_document

@router.get("/")
async def get_payments(
    loan_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user = Depends(get_current_active_user)
):
    """Get payments for a loan or user"""
    payments_collection = get_collection("payments")
    loans_collection = get_collection("loans")
    
    # Build query based on parameters
    query = {}
    
    # If loan_id provided, verify access
    if loan_id:
        try:
            loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid loan ID format"
            )
            
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found"
            )
        
        # Check access rights
        if current_user["role"] == "borrower" and loan["borrower_id"] != str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view these payments"
            )
            
        if current_user["role"] == "lender" and loan["lender_id"] != str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view these payments"
            )
            
        query["loan_id"] = loan_id
    else:
        # If no loan_id, show only user's payments
        if current_user["role"] == "borrower":
            # Get all loans for this borrower
            loans_cursor = loans_collection.find({"borrower_id": str(current_user["_id"])})
            loans = await loans_cursor.to_list(length=100)
            loan_ids = [str(loan["_id"]) for loan in loans]
            query["loan_id"] = {"$in": loan_ids}
        elif current_user["role"] == "lender":
            # Get all loans for this lender
            loans_cursor = loans_collection.find({"lender_id": str(current_user["_id"])})
            loans = await loans_cursor.to_list(length=100)
            loan_ids = [str(loan["_id"]) for loan in loans]
            query["loan_id"] = {"$in": loan_ids}
    
    # Filter by status if provided
    if status:
        query["status"] = status
    
    # Get the payments
    cursor = payments_collection.find(query).sort("created_at", -1)
    payments = await cursor.to_list(length=100)
    
    # If no payments found in payments collection, look in the loan's payments array
    if len(payments) == 0 and loan_id:
        loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
        if loan and "payments" in loan and loan["payments"]:
            # Format payments from loan's payments array
            for i, payment in enumerate(loan["payments"]):
                payment["_id"] = f"loan-payment-{i}"
                payment["loan_id"] = loan_id
                if "payment_date" not in payment and "due_date" in payment:
                    payment["payment_date"] = payment["due_date"]
                if "user_id" not in payment:
                    payment["user_id"] = loan["borrower_id"]
            payments = loan["payments"]
    
    # Convert ObjectId to string
    for payment in payments:
        if "_id" in payment and not isinstance(payment["_id"], str):
            payment["_id"] = str(payment["_id"])
    
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