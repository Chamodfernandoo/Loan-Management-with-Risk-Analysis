from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict
from bson import ObjectId
from datetime import datetime
import random


from ..core.auth import get_current_active_user
from ..core.database import get_collection
from ..models.risk_analysis import RiskAnalysisRequest, RiskAnalysisResponse, RiskFactor, RiskLevel
from .loanmodel_inference import predict_risk


router = APIRouter(
    prefix="/risk-analysis",
    tags=["risk-analysis"],
    dependencies=[Depends(get_current_active_user)]
)

@router.get("/borrower/{borrower_id}/data", response_model=RiskAnalysisRequest)
async def get_borrower_risk_data(
    borrower_id: str,
    current_user = Depends(get_current_active_user)
):
    """Get borrower data needed for risk analysis"""
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can access risk analysis data"
        )
    
    # Get borrower profile
    borrowers_collection = get_collection("borrowers")
    borrower_profile = await borrowers_collection.find_one({"user_id": borrower_id})
    
    if not borrower_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Borrower profile not found"
        )
    
    # Get user information for additional fields
    users_collection = get_collection("users")
    user = await users_collection.find_one({"_id": ObjectId(borrower_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get loan history
    loans_collection = get_collection("loans")
    cursor = loans_collection.find({"borrower_id": borrower_id})
    loans = await cursor.to_list(length=100)
    
    # Get payment history
    payments_collection = get_collection("payments")
    payments_cursor = payments_collection.find({"user_id": borrower_id})
    payments = await payments_cursor.to_list(length=100)
    
    # Calculate metrics
    no_of_previous_loans = len([loan for loan in loans if loan.get("status") == "COMPLETED"])
    no_of_available_loans = len([loan for loan in loans if loan.get("status") in ["ACTIVE", "APPROVED"]])
    
    # Count on-time and late payments
    total_on_time_payments = len([payment for payment in payments if payment.get("status") == "PAID"])
    total_late_payments = len([payment for payment in payments if payment.get("status") in ["LATE", "MISSED"]])
    
    # Extract borrower profile data
    try:
        # Try to extract age from date of birth if available
        age = None
        if user.get("date_of_birth"):
            dob = user["date_of_birth"]
            if isinstance(dob, datetime):
                today = datetime.now()
                age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        
        risk_data = {
            "borrower_id": borrower_id,
            "age": age,
            "gender": user.get("gender"),
            "marital_status": borrower_profile.get("marital_status"),
            "job": borrower_profile.get("employment_status"),
            "monthly_income": borrower_profile.get("monthly_income"),
            "housing_status": borrower_profile.get("housing_status", 
                              "owner" if borrower_profile.get("address", {}).get("ownership_status") == "owned" else "renter"),
            "district": borrower_profile.get("address", {}).get("district"),
            "city": borrower_profile.get("address", {}).get("city"),
            "no_of_previous_loans": no_of_previous_loans,
            "no_of_available_loans": no_of_available_loans,
            "total_on_time_payments": total_on_time_payments,
            "total_late_payments": total_late_payments,
            "loan_amount_requested": 0,  # Will be filled in by lender during analysis
            "loan_term_months": 0        # Will be filled in by lender during analysis
        }
        
        return risk_data
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing borrower data: {str(e)}"
        )

@router.post("/analyze", response_model=RiskAnalysisResponse)
async def analyze_borrower_risk(
    risk_data: RiskAnalysisRequest,
    current_user = Depends(get_current_active_user)
):
    """Analyze the risk profile of a borrower"""
    if current_user["role"] != "lender":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lenders can analyze borrower risk"
        )
    
    # Verify borrower exists - first check if we have an ID or NIC
    users_collection = get_collection("users")
    borrower_id = risk_data.borrower_id
    
    try:
        # Try to find by object ID first
        user = await users_collection.find_one({"_id": ObjectId(borrower_id)})
    except:
        # If that fails, try to find by NIC number
        user = await users_collection.find_one({"nic_number": borrower_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Borrower not found"
        )
    
    # Set the correct borrower_id to the user's ID
    risk_data.borrower_id = str(user["_id"])
    
    try:
        # This is a placeholder for your actual risk model
        # In a real application, you would call your ML model here
        risk_score, risk_level, factors, recommendations = perform_risk_analysis(risk_data)
        
        # Create response
        response = RiskAnalysisResponse(
            borrower_id=risk_data.borrower_id,
            risk_score=risk_score,
            risk_level=risk_level,
            factors=factors,
            recommendations=recommendations,
            analyzed_at=datetime.utcnow()
        )
        
        # Store the analysis result in the database
        risk_analysis_collection = get_collection("risk_analysis")
        analysis_data = response.dict()
        analysis_data["created_at"] = datetime.utcnow()
        await risk_analysis_collection.insert_one(analysis_data)
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing risk: {str(e)}"
        )

def perform_risk_analysis(data: RiskAnalysisRequest):
 """
 Placeholder for risk analysis model.
 This would be replaced with your actual model implementation.
 Uses 3 risk levels: low, medium, high
 """
 # Simple logic to calculate risk score based on available data
 
 base_score = 50  # Start with medium risk

    # Adjust based on income
 if data.monthly_income:
        if data.monthly_income > 100000:
            base_score -= 20
        elif data.monthly_income > 50000:
            base_score -= 10
        elif data.monthly_income < 20000:
            base_score += 15
    
    # Adjust based on payment history
 if data.total_on_time_payments is not None and data.total_late_payments is not None:
        total_payments = data.total_on_time_payments + data.total_late_payments
        if total_payments > 0:
            late_ratio = data.total_late_payments / total_payments
            if late_ratio > 0.3:
                base_score += 20
            elif late_ratio < 0.1:
                base_score -= 15
    
    # Adjust based on existing loans
 if data.no_of_available_loans and data.no_of_available_loans > 2:
        base_score += 10
    
    # Add some randomization
 base_score += random.uniform(-5, 5)
    
    # Ensure within bounds
 risk_score = max(min(base_score, 100), 0)
    
    # Determine risk level - using 3 levels instead of 4
 if risk_score < 33:
        risk_level = RiskLevel.LOW
 elif risk_score < 66:
        risk_level = RiskLevel.MEDIUM
 else:
        risk_level = RiskLevel.HIGH
    
    # Generate factors
 factors = [
        RiskFactor(
            name="Payment History",
            importance=0.35,
            impact="high",
            description="History of on-time payments is a key indicator of future repayment"
        ),
        RiskFactor(
            name="Income Level",
            importance=0.25,
            impact="medium",
            description="Monthly income relative to requested loan amount affects repayment ability"
        ),
        RiskFactor(
            name="Existing Debt",
            importance=0.20,
            impact="medium",
            description="Current loan obligations may impact ability to take on more debt"
        ),
        RiskFactor(
            name="Loan Amount",
            importance=0.10,
            impact="low",
            description="Size of requested loan relative to income and credit history"
        )
    ]
    
    # Generate recommendations based on 3 risk levels
 if risk_level == RiskLevel.LOW:
        recommendations = [
            "Offer preferred interest rates",
            "Consider expedited loan processing",
            "Eligible for maximum loan amount"
        ]
 elif risk_level == RiskLevel.MEDIUM:
        recommendations = [
            "Proceed with standard terms",
            "Verify income documentation",
            "Regular payment monitoring recommended"
        ]
 else:  # HIGH
        recommendations = [
            "Consider reduced loan amount",
            "Require additional guarantees or collateral",
            "Implement stricter payment monitoring",
            "Consider financial counseling for applicant"
        ]
    
 return risk_score, risk_level, factors, recommendations