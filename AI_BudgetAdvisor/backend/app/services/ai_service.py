import os
import json
from backend.app.config import settings

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_initialized = False
        self._setup_client()

    def _setup_client(self):
        """Initializes Gemini API if key is present."""
        if not self.api_key:
            print("[!] GEMINI_API_KEY is not set. AI Advisor will operate in highly-intelligent offline simulation mode.")
            return
            
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
            self.model_initialized = True
            print("[*] Gemini 1.5 Client initialized successfully.")
        except Exception as e:
            print(f"[!] Error configuring Gemini Client: {e}. Falling back to simulation mode.")

    def generate_savings_insights(self, monthly_income: float, category_totals: dict, anomalies: list) -> list:
        """
        Generates actionable savings insights based on current aggregates and anomalies.
        """
        total_expense = sum(category_totals.values())
        savings = monthly_income - total_expense
        savings_ratio = (savings / monthly_income) * 100 if monthly_income > 0 else 0
        
        # Build strict structured prompt
        prompt = f"""
        Analyze this user's monthly budget profile and generate 3 highly personalized, actionable savings insights.
        Keep the response as a valid JSON array of 3 strings. Do not include markdown code block formatting, just the raw JSON.
        
        Monthly Income: {monthly_income} INR
        Total Expense: {total_expense} INR
        Current Savings: {savings} INR (Savings Ratio: {savings_ratio:.1f}%)
        
        Category-wise Expenses:
        {json.dumps(category_totals, indent=2)}
        
        Anomalies Found:
        {json.dumps([a.get('reason', '') for a in anomalies][:3], indent=2)}
        
        Provide highly concrete, numbers-driven suggestions:
        1. Target the category with the highest spend (excluding Hostel/Education if they are fixed).
        2. Give a tip about the flagged anomalies (if any).
        3. Suggest a realistic student/household-friendly daily budget limit to boost savings by 15%.
        """
        
        if self.model_initialized:
            try:
                response = self.model.generate_content(prompt)
                text = response.text.strip()
                # Clean up any potential markdown wraps
                if text.startswith("```json"):
                    text = text.split("```json")[1].split("```")[0].strip()
                elif text.startswith("```"):
                    text = text.split("```")[1].split("```")[0].strip()
                insights = json.loads(text)
                if isinstance(insights, list) and len(insights) > 0:
                    return insights
            except Exception as e:
                print(f"[!] Gemini generation failed: {e}. Executing simulation.")
                
        # High quality offline rules-based generator (Simulation Mode)
        insights = []
        
        # 1. Food insights
        food_spend = category_totals.get("Food", 0.0)
        if food_spend > monthly_income * 0.25:
            insights.append(f"Your food expenses ({food_spend:.0f} INR) make up over 25% of your income. Reducing online ordering by just 2 times a week can save up to 1,500 INR monthly.")
        else:
            insights.append("Your food expenses are well within the standard safety threshold. Maintain your current habit of eating at the hostel mess.")
            
        # 2. Anomaly insights
        if anomalies:
            insights.append(f"We detected a highly unusual transaction spike of {anomalies[0].get('amount', 0)} INR flagged under '{anomalies[0].get('category', '')}'. Review this alert in the Anomaly Dashboard immediately to prevent billing errors.")
        else:
            insights.append("Good job! No suspicious transactions or spending spikes were detected this month, ensuring high transaction integrity.")
            
        # 3. Category-specific optimization
        shopping_spend = category_totals.get("Shopping", 0.0)
        if shopping_spend > 3000:
            insights.append(f"Shopping and electronics ({shopping_spend:.0f} INR) are impacting your monthly cashflow. Try implementing a '48-hour cool-off rule' before clicking 'Buy Now' to curb impulsive buying.")
        else:
            daily_limit = (monthly_income - category_totals.get("Hostel", 0) - category_totals.get("Education", 0)) / 30
            insights.append(f"To raise your savings ratio to 20%, try limiting your daily non-fixed expenses (transport, tea, snacks) to {max(150.0, daily_limit * 0.85):.0f} INR.")
            
        return insights

    def generate_chat_response(self, user_message: str, history: list, category_totals: dict, monthly_income: float) -> dict:
        """
        Performs interactive, conversational financial counseling.
        """
        total_expense = sum(category_totals.values())
        
        prompt = f"""
        You are 'TaskFlow Finance AI' - a highly professional, friendly, and practical AI Financial Advisor and Budget Planner.
        The user is asking a question or requesting financial advice. Provide a structured, beautiful, and highly personalized response.
        If they are a student, give student-specific tips (hostel, mess hall, shared transport, part-time freelancing/stipends).
        
        Here is the user's financial profile:
        - Monthly Income: {monthly_income} INR
        - Total Monthly Expense: {total_expense} INR
        - Category Spending: {json.dumps(category_totals)}
        
        Chat History Summary:
        {json.dumps(history[-4:] if history else [])}
        
        User Message: "{user_message}"
        
        Structure your response. Provide 3 specific action items (recommendations) as separate, clean bullet points.
        """
        
        if self.model_initialized:
            try:
                response = self.model.generate_content(prompt)
                full_text = response.text.strip()
                
                # Split recommendations out or generate structured recommendations
                # Let's extract bullet points
                lines = full_text.split("\n")
                bullets = [line.strip().replace("*", "").replace("-", "").strip() for line in lines if (line.strip().startswith("*") or line.strip().startswith("-")) and len(line) > 10]
                if not bullets:
                    bullets = [
                        "Review your highest variable expense category this week.",
                        "Setup small automatic deposits into a savings wallet.",
                        "Log cash transactions manually to prevent budget leaks."
                    ]
                return {
                    "response": full_text,
                    "recommendations": bullets[:3]
                }
            except Exception as e:
                print(f"[!] Gemini chat generation failed: {e}. Executing simulation.")
                
        # Highly customized Offline Advisor Chat System
        msg = user_message.lower()
        response_text = ""
        recs = []
        
        if "budget" in msg or "save" in msg or "plan" in msg:
            response_text = f"Based on your profile, you are earning **{monthly_income:.2f} INR** and spending **{total_expense:.2f} INR** monthly. To optimize your budget:\n\n1. **Allocate 50-30-20 Rule**: Keep fixed costs (Hostel, Tuition) to 50%, lifestyle (Shopping, Entertainment) to 30%, and instantly allocate 20% into savings before spending.\n2. **Tackle Canteen Spends**: Small daily spends of 150 INR on coffee, tea, and snacks add up to 4,500 INR monthly. Consider bringing a thermos or prepaying for mess tokens.\n3. **Track Freelance Income**: Keep part-time earnings in a separate high-yield account instead of your main spending wallet."
            recs = [
                "Track daily snack spending limit of 100 INR.",
                "Automate a 10% transfer to your savings wallet on payday.",
                "Negotiate shared hostel/roommate splits using Splitwise."
            ]
        elif "hostel" in msg or "rent" in msg or "student" in msg:
            response_text = "Student life requires smart budgeting! Fixed expenses like hostel fees and college tuition cannot be changed, but you can optimize variable categories:\n\n- **Shared Commute**: Find travel buddies to share Uber/Ola Auto costs, or buy a monthly student metro pass.\n- **Mess vs Swiggy**: Every meal ordered online costs 3-4x more than hostel mess food. Set a strict rule: food delivery only on Saturdays.\n- **Second-hand Material**: Purchase college manuals, calculators, and novels from graduating seniors at a 60% discount."
            recs = [
                "Limit food delivery apps to weekends only.",
                "Buy a public transport pass instead of single cab rides.",
                "Buy second-hand lab manuals and textbooks."
            ]
        elif "anomaly" in msg or "suspicious" in msg or "fraud" in msg:
            response_text = "I have scanned your accounts. Anomaly detection is active. If you notice any highlighted red alerts, they represent transaction spikes or unusual time stamps (e.g. late night bills). Verify if these were double swipes or automated subscription renewals."
            recs = [
                "Check recent credit card statements for duplicate items.",
                "Review active Google Play or App Store subscriptions.",
                "Toggle online transactions OFF on cards when not in use."
            ]
        else:
            response_text = f"Hello! I am your AI Finance Advisor. I am currently monitoring your monthly spending of **{total_expense:.0f} INR**. You have saved **{max(0.0, monthly_income - total_expense):.0f} INR** this month.\n\nLet me know if you would like me to analyze your student expenses, outline a personalized monthly savings plan, or explain any flagged transaction anomalies!"
            recs = [
                "Ask me: 'How can I save money on hostel food?'",
                "Ask me: 'Create a custom budget plan for me.'",
                "Ask me: 'Explain my spending anomalies.'"
            ]
            
        return {
            "response": response_text,
            "recommendations": recs
        }

ai_service = AIService()
