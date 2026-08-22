import os
from sklearn.model_selection import train_test_split
from .config import MODEL_SAVE_PATH, EPOCHS, BATCH_SIZE
from .data_processor import load_and_preprocess_data
from .model import build_model

def train_model():
    """
    Trains the ANN on the preprocessed EEG dataset.
    """
    print("--- Starting Training Process ---")
    
    # 1. Load data
    X, y, scaler = load_and_preprocess_data()
    if X is None:
        return
        
    # 2. Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Build model
    input_dim = X.shape[1]
    model = build_model(input_dim)
    model.summary()
    
    # 4. Train model
    print(f"Training for {EPOCHS} epochs...")
    history = model.fit(
        X_train, y_train,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        validation_data=(X_test, y_test),
        verbose=2
    )
    
    # 5. Evaluate and save
    print("\n--- Evaluation Metrics ---")
    loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test Loss: {loss:.4f}")
    print(f"Test Accuracy: {accuracy:.4f}")
    
    model.save(MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")
    
if __name__ == "__main__":
    train_model()
