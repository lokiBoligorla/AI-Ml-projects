from database.mongo import db_client

def cleanup():
    print("Clearing database...")
    db_client.raw_collection.delete_many({})
    db_client.db['processed_claim'].delete_many({})
    print("Database cleared successfully.")

if __name__ == "__main__":
    cleanup()
