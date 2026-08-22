import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
import random
import nltk
from nltk.stem.lancaster import LancasterStemmer
import json
import pickle
import os

# Initialize stemmer
stemmer = LancasterStemmer()

print("Loading Intents...")
with open('intents.json') as json_data:
    intents = json.load(json_data)

words = []
classes = []
documents = []
ignore_words = ['?']

print("Tokenizing patterns...")
for intent in intents['intents']:
    for pattern in intent['patterns']:
        # Tokenize each word
        w = nltk.word_tokenize(pattern)
        # Add to words list
        words.extend(w)
        # Add to documents
        documents.append((w, intent['tag']))
        # Add to classes
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

print("Stemming and removing duplicates...")
words = [stemmer.stem(w.lower()) for w in words if w not in ignore_words]
words = sorted(list(set(words)))
classes = sorted(list(set(classes)))

print(f"{len(documents)} documents")
print(f"{len(classes)} classes: {classes}")
print(f"{len(words)} unique stemmed words")

print("Creating training data (bag-of-words)...")
training = []
output_empty = [0] * len(classes)

for doc in documents:
    bag = []
    pattern_words = doc[0]
    pattern_words = [stemmer.stem(word.lower()) for word in pattern_words]
    
    # Create bag-of-words
    for w in words:
        bag.append(1) if w in pattern_words else bag.append(0)

    output_row = list(output_empty)
    output_row[classes.index(doc[1])] = 1

    training.append((bag, output_row))

# Shuffle and convert to numpy array
random.shuffle(training)

train_x = np.array([item[0] for item in training], dtype=np.float32)
train_y = np.array([item[1] for item in training], dtype=np.float32)

print(f"train_x shape: {train_x.shape}")
print(f"train_y shape: {train_y.shape}")

print("Building modern TensorFlow 2.x Keras Sequential Neural Network model...")
model = Sequential([
    Dense(8, input_shape=(len(train_x[0]),), activation='relu'),
    Dense(8, activation='relu'),
    Dense(len(train_y[0]), activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

print("Training the model...")
# 1000 epochs to match the notebook's configuration
model.fit(train_x, train_y, epochs=1000, batch_size=8, verbose=1)

print("Saving Keras model...")
model.save('chatbot_model.keras')

print("Saving vocabulary and classes to pickle file...")
with open('training_data.pkl', 'wb') as f:
    pickle.dump({'words': words, 'classes': classes}, f)

print("Training completed successfully and all artifacts saved!")
