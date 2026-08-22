import numpy as np
import pickle
from tensorflow.keras.models import load_model

# Load the model and tokenizer
print("Loading model and tokenizer...")
try:
    model = load_model('nextword1.h5')
    tokenizer = pickle.load(open('tokenizer1.pkl', 'rb'))
    print("Model and tokenizer loaded successfully!")
except Exception as e:
    print(f"Error loading model or tokenizer: {e}")
    print("Please make sure train.py has completed training first.")
    exit(1)

def Predict_Next_Words(model, tokenizer, text):
    """
    Predict the next word based on the input text.
    """
    sequence = tokenizer.texts_to_sequences([text])[0]
    # Reshape sequence to match input_shape of (1, 1)
    sequence = np.array(sequence).reshape(-1, 1)
    
    if len(sequence) == 0:
        print("<Word not in vocabulary>")
        return None
        
    # Predict probabilities
    preds = model.predict(sequence, verbose=0)
    # Get index of the class with highest probability
    pred_idx = np.argmax(preds, axis=-1)[0]
    
    predicted_word = ""
    for key, value in tokenizer.word_index.items():
        if value == pred_idx:
            predicted_word = key
            break
            
    print(f"Predicted next word: {predicted_word}")
    return predicted_word

print("\n--- Next Word Prediction CLI ---")
print("Enter a line or a word. The model will predict the next word.")
print("Type 'stop the script' to exit.\n")

while True:
    try:
        text = input("Enter your line: ")
    except EOFError:
        break
        
    if text.strip() == "stop the script":
        print("Ending The Program.....")
        break
        
    if not text.strip():
        continue
        
    try:
        # Split by space and get the last word
        words_list = text.split(" ")
        last_word = words_list[-1]
        last_word = ''.join(last_word)
        
        Predict_Next_Words(model, tokenizer, last_word)
    except Exception as e:
        print(f"Error making prediction: {e}")
        continue
