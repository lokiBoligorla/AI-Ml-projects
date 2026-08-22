from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from .config import NUM_CLASSES

def build_model(input_dim):
    """
    Builds and compiles the Artificial Neural Network (ANN) model.
    Input layer size is dependent on the number of features (EEG + confidence + attention).
    Output layer size is fixed to 9 classes.
    """
    model = Sequential([
        # Input Layer & First Hidden Layer
        Dense(64, activation='relu', input_shape=(input_dim,)),
        Dropout(0.2),
        
        # Second Hidden Layer
        Dense(32, activation='relu'),
        Dropout(0.2),
        
        # Output Layer (9 neurons for classification)
        Dense(NUM_CLASSES, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model
