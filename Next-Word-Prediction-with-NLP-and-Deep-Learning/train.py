import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.layers import Embedding, LSTM, Dense
from tensorflow.keras.models import Sequential
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.optimizers import Adam
import pickle
import numpy as np
import os

# 1. Load the data
print("Loading data...")
file = open("metamorphosis_clean.txt", "r", encoding="utf8")
lines = []
for i in file:
    lines.append(i)

data = ' '.join(lines)
data = data.replace('\n', '').replace('\r', '').replace('\ufeff', '')

# 2. Get unique words (as in the notebook)
print("Processing unique words...")
z = []
for i in data.split():
    if i not in z:
        z.append(i)
data = ' '.join(z)

# 3. Tokenization
print("Tokenizing...")
tokenizer = Tokenizer()
tokenizer.fit_on_texts([data])

# saving the tokenizer for predict function.
pickle.dump(tokenizer, open('tokenizer1.pkl', 'wb'))
print("Saved tokenizer1.pkl")

sequence_data = tokenizer.texts_to_sequences([data])[0]

vocab_size = len(tokenizer.word_index) + 1
print("Vocab size:", vocab_size)

sequences = []
for i in range(1, len(sequence_data)):
    words = sequence_data[i-1:i+1]
    sequences.append(words)
    
print("The Length of sequences are: ", len(sequences))
sequences = np.array(sequences)

X = []
y = []
for i in sequences:
    X.append(i[0])
    y.append(i[1])
    
# Reshape X to be 2D: (batch_size, 1)
X = np.array(X).reshape(-1, 1)
y = np.array(y)

y = to_categorical(y, num_classes=vocab_size)

# 4. Creating the Model
print("Creating model...")
model = Sequential()
# In Keras 3, we define input_shape=(1,) on the Embedding layer to make it output 3D (None, 1, 10)
model.add(Embedding(vocab_size, 10, input_shape=(1,)))
model.add(LSTM(1000, return_sequences=True))
model.add(LSTM(1000))
model.add(Dense(1000, activation="relu"))
model.add(Dense(vocab_size, activation="softmax"))

model.summary()

# Compile
model.compile(loss="categorical_crossentropy", optimizer=Adam(learning_rate=0.001))

# Fit
print("Starting training (150 epochs)...")
model.fit(X, y, epochs=150, batch_size=64)

# Save the final model
model.save('nextword1.h5')
print("Model saved to nextword1.h5 successfully!")
