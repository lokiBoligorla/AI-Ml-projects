from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.database_models import User, PredictionHistory
from app.utils.security import get_current_user
from app.services.ml_service import ml_service
from app.services.ai_advisor import AIAdvisor
from app.services.report_service import ReportService

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

# Pydantic schema for student form submission
class PredictionInput(BaseModel):
    age: int = Field(..., ge=10, le=100)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    sleep_hours: float = Field(..., ge=1.0, le=24.0)
    study_hours: float = Field(..., ge=0.0, le=24.0)
    screen_time: float = Field(..., ge=0.0, le=24.0)
    exercise_hours: float = Field(..., ge=0.0, le=24.0)
    social_level: int = Field(..., ge=1, le=5)
    academic_pressure: int = Field(..., ge=1, le=5)
    attendance_pct: float = Field(..., ge=0.0, le=100.0)
    diet_quality: str = Field(..., pattern="^(Healthy|Moderate|Unhealthy)$")
    financial_stress: int = Field(..., ge=1, le=5)
    relationship_stress: int = Field(..., ge=1, le=5)
    model_type: Optional[str] = "xgboost"  # "xgboost" or "random_forest"

class PredictionResponse(BaseModel):
    id: int
    stress_level: int
    burnout_risk: int
    wellness_score: float
    model_used: str
    feature_contributions: dict
    recommendations: dict

    class Config:
        from_attributes = True

@router.post("/", response_model=PredictionResponse)
def create_prediction(
    payload: PredictionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 1. Run ML prediction & SHAP
        results = ml_service.predict(payload.model_dump(), model_type=payload.model_type)
        
        # 2. Run Advisor Recommendations
        recommendations = AIAdvisor.generate_recommendations(payload.model_dump(), results)
        
        # 3. Save to SQL database
        db_prediction = PredictionHistory(
            user_id=current_user.id,
            age=payload.age,
            gender=payload.gender,
            sleep_hours=payload.sleep_hours,
            study_hours=payload.study_hours,
            screen_time=payload.screen_time,
            exercise_hours=payload.exercise_hours,
            social_level=payload.social_level,
            academic_pressure=payload.academic_pressure,
            attendance_pct=payload.attendance_pct,
            diet_quality=payload.diet_quality,
            financial_stress=payload.financial_stress,
            relationship_stress=payload.relationship_stress,
            stress_level=results['stress_level'],
            burnout_risk=results['burnout_risk'],
            wellness_score=results['wellness_score'],
            model_used=results['model_used']
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        # Return composite response
        return {
            "id": db_prediction.id,
            "stress_level": db_prediction.stress_level,
            "burnout_risk": db_prediction.burnout_risk,
            "wellness_score": db_prediction.wellness_score,
            "model_used": db_prediction.model_used,
            "feature_contributions": results['feature_contributions'],
            "recommendations": recommendations
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@router.get("/history")
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history = db.query(PredictionHistory)\
        .filter(PredictionHistory.user_id == current_user.id)\
        .order_by(PredictionHistory.created_at.desc())\
        .all()
    return history

@router.get("/{pred_id}/report")
def download_pdf_report(
    pred_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch prediction
    pred = db.query(PredictionHistory)\
        .filter(PredictionHistory.id == pred_id, PredictionHistory.user_id == current_user.id)\
        .first()
        
    if not pred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mental wellness log not found or access denied."
        )
        
    # Standardize inputs dict for recommender & PDF compiler
    inputs_dict = {
        "age": pred.age,
        "gender": pred.gender,
        "sleep_hours": pred.sleep_hours,
        "study_hours": pred.study_hours,
        "screen_time": pred.screen_time,
        "exercise_hours": pred.exercise_hours,
        "social_level": pred.social_level,
        "academic_pressure": pred.academic_pressure,
        "attendance_pct": pred.attendance_pct,
        "diet_quality": pred.diet_quality,
        "financial_stress": pred.financial_stress,
        "relationship_stress": pred.relationship_stress
    }
    
    predictions_dict = {
        "stress_level": pred.stress_level,
        "burnout_risk": pred.burnout_risk,
        "wellness_score": pred.wellness_score
    }
    
    # Generate recommender and compile PDF
    recommendations = AIAdvisor.generate_recommendations(inputs_dict, predictions_dict)
    pdf_buffer = ReportService.generate_pdf_report(
        student_name=current_user.name,
        inputs=inputs_dict,
        predictions=predictions_dict,
        recommendations=recommendations
    )
    
    # Return as file stream download
    filename = f"WellnessAI_Report_{current_user.name.replace(' ', '_')}_{datetime_now_str()}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

def datetime_now_str():
    from datetime import datetime
    return datetime.now().strftime("%Y%m%d_%H%M%S")
