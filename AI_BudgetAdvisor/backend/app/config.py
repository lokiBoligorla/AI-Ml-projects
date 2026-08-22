import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Personal Finance Advisor"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "SUPER_SECRET_JWT_SIGNING_KEY_1234567890!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finance.db")
    
    # AI / LLM Integration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Environment
    ENV: str = os.getenv("ENV", "development")
    
    class Config:
        case_sensitive = True

settings = Settings()
