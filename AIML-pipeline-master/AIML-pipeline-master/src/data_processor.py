import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from .config import DATA_FILE, NUM_CLASSES, EEG_CHANNELS

def load_and_preprocess_data():
    """
    Loads raw EEG data, handles missing values, normalizes, 
    and generates synthetic labels and metadata (confidence, attention)
    for the Refinement Layer.
    """
    try:
        df = pd.read_csv(DATA_FILE)
    except FileNotFoundError:
        print(f"Error: {DATA_FILE} not found. Please run generate_mock_data.py first.")
        return None, None
        
    # 1. Handle missing values (Fill with column means)
    if df.isnull().values.any():
        print("Handling missing values...")
        df.fillna(df.mean(), inplace=True)
        
    # 2. Normalize/standardize EEG values
    scaler = StandardScaler()
    eeg_data = scaler.fit_transform(df[EEG_CHANNELS])
    
    # 3. Label Generation (Synthetic & Balanced)
    num_samples = len(df)
    labels = np.random.randint(0, NUM_CLASSES, num_samples)
    
    # 4. Generate Synthetic Metadata for the Refinement Layer
    # The ANN requires confidence and attention as inputs along with EEG features
    confidence = np.random.uniform(0.3, 1.0, num_samples).reshape(-1, 1)
    attention = np.random.uniform(0.1, 1.0, num_samples).reshape(-1, 1)
    
    # Combine EEG features with confidence and attention
    X = np.hstack((eeg_data, confidence, attention))
    y = labels
    
    print(f"Data preprocessed successfully. Input shape: {X.shape}, Labels shape: {y.shape}")
    
    return X, y, scaler
