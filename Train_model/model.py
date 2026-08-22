from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

class BCIModel:
    def __init__(self, model_type='random_forest'):
        if model_type == 'random_forest':
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            # Fallback or extension point for SVM / Logistic Regression
            from sklearn.linear_model import LogisticRegression
            self.model = LogisticRegression(max_iter=1000)
            
    def train(self, X_train, y_train):
        print("Training the ML model...")
        self.model.fit(X_train, y_train)
        
    def evaluate(self, X_test, y_test):
        print("Evaluating model performance...")
        predictions = self.model.predict(X_test)
        acc = accuracy_score(y_test, predictions)
        report = classification_report(y_test, predictions)
        return acc, report
    
    def save(self, filename='bci_model.pkl'):
        joblib.dump(self.model, filename)
        print(f"Model saved to {filename}")

    def load(self, filename='bci_model.pkl'):
        self.model = joblib.load(filename)
        print(f"Model loaded from {filename}")

if __name__ == "__main__":
    # Example logic
    import numpy as np
    X_fake = np.random.rand(100, 4)
    y_fake = np.random.choice(['PLAY', 'PAUSE', 'NEXT'], 100)
    
    bci = BCIModel()
    bci.train(X_fake, y_fake)
    acc, report = bci.evaluate(X_fake, y_fake)
    print(f"Accuracy: {acc}")
    print(f"Report:\n{report}")
