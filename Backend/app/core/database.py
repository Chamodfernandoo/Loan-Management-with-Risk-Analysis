from pymongo import MongoClient
from ..core.config import settings

class Database:
    client: MongoClient = None
    
def connect_to_mongo():
    Database.client = MongoClient(settings.MONGODB_URL)
    print("Connected to MongoDB")
    
def close_mongo_connection():
    if Database.client:
        Database.client.close()
        print("MongoDB connection closed")
        
def get_collection(collection_name: str):
    return Database.client[settings.MONGODB_DB_NAME][collection_name]