import os
import re
import json
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from flasgger import Swagger

# Import database and preprocessing helpers
import database
from preprocess import preprocess_text

app = Flask(__name__)
# Enable CORS for frontend integration
CORS(app)

# Initialize database
database.init_db()

# Initialize Swagger UI documentation engine
swagger = Swagger(app)

# Load Serialized Models
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "model.joblib")
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), "models", "vectorizer.joblib")

try:
    classifier = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    print("AI Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}. Running training script to generate them...")
    import train
    train.train_and_evaluate()
    classifier = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)

# Suspicious keywords for heuristic scanning
SUSPICIOUS_KEYWORDS = [
    "urgent", "urgently", "verify", "verify credentials", "click here", "click now", 
    "account blocked", "suspended", "password reset", "unauthorized", "free money", 
    "lottery", "cash prize", "wire transfer", "social security", "credit card", 
    "bank", "routing number", "identity verification", "restricted", "action required", 
    "immediate attention", "claim refund", "get rich", "millions online", "confirm identity"
]

def scan_keywords(text):
    text_lower = text.lower()
    detected = []
    for kw in SUSPICIOUS_KEYWORDS:
        if kw in text_lower:
            detected.append(kw)
    return detected

def scan_urls(text):
    # Regex to extract URLs
    url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
    urls = re.findall(url_pattern, text)
    
    analyzed_urls = []
    
    for url in urls:
        is_suspicious = False
        reasons = []
        
        # 1. Check for IP address in URL
        ip_pattern = r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'
        if re.search(ip_pattern, url):
            is_suspicious = True
            reasons.append("Uses IP address instead of domain name (classic phishing technique)")
            
        # 2. Check for phishing keywords in URL
        phish_keywords = ["login", "verify", "secure", "bank", "paypal", "signin", "update", "restore", "account", "billing"]
        url_lower = url.lower()
        found_kw = [kw for kw in phish_keywords if kw in url_lower]
        if found_kw:
            is_suspicious = True
            reasons.append(f"Contains security-sensitive terms in path: {', '.join(found_kw)}")
            
        # 3. Check for suspicious Top Level Domains (TLDs)
        suspicious_tlds = [".cc", ".info", ".work", ".ru", ".xyz", ".top", ".club", ".biz", ".fit"]
        for tld in suspicious_tlds:
            if url_lower.endswith(tld) or f"{tld}/" in url_lower:
                is_suspicious = True
                reasons.append(f"Uses a high-risk Top Level Domain ({tld}) commonly associated with spam")
                break
                
        # 4. Check for excessive URL length
        if len(url) > 70:
            is_suspicious = True
            reasons.append("Excessive link length (>70 characters), likely masking redirect strings")
            
        analyzed_urls.append({
            "url": url,
            "is_suspicious": is_suspicious,
            "reasons": reasons
        })
        
    return analyzed_urls

def generate_ai_explainability(raw_text, predicted_class):
    """
    Identifies which words in this specific email contributed most to the model's prediction.
    It checks the intersection of email tokens and vocabulary, evaluating their TF-IDF scores
    and Naive Bayes log probability weights.
    """
    try:
        # Preprocess text to match model features
        processed = preprocess_text(raw_text)
        tokens = processed.split()
        
        if not tokens:
            return []
            
        # Transform token list using current vectorizer to find TF-IDF values
        tfidf_matrix = vectorizer.transform([processed])
        feature_names = vectorizer.get_feature_names_out()
        
        # Get matching feature indices and values
        non_zero_indices = tfidf_matrix.nonzero()[1]
        
        # Map feature log probabilities from Naive Bayes classifier
        # MultinomialNB has classifier.feature_log_prob_ of shape (n_classes, n_features)
        class_idx = list(classifier.classes_).index(predicted_class)
        log_probs = classifier.feature_log_prob_[class_idx]
        
        explanations = []
        for idx in non_zero_indices:
            token = feature_names[idx]
            tfidf_score = tfidf_matrix[0, idx]
            word_importance = tfidf_score * np.exp(log_probs[idx]) # TF-IDF weighted probability
            
            explanations.append({
                "token": token,
                "importance": float(word_importance)
            })
            
        # Sort by importance descending and take top 5
        explanations = sorted(explanations, key=lambda x: x["importance"], reverse=True)[:5]
        
        # Normalize weights for visualization
        total_imp = sum(e["importance"] for e in explanations) if explanations else 0
        if total_imp > 0:
            for e in explanations:
                e["percentage"] = round((e["importance"] / total_imp) * 100, 1)
        else:
            for e in explanations:
                e["percentage"] = 20.0
                
        return explanations
    except Exception as e:
        print(f"Explainability generation failed: {e}")
        return []

