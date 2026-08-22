import os
from dotenv import load_dotenv

# Root directory
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(ROOT_DIR, ".env")

# Force load from specific path
load_dotenv(ENV_PATH)

# Database Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "claim_ingestion_db")

# Debugging (can be removed later)
# print(f"DEBUG: Using MONGO_URI from os.getenv: {MONGO_URI[:20]}...")

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Pipeline Configuration
FETCH_INTERVAL_MINUTES = int(os.getenv("FETCH_INTERVAL_MINUTES", "60"))

# Sample Data Sources (for demo)
DATA_SOURCES = {
    "urls": [
        "https://www.reuters.com/legal/apple-pay-95-million-settle-siri-privacy-lawsuit-2025-01-02/"
       
    ],
    "apis": [
        # "https://api.example.com/v1/claims",
    ],
    "rss": [
        # "https://example.com/rss",
    ],
    "pdfs": [
        # "c:/Users/User/Downloads/Claim_Data_pipeline/samples/sample_claim.txt",
    ]
}
