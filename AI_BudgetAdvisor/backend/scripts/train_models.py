import os
import sys

# Ensure backend is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ml_service import ml_service

def main():
    print("[*] Starting model training pipeline...")
    data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "datasets", "final_transactions.csv")
    
    # Train categorization models
    ml_service.train_categorization_models(data_path)
    
    # Train anomaly detection model
    ml_service.train_anomaly_detector(data_path)
    
    print("[+] Model training pipeline completed successfully!")

if __name__ == "__main__":
    main()
