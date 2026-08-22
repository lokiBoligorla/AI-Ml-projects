import pandas as pd
import numpy as np
import os
import json

def load_data(csv_path='features_raw.csv', labels_path=None):
    """
    Loads EEG signal data from CSV and handles potential label assignments.
    """
    print(f"Loading data from {csv_path}...")
    
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset file not found at {csv_path}")

    # Load EEG signals (32 channels)
    df = pd.read_csv(csv_path)
    
    # Standard EEG channel names (as per the dataset header)
    channels = ['Fp1', 'AF3', 'F3', 'F7', 'FC5', 'FC1', 'C3', 'T7', 'CP5', 'CP1', 'P3',
                'P7', 'PO3', 'O1', 'Oz', 'Pz', 'Fp2', 'AF4', 'Fz', 'F4', 'F8', 'FC6',
                'FC2', 'Cz', 'C4', 'T8', 'CP6', 'CP2', 'P4', 'P8', 'PO4', 'O2']
    
    # Ensure we only take the 32 signal columns
    signals = df[channels].values
    
    labels = None
    
    # Attempt to load labels if path provided or if they exist in standard locations
    if labels_path and os.path.exists(labels_path):
        print(f"Loading labels from {labels_path}...")
        if labels_path.endswith('.json'):
            with open(labels_path, 'r') as f:
                labels = json.load(f)
        else:
            labels_df = pd.read_csv(labels_path)
            labels = labels_df.iloc[:, 0].values # Assume first column
    
    # Fallback: If no labels found, generate balanced placeholders for prototype demonstration
    if labels is None:
        print("Warning: No labels found. Generating balanced placeholders (PLAY, PAUSE, NEXT) for demonstration.")
        n_samples = signals.shape[0]
        label_options = ['PLAY', 'PAUSE', 'NEXT']
        # Create a repeating sequence to simulate structured data
        labels = np.array([label_options[i % 3] for i in range(n_samples)])
        
    return signals, labels

if __name__ == "__main__":
    # Test loading
    try:
        X, y = load_data()
        print(f"Loaded {X.shape[0]} samples with {X.shape[1]} channels.")
        print(f"Unique labels: {np.unique(y)}")
    except Exception as e:
        print(f"Error: {e}")
