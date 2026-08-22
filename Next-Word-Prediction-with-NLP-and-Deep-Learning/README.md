# Next-Word Prediction with NLP and Deep Learning

This project implements a Deep Learning model designed to predict the next word in a sequence using a Long Short-Term Memory (LSTM) network. The model is trained on the English text of Franz Kafka's classic book, *The Metamorphosis*.

Originally developed as Jupyter Notebooks, the project has been updated and refactored into structured, fully optimized Python scripts that resolve environment conflicts and shape compatibility issues with modern Keras 3/TensorFlow 2.

---

## 🛠️ Core Technologies Used
*   **Python 3**: Main runtime environment.
*   **TensorFlow 2.x & Keras 3**: Used to design, train, and make inferences with the Neural Network.
*   **NumPy**: Handled fast mathematical matrix transformations and array reshaping.
*   **Pickle**: Serialized and saved the trained vocabulary mapping (`Tokenizer`).

---

## 🏗️ How the Project Works

### 1. Data Cleaning & Tokenization
*   The raw text (`metamorphosis_clean.txt`) is parsed and cleaned of newlines, byte order marks, and punctuation.
*   The system creates a list of unique words in order of first appearance to act as its vocabulary.
*   A Keras `Tokenizer` maps each of the **2,616 unique words** to a unique integer index.

### 2. Model Architecture
The network is built using the Keras `Sequential` API:
*   **Embedding Layer**: Maps integer indices to 10-dimensional dense vectors.
*   **Double LSTM Layers**: Two recurrent LSTM layers with 1000 memory units each to learn sequences of context.
*   **Dense (ReLU)**: A standard hidden layer with 1000 units.
*   **Dense (Softmax)**: The output classification layer with 2,617 nodes (representing the vocabulary size). It outputs the probability distribution for every word in the vocabulary.

### 3. Inference Logic
When the user inputs a text phrase, the script takes the **last word**, tokenizes it to its integer index, and feeds it to the model. The model outputs a probability vector, and the script selects the word with the highest probability (`np.argmax`) to display as the prediction.

---

## 🚀 How to Run and Predict

### Prerequisites
Make sure your environment has TensorFlow and NumPy installed. If you encounter any protobuf conflicts, upgrade protobuf:
```bash
pip install "protobuf>=6.31.1"
```

### Option 1: Run Predictions (Model is pre-trained)
We have already trained the model for you. To run the interactive prediction interface in your terminal, run:
```bash
python predict.py
```

**Example CLI usage:**
```text
Enter your line: at the dull
Predicted next word: weather

Enter your line: collection of textile
Predicted next word: samples

Enter your line: stop the script
Ending The Program.....
```

### Option 2: Retrain the Model
If you modify the source text or want to train from scratch, execute:
```bash
python train.py
```
This will train the model over 150 epochs, saving the updated tokenizer as `tokenizer1.pkl` and the neural network weights as `nextword1.h5`.

---

## 🧪 Test Examples to Try
Type these words/phrases into `predict.py` to see the model in action:
*   `troubled` ➡️ predicts `dreams`
*   `horrible` ➡️ predicts `vermin`
*   `travelling` ➡️ predicts `salesman`
*   `dull` ➡️ predicts `weather`
*   `what a strenuous` ➡️ predicts `career`

*Note: Since the vocabulary size is bound to the source text (Kafka's book), entering words outside of the book's context (e.g. "computer" or "pizza") will result in a `<Word not in vocabulary>` message.*
