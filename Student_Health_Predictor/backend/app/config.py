import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Student Mental Health & Stress Predictor"
    DEBUG: bool = True
    
    # Database
    # Default to SQLite for easy out-of-the-box local testing
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./student_health.db")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-student-wellness-platform-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # Model Paths
    MODELS_DIR: str = os.path.join(os.path.dirname(__file__), "ml", "models")
    SCALER_PATH: str = os.path.join(MODELS_DIR, "scaler.joblib")
    
    STRESS_RF_PATH: str = os.path.join(MODELS_DIR, "stress_model_rf.joblib")
    STRESS_XGB_PATH: str = os.path.join(MODELS_DIR, "stress_model_xgb.joblib")
    
    BURNOUT_RF_PATH: str = os.path.join(MODELS_DIR, "burnout_model_rf.joblib")
    BURNOUT_XGB_PATH: str = os.path.join(MODELS_DIR, "burnout_model_xgb.joblib")
    
    WELLNESS_RF_PATH: str = os.path.join(MODELS_DIR, "wellness_model_rf.joblib")
    WELLNESS_XGB_PATH: str = os.path.join(MODELS_DIR, "wellness_model_xgb.joblib")
    
    METRICS_PATH: str = os.path.join(MODELS_DIR, "model_metrics.json")
    
    class Config:
        case_sensitive = True

settings = Settings()
