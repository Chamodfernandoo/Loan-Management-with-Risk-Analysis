from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection

def register_borrower_routes(router: APIRouter):
    """Register all borrower-related routes to the loans router"""
    
    @router.get("/borrower/summary")
    async def get_borrower_loan_summary(current_user = Depends(get_current_active_user)):
        """Get loan summary for the current borrower"""
        if current_user["role"] != "borrower":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only borrowers can access their loan summary"
            )
        
        loans_collection = get_collection("loans")
        
        # Get all loans for this borrower
        borrower_id = str(current_user["_id"])
        cursor = loans_collection.find({"borrower_id": borrower_id})
        loans = await cursor.to_list(length=100)
        
        # Calculate summary statistics
        active_loans = [loan for loan in loans if loan.get("status") in ["ACTIVE", "APPROVED"]]
        completed_loans = [loan for loan in loans if loan.get("status") == "COMPLETED"]
        
        total_borrowed = sum(loan.get("amount", 0) for loan in loans)
        current_balance = sum(loan.get("remaining_amount", 0) for loan in active_loans)
        total_paid = sum(loan.get("total_paid", 0) for loan in loans)
        
        # Find next payment due
        next_payment_due = None
        next_payment_amount = 0
        
        for loan in active_loans:
            for payment in loan.get("payments", []):
                if payment.get("status") == "PENDING":
                    payment_date = payment.get("due_date")
                    if payment_date and (next_payment_due is None or payment_date < next_payment_due):
                        next_payment_due = payment_date
                        next_payment_amount = payment.get("amount", 0)
                    break
        
        # Format loans for response
        formatted_loans = []
        for loan in loans:
            # Calculate remaining installments
            remaining_installments = len([p for p in loan.get("payments", []) if p.get("status") == "PENDING"])
            
            formatted_loan = {
                "id": str(loan["_id"]),
                "lender": loan.get("lender_name", "Unknown Lender"),
                "amount": loan.get("amount", 0),
                "startDate": loan.get("start_date"),
                "endDate": loan.get("end_date"),
                "installments": loan.get("term_months", 0),
                "installmentAmount": loan.get("installment_amount", 0),
                "remainingInstallments": remaining_installments,
                "status": "active" if loan.get("status") in ["ACTIVE", "APPROVED"] else "completed" if loan.get("status") == "COMPLETED" else "pending",
                "interestRate": loan.get("interest_rate", 0)
            }
            formatted_loans.append(formatted_loan)
        
        # Get upcoming payments
        upcoming_payments = []
        for loan in active_loans:
            for payment in loan.get("payments", []):
                if payment.get("status") == "PENDING":
                    due_date = payment.get("due_date")
                    if due_date:
                        upcoming_payment = {
                            "id": payment.get("payment_id", str(ObjectId())),
                            "loanId": str(loan["_id"]),
                            "dueDate": due_date,
                            "amount": payment.get("amount", 0),
                            "status": "upcoming",
                            "lender": loan.get("lender_name", "Unknown Lender")
                        }
                        upcoming_payments.append(upcoming_payment)
        
        # Sort upcoming payments by due date
        upcoming_payments.sort(key=lambda x: x["dueDate"])
        
        # Get recent payments
        recent_payments = []
        payments_collection = get_collection("payments")
        payments_cursor = payments_collection.find({"user_id": borrower_id}).sort("created_at", -1).limit(10)
        payments = await payments_cursor.to_list(length=10)
        
        for payment in payments:
            loan_id = payment.get("loan_id")
            loan = None
            if loan_id:
                try:
                    loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
                except:
                    pass
            
            recent_payment = {
                "id": str(payment["_id"]),
                "loanId": loan_id,
                "paidDate": payment.get("created_at") or payment.get("payment_date"),
                "amount": payment.get("amount", 0),
                "method": payment.get("method", "unknown"),
                "lender": loan.get("lender_name", "Unknown Lender") if loan else "Unknown Lender"
            }
            recent_payments.append(recent_payment)
        
        return {
            "stats": {
                "activeLoans": len(active_loans),
                "completedLoans": len(completed_loans),
                "totalBorrowed": total_borrowed,
                "currentBalance": current_balance,
                "totalPaid": total_paid,
                "nextPaymentDue": next_payment_due,
                "nextPaymentAmount": next_payment_amount
            },
            "loans": formatted_loans,
            "upcomingPayments": upcoming_payments,
            "recentPayments": recent_payments
        }
    
    @router.get("/borrower/{borrower_id}")
    async def get_borrower_loans(
        borrower_id: str,
        status_param: Optional[str] = None,
        current_user = Depends(get_current_active_user)
    ):
        """Get all loans for a specific borrower"""
        loans_collection = get_collection("loans")
        
        # Verify authorization
        if current_user["role"] == "borrower" and borrower_id != str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own loans"
            )
        
        query = {"borrower_id": borrower_id}
        if status_param:
            query["status"] = status_param
        
        cursor = loans_collection.find(query)
        loans = await cursor.to_list(length=100)
        
        # Convert ObjectId to string for JSON serialization
        for loan in loans:
            loan["_id"] = str(loan["_id"])
        
        return loans
    
    # Also register a route without the trailing slash
    @router.get("/borrower/{borrower_id}/")
    async def get_borrower_loans_slash(
        borrower_id: str,
        status_param: Optional[str] = None,
        current_user = Depends(get_current_active_user)
    ):
        return await get_borrower_loans(borrower_id, status_param, current_user)
    
    return router