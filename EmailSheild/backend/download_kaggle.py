import os
import pandas as pd
import requests

DATASET_DIR = os.path.join(os.path.dirname(__file__), "..", "dataset")
KAGGLE_CSV_PATH = os.path.join(DATASET_DIR, "Phishing_Email.csv")
DOWNLOAD_URL = "https://raw.githubusercontent.com/uzmabb182/Data_622/refs/heads/main/final_project_data_622/Phishing_Email.csv"

def download_dataset():
    print(f"Creating dataset directory at: {os.path.abspath(DATASET_DIR)}")
    os.makedirs(DATASET_DIR, exist_ok=True)
    
    print(f"Downloading real Kaggle dataset from: {DOWNLOAD_URL}...")
    try:
        response = requests.get(DOWNLOAD_URL, timeout=30)
        response.raise_for_status()
        
        with open(KAGGLE_CSV_PATH, "wb") as f:
            f.write(response.content)
        print(f"[SUCCESS] Kaggle dataset saved to: {os.path.abspath(KAGGLE_CSV_PATH)}")
        
        # Analyze structure
        df = pd.read_csv(KAGGLE_CSV_PATH)
        print("\n--- Kaggle Dataset Analysis ---")
        print(f"Total Rows: {len(df)}")
        print(f"Columns: {list(df.columns)}")
        print("\nClass Value Counts:")
        print(df.iloc[:, 2].value_counts() if len(df.columns) > 2 else df.iloc[:, 1].value_counts())
        
    except Exception as e:
        print(f"[ERROR] Failed to download or read dataset: {e}")

if __name__ == "__main__":
    download_dataset()
