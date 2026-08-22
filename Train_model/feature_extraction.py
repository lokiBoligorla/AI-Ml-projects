import numpy as np
import pandas as pd

def extract_features(X):
    """
    Extracts statistical features from raw EEG signal segments.
    In this prototype, we assume each row is a time-point or a small segment.
    If X is 2D (samples, channels), we can extract features per sample 
    or across a sliding window. 
    
    Given the requirement 'Mean, Std, Max, Min', we will treat each sample 
    as a feature vector of these stats across all channels.
    """
    print("Extracting features (Mean, Std, Max, Min)...")
    
    # Calculate stats across the channels (axis=1) for each sample
    mean_val = np.mean(X, axis=1)
    std_val = np.std(X, axis=1)
    max_val = np.max(X, axis=1)
    min_val = np.min(X, axis=1)
    
    # Combine into a feature matrix (samples, 4)
    features = np.column_stack((mean_val, std_val, max_val, min_val))
    
    return features

if __name__ == "__main__":
    # Test with dummy data
    X_dummy = np.random.rand(100, 32)
    features = extract_features(X_dummy)
    print(f"Feature matrix shape: {features.shape}")
    print(f"First 5 feature vectors:\n{features[:5]}")
