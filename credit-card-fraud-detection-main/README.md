# Credit Card Fraud Detection

A machine learning project designed to detect fraudulent credit card transactions using classification models. The project addresses extreme class imbalance and compares several classification algorithms.

---

## 📌 Project Objective & Role

The primary goal of this project is to build an effective binary classifier to identify fraudulent transactions (`Class = 1`) from a stream of credit card transactions while minimizing false alarms for genuine transactions (`Class = 0`). 

Keeping customer money safe is a primary job of any bank. Every undetected fraud leads to direct financial loss, reputational damage, and erosion of customer trust.

---

## 📊 Dataset Overview

*   **Source:** [Kaggle Credit Card Fraud Detection Dataset](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud)
*   **Total Transactions:** 284,807
*   **Features:** 31 columns:
    *   `Time`: Seconds elapsed between this transaction and the first transaction.
    *   `V1` to `V28`: Principal components obtained using PCA (anonymized for privacy).
    *   `Amount`: Transaction amount.
    *   `Class`: `1` for Fraud, `0` for Genuine.
*   **Extreme Class Imbalance:**
    *   **Genuine (Class 0):** 284,315 (99.83%)
    *   **Fraud (Class 1):** 492 (0.17%)

---

## 🧠 Key Machine Learning Concepts

### 1. The Confusion Matrix
A layout showing predicted vs. actual classes:

| | Predicted `0` (Genuine) | Predicted `1` (Fraud) |
|---|---|---|
| **True `0` (Genuine)** | **True Negatives (TN):** Genuine correctly allowed | **False Positives (FP):** False Alarm (Genuine blocked) |
| **True `1` (Fraud)** | **False Negatives (FN):** Missed Fraud (Fraud allowed) | **True Positives (TP):** Fraud correctly blocked |

> [!WARNING]
> **False Negatives (FN)** are the most **dangerous** because they represent undetected theft where the customer loses money and the bank is liable. **False Positives (FP)** represent customer inconvenience (card declined) but do not cause direct financial theft.

---

### 2. Core Metrics & Formulas

*   **Precision:** How accurate are the fraud alarms?
    $$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}$$

*   **Recall (Sensitivity):** What percentage of actual frauds did we catch?
    $$\text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$

*   **F1-Score:** The harmonic mean balancing Precision and Recall:
    $$\text{F1-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

---

### 3. ROC and AUC
*   **ROC Curve (Receiver Operating Characteristic):** A graph plotting **True Positive Rate (Recall)** against **False Positive Rate** at all possible classification thresholds.
*   **AUC (Area Under the Curve):** A single metric between $0.5$ (random guessing) and $1.0$ (perfect classification) summarizing the ROC curve. An AUC of $0.96$ means there is a $96\%$ probability the model will rank a random fraud case higher than a random genuine case.

---

## 🏆 Models Evaluated & Performance

We split the dataset into an **80:20 Train-Test split**, standardized the `Amount` column, and evaluated the models on the test set:

| Model Name | Accuracy | F1-score | ROC AUC | Key Takeaways |
| :--- | :---: | :---: | :---: | :--- |
| **Logistic Regression** | 99.89% | 62.50% | **0.9764** | Highest ROC AUC, but misses more fraud cases (Recall: 52%). |
| **Random Forest** | 99.90% | 68.54% | **0.9628** | Balanced classifier with solid precision (74%) and recall (63%). |
| **Decision Tree** | 99.88% | 61.54% | **0.9218** | Simple, interpretable rules but lower overall metrics. |
| **XGBoost** | 99.94% | **78.86%** | **0.9046** | **Best model for deployment.** Achieved the highest recall (71.88%) and F1-score. |

---

## 🚀 Running the Project

### 1. Download the Dataset
The raw dataset must be downloaded and placed inside a folder named `datasets`:
*   Create a folder `datasets/` inside the project root.
*   Download `creditcard.csv` and save it as `datasets/creditcard.csv`.

### 2. Install Dependencies
```bash
pip install pandas numpy matplotlib seaborn scikit-learn xgboost
```

### 3. Run the Jupyter Notebook
Open the Jupyter notebook and run all cells:
```bash
jupyter notebook credit_card_fraud_detection.ipynb
```