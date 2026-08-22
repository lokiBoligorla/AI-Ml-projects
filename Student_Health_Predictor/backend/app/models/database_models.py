from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    predictions = relationship("PredictionHistory", back_populates="user", cascade="all, delete-orphan")

class PredictionHistory(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Input student features
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    sleep_hours = Column(Float, nullable=False)
    study_hours = Column(Float, nullable=False)
    screen_time = Column(Float, nullable=False)
    exercise_hours = Column(Float, nullable=False)
    social_level = Column(Integer, nullable=False)
    academic_pressure = Column(Integer, nullable=False)
    attendance_pct = Column(Float, nullable=False)
    diet_quality = Column(String, nullable=False)
    financial_stress = Column(Integer, nullable=False)
    relationship_stress = Column(Integer, nullable=False)
    
    # ML predicted outcomes
    stress_level = Column(Integer, nullable=False)       # 0: Low, 1: Medium, 2: High
    burnout_risk = Column(Integer, nullable=False)       # 0: Low, 1: Medium, 2: High
    wellness_score = Column(Float, nullable=False)       # 0.0 to 100.0
    model_used = Column(String, default="xgboost")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="predictions")
