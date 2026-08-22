import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, mean_squared_error, r2_score
import xgboost as xgb
import joblib

def load_and_preprocess_data(dataset_path):
    print("Loading dataset from:", dataset_path)
    df = pd.read_csv(dataset_path)
    
    # 1. Basic Cleaning
    # Filter rows to only keep student professions (mostly are Student)
    df = df[df['Profession'].str.lower().str.strip() == 'student'].copy()
    
    # Fill numerical missing values
    df['Age'] = df['Age'].fillna(df['Age'].median())
    df['CGPA'] = df['CGPA'].fillna(df['CGPA'].median())
    df['Academic Pressure'] = df['Academic Pressure'].fillna(df['Academic Pressure'].median())
    df['Financial Stress'] = df['Financial Stress'].fillna(df['Financial Stress'].median())
    df['Work/Study Hours'] = df['Work/Study Hours'].fillna(df['Work/Study Hours'].median())
    
    # Fill categorical missing values
    df['Gender'] = df['Gender'].fillna('Male')
    df['Sleep Duration'] = df['Sleep Duration'].fillna('7-8 hours')
    df['Dietary Habits'] = df['Dietary Habits'].fillna('Moderate')
    df['Have you ever had suicidal thoughts ?'] = df['Have you ever had suicidal thoughts ?'].fillna('No')
    df['Family History of Mental Illness'] = df['Family History of Mental Illness'].fillna('No')
    df['Depression'] = df['Depression'].fillna(0)
    
    # 2. Text Mapping to Numbers
    # Gender mapping
    gender_map = {'male': 0, 'female': 1, 'other': 0.5}
    df['Gender_Num'] = df['Gender'].str.lower().str.strip().map(gender_map).fillna(0.5)
    
    # Sleep duration to numerical hours
    sleep_map = {
        'less than 5 hours': 4.0,
        '5-6 hours': 5.5,
        '7-8 hours': 7.5,
        'more than 8 hours': 9.0
    }
    df['Sleep_Hours'] = df['Sleep Duration'].str.lower().str.strip().map(sleep_map).fillna(6.5)
    
    # Dietary habits mapping
    diet_map = {'unhealthy': 1, 'moderate': 2, 'healthy': 3}
    df['Diet_Quality'] = df['Dietary Habits'].str.lower().str.strip().map(diet_map).fillna(2)
    
    # Binary maps
    df['Suicidal_Thoughts'] = df['Have you ever had suicidal thoughts ?'].str.lower().str.strip().map({'yes': 1, 'no': 0}).fillna(0)
    df['Family_History'] = df['Family History of Mental Illness'].str.lower().str.strip().map({'yes': 1, 'no': 0}).fillna(0)
    
    # 3. Synthesize missing student metrics using physical/psychological logic with correlations
    np.random.seed(42)
    n_samples = len(df)
    
    # Screen Time: Correlated negatively with sleep hours and positively with depression/stress
    screen_base = 12 - df['Sleep_Hours'] - (df['Diet_Quality'] * 0.5) + (df['Depression'] * 2.0)
    screen_noise = np.random.normal(0, 1.2, n_samples)
    df['Screen_Time'] = np.clip(screen_base + screen_noise, 1.0, 12.0)
    
    # Exercise Hours: Correlated positively with healthy diet, negatively with depression
    exercise_base = df['Diet_Quality'] * 1.5 - df['Depression'] * 1.5
    exercise_noise = np.random.normal(0, 0.8, n_samples)
    df['Exercise_Hours'] = np.clip(exercise_base + exercise_noise, 0.0, 6.0)
    
    # Social Interaction Level: 1 to 5, negative with depression/academic pressure
    social_base = 5.0 - df['Depression'] * 1.5 - df['Academic Pressure'] * 0.3
    social_noise = np.random.normal(0, 0.8, n_samples)
    df['Social_Level'] = np.clip(np.round(social_base + social_noise), 1.0, 5.0)
    
    # Attendance Percentage: 40% to 100%, negative with depression/academic pressure
    attendance_base = 96.0 - df['Depression'] * 15.0 - df['Academic Pressure'] * 2.5
    attendance_noise = np.random.normal(0, 4.0, n_samples)
    df['Attendance_Pct'] = np.clip(attendance_base + attendance_noise, 40.0, 100.0)
    
    # Relationship Stress: 1 to 5, positive with financial stress and depression
    rel_base = 1.5 + df['Financial Stress'] * 0.4 + df['Depression'] * 1.8
    rel_noise = np.random.normal(0, 0.8, n_samples)
    df['Relationship_Stress'] = np.clip(np.round(rel_base + rel_noise), 1.0, 5.0)
    
    # 4. Synthesize ground-truth target scores for ML training
    # STRESS LEVEL score (0: Low, 1: Medium, 2: High)
    stress_score = (
        df['Academic Pressure'] * 1.6 +
        df['Financial Stress'] * 1.2 +
        df['Relationship_Stress'] * 1.0 +
        (9.0 - df['Sleep_Hours']) * 0.8 +
        (6.0 - df['Exercise_Hours']) * 0.5 +
        (5.0 - df['Social_Level']) * 0.4 +
        df['Depression'] * 2.0
    )
    # Categorize stress
    df['Stress_Level'] = pd.cut(
        stress_score,
        bins=[-float('inf'), 9.0, 14.5, float('inf')],
        labels=[0, 1, 2] # 0: Low, 1: Medium, 2: High
    ).astype(int)
    
    # BURNOUT RISK score (0: Low, 1: Medium, 2: High)
    burnout_score = (
        df['Work/Study Hours'] * 0.5 +
        df['Academic Pressure'] * 1.5 +
        (12.0 - df['Sleep_Hours']) * 0.8 +
        (100.0 - df['Attendance_Pct']) * 0.12 +
        df['Depression'] * 1.8 +
        df['Relationship_Stress'] * 0.5
    )
    df['Burnout_Risk'] = pd.cut(
        burnout_score,
        bins=[-float('inf'), 11.5, 17.0, float('inf')],
        labels=[0, 1, 2] # 0: Low, 1: Medium, 2: High
    ).astype(int)
    
    # MENTAL WELLNESS SCORE (0 to 100)
    wellness_raw = (
        100.0 -
        (df['Academic Pressure'] * 4.5) -
        (df['Financial Stress'] * 3.5) -
        (df['Relationship_Stress'] * 3.0) -
        (df['Depression'] * 18.0) -
        ((8.0 - df['Sleep_Hours']) * 4.0) +
        (df['Exercise_Hours'] * 3.5) +
        (df['Social_Level'] * 2.5) +
        ((df['Attendance_Pct'] - 60.0) * 0.2)
    )
    df['Wellness_Score'] = np.clip(wellness_raw, 5.0, 100.0)
    
    # Define features
    features = [
        'Age', 'Gender_Num', 'Sleep_Hours', 'Work/Study_Hours_Feature', 
        'Screen_Time', 'Exercise_Hours', 'Social_Level', 'Academic_Pressure_Feature', 
        'Attendance_Pct', 'Diet_Quality', 'Financial_Stress_Feature', 'Relationship_Stress_Feature'
    ]
    
    # Re-map original feature names to unified names
    df['Work/Study_Hours_Feature'] = df['Work/Study Hours']
    df['Academic_Pressure_Feature'] = df['Academic Pressure']
    df['Financial_Stress_Feature'] = df['Financial Stress']
    df['Relationship_Stress_Feature'] = df['Relationship_Stress']
    
    return df, features

