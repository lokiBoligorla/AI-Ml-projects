from database.mongo import db_client
import json

def check_one():
    print("Checking a processed document...")
    doc = db_client.processed_collection.find_one()
    if doc:
        # Convert ObjectId to string for printing
        doc['_id'] = str(doc['_id'])
        print(json.dumps(doc, indent=2))
    else:
        print("No documents found in processed_claim.")

if __name__ == "__main__":
    check_one()
