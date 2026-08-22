class AIAdvisor:
    @staticmethod
    def generate_recommendations(inputs: dict, predictions: dict) -> dict:
        """
        Analyzes prediction scores and student lifestyle metrics to produce 
        hyper-personalized, contextual suggestions for wellness, study balance, and lifestyle.
        """
        stress_lvl = predictions['stress_level']
        burnout_lvl = predictions['burnout_risk']
        wellness_score = predictions['wellness_score']
        
        sleep = inputs['sleep_hours']
        study = inputs['study_hours']
        screen = inputs['screen_time']
        exercise = inputs['exercise_hours']
        social = inputs['social_level']
        pressure = inputs['academic_pressure']
        attendance = inputs['attendance_pct']
        diet = inputs['diet_quality'].lower()
        financial = inputs['financial_stress']
        relationship = inputs['relationship_stress']
        
        # Clinical & Lifestyle Assessments
        wellness_status = "Excellent" if wellness_score >= 80 else ("Moderate" if wellness_score >= 50 else "Critical")
        stress_labels = ["Low", "Moderate", "High"]
        burnout_labels = ["Low", "Moderate", "High"]
        
        # Lists of action items
        routines = []
        stress_reduction = []
        study_balance = []
        wellness_suggestions = []
        
        # 1. Sleep-based recommendations
        if sleep < 6.0:
            routines.append("Implement a strict digital curfew: Turn off all screens 45 minutes before bed to allow melatonin synthesis.")
            wellness_suggestions.append(f"Your sleep duration ({sleep}h) is below the threshold. Aim for an incremental increase of 30 mins/day to reach 7-8h.")
            stress_reduction.append("Short 15-20 min power naps in the early afternoon (before 3 PM) can help restore cognitive function when sleep is low.")
        else:
            routines.append("Maintain your consistent sleep schedule, waking up at the same time even on weekends to support circadian stability.")

        # 2. Screen Time-based recommendations
        if screen > 6.0:
            routines.append(f"Introduce the '20-20-20' rule: Every 20 minutes, look at an object 20 feet away for 20 seconds to ease eye strain from your {screen} hours of daily screen time.")
            stress_reduction.append("Practice a daily 'digital detox hour'—completely silence your phone for 60 minutes after your classes end.")
            
        # 3. Study / Academic Pressure recommendations
        if pressure >= 4 or study > 8.0:
            study_balance.append("Adopt the Pomodoro technique: 25 minutes of highly focused study followed by a strict 5-minute offline break.")
            study_balance.append("Establish 'Study-Free Zones' in your schedule: Block off Friday evenings or Sunday mornings entirely for non-academic hobbies.")
            stress_reduction.append("Incorporate 'box breathing' (inhale 4s, hold 4s, exhale 4s, hold 4s) during high academic pressure blocks.")
        else:
            study_balance.append("Continue with your current study pace. Try active recall and spaced repetition to maintain high study efficiency without long sessions.")

        # 4. Exercise / Activity recommendations
        if exercise < 1.5:
            routines.append("Start with micro-workouts: Just 10-15 minutes of brisk walking, stretching, or light bodyweight exercises daily.")
            wellness_suggestions.append("Increase your daily physical activity. Regular movement is clinically shown to act as a buffer against academic burnout.")
        else:
            wellness_suggestions.append("Excellent job on maintaining your exercise routine! This physical foundation strongly protects your wellness score.")

        # 5. Diet Quality recommendations
        if diet == 'unhealthy':
            routines.append("Switch sweet snacks for blood-sugar-stabilizing foods like nuts, berries, or yogurt to avoid mid-day energy crashes.")
            wellness_suggestions.append("Improve diet quality: High sugars/processed foods increase cortisol. Increase whole grains and leafy greens.")
        elif diet == 'moderate':
            routines.append("Gradually substitute processed items with fresh, high-protein options to sustain focus during long study blocks.")

        # 6. Social and Relationship recommendations
        if social <= 2 or relationship >= 4:
            stress_reduction.append("Seek low-stakes social connection: Set up a casual coffee chat or call a family member/friend for 15 minutes.")
            if relationship >= 4:
                stress_reduction.append("Practice assertive boundary setting: Communicate your study priorities clearly to friends and family to prevent relationship friction.")
        else:
            wellness_suggestions.append("Your positive social interaction level is helping maintain healthy dopamine and serotonin levels.")

        # 7. Financial Stress recommendations
        if financial >= 4:
            study_balance.append("Reduce textbook expenses by exploring open educational resource (OER) libraries or checking university book swap boards.")
            wellness_suggestions.append("High financial stress detected: Visit the campus financial aid office or student services to learn about scholarships, work-study, or financial workshops.")

        # 8. High Risk / High Stress Warnings
        if stress_lvl == 2 or burnout_lvl == 2:
            stress_reduction.insert(0, "CRITICAL: Schedule an appointment with your university's student health/counseling center. Speaking to a professional is the strongest proactive step.")
            study_balance.insert(0, "Actionable: Apply for academic extensions or consult your advisor to reduce your course load/work obligations immediately.")

        # Compile summaries
        custom_plan = {
            "status": wellness_status,
            "overall_summary": f"Your Wellness Score is {wellness_score}/100 ({wellness_status} level). Your Stress Level is {stress_labels[stress_lvl]} and your Burnout Risk is {burnout_labels[burnout_lvl]}.",
            "routines": routines[:3],
            "stress_reduction": stress_reduction[:3],
            "study_balance": study_balance[:3],
            "wellness_suggestions": wellness_suggestions[:3]
        }
        
        return custom_plan