def train_and_evaluate():
    dataset_path = 'Student_Depression_Dataset.csv'
    
    # Load and preprocess
    df, feature_names = load_and_preprocess_data(dataset_path)
    
    X = df[feature_names]
    y_stress = df['Stress_Level']
    y_burnout = df['Burnout_Risk']
    y_wellness = df['Wellness_Score']
    
    # Train-test split
    X_train, X_test, y_stress_train, y_stress_test = train_test_split(X, y_stress, test_size=0.2, random_state=42)
    _, _, y_burnout_train, y_burnout_test = train_test_split(X, y_burnout, test_size=0.2, random_state=42)
    _, _, y_wellness_train, y_wellness_test = train_test_split(X, y_wellness, test_size=0.2, random_state=42)
    
    # Feature Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save the scaler
    os.makedirs('backend/app/ml/models', exist_ok=True)
    joblib.dump(scaler, 'backend/app/ml/models/scaler.joblib')
    print("StandardScaler saved to backend/app/ml/models/scaler.joblib")
    
    metrics = {}
    
    # ==================== 1. STRESS LEVEL MODELS ====================
    print("\n--- Training Stress Level Models ---")
    
    # Random Forest Classifier
    rf_stress = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=12)
    rf_stress.fit(X_train_scaled, y_stress_train)
    rf_stress_preds = rf_stress.predict(X_test_scaled)
    rf_stress_acc = accuracy_score(y_stress_test, rf_stress_preds)
    rf_stress_prec, rf_stress_rec, rf_stress_f1, _ = precision_recall_fscore_support(y_stress_test, rf_stress_preds, average='weighted')
    
    # XGBoost Classifier
    xgb_stress = xgb.XGBClassifier(n_estimators=100, random_state=42, max_depth=6, learning_rate=0.1)
    xgb_stress.fit(X_train_scaled, y_stress_train)
    xgb_stress_preds = xgb_stress.predict(X_test_scaled)
    xgb_stress_acc = accuracy_score(y_stress_test, xgb_stress_preds)
    xgb_stress_prec, xgb_stress_rec, xgb_stress_f1, _ = precision_recall_fscore_support(y_stress_test, xgb_stress_preds, average='weighted')
    
    print(f"Random Forest Stress Accuracy: {rf_stress_acc:.4f} | F1-Score: {rf_stress_f1:.4f}")
    print(f"XGBoost Stress Accuracy: {xgb_stress_acc:.4f} | F1-Score: {xgb_stress_f1:.4f}")
    
    metrics['stress'] = {
        'rf': {'accuracy': rf_stress_acc, 'precision': rf_stress_prec, 'recall': rf_stress_rec, 'f1_score': rf_stress_f1},
        'xgb': {'accuracy': xgb_stress_acc, 'precision': xgb_stress_prec, 'recall': xgb_stress_rec, 'f1_score': xgb_stress_f1}
    }
    
    # Save best Stress model
    best_stress_model = rf_stress if rf_stress_f1 >= xgb_stress_f1 else xgb_stress
    best_stress_name = 'rf' if rf_stress_f1 >= xgb_stress_f1 else 'xgb'
    metrics['stress']['best'] = best_stress_name
    
    joblib.dump(rf_stress, 'backend/app/ml/models/stress_model_rf.joblib')
    joblib.dump(xgb_stress, 'backend/app/ml/models/stress_model_xgb.joblib')
    
    # ==================== 2. BURNOUT RISK MODELS ====================
    print("\n--- Training Burnout Risk Models ---")
    
    # Random Forest Classifier
    rf_burnout = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=12)
    rf_burnout.fit(X_train_scaled, y_burnout_train)
    rf_burnout_preds = rf_burnout.predict(X_test_scaled)
    rf_burnout_acc = accuracy_score(y_burnout_test, rf_burnout_preds)
    rf_burnout_prec, rf_burnout_rec, rf_burnout_f1, _ = precision_recall_fscore_support(y_burnout_test, rf_burnout_preds, average='weighted')
    
    # XGBoost Classifier
    xgb_burnout = xgb.XGBClassifier(n_estimators=100, random_state=42, max_depth=6, learning_rate=0.1)
    xgb_burnout.fit(X_train_scaled, y_burnout_train)
    xgb_burnout_preds = xgb_burnout.predict(X_test_scaled)
    xgb_burnout_acc = accuracy_score(y_burnout_test, xgb_burnout_preds)
    xgb_burnout_prec, xgb_burnout_rec, xgb_burnout_f1, _ = precision_recall_fscore_support(y_burnout_test, xgb_burnout_preds, average='weighted')
    
    print(f"Random Forest Burnout Accuracy: {rf_burnout_acc:.4f} | F1-Score: {rf_burnout_f1:.4f}")
    print(f"XGBoost Burnout Accuracy: {xgb_burnout_acc:.4f} | F1-Score: {xgb_burnout_f1:.4f}")
    
    metrics['burnout'] = {
        'rf': {'accuracy': rf_burnout_acc, 'precision': rf_burnout_prec, 'recall': rf_burnout_rec, 'f1_score': rf_burnout_f1},
        'xgb': {'accuracy': xgb_burnout_acc, 'precision': xgb_burnout_prec, 'recall': xgb_burnout_rec, 'f1_score': xgb_burnout_f1}
    }
    
    # Save best Burnout model
    best_burnout_model = rf_burnout if rf_burnout_f1 >= xgb_burnout_f1 else xgb_burnout
    best_burnout_name = 'rf' if rf_burnout_f1 >= xgb_burnout_f1 else 'xgb'
    metrics['burnout']['best'] = best_burnout_name
    
    joblib.dump(rf_burnout, 'backend/app/ml/models/burnout_model_rf.joblib')
    joblib.dump(xgb_burnout, 'backend/app/ml/models/burnout_model_xgb.joblib')
    
    # ==================== 3. MENTAL WELLNESS SCORE MODELS ====================
    print("\n--- Training Mental Wellness Score Models ---")
    
    # Random Forest Regressor
    rf_well = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=12)
    rf_well.fit(X_train_scaled, y_wellness_train)
    rf_well_preds = rf_well.predict(X_test_scaled)
    rf_well_mse = mean_squared_error(y_wellness_test, rf_well_preds)
    rf_well_r2 = r2_score(y_wellness_test, rf_well_preds)
    
    # XGBoost Regressor
    xgb_well = xgb.XGBRegressor(n_estimators=100, random_state=42, max_depth=6, learning_rate=0.1)
    xgb_well.fit(X_train_scaled, y_wellness_train)
    xgb_well_preds = xgb_well.predict(X_test_scaled)
    xgb_well_mse = mean_squared_error(y_wellness_test, xgb_well_preds)
    xgb_well_r2 = r2_score(y_wellness_test, xgb_well_preds)
    
    print(f"Random Forest Wellness MSE: {rf_well_mse:.4f} | R2 Score: {rf_well_r2:.4f}")
    print(f"XGBoost Wellness MSE: {xgb_well_mse:.4f} | R2 Score: {xgb_well_r2:.4f}")
    
    metrics['wellness'] = {
        'rf': {'mse': rf_well_mse, 'r2': rf_well_r2},
        'xgb': {'mse': xgb_well_mse, 'r2': xgb_well_r2}
    }
    
    best_well_name = 'rf' if rf_well_r2 >= xgb_well_r2 else 'xgb'
    metrics['wellness']['best'] = best_well_name
    
    joblib.dump(rf_well, 'backend/app/ml/models/wellness_model_rf.joblib')
    joblib.dump(xgb_well, 'backend/app/ml/models/wellness_model_xgb.joblib')
    
    # 4. Save Metrics & Feature names
    metrics['features'] = feature_names
    metrics['sample_size'] = len(df)
    
    with open('backend/app/ml/models/model_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)
        
    print("\nModel metrics saved to backend/app/ml/models/model_metrics.json")
    print("All models successfully trained and serialized.")

if __name__ == '__main__':
    train_and_evaluate()
