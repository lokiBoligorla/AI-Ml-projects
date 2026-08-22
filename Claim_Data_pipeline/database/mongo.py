from pymongo import MongoClient
from config.settings import MONGO_URI, DB_NAME
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDatabase:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DB_NAME]
        self.raw_collection = self.db["raw_claims"]
        self.processed_collection = self.db["processed_claim"]
        
        # Create unique index to avoid duplicates
        self.raw_collection.create_index([("source", 1)], unique=True)
        self.processed_collection.create_index([("title", 1)], unique=True)
        # Often source url is better but since generic source might be used:
        # self.processed_collection.create_index([("source", 1), ("title", 1)], unique=True)

    def insert_raw_claim(self, data: dict):
        try:
            result = self.raw_collection.insert_one(data)
            logger.info(f"Inserted raw claim with id: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            logger.error(f"Error inserting raw claim: {e}")
            return None

    def insert_processed_claim(self, data: dict):
        try:
            result = self.processed_collection.insert_one(data)
            logger.info(f"Inserted processed claim: {data.get('title')}")
            return result.inserted_id
        except Exception as e:
            # Handle duplicate key error gracefully
            if "duplicate key error" in str(e).lower():
                logger.warning(f"Claim already exists: {data.get('title')}")
            else:
                logger.error(f"Error inserting processed claim: {e}")
            return None

db_client = MongoDatabase()
