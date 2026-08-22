import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
import joblib

# Import custom preprocessor helper
from preprocess import preprocess_text

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "Phishing_Email.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

def train_and_evaluate():
    print("\n===========================================================")
    print("           EMAILSHIELD KAGGLE DATASET PIPELINE              ")
    print("===========================================================")
    
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Kaggle dataset not found at: {os.path.abspath(DATASET_PATH)}. Run download_kaggle.py first.")
        
    print(f"Loading Kaggle dataset: {os.path.abspath(DATASET_PATH)}...")
    df = pd.read_csv(DATASET_PATH)
    
    # 1. Cleaning & Wrangling
    print("Step 1: Dropping empty cells and formatting labels...")
    df = df.dropna(subset=['Email Text', 'Email Type'])
    
    # Map labels: Safe Email -> safe, Phishing Email -> phishing
    label_map = {
        "Safe Email": "safe",
        "Phishing Email": "phishing"
    }
    df['label'] = df['Email Type'].map(label_map)
    df = df.dropna(subset=['label'])
    
    print(f"Dataset Loaded. Total records: {len(df)}")
    print(df['label'].value_counts())
    
    # 2. Text Preprocessing
    print("\nStep 2: Preprocessing email text features (this may take a few seconds)...")
    # Preprocess text column
    df['processed_text'] = df['Email Text'].apply(preprocess_text)
    
    # Filter empty processed rows
    df = df[df['processed_text'] != ""]
    
    X = df['processed_text']
    y = df['label']
    
    # 3. Data Split
    print("Step 3: Splitting dataset (80% Train, 20% Test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 4. Vectorization
    print("Step 4: Vectorizing text features with TF-IDF Vectorizer...")
    # Map features to informative weights
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    # 5. Model Training
    print("Step 5: Training Multinomial Naive Bayes model...")
    classifier = MultinomialNB(alpha=0.1)
    classifier.fit(X_train_tfidf, y_train)
    
    # 6. Evaluation
    print("Step 6: Evaluating models on test partition...")
    y_pred = classifier.predict(X_test_tfidf)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average='weighted'
    )
    
    print("\n================ MODEL PERFORMANCE SUMMARY ================")
    print(f"Accuracy:  {accuracy * 100:.2f}%")
    print(f"Precision: {precision * 100:.2f}%")
    print(f"Recall:    {recall * 100:.2f}%")
    print(f"F1 Score:  {f1 * 100:.2f}%")
    print("===========================================================")
    
    print("\nConfusion Matrix:")
    labels = sorted(list(y_test.unique()))
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    cm_df = pd.DataFrame(cm, index=[f"Actual {l}" for l in labels], columns=[f"Predicted {l}" for l in labels])
    print(cm_df)
    
    # Save parameters
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    vectorizer_path = os.path.join(MODEL_DIR, "vectorizer.joblib")
    model_path = os.path.join(MODEL_DIR, "model.joblib")
    
    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(classifier, model_path)
    
    print(f"\n[SUCCESS] Saved TF-IDF Vectorizer to: {os.path.abspath(vectorizer_path)}")
    print(f"[SUCCESS] Saved Naive Bayes Model to: {os.path.abspath(model_path)}")
    print("\nModel pipeline execution complete! Models are fully loaded on Kaggle weights.")

if __name__ == "__main__":
    train_and_evaluate()
