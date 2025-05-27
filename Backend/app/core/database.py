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
    
    # Ensure required collections exist
    collections = await Database.db.list_collection_names()
    required_collections = [
        "users", "loans", "payments", "notifications", 
        "borrowers", "lenders", "advertisements"
    ]
    
    for collection in required_collections:
        if collection not in collections:
            await Database.db.create_collection(collection)
            print(f"Created missing collection: {collection}")
        
async def close_mongo_connection():
    if Database.client:
        Database.client.close()
        print("MongoDB connection closed")
        
def get_collection(collection_name: str):
    return Database.db[collection_name]