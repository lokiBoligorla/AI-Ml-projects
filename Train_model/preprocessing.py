from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np

def preprocess_data(X, y, test_size=0.2, random_state=42):
    """
    Cleans, normalizes, and splits the dataset.
    """
    print("Preprocessing data...")
    
    # Handle missing values by replacing NaNs with column means
    if np.isnan(X).any():
        col_means = np.nanmean(X, axis=0)
        inds = np.where(np.isnan(X))
        X[inds] = np.take(col_means, inds[1])
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split into train/test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    return X_train, X_test, y_train, y_test, scaler

if __name__ == "__main__":
    from data_loader import load_data
    X, y = load_data()
    X_train, X_test, y_train, y_test, scaler = preprocess_data(X, y)
    print(f"Training set size: {X_train.shape}")
    print(f"Testing set size: {X_test.shape}")
