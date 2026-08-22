from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.database import get_db
from app.models.database_models import User, PredictionHistory
from app.utils.security import get_current_admin
from app.config import settings
import json
import os

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

@router.get("/dashboard")
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    try:
        # 1. Core aggregations
        total_students = db.query(User).filter(User.is_admin == False).count()
        total_predictions = db.query(PredictionHistory).count()
        
        avg_wellness = db.query(func.avg(PredictionHistory.wellness_score)).scalar() or 0.0
        avg_stress = db.query(func.avg(PredictionHistory.stress_level)).scalar() or 0.0
        avg_burnout = db.query(func.avg(PredictionHistory.burnout_risk)).scalar() or 0.0
        
        # 2. Risk Level Distributions
        low_stress_cnt = db.query(PredictionHistory).filter(PredictionHistory.stress_level == 0).count()
        med_stress_cnt = db.query(PredictionHistory).filter(PredictionHistory.stress_level == 1).count()
        high_stress_cnt = db.query(PredictionHistory).filter(PredictionHistory.stress_level == 2).count()
        
        # 3. Compile a list of high-risk students (latest prediction shows high stress, high burnout, or wellness < 50)
        # To get the latest prediction for each user:
        subquery = db.query(
            PredictionHistory.user_id,
            func.max(PredictionHistory.created_at).label('max_date')
        ).group_by(PredictionHistory.user_id).subquery()
        
        latest_predictions = db.query(PredictionHistory)\
            .join(subquery, (PredictionHistory.user_id == subquery.c.user_id) & (PredictionHistory.created_at == subquery.c.max_date))\
            .all()
            
        high_risk_students = []
        for pred in latest_predictions:
            if pred.stress_level == 2 or pred.burnout_risk == 2 or pred.wellness_score < 50.0:
                high_risk_students.append({
                    "id": pred.id,
                    "student_name": pred.user.name,
                    "student_email": pred.user.email,
                    "age": pred.age,
                    "gender": pred.gender,
                    "stress_level": pred.stress_level,
                    "burnout_risk": pred.burnout_risk,
                    "wellness_score": round(pred.wellness_score, 1),
                    "logged_at": pred.created_at.strftime("%Y-%m-%d %H:%M")
                })
                
        # 4. Load ML pipeline metrics comparing RF vs XGBoost
        model_metrics = {}
        if os.path.exists(settings.METRICS_PATH):
            with open(settings.METRICS_PATH, 'r') as f:
                model_metrics = json.load(f)
                
        return {
            "stats": {
                "total_students": total_students,
                "total_predictions": total_predictions,
                "average_wellness_score": round(avg_wellness, 1),
                "average_stress_level": round(avg_stress, 2),
                "average_burnout_risk": round(avg_burnout, 2)
            },
            "distributions": {
                "stress": {
                    "low": low_stress_cnt,
                    "medium": med_stress_cnt,
                    "high": high_stress_cnt
                }
            },
            "high_risk_students": high_risk_students,
            "model_metrics": model_metrics
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch admin stats: {str(e)}"
        )
