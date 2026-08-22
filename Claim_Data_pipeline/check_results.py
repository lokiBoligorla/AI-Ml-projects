import sys
sys.path.append('.')
from database.mongo import db_client

def verify():
    print(f"--- Database Verification ---")
    raw_count = db_client.raw_collection.count_documents({})
    processed_count = db_client.db['processed_claim'].count_documents({})
    
    print(f"Raw Items: {raw_count}")
    print(f"Processed Claims: {processed_count}")
    
    if processed_count > 0:
        print(f"\nExtracted URLs:")
        for doc in db_client.db['processed_claim'].find():
            print(f"- {doc.get('source')} (Title: {doc.get('title')})")

if __name__ == "__main__":
    verify()
