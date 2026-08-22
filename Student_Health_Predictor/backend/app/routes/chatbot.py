from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database_models import User, PredictionHistory
from app.utils.security import get_current_user
import random

router = APIRouter(prefix="/api/chatbot", tags=["AI Wellness Chatbot"])

class ChatInput(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    context_used: bool

@router.post("/", response_model=ChatResponse)
def handle_chat_message(
    payload: ChatInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_msg = payload.message.lower().strip()
    
    # 1. Fetch latest prediction to inject context
    latest_pred = db.query(PredictionHistory)\
        .filter(PredictionHistory.user_id == current_user.id)\
        .order_by(PredictionHistory.created_at.desc())\
        .first()
        
    context_available = latest_pred is not None
    
    # Base clinical chatbot templates
    wellness_score = latest_pred.wellness_score if context_available else 75.0
    stress_lbl = ["Low", "Moderate", "High"][latest_pred.stress_level] if context_available else "Low"
    burnout_lbl = ["Low", "Moderate", "High"][latest_pred.burnout_risk] if context_available else "Low"
    sleep_h = latest_pred.sleep_hours if context_available else 7.0
    study_h = latest_pred.study_hours if context_available else 4.0
    screen_h = latest_pred.screen_time if context_available else 3.0
    
    # Friendly counselor salutation
    intro = f"Hi {current_user.name}! "
    
    # 2. Conversational Intent Classification
    if "hello" in user_msg or "hi" in user_msg or "hey" in user_msg:
        if context_available:
            reply = f"{intro}I'm here as your personal wellness coach. I've analyzed your latest assessment (Wellness Score: {wellness_score:.1f}/100). You are currently experiencing {stress_lbl} stress levels. What can I support you with today? (e.g. sleep improvement, study schedules, digital wellness)"
        else:
            reply = f"{intro}I'm your AI mental health coach. I see you haven't taken a lifestyle assessment yet! I highly recommend going to the 'Prediction Form' page, so we can analyze your academic pressure and customize a wellness blueprint. How can I help you today?"
            
    elif "sleep" in user_msg or "insomnia" in user_msg or "tired" in user_msg:
        if context_available and sleep_h < 6.0:
            reply = f"I noticed you are currently sleeping {sleep_h} hours a night. This is a primary driver behind your {stress_lbl} stress. Try establishing a 'digital curfew' by shutting off all devices 45 minutes before sleep. Also, drinking chamomile tea or reading a physical book can help downregulate your nervous system before bed. Would you like a guided relaxation schedule?"
        else:
            reply = "A regular sleep schedule is the cornerstone of cognitive performance! Try to wake up at the exact same time every morning to synchronize your circadian rhythm, and avoid consuming caffeine after 2 PM."
            
    elif "study" in user_msg or "exam" in user_msg or "pressure" in user_msg or "academic" in user_msg or "burnout" in user_msg:
        if context_available and (latest_pred.academic_pressure >= 4 or study_h > 8.0):
            reply = f"With {study_h} hours of daily studying and a reported Academic Pressure of {latest_pred.academic_pressure}/5, your Burnout Risk is marked as {burnout_lbl}. I strongly recommend installing the Pomodoro method: study for 25 minutes, then take a strict 5-minute break *away* from your desk. Also, try setting boundaries: declare Friday nights and Sundays as 'study-free' to recover."
        else:
            reply = "To manage academic stress, try dividing large tasks into bite-sized milestones. Utilize active recall (self-quizzing) and spaced repetition instead of marathon cramming sessions. You can also talk to your academic advisor if you feel overwhelmed."
            
    elif "screen" in user_msg or "phone" in user_msg or "social media" in user_msg or "computer" in user_msg:
        if context_available and screen_h > 6.0:
            reply = f"Your daily screen time is currently {screen_h} hours. High screen time elevates baseline cortisol and causes cognitive fatigue. Try setting a 'do-not-disturb' mode for 1-2 hours in the evening. Engage in a physical hobby like sketching, walking, or cooking to give your brain a visual break."
        else:
            reply = "Managing device screen time is vital for neurological rest. Try setting daily app limits for social media, and practice looking at something 20 feet away every 20 minutes to prevent digital eye strain."
            
    elif "relationship" in user_msg or "conflict" in user_msg or "friend" in user_msg:
        if context_available and latest_pred.relationship_stress >= 4:
            reply = f"I see your relationship strain index is high ({latest_pred.relationship_stress}/5). Social conflicts drastically drain mental energy. I recommend setting clear, polite boundaries with peers about your study time. Focus on direct, empathetic communication. If the issue is deep, reaching out to campus health counseling is an incredibly brave and helpful move."
        else:
            reply = "Healthy relationships and peer support are fantastic buffers against college stress. Set aside 30 minutes to have high-quality, offline chats with friends to keep your emotional batteries charged."

    elif "financial" in user_msg or "money" in user_msg or "job" in user_msg:
        if context_available and latest_pred.financial_stress >= 4:
            reply = f"Your financial stress is at level {latest_pred.financial_stress}/5. This is a heavy burden to carry alongside classes. I highly recommend visiting your university's student services department. They often have emergency grants, food banks, work-study openings, and basic budgeting workshops that can lift this pressure."
        else:
            reply = "Financial security plays a massive role in wellness. Creating a simple monthly budget and searching for student-focused scholarships or research assistantships are great proactive ways to build peace of mind."
            
    elif "anxious" in user_msg or "stress" in user_msg or "wellness" in user_msg or "depressed" in user_msg:
        if context_available and wellness_score < 50.0:
            reply = f"Your Wellness Score is at {wellness_score:.1f}/100, and your stress levels are {stress_lbl}. It is completely normal to feel overwhelmed. Right now, I want you to focus on the 'Rule of One': just do *one* small healthy thing today. Drink one glass of water, step outside for a 5-minute walk, or write down 2 things you are grateful for. Remember, your campus counseling team is always there to guide you, and taking that step is a sign of strength."
        else:
            reply = "When stress builds up, try 'box breathing': inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, and hold for 4 seconds. Repeating this three times immediately lowers your heart rate and activates the parasympathetic nervous system."
            
    else:
        # Default supportive response
        counselor_phrases = [
            "Remember that wellness is a continuous journey, not an all-or-nothing test. What small step can you take today?",
            "You are doing the best you can under heavy academic demands. Make sure to treat yourself with self-compassion.",
            "I'm here to support you. Let's look at sleep, diet, or screen time parameters together to see where we can make simple positive changes."
        ]
        reply = random.choice(counselor_phrases)
        if context_available:
            reply = f"Looking at your profile (Wellness: {wellness_score:.1f}, Stress: {stress_lbl}), " + reply
            
    return {
        "reply": reply,
        "context_used": context_available
    }
