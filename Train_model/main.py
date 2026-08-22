import numpy as np
import os
from data_loader import load_data
from preprocessing import preprocess_data
from feature_extraction import extract_features
from model import BCIModel
from predict import predict_single_sample, execute_command

def main():
    print("=== SynaptiMesh BCI Pipeline Prototype ===")
    
    # 1. Dataset Handling
    # Use the discovered 'features_raw.csv'
    dataset_path = 'features_raw.csv'
    try:
        signals, labels = load_data(dataset_path)
        print(f"Data loaded: {signals.shape[0]} samples, {signals.shape[1]} channels.")
    except Exception as e:
        print(f"Failed to load dataset: {e}")
        return

    # 2. Feature Engineering
    print("Starting Feature Extraction...")
    X_features = extract_features(signals)
    y = labels
    print(f"Features extracted: {X_features.shape}")

    # 3. Data Preprocessing
    print("Starting Preprocessing...")
    X_train, X_test, y_train, y_test, scaler = preprocess_data(X_features, y)
    print("Preprocessing complete.")

    # 4. Model Training
    print("Starting Model Training...")
    bci_model = BCIModel(model_type='random_forest')
    bci_model.train(X_train, y_train)
    print("Model Training complete.")

    # 5. Evaluation
    accuracy, report = bci_model.evaluate(X_test, y_test)
    print(f"\nModel Accuracy: {accuracy:.2f}")
    print("\nClassification Report:")
    print(report)

    # 6. Prediction System Simulation
    print("\n--- Simulating New EEG Sample Prediction ---")
    # Take a random raw sample from the original signal dataset
    random_idx = np.random.randint(0, signals.shape[0])
    raw_sample = signals[random_idx]
    
    # We need a NEW scaler or the feature-based scaler? 
    # Correction: The scaler was fit on X_features. 
    # predict_single_sample in predict.py expects raw signals and then scales/extracts.
    # I'll update the main logic to match the predict.py utility or vice versa.
    
    # Let's use the actual prediction system utility
    # But wait, our 'scaler' and 'model' are based on the (samples, 4) features.
    
    # Extract features for the single sample
    sample_features = extract_features(raw_sample.reshape(1, -1))
    sample_scaled = scaler.transform(sample_features)
    
    # Predict using the trained model
    predicted_cmd = bci_model.model.predict(sample_scaled)[0]
    
    print(f"Sample Index: {random_idx}")
    print(f"Predicted Command: {predicted_cmd}")

    # 7. Command Execution
    execute_command(predicted_cmd)

    print("\n=== Pipeline Execution Complete ===")

if __name__ == "__main__":
    main()
