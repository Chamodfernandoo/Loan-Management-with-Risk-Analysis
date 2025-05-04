from datetime import datetime
from bson import ObjectId
from ..core.database import get_collection
from ..models.notification import NotificationType

async def create_notification(user_id: str, type: NotificationType, title: str, message: str, related_id: str = None, related_data: dict = None):
    """
    Create a new notification for a user
    """
    try:
        notifications_collection = get_collection("notifications")
        
        # Convert any ObjectId values in related_data to strings
        if related_data:
            related_data = _serialize_objectids(related_data)
        
        notification_data = {
            "user_id": user_id,
            "type": type,
            "title": title,
            "message": message,
            "timestamp": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",  # Add 'Z' to indicate UTC
            "read": False
        }
        
        if related_id:
            notification_data["related_id"] = related_id
        
        if related_data:
            notification_data["related_data"] = related_data
        
        result = await notifications_collection.insert_one(notification_data)
        print(f"Successfully created notification for user {user_id}, ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error creating notification: {str(e)}")
        raise

def _serialize_objectids(data):
    """
    Recursively convert all ObjectId values in a dictionary to strings
    """
    if isinstance(data, dict):
        return {k: _serialize_objectids(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [_serialize_objectids(item) for item in data]
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

async def send_loan_created_notifications(loan_data: dict):
    """
    Send notifications when a loan is created
    - To the lender: Confirmation that loan was created
    - To the borrower: New loan notification
    """
    # Ensure loan_data doesn't contain ObjectId
    loan_data = _serialize_objectids(loan_data)
    
    # Send notification to borrower
    if loan_data.get("borrower_id"):
        borrower_message = f"You've received a new loan offer of Rs {loan_data.get('amount', 0):,.2f} from {loan_data.get('lender_name', 'a lender')}."
        await create_notification(
            user_id=loan_data["borrower_id"],
            type=NotificationType.loan_approved,
            title="New Loan Offer",
            message=borrower_message,
            related_id=str(loan_data.get("_id")),
            related_data={
                "amount": loan_data.get("amount"),
                "lender_name": loan_data.get("lender_name"),
                "term_months": loan_data.get("term_months")
            }
        )
    
    # Send notification to lender
    if loan_data.get("lender_id"):
        lender_message = f"You've created a new loan of Rs {loan_data.get('amount', 0):,.2f} for {loan_data.get('customer_name', 'a borrower')}."
        await create_notification(
            user_id=loan_data["lender_id"],
            type=NotificationType.loan_approved,
            title="Loan Created",
            message=lender_message,
            related_id=str(loan_data.get("_id")),
            related_data={
                "amount": loan_data.get("amount"),
                "customer_name": loan_data.get("customer_name"),
                "term_months": loan_data.get("term_months")
            }
        )

async def send_payment_notifications(payment_data: dict, loan_data: dict):
    """
    Send notifications when a payment is made
    - To the lender: Payment received notification
    - To the borrower: Payment confirmation
    """
    try:
        # Ensure data doesn't contain ObjectId
        payment_data = _serialize_objectids(payment_data)
        loan_data = _serialize_objectids(loan_data)
        
        # Send notification to borrower
        if loan_data.get("borrower_id"):
            try:
                borrower_message = f"Your payment of Rs {payment_data.get('amount', 0):,.2f} for loan {loan_data.get('_id')} has been processed successfully."
                await create_notification(
                    user_id=loan_data["borrower_id"],
                    type=NotificationType.payment_received,
                    title="Payment Confirmed",
                    message=borrower_message,
                    related_id=str(loan_data.get("_id")),
                    related_data={
                        "amount": payment_data.get("amount"),
                        "payment_id": str(payment_data.get("_id")),
                        "lender_name": loan_data.get("lender_name")
                    }
                )
                print(f"Successfully sent payment confirmation notification to borrower: {loan_data['borrower_id']}")
            except Exception as e:
                print(f"Error sending payment notification to borrower: {str(e)}")
        
        # Send notification to lender
        if loan_data.get("lender_id"):
            try:
                lender_message = f"You've received a payment of Rs {payment_data.get('amount', 0):,.2f} from {loan_data.get('customer_name', 'a borrower')}."
                await create_notification(
                    user_id=loan_data["lender_id"],
                    type=NotificationType.payment_received,
                    title="Payment Received",
                    message=lender_message,
                    related_id=str(loan_data.get("_id")),
                    related_data={
                        "amount": payment_data.get("amount"),
                        "payment_id": str(payment_data.get("_id")),
                        "customer_name": loan_data.get("customer_name")
                    }
                )
                print(f"Successfully sent payment received notification to lender: {loan_data['lender_id']}")
            except Exception as e:
                print(f"Error sending payment notification to lender: {str(e)}")
    except Exception as e:
        print(f"Error in send_payment_notifications: {str(e)}")

async def send_payment_reminder(loan_data: dict, payment_data: dict, days_until_due: int):
    """
    Send payment reminder notifications
    - To the borrower: Remind about upcoming payment
    """
    # Ensure data doesn't contain ObjectId
    loan_data = _serialize_objectids(loan_data)
    payment_data = _serialize_objectids(payment_data)
    
    if loan_data.get("borrower_id"):
        if days_until_due <= 0:
            # Payment is overdue
            days_overdue = abs(days_until_due)
            title = "Payment Overdue"
            message = f"Your payment of Rs {payment_data.get('amount', 0):,.2f} for loan {loan_data.get('_id')} is overdue by {days_overdue} day{'s' if days_overdue != 1 else ''}."
            notification_type = NotificationType.payment_overdue
        else:
            # Payment is upcoming
            title = "Payment Due Soon"
            message = f"Your payment of Rs {payment_data.get('amount', 0):,.2f} for loan {loan_data.get('_id')} is due in {days_until_due} day{'s' if days_until_due != 1 else ''}."
            notification_type = NotificationType.payment_due
            
        await create_notification(
            user_id=loan_data["borrower_id"],
            type=notification_type,
            title=title,
            message=message,
            related_id=str(loan_data.get("_id")),
            related_data={
                "amount": payment_data.get("amount"),
                "due_date": payment_data.get("due_date").isoformat() if isinstance(payment_data.get("due_date"), datetime) else payment_data.get("due_date"),
                "lender_name": loan_data.get("lender_name")
            }
        )