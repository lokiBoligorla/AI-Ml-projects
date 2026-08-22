# 🛡️ EmailShield: AI-Powered Email Defense Console

EmailShield is a modern, high-performance web application designed to scan and classify incoming emails into **Safe/Legitimate**, **Spam**, and **Phishing** categories. 

Combining a custom Scikit-learn **TF-IDF + Multinomial Naive Bayes** machine learning pipeline with rule-based heuristics for **suspicious keywords** and **hyperlink redirects**, EmailShield provides a high-fidelity Operations Center UI to evaluate and log potential cyber threats.

---

## 🏗️ Folder Structure

```
EmailShield/
├── backend/
│   ├── app.py                  # Flask Application & API Routes (predict, stats, history)
│   ├── database.py             # SQLite helper module managing threat logging
│   ├── preprocess.py           # NLP Text preprocessing engine (NLTK PorterStemmer)
│   ├── train.py                # Dataset builder & ML pipeline training script
│   ├── requirements.txt        # Backend dependencies
│   └── models/                 # Serialized ML model binaries
│       ├── model.joblib        # Trained Naive Bayes classifier
│       └── vectorizer.joblib   # TF-IDF Vectorizer matrix weights
├── frontend/
│   ├── package.json            # React + Vite dependencies
│   ├── tailwind.config.js      # Cybersecurity theme styling configuration
│   ├── index.html              # Main index file
│   └── src/
│       ├── index.css           # Custom styles (neon glows, tech grid backgrounds)
│       ├── main.jsx            # Mounting React
│       ├── App.jsx             # Active Tab controller, API poller, and overall state
│       └── components/         # Premium reusable dashboard widgets
│           ├── Navbar.jsx      # Top navigation with hardware status heartbeat
│           ├── Sidebar.jsx     # Navigation sidebar
│           ├── Home.jsx        # Landing telemetry and core features overview
│           ├── PredictCard.jsx # Email scanning console, highlighter, and URL analyzer
│           ├── Charts.jsx      # Pure interactive SVG charts (distribution & line trends)
│           ├── HistoryList.jsx # Database log registry and collapsible raw scans
│           └── Explanation.jsx # Interactive AI Explainability page (math details)
├── dataset/
│   └── email_dataset.csv       # 1,200 perfectly balanced generated CSV templates
├── README.md                   # Complete architectural guide (this document)
└── run.py                      # Dual-service orchestrator script
```

---

## 🧠 The AI Pipeline & Mathematical Mechanics

EmailShield uses a structured Natural Language Processing (NLP) pipeline to convert human text into mathematical vectors and then predict its safety category based on probability equations.

### Step 1: Preprocessing & Text Normalization
Human language contains structural noise (grammar rules, punctuation) that increases feature dimensions without adding security information. We pass text through our `TextPreprocessor` to execute:
1. **Lowercase conversion**: Ensures characters like "Verify" and "verify" map to the exact same vocabulary index.
2. **Punctuation removal**: Strips exclamation marks and symbols so "urgent!!!" becomes "urgent".
3. **NLTK Stopwords exclusion**: Filters out high-frequency grammatical connector words (e.g. *the, is, in, at, of, under*) which do not help distinguish phishing.
4. **Porter Stemmer compression**: Strips prefixes/suffixes to resolve words to their root forms (e.g. *verify, verifying, verification, verified* all compress to **"verifi"**).

---

### Step 2: TF-IDF Feature Extraction
To perform machine learning, we convert the preprocessed words into numerical arrays. We use a **TF-IDF Vectorizer** (Term Frequency-Inverse Document Frequency) which assigns a mathematical weight to every word:

$$\text{TF}(t, d) = \frac{\text{Count of term } t \text{ in document } d}{\text{Total terms in document } d}$$

$$\text{IDF}(t) = \log\left(\frac{\text{Total documents in dataset}}{\text{Documents containing term } t}\right)$$

$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \text{IDF}(t)$$

- **Why this works:** Standard words appearing in every document (e.g., "Regards", "Dear") receive an IDF score close to `0.0`. Rare, highly descriptive threat indicators (e.g., "lottery", "unauthorized", "routing", "seed phrase") receive highly elevated weights!

---

### Step 3: Multinomial Naive Bayes Inference
Once vectorized, the weights are checked by the **Multinomial Naive Bayes** classifier. It utilizes **Bayes' Theorem** to find the probability of a category given the text:

