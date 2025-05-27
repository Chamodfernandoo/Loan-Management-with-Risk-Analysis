import asyncio
import sys
import logging
from app.utils.scheduled_tasks import check_payments
from app.core.database import connect_to_mongo, close_mongo_connection

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("payment-reminder-scheduler")

async def main():
    """
    Main function to run the payment reminder scheduler
    """
    try:
        # Connect to the database
        logger.info("Connecting to database...")
        await connect_to_mongo()
        
        # Run forever
        while True:
            try:
                logger.info("Running payment reminder check...")
                await check_payments()
                logger.info("Payment reminder check completed.")
            except Exception as e:
                logger.error(f"Error in payment reminder check: {e}")
            
            # Sleep for 1 hour before checking again
            logger.info("Sleeping for 1 hour...")
            await asyncio.sleep(3600)
    except KeyboardInterrupt:
        logger.info("Scheduler stopped by user.")
    finally:
        # Close database connection
        logger.info("Closing database connection...")
        await close_mongo_connection()

if __name__ == "__main__":
    logger.info("Starting payment reminder scheduler...")
    asyncio.run(main())