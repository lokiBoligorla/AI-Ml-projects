from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.database_models import User, PredictionHistory
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Student Analytics"])

@router.get("/trends")
def get_student_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Fetch all prediction histories sorted chronologically
        history = db.query(PredictionHistory)\
            .filter(PredictionHistory.user_id == current_user.id)\
            .order_by(PredictionHistory.created_at.asc())\
            .all()
            
        if not history:
            return {
                "has_data": False,
                "summary": {},
                "chart_data": []
            }
            
        chart_data = []
        total_sleep = 0.0
        total_study = 0.0
        total_screen = 0.0
        total_exercise = 0.0
        
        for pred in history:
            chart_data.append({
                "date": pred.created_at.strftime("%b %d"),
                "wellness_score": round(pred.wellness_score, 1),
                "stress_level": pred.stress_level,
                "burnout_risk": pred.burnout_risk,
                "sleep_hours": pred.sleep_hours,
                "study_hours": pred.study_hours,
                "screen_time": pred.screen_time,
                "exercise_hours": pred.exercise_hours,
                "academic_pressure": pred.academic_pressure,
                "attendance_pct": pred.attendance_pct
            })
            total_sleep += pred.sleep_hours
            total_study += pred.study_hours
            total_screen += pred.screen_time
            total_exercise += pred.exercise_hours
            
        count = len(history)
        
        summary = {
            "total_checkins": count,
            "average_wellness": round(sum(p.wellness_score for p in history) / count, 1),
            "average_sleep": round(total_sleep / count, 1),
            "average_study": round(total_study / count, 1),
            "average_screen": round(total_screen / count, 1),
            "average_exercise": round(total_exercise / count, 1),
            "latest_stress": history[-1].stress_level,
            "latest_burnout": history[-1].burnout_risk,
            "latest_wellness": round(history[-1].wellness_score, 1)
        }
        
        return {
            "has_data": True,
            "summary": summary,
            "chart_data": chart_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load user analytics: {str(e)}"
        )
