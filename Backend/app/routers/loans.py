from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.loan import Loan, LoanStatus, Payment, PaymentStatus

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