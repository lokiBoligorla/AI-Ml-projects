import os
import joblib
import pandas as pd
import numpy as np
import shap
from app.config import settings

class MLService:
    def __init__(self):
        self.scaler = None
        self.models = {}
        self.explainers = {}
        self.feature_names = []
        self.load_models()

    def load_models(self):
        try:
            print("Loading serialized ML models...")
            # Load scaler
            if os.path.exists(settings.SCALER_PATH):
                self.scaler = joblib.load(settings.SCALER_PATH)
            
            # Load classifiers
            if os.path.exists(settings.STRESS_RF_PATH):
                self.models['stress_rf'] = joblib.load(settings.STRESS_RF_PATH)
            if os.path.exists(settings.STRESS_XGB_PATH):
                self.models['stress_xgb'] = joblib.load(settings.STRESS_XGB_PATH)
                
            if os.path.exists(settings.BURNOUT_RF_PATH):
                self.models['burnout_rf'] = joblib.load(settings.BURNOUT_RF_PATH)
            if os.path.exists(settings.BURNOUT_XGB_PATH):
                self.models['burnout_xgb'] = joblib.load(settings.BURNOUT_XGB_PATH)
                
            # Load regressors
            if os.path.exists(settings.WELLNESS_RF_PATH):
                self.models['wellness_rf'] = joblib.load(settings.WELLNESS_RF_PATH)
            if os.path.exists(settings.WELLNESS_XGB_PATH):
                self.models['wellness_xgb'] = joblib.load(settings.WELLNESS_XGB_PATH)
                
            # Load feature names and metrics
            if os.path.exists(settings.METRICS_PATH):
                import json
                with open(settings.METRICS_PATH, 'r') as f:
                    metrics_data = json.load(f)
                    self.feature_names = metrics_data.get('features', [])
            
            # Pre-fit SHAP Tree Explainer on Random Forest Wellness model for lightning-fast real-time explanations
            if 'wellness_rf' in self.models:
                # TreeExplainer is extremely fast and doesn't require background samples for Random Forest
                self.explainers['wellness'] = shap.TreeExplainer(self.models['wellness_rf'])
                
            print("Successfully loaded all models and configured SHAP explainers.")
        except Exception as e:
            print(f"Error loading models: {str(e)}")

    def predict(self, input_data: dict, model_type: str = "xgboost") -> dict:
        """
        Runs predictions for Stress Level, Burnout Risk, and Mental Wellness Score.
        Returns prediction outputs along with SHAP explainability contributions.
        """
        if not self.scaler or not self.models:
            raise ValueError("ML Models are not fully loaded or initialized.")
            
        # Map raw fields to unified training features
        # Unified Names: 'Age', 'Gender_Num', 'Sleep_Hours', 'Work/Study_Hours_Feature', 
        # 'Screen_Time', 'Exercise_Hours', 'Social_Level', 'Academic_Pressure_Feature', 
        # 'Attendance_Pct', 'Diet_Quality', 'Financial_Stress_Feature', 'Relationship_Stress_Feature'
        gender_num = 1.0 if input_data['gender'].lower() == 'female' else (0.5 if input_data['gender'].lower() == 'other' else 0.0)
        diet_num = 3 if input_data['diet_quality'].lower() == 'healthy' else (1 if input_data['diet_quality'].lower() == 'unhealthy' else 2)
        
        feature_dict = {
            'Age': input_data['age'],
            'Gender_Num': gender_num,
            'Sleep_Hours': input_data['sleep_hours'],
            'Work/Study_Hours_Feature': input_data['study_hours'],
            'Screen_Time': input_data['screen_time'],
            'Exercise_Hours': input_data['exercise_hours'],
            'Social_Level': input_data['social_level'],
            'Academic_Pressure_Feature': input_data['academic_pressure'],
            'Attendance_Pct': input_data['attendance_pct'],
            'Diet_Quality': diet_num,
            'Financial_Stress_Feature': input_data['financial_stress'],
            'Relationship_Stress_Feature': input_data['relationship_stress']
        }
        
        # Create Dataframe and order features correctly
        df_input = pd.DataFrame([feature_dict])[self.feature_names]
        
        # Scale features
        scaled_input = self.scaler.transform(df_input)
        
        # Determine model keys
        suffix = "xgb" if model_type == "xgboost" else "rf"
        stress_model_key = f"stress_{suffix}"
        burnout_model_key = f"burnout_{suffix}"
        wellness_model_key = f"wellness_{suffix}"
        
        # Execute predictions
        stress_pred = int(self.models[stress_model_key].predict(scaled_input)[0])
        burnout_pred = int(self.models[burnout_model_key].predict(scaled_input)[0])
        wellness_pred = float(self.models[wellness_model_key].predict(scaled_input)[0])
        
        # Clip wellness score
        wellness_pred = max(0.0, min(100.0, wellness_pred))
        
        # Generate SHAP explainability for Mental Wellness Score
        shap_values = []
        feature_contributions = {}
        
        if 'wellness' in self.explainers:
            try:
                # Compute SHAP values
                shap_res = self.explainers['wellness'](df_input)
                # Extract SHAP values for the single sample
                vals = shap_res.values[0]
                
                # Format into a readable dictionary mapped to nice UI labels
                ui_label_map = {
                    'Age': 'Age',
                    'Gender_Num': 'Gender',
                    'Sleep_Hours': 'Sleep Hours',
                    'Work/Study_Hours_Feature': 'Study Hours',
                    'Screen_Time': 'Screen Time',
                    'Exercise_Hours': 'Exercise Duration',
                    'Social_Level': 'Social Interaction',
                    'Academic_Pressure_Feature': 'Academic Pressure',
                    'Attendance_Pct': 'Class Attendance',
                    'Diet_Quality': 'Diet Quality',
                    'Financial_Stress_Feature': 'Financial Pressure',
                    'Relationship_Stress_Feature': 'Relationship Stress'
                }
                
                for feat, val in zip(self.feature_names, vals):
                    ui_label = ui_label_map.get(feat, feat)
                    feature_contributions[ui_label] = float(val)
            except Exception as e:
                print(f"SHAP explanation failure: {str(e)}")
                
        # Return complete details
        return {
            "stress_level": stress_pred,          # 0: Low, 1: Medium, 2: High
            "burnout_risk": burnout_pred,          # 0: Low, 1: Medium, 2: High
            "wellness_score": round(wellness_pred, 1),
            "model_used": "XGBoost" if model_type == "xgboost" else "Random Forest",
            "feature_contributions": feature_contributions
        }

# Instantiate singleton
ml_service = MLService()
