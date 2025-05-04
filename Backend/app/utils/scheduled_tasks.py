import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from ..core.config import settings
from ..utils.notification_utils import send_payment_reminder, _serialize_objectids

async def check_payments():
    """
    Check for upcoming and overdue payments and send notifications
    """
    print("Running scheduled payment check...")
    
    # Connect to MongoDB directly
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    loans_collection = db["loans"]
    notifications_collection = db["notifications"]
    
    # Get current date
    now = datetime.utcnow()
    
    # Find active loans
    cursor = loans_collection.find({"status": {"$in": ["ACTIVE", "APPROVED"]}})
    active_loans = await cursor.to_list(length=100)
    
    for loan in active_loans:
        # Convert the loan to a serializable format
        loan = _serialize_objectids(loan)
        
        # Check each pending payment
        for payment in loan.get("payments", []):
            if payment.get("status") != "PENDING":
                continue
                
            due_date = payment.get("due_date")
            if not due_date:
                continue
                
            # Calculate days until payment is due
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            
            days_until_due = (due_date - now).days
            
            # Check if this is a day before payment (days_until_due == 1) or
            # a day after payment was due (days_until_due == -1)
            if days_until_due == 1 or days_until_due == -1:
                # Check if we've already sent a notification for this payment
                existing_notification = await notifications_collection.find_one({
                    "user_id": loan["borrower_id"],
                    "related_id": str(loan["_id"]),
                    "related_data.due_date": due_date.isoformat() if isinstance(due_date, datetime) else due_date,
                    "timestamp": {"$gt": (now - timedelta(days=1)).isoformat()}  # Use ISO format consistently
                })
                
                if not existing_notification:
                    # Send reminder notification
                    await send_payment_reminder(loan, payment, days_until_due)
                    print(f"Sent payment reminder for loan {loan['_id']}, due in {days_until_due} days")

async def start_background_tasks():
    """
    Start background tasks for the application
    """
    while True:
        try:
            await check_payments()
        except Exception as e:
            print(f"Error in scheduled payment check: {e}")
        
        # Sleep for 1 hour before checking again
        await asyncio.sleep(3600)