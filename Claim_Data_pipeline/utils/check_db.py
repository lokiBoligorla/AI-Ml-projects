from database.mongo import db_client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_data():
    """
    Simple script to check data in MongoDB.
    """
    try:
        raw_count = db_client.raw_collection.count_documents({})
        processed_count = db_client.db['processed_claim'].count_documents({})
        
        print(f"--- MongoDB Stats ---")
        print(f"Raw Claims: {raw_count}")
        print(f"Processed Claims: {processed_count}")
        
        if processed_count > 0:
            print(f"\n--- Latest Processed Claim ---")
            latest = db_client.processed_collection.find_one(sort=[("_id", -1)])
            print(f"Title: {latest.get('title')}")
            print(f"Category: {latest.get('category')}")
            print(f"Deadline: {latest.get('deadline')}")
            print(f"Source: {latest.get('source')}")
            
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        print("\nTIP: Make sure your MongoDB server is running!")

if __name__ == "__main__":
    check_data()