$$P(\text{Class} \mid \text{Text}) = \frac{P(\text{Text} \mid \text{Class}) \times P(\text{Class})}{P(\text{Text})}$$

- **The Naive Assumption:** To make calculations incredibly fast, the model assumes that the presence of every word is **completely independent** of all other words. While technically incorrect in natural human speech, this simplification makes the model highly resistant to overfitting, uses negligible memory, and executes predictions in under **1 millisecond**!

---

### 🍳 Non-Technical Analogy: "The Three Chefs"
To explain this to non-technical business stakeholders:
Imagine three chefs: **Chef Safe** (cooks office emails), **Chef Spam** (cooks advertisement flyers), and **Chef Phishing** (cooks toxic trap alerts). Every chef has their own unique bucket of vocabulary ingredients they use most frequently. 

When an email arrives, our AI acts as a food inspector. It reviews the ingredients (the words) and determines: **"Whose kitchen did this recipe most likely come from?"**
- Ingredients like *"verify, blocked, credentials"* are cooked by Chef Phishing.
- Ingredients like *"free, win, discount"* are cooked by Chef Spam.
- Ingredients like *"timeline, attached, meeting"* are cooked by Chef Safe.

---

## ⚡ Setup & Run Instructions

EmailShield is designed to be fully self-contained and run on a single machine without internet connections or complex docker setups.

### Quick Start (Single Command)
Ensure you have **Python 3** and **Node.js** installed, then run the dual-process orchestrator from the project root:
```powershell
python run.py
```
This script automatically starts both the Flask backend (http://127.0.0.1:5000) and the React frontend (http://localhost:5173).

---

### Manual Step-by-Step Setup

#### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies (will fetch pre-compiled binary wheels matching your Python environment)
pip install -r requirements.txt

# Run model training pipeline (generates synthetic CSV dataset, fits vectorizer, saves models)
python train.py

# Launch API server
python app.py
```

#### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install Vite and Tailwind dependencies
npm install

# Start Vite React server
npm run dev
```

---

## 🧪 Testing Presets & Expected Classification

You can copy and paste the following templates into the scanning terminal to verify pipeline precision:

### Test Case 1: Phishing Email
* **Text:**
  > URGENT: Your corporate bank card has been temporarily blocked due to unauthorized withdrawals. Click immediately on http://192.168.4.1/wellsfargo/secure-verify to confirm your identity and avoid permanent suspension. Reference ID: REF-9014.
* **Expected Classification:** **Phishing Threat** (95%+ Confidence)
* **Under the Hood Indicators:** Highlighted keywords ("urgent", "blocked", "unauthorized", "verify"). URL Redirect alert flags "Uses IP address instead of domain". AI Explainability shows "verifi" and "block" as the top contribution parameters.

### Test Case 2: Spam Campaign
* **Text:**
  > Win up to $500,000 in our exclusive online casino lucky draw! Claim your free spins and bonus gift card by ordering our herbal weight loss supplement. Overnight shipping guaranteed!
* **Expected Classification:** **Spam** (90%+ Confidence)
* **Under the Hood Indicators:** Highlighted keywords ("win", "free", "gift card", "guaranteed"). AI Explainability details "win" and "free" as major commercial token triggers.

### Test Case 3: Safe Corporate Email
* **Text:**
  > Hi team, please find attached the weekly sprint guidelines and project timeline. I have scheduled our sync meeting for Thursday at 10 AM. Let me know if you need any adjustments to the task board. Best regards.
* **Expected Classification:** **Safe / Legitimate** (95%+ Confidence)
* **Under the Hood Indicators:** No suspect keywords flagged. No hyperlinks. UI safety status gauge glows emerald.

---

## 🛠️ Troubleshooting & Future Upgrades

### Troubleshooting
- **Backend Connection Error:** If the UI shows "AI CORE NODE: OFFLINE", check that port `5000` isn't blocked by another application. Flask runs on `http://127.0.0.1:5000` by default.
- **NLTK Download Lock:** If NLTK stopwords fail to download due to secure proxy configurations on Windows, our `preprocess.py` has a pre-coded fallback of 150 standard English stopwords to guarantee uptime.

### Future Roadmap
1. **Gmail API Integration:** Bind directly to Google API to scan incoming inboxes in real-time.
2. **Deep Learning Upgrade:** Switch from Naive Bayes to an LSTM or transformer-based **BERT** model to capture sentence context and advanced grammatical patterns.
3. **Browser Extension:** Package the frontend parser into a lightweight Chrome/Edge Extension to allow users to scan text directly on their browser screens.