@app.route("/", methods=["GET"])
def index():
    """
    Diagnostics check validating API operational availability.
    ---
    responses:
      200:
        description: A list of available routing channels and overall network pulse.
    """
    return jsonify({
        "status": "online",
        "message": "EmailShield AI Classification Backend is operational.",
        "endpoints": {
            "predict": "/api/predict [POST]",
            "history": "/api/history [GET]",
            "stats": "/api/stats [GET]",
            "clear": "/api/clear [POST]"
        }
    })

@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Evaluate safety coordinates of an email message body.
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - email_text
          properties:
            email_text:
              type: string
              example: "URGENT: Verify your bank identity immediately to resolve card block suspension."
    responses:
      200:
        description: Safety evaluation report successfully completed.
    """
    data = request.get_json()
    if not data or "email_text" not in data:
        return jsonify({"error": "Missing email_text field"}), 400
        
    email_text = data["email_text"]
    if not email_text.strip():
        return jsonify({"error": "Email content cannot be empty"}), 400
        
    # 1. Run rule-based scanners
    keywords_found = scan_keywords(email_text)
    urls_found = scan_urls(email_text)
    
    # 2. Run text preprocessing for ML
    processed = preprocess_text(email_text)
    
    if not processed.strip():
        # Fallback if text is empty after removing stop words
        # (e.g. only contains punctuation or spaces)
        return jsonify({
            "email_text": email_text,
            "prediction": "safe",
            "confidence": 100.0,
            "keywords_detected": [],
            "urls_detected": [],
            "explanations": [],
            "database_id": None
        })
        
    # 3. Vectorize and Predict using Naive Bayes
    vectorized_text = vectorizer.transform([processed])
    prediction = str(classifier.predict(vectorized_text)[0]).strip().lower()
    
    # Calculate confidence (probabilities for each class)
    probabilities = classifier.predict_proba(vectorized_text)[0]
    classes = list(classifier.classes_)
    pred_idx = classes.index(prediction)
    confidence = float(probabilities[pred_idx]) * 100.0
    
    # 4. Generate AI explainability insights
    explanations = generate_ai_explainability(email_text, prediction)
    
    # 5. Save to database log
    inserted_id = database.insert_scan(
        email_text=email_text,
        prediction=prediction,
        confidence=confidence,
        keywords_detected=keywords_found,
        urls_detected=urls_found
    )
    
    return jsonify({
        "email_text": email_text,
        "prediction": prediction,
        "confidence": round(confidence, 2),
        "keywords_detected": keywords_found,
        "urls_detected": urls_found,
        "explanations": explanations,
        "database_id": inserted_id
    })

@app.route("/api/history", methods=["GET"])
def history():
    """
    Retrieve past classification history logs.
    ---
    parameters:
      - name: limit
        in: query
        type: integer
        default: 20
    responses:
      200:
        description: Logs fetched successfully.
    """
    limit = request.args.get("limit", 20, type=int)
    history_data = database.get_history(limit)
    return jsonify(history_data)

@app.route("/api/stats", methods=["GET"])
def stats():
    """
    Fetch threat ratio statistics and line chart parameters.
    ---
    responses:
      200:
        description: Stats metrics fetched.
    """
    stats_data = database.get_stats()
    return jsonify(stats_data)

@app.route("/api/clear", methods=["POST"])
def clear():
    """
    Purge history log records from database tables.
    ---
    responses:
      200:
        description: Success confirmation message.
    """
    database.clear_history()
    return jsonify({"success": True, "message": "Database log cleared successfully."})

if __name__ == "__main__":
    # Standard Flask port
    app.run(host="127.0.0.1", port=5000, debug=True)
