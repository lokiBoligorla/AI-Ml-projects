from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    currency: Optional[str] = "INR"
    monthly_income: Optional[float] = 0.0
    savings_goal: Optional[float] = 0.0

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    currency: Optional[str] = None
    monthly_income: Optional[float] = None
    savings_goal: Optional[float] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionBase(BaseModel):
    date: datetime
    description: str
    amount: float
    category: str
    type: str  # expense, income
    source: Optional[str] = "Manual"

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    is_anomaly: bool
    anomaly_score: float
    created_at: datetime

    class Config:
        from_attributes = True

# Budget Schemas
class BudgetBase(BaseModel):
    category: str
    limit_amount: float
    month: str  # YYYY-MM

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    limit_amount: float

class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    spent_amount: float
    created_at: datetime

    class Config:
        from_attributes = True

# Forecast Schemas
class ForecastResponse(BaseModel):
    id: int
    category: str
    forecast_date: str
    expected_amount: float
    lower_bound: float
    upper_bound: float
    created_at: datetime

    class Config:
        from_attributes = True

# Anomaly Schemas
class AnomalyResponse(BaseModel):
    id: int
    transaction_id: int
    user_id: int
    risk_score: float
    reason: str
    status: str
    created_at: datetime
    transaction: TransactionResponse

    class Config:
        from_attributes = True

class AnomalyUpdate(BaseModel):
    status: str  # open, ignored, confirmed

# AI Recommendation Schemas
class AIRecommendationResponse(BaseModel):
    id: int
    type: str
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Chat Schemas
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    recommendations: List[str]

# Dashboard Metrics
class DashboardSummary(BaseModel):
    total_balance: float
    total_income: float
    total_expense: float
    budget_health_score: int
    recent_transactions: List[TransactionResponse]
    budget_alerts: List[str]
    savings_insights: List[str]

class AdminMetrics(BaseModel):
    total_users: int
    total_transactions: int
    anomaly_rate: float
    model_accuracy: float
    category_counts: dict

class FinancialProfileSetup(BaseModel):
    monthly_income: float
    savings_goal: float
    category_expenses: dict

