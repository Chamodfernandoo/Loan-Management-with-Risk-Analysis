# app/core/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from ..core.config import settings

class Database:
    client = None
    db = None

async def connect_to_mongo():
    Database.client = AsyncIOMotorClient(settings.MONGODB_URL)
    Database.db = Database.client[settings.MONGODB_DB_NAME]
    await Database.db.command("ping")  # Test the connection
    print("Connected to MongoDB")
    
async def close_mongo_connection():
    if Database.client:
        Database.client.close()
        print("MongoDB connection closed")
        
def get_collection(collection_name: str):
    return Database.db[collection_name]