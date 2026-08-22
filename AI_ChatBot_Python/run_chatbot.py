import numpy as np
import tensorflow as tf
import random
import nltk
from nltk.stem.lancaster import LancasterStemmer
import json
import pickle
import os
import sys

# Console styling colors
RESET = "\033[0m"
BOLD = "\033[1m"
CYAN = "\033[36m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
RED = "\033[31m"
MAGENTA = "\033[35m"
WHITE = "\033[37m"

# Initialize stemmer
stemmer = LancasterStemmer()

print(f"{YELLOW}* Loading chatbot resources...{RESET}")

# Load vocabulary and classes
if not os.path.exists('training_data.pkl'):
    print(f"{RED}Error: training_data.pkl not found! Please run train_model.py first.{RESET}")
    sys.exit(1)

with open('training_data.pkl', 'rb') as f:
    data = pickle.load(f)
words = data['words']
classes = data['classes']

# Load intents definition
if not os.path.exists('intents.json'):
    print(f"{RED}Error: intents.json not found!{RESET}")
    sys.exit(1)

with open('intents.json') as json_data:
    intents = json.load(json_data)

# Load trained model
if not os.path.exists('chatbot_model.keras'):
    print(f"{RED}Error: chatbot_model.keras not found! Please run train_model.py first.{RESET}")
    sys.exit(1)

# Suppress TensorFlow logging to keep terminal output clean
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.get_logger().setLevel('ERROR')

model = tf.keras.models.load_model('chatbot_model.keras')
print(f"{GREEN}* Chatbot model loaded successfully!{RESET}")

# Global context dictionary
context_state = {}

def clean_up_sentence(sentence):
    # Tokenize
    sentence_words = nltk.word_tokenize(sentence)
    # Stem
    sentence_words = [stemmer.stem(word.lower()) for word in sentence_words]
    return sentence_words

def bow(sentence, words, show_details=False):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
                if show_details:
                    print(f"found in bag: {w}")
    return np.array(bag)

ERROR_THRESHOLD = 0.25

def classify(sentence):
    # Predict probabilities using modern Keras API
    bow_vec = bow(sentence, words)
    results = model.predict(np.array([bow_vec]), verbose=0)[0]
    
    # Filter results below threshold
    results = [[i, r] for i, r in enumerate(results) if r > ERROR_THRESHOLD]
    
    # Sort by probability descending
    results.sort(key=lambda x: x[1], reverse=True)
    
    return_list = []
    for r in results:
        return_list.append((classes[r[0]], r[1]))
    return return_list

def get_response(sentence, user_id='123'):
    global context_state
    results = classify(sentence)
    
    if results:
        # Check matching intent in intents.json
        for intent_tag, probability in results:
            for i in intents['intents']:
                if i['tag'] == intent_tag:
                    # Check context filter
                    # If intent expects a context_filter, check if it matches the current user context
                    if 'context_filter' in i:
                        current_context = context_state.get(user_id)
                        if current_context != i['context_filter']:
                            # Context doesn't match, try next predicted tag
                            continue
                    
                    # Set context if requested
                    if 'context_set' in i:
                        if i['context_set']:
                            context_state[user_id] = i['context_set']
                        else:
                            # Clear context
                            context_state.pop(user_id, None)
                    else:
                        # Clear context if not specified
                        context_state.pop(user_id, None)
                        
                    return random.choice(i['responses']), intent_tag, probability
                    
        # If all predictions fail context checks, fall back to the highest probability match ignoring context
        # (or standard default response)
        for i in intents['intents']:
            if i['tag'] == results[0][0]:
                return random.choice(i['responses']), results[0][0], results[0][1]

    return "I'm sorry, I didn't quite get that. Could you rephrase?", None, 0.0

# Print greeting and start interactive loop if executed directly
if __name__ == '__main__':
    print("\n" + "=" * 60)
    print(f"       {BOLD}{CYAN}Welcome to the AI Chatbot CLI Session{RESET}")
    print(f"       Type {RED}'quit'{RESET} or {RED}'exit'{RESET} to end the chat.")
    print("=" * 60 + "\n")
    
    user_id = 'user_session_1'
    
    while True:
        try:
            user_input = input(f"{BOLD}{GREEN}You{RESET}- ")
            if not user_input.strip():
                continue
                
            if user_input.lower().strip() in ['quit', 'exit']:
                print(f"\n{CYAN}FreeBirdsBot- {WHITE}Goodbye! Have a wonderful day!{RESET}\n")
                break
                
            response_text, matched_tag, confidence = get_response(user_input, user_id)
            
            # Format printing output nicely with matched tag and confidence in debug style
            debug_info = ""
            if matched_tag:
                debug_info = f" {MAGENTA}(tag: {matched_tag}, conf: {confidence:.2f}){RESET}"
                
            print(f"{BOLD}{CYAN}FreeBirdsBot-{RESET} {WHITE}{response_text}{RESET}{debug_info}")
            
        except KeyboardInterrupt:
            print(f"\n{CYAN}FreeBirdsBot- {WHITE}Goodbye!{RESET}\n")
            break
        except Exception as e:
            print(f"{RED}An error occurred: {e}{RESET}")

