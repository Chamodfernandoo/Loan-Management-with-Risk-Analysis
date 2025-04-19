from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.loan import Loan, LoanStatus, Payment, PaymentStatus, PaymentCreate
router = APIRouter(
    prefix="/loans",
    tags=["loans"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=Loan)
async def create_loan(loan: Loan, current_user = Depends(get_current_active_user)):
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can create loans"
        )
    
    loans_collection = get_collection("loans")
    
    loan_dict = loan.dict(exclude_unset=True)
    loan_dict["lender_id"] = str(current_user["_id"])
    loan_dict["status"] = LoanStatus.PENDING
    loan_dict["created_at"] = datetime.utcnow()
    loan_dict["updated_at"] = datetime.utcnow()
    
    result = await loans_collection.insert_one(loan_dict)
    created_loan = await loans_collection.find_one({"_id": result.inserted_id})
    
    return created_loan

@router.get("/", response_model=List[Loan])
async def get_loans(
    status: Optional[LoanStatus] = None,
    current_user = Depends(get_current_active_user)
):
    loans_collection = get_collection("loans")
    
    query = {}
    if current_user["role"] == "borrower":
        query["borrower_id"] = str(current_user["_id"])
    elif current_user["role"] == "lender":
        query["lender_id"] = str(current_user["_id"])
    
    if status:
        query["status"] = status
    
    cursor = loans_collection.find(query)
    loans = await cursor.to_list(length=100)
    
    return loans

@router.get("/{loan_id}", response_model=Loan)
async def get_loan(loan_id: str, current_user = Depends(get_current_active_user)):
    loans_collection = get_collection("loans")
    
    loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    # Check if user is authorized to view this loan
    if (current_user["role"] == "borrower" and loan["borrower_id"] != str(current_user["_id"])) or \
       (current_user["role"] == "lender" and loan["lender_id"] != str(current_user["_id"])):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this loan"
        )
    
    return loan

@router.patch("/{loan_id}/status", response_model=Loan)
async def update_loan_status(
    loan_id: str, 
    status: LoanStatus,
    current_user = Depends(get_current_active_user)
):
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can update loan status"
        )
    
    loans_collection = get_collection("loans")
    
    loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    if loan["lender_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this loan"
        )
    
        await loans_collection.update_one(
            {"_id": ObjectId(loan_id)},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        
        updated_loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
        return updated_loan
    
    @router.get("/borrower/{borrower_id}", response_model=List[Loan])
    async def get_borrower_loans(
        borrower_id: str,
        status: Optional[LoanStatus] = None,
        current_user = Depends(get_current_active_user)
    ):
        """Get all loans for a specific borrower"""
        loans_collection = get_collection("loans")
        
        # Verify authorization
        if current_user["role"] == "borrower" and str(current_user["_id"]) != borrower_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own loans"
            )
        
        query = {"borrower_id": borrower_id}
        if status:
            query["status"] = status
        
        cursor = loans_collection.find(query)
        loans = await cursor.to_list(length=100)
        
        return loans

@router.get("/lender/{lender_id}", response_model=List[Loan])
async def get_lender_loans(
    lender_id: str,
    status: Optional[LoanStatus] = None,
    current_user = Depends(get_current_active_user)
):
    """Get all loans issued by a specific lender"""
    loans_collection = get_collection("loans")
    
    # Verify authorization
    if current_user["role"] == "lender" and str(current_user["_id"]) != lender_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view loans you've issued"
        )
    
    query = {"lender_id": lender_id}
    if status:
        query["status"] = status
    
    cursor = loans_collection.find(query)
    loans = await cursor.to_list(length=100)
    
    return loans

@router.post("/{loan_id}/payments", response_model=Payment)
async def add_loan_payment(
    loan_id: str,
    payment: PaymentCreate,
    current_user = Depends(get_current_active_user)
):
    """Add a payment to a specific loan"""
    loans_collection = get_collection("loans")
    payments_collection = get_collection("payments")
    
    # Verify the loan exists
    loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
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
    
    # Create the payment
    payment_dict = payment.dict(exclude_unset=True)
    payment_dict["loan_id"] = loan_id
    payment_dict["user_id"] = str(current_user["_id"])
    payment_dict["status"] = "pending"  # Initial status
    payment_dict["created_at"] = datetime.utcnow()
    
    result = await payments_collection.insert_one(payment_dict)
    created_payment = await payments_collection.find_one({"_id": result.inserted_id})
    
    # Update loan payment status
    await loans_collection.update_one(
        {"_id": ObjectId(loan_id)},
        {"$inc": {"paid_amount": payment.amount}}
    )
    
    return created_payment

@router.get("/{loan_id}/payments", response_model=List[Payment])
async def get_loan_payments(
    loan_id: str,
    current_user = Depends(get_current_active_user)
):
    """Get all payments for a specific loan"""
    loans_collection = get_collection("loans")
    payments_collection = get_collection("payments")
    
    # Verify the loan exists
    loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    # Verify authorization
    if current_user["role"] == "borrower" and loan["borrower_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view payments for your own loans"
        )
    
    if current_user["role"] == "lender" and loan["lender_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view payments for loans you've issued"
        )
    
    cursor = payments_collection.find({"loan_id": loan_id}).sort("created_at", -1)
    payments = await cursor.to_list(length=100)
    
    updated_loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
    return updated_loan,payments