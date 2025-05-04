from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.loan import Loan, LoanStatus, Payment, PaymentStatus, PaymentCreate
from ..utils.loan_utils import register_borrower_routes
from ..utils.notification_utils import send_loan_created_notifications

router = APIRouter(
    prefix="/loans",
    tags=["loans"],
    dependencies=[Depends(get_current_active_user)]
)


router = register_borrower_routes(router)



@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify the router is working"""
    return {"message": "Loans router is working"}

@router.post("/")
async def create_loan(loan_data: dict, current_user = Depends(get_current_active_user)):
    """Create a new loan"""
    print(f"Received loan data: {loan_data}")
    print(f"Current user: {current_user}")
    
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can create loans"
        )
    
    # Get collections
    loans_collection = get_collection("loans")
    users_collection = get_collection("users")
    
    # Find borrower by NIC
    borrower = await users_collection.find_one({"nic_number": loan_data.get("borrower_nic")})
    if not borrower:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Borrower not found with the provided NIC"
        )
    
    # Calculate installments and prepare loan data
    amount = float(loan_data.get("amount", 0))
    interest_rate = float(loan_data.get("interest_rate", 0))
    term_months = int(loan_data.get("term_months", 1))
    
    interest_amount = amount * (interest_rate / 100)
    total_amount = amount + interest_amount
    installment_amount = total_amount / term_months
    
    # Create payment schedule
    from datetime import datetime, timedelta
    
    today = datetime.utcnow()
    payments = []
    
    for i in range(term_months):
        due_date = today + timedelta(days=30 * (i + 1))
        payments.append({
            "amount": installment_amount,
            "due_date": due_date,
            "status": "PENDING"
        })
    
    # Prepare loan document
    loan_document = {
        "borrower_id": str(borrower["_id"]),
        "lender_id": str(current_user["_id"]),
        "amount": amount,
        "interest_rate": interest_rate,
        "term_months": term_months,
        "status": "PENDING",  # Initial status
        "purpose": loan_data.get("purpose", ""),
        "start_date": today,
        "end_date": today + timedelta(days=30 * term_months),
        "payments": payments,
        "total_amount": total_amount,
        "remaining_amount": total_amount,
        "total_paid": 0,
        # Use the provided installment_amount if available, otherwise calculate it
        "installment_amount": loan_data.get("installment_amount", installment_amount),
        "created_at": today,
        "updated_at": today,
        # Additional custom fields
        "lender_name": loan_data.get("lender_name", ""),
        "customer_name": loan_data.get("customer_name", ""),
        "customer_phone": loan_data.get("customer_phone", ""),
        "customer_address": loan_data.get("customer_address", ""),
        "borrower_nic": loan_data.get("borrower_nic", ""),
        "customer_gender": loan_data.get("customer_gender", "")  # Add this line
    }
    
    # Insert into database
    result = await loans_collection.insert_one(loan_document)
    
    # Add the ID to the loan document for notification
    loan_document["_id"] = result.inserted_id
    
    # Send notifications
    await send_loan_created_notifications(loan_document)
    
    # Return created loan with ID
    loan_document["_id"] = str(result.inserted_id)
    return loan_document

# Add this route as well for consistency
@router.post("")
async def create_loan_alt(loan_data: dict, current_user = Depends(get_current_active_user)):
    return await create_loan(loan_data, current_user)

@router.get("/", response_model=List[dict])
@router.get("", response_model=List[dict])  
async def get_loans(
    request: Request,
    status: Optional[str] = None,
    current_user = Depends(get_current_active_user)
):
    """Get all loans for the current user based on role"""
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
    
    # Convert ObjectId to string for JSON serialization
    for loan in loans:
        loan["_id"] = str(loan["_id"])
    
    return loans

@router.get("/{loan_id}")
async def get_loan(loan_id: str, current_user = Depends(get_current_active_user)):
    try:
        loans_collection = get_collection("loans")
        users_collection = get_collection("users")
        
        
        try:
            loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
        except InvalidId:
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid loan ID format"
            )
            
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found"
            )
        
        # Convert ObjectId to string for JSON serialization
        loan["_id"] = str(loan["_id"])
        
        # Check if user is authorized to view this loan
        if current_user["role"] == "lender" and loan["lender_id"] != str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this loan"
            )
        
        if current_user["role"] == "borrower" and loan["borrower_id"] != str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this loan"
            )
        
        # Fetch lender details if available
        if loan.get("lender_id"):
            try:
                lender = await users_collection.find_one({"_id": ObjectId(loan["lender_id"])})
                if lender:
                    # Add more lender details
                    loan["lender_name"] = lender.get("full_name", loan.get("lender_name", "Unknown Lender"))
                    
                    # Get lender address if available
                    if lender.get("address"):
                        loan["lender_address"] = lender.get("address")
            except Exception as e:
                print(f"Error fetching lender details: {str(e)}")
        
        return loan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error retrieving loan: {str(e)}"
        )

@router.patch("/{loan_id}/status")
async def update_loan_status(
    loan_id: str,
    status: str,
    current_user = Depends(get_current_active_user)
):
    """Update a loan's status"""
    
    # Check if the current user is authorized
    if current_user["role"] not in ["lender", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders or admins can update loan status"
        )
    
    # Get loans collection
    loans_collection = get_collection("loans")
    
    # Find the loan
    loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    # Check if user is the lender for this loan
    if current_user["role"] == "lender" and loan.get("lender_id") != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update loans you've created"
        )
    
    # Update loan status
    await loans_collection.update_one(
        {"_id": ObjectId(loan_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    # Return updated loan
    updated_loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
    updated_loan["_id"] = str(updated_loan["_id"])
    return updated_loan
    
    # @router.get("/borrower/{borrower_id}")
    # async def get_borrower_loans(
    #     borrower_id: str,
    #     status: Optional[str] = None,
    #     current_user = Depends(get_current_active_user)
    # ):
    #     """Get all loans for a specific borrower"""
    #     loans_collection = get_collection("loans")
        
    #     # Verify authorization (lenders can view any borrower's loans)
    #     if current_user["role"] == "borrower" and borrower_id != str(current_user["_id"]):
    #         raise HTTPException(
    #             status_code=status.HTTP_403_FORBIDDEN,
    #             detail="You can only view your own loans"
    #         )
        
    #     query = {"borrower_id": borrower_id}
    #     if status:
    #         query["status"] = status
        
    #     cursor = loans_collection.find(query)
    #     loans = await cursor.to_list(length=100)
        
    #     # Convert ObjectId to string for JSON serialization
    #     for loan in loans:
    #         loan["_id"] = str(loan["_id"])
        
    #     return loans

# Import the router_utils at the top
from ..utils.router_utils import create_dual_route

# Then, add this after the previous endpoint
# create_dual_route(
#     router=router,
#     path="/borrower/{borrower_id}",
#     endpoint=get_borrower_loans
# )

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

# Make sure to import the notification utilities
from ..utils.notification_utils import send_payment_notifications

@router.post("/{loan_id}/payments")
async def add_loan_payment(
    loan_id: str,
    payment_data: dict,
    current_user = Depends(get_current_active_user)
):
    """Add a payment to a specific loan"""
    loans_collection = get_collection("loans")
    payments_collection = get_collection("payments")
    
    # Verify the loan exists
    try:
        loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
    except Exception as e:
        print(f"Error converting loan_id to ObjectId: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid loan ID format: {str(e)}"
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
    
    # Validate and process payment data
    try:
        amount = float(payment_data.get("amount", 0))
    except (ValueError, TypeError) as e:
        print(f"Error converting amount to float: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid amount format: {str(e)}"
        )
        
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount must be positive"
        )
    
    # Create the payment record
    payment_record = {
        "payment_id": str(ObjectId()),  # Generate a unique ID
        "amount": amount,
        "status": "COMPLETED",
        "payment_date": payment_data.get("payment_date", datetime.utcnow()),
        "method": payment_data.get("method", "cash")
    }
    
    # Create a separate record in the payments collection
    standalone_payment = {
        "loan_id": loan_id,
        "user_id": str(current_user["_id"]),
        "amount": amount,
        "status": "COMPLETED", 
        "method": payment_data.get("method", "cash"),
        "created_at": datetime.utcnow(),
        "payment_date": payment_data.get("payment_date", datetime.utcnow())
    }
    
    try:
        payment_result = await payments_collection.insert_one(standalone_payment)
        standalone_payment["_id"] = payment_result.inserted_id
    except Exception as e:
        print(f"Error inserting payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment record: {str(e)}"
        )
    
    # Update loan with payment information
    total_paid = loan.get("total_paid", 0) + amount
    remaining_amount = loan.get("total_amount", 0) - total_paid
    
    # Update loan status based on payment
    new_status = loan["status"]
    
    # If first payment received but not fully paid, set to ACTIVE
    if total_paid > 0 and total_paid < loan.get("total_amount", 0) and loan["status"] == "PENDING":
        new_status = "ACTIVE"
    
    # If fully paid, set to COMPLETED
    if remaining_amount <= 0:
        new_status = "COMPLETED"
    
    # Also update the status of the payment in the payment schedule
    payments = loan.get("payments", [])
    updated_payments = []
    payment_marked = False
    
    for pmt in payments:
        # Only mark one payment as completed
        if pmt.get("status") == "PENDING" and not payment_marked:
            pmt["status"] = "COMPLETED"
            pmt["payment_date"] = payment_data.get("payment_date", datetime.utcnow())
            pmt["method"] = payment_data.get("method", "cash")
            payment_marked = True
        updated_payments.append(pmt)
    
    # Update the loan document
    try:
        await loans_collection.update_one(
            {"_id": ObjectId(loan_id)},
            {
                "$set": {
                    "payments": updated_payments,
                    "total_paid": total_paid,
                    "remaining_amount": max(0, remaining_amount),
                    "status": new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    except Exception as e:
        print(f"Error updating loan: {str(e)}")
        # Even if loan update fails, we don't want to roll back the payment
        # as it might cause data inconsistency. We'll handle this error but still
        # try to send notifications
    
    # Get the updated loan to return
    try:
        updated_loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
        if updated_loan:
            # Create a clean copy of standalone_payment for notifications
            payment_for_notification = dict(standalone_payment)
            # Convert ObjectId to string
            payment_for_notification["_id"] = str(payment_for_notification["_id"])
            
            # Send notifications
            try:
                await send_payment_notifications(payment_for_notification, updated_loan)
            except Exception as e:
                print(f"Error sending payment notifications: {str(e)}")
                # We don't want to fail the whole request if notifications fail
            
            updated_loan["_id"] = str(updated_loan["_id"])
    except Exception as e:
        print(f"Error fetching updated loan: {str(e)}")
        updated_loan = {"_id": loan_id, "error": "Loan was updated but couldn't be retrieved"}
    
    return {
        "payment": {**standalone_payment, "_id": str(standalone_payment["_id"])},
        "loan": updated_loan
    }

@router.get("/{loan_id}/payments")
async def get_loan_payments(
    loan_id: str,
    current_user = Depends(get_current_active_user)
):
    """Get all payments for a specific loan"""
    loans_collection = get_collection("loans")
    payments_collection = get_collection("payments")
    
    # Verify the loan exists
    try:
        loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid loan ID format: {str(e)}"
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
            detail="You can only view payments for your own loans"
        )
    
    if current_user["role"] == "lender" and loan["lender_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view payments for loans you've issued"
        )
    
    # Get payments from the payments collection
    try:
        cursor = payments_collection.find({"loan_id": loan_id}).sort("created_at", -1)
        payments = await cursor.to_list(length=100)
        
        # Convert ObjectId to string
        for payment in payments:
            if "_id" in payment:
                payment["_id"] = str(payment["_id"])
        
        return payments
    except Exception as e:
        # If there's an error getting payments from the collection,
        # attempt to return the payments from the loan document itself
        if "payments" in loan and loan["payments"]:
            return loan["payments"]
        
        # If no payments are found, return an empty list rather than an error
        return []

@router.get("/{loan_id}/next-installment")
async def get_next_installment(
    loan_id: str, 
    current_user = Depends(get_current_active_user)
):
    """Get the next installment due for a loan"""
    loans_collection = get_collection("loans")
    
    # Try to convert the ID to ObjectId
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
    
    # Authorization check
    if current_user["role"] == "lender" and loan["lender_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this loan"
        )
    
    if current_user["role"] == "borrower" and loan["borrower_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this loan"
        )
    
    # Find the next pending payment
    next_payment = None
    payments = loan.get("payments", [])
    
    for payment in payments:
        if payment.get("status") == "PENDING":
            next_payment = {
                "amount": payment.get("amount"),
                "dueDate": payment.get("due_date")
            }
            break
    
    if not next_payment:
        # If no pending payments found, use the installment amount
        from datetime import datetime, timedelta
        today = datetime.utcnow()
        next_payment = {
            "amount": loan.get("installment_amount", 0),
            "dueDate": today + timedelta(days=30)
        }
    
    return next_payment

# Add the borrower summary endpoint at the top with other important endpoints
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

@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify the router is working"""
    return {"message": "Loans router is working"}