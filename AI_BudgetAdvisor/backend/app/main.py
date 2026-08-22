from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import pandas as pd
import io
import os
import joblib

from backend.app.config import settings
from backend.app.database import engine, Base, get_db
from backend.app import models, schemas, auth
from backend.app.services.ml_service import ml_service
from backend.app.services.ai_service import ai_service


# Auto-create tables on startup for simplicity in SQLite local development
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all. In prod, restrict.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- AUTHENTICATION ENDPOINTS -----------------

@app.post(f"{settings.API_V1_STR}/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = auth.get_password_hash(user_in.password)
    user = models.User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        currency=user_in.currency,
        monthly_income=user_in.monthly_income,
        role="admin" if user_in.email.startswith("admin") else "user"  # Auto-admin for admin@...
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Initialize some default budgets for the new user
    default_categories = ["Food", "Transport", "Shopping", "Education", "Entertainment", "Bills", "Hostel"]
    current_month = datetime.now().strftime("%Y-%m")
    for cat in default_categories:
        limit = 5000.0 if cat in ["Food", "Hostel", "Education"] else 1500.0
        budget = models.Budget(
            user_id=user.id,
            category=cat,
            limit_amount=limit,
            spent_amount=0.0,
            month=current_month
        )
        db.add(budget)
    db.commit()
    
    return user

@app.post(f"{settings.API_V1_STR}/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

# ----------------- USER PROFILE ENDPOINTS -----------------

@app.get(f"{settings.API_V1_STR}/user/profile", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put(f"{settings.API_V1_STR}/user/profile", response_model=schemas.UserResponse)
def update_profile(user_in: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.currency is not None:
        current_user.currency = user_in.currency
    if user_in.monthly_income is not None:
        current_user.monthly_income = user_in.monthly_income
    if user_in.password is not None:
        current_user.hashed_password = auth.get_password_hash(user_in.password)
        
    db.commit()
    db.refresh(current_user)
    return current_user

# ----------------- FINANCIAL PROFILE SETUP ENDPOINT -----------------

@app.post(f"{settings.API_V1_STR}/setup-financial-profile", status_code=status.HTTP_200_OK)
def setup_financial_profile(payload: schemas.FinancialProfileSetup, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    import random
    from datetime import timedelta
    
    # 1. Update user profile details
    current_user.monthly_income = payload.monthly_income
    current_user.savings_goal = payload.savings_goal
    db.add(current_user)
    db.commit()
    
    # 2. Clear out user's old budget, transaction, forecast, recommendation and anomaly records
    db.query(models.Anomaly).filter(models.Anomaly.user_id == current_user.id).delete()
    db.query(models.Forecast).filter(models.Forecast.user_id == current_user.id).delete()
    db.query(models.AIRecommendation).filter(models.AIRecommendation.user_id == current_user.id).delete()
    db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).delete()
    db.query(models.Budget).filter(models.Budget.user_id == current_user.id).delete()
    db.commit()
    
    # 3. Create fresh Budgets for past month and current month
    current_month_str = datetime.now().strftime("%Y-%m")
    last_month_date = datetime.now() - timedelta(days=30)
    last_month_str = last_month_date.strftime("%Y-%m")
    
    months_to_seed = [last_month_str, current_month_str]
    
    # Allocate category budgets based on user expenses target
    for cat, monthly_target in payload.category_expenses.items():
        for m_str in months_to_seed:
            budget = models.Budget(
                user_id=current_user.id,
                category=cat,
                limit_amount=float(monthly_target),
                spent_amount=0.0,
                month=m_str
            )
            db.add(budget)
    db.commit()
    
    # 4. Generate transaction ledger distributed across past 45 days
    # Natural description templates for each category
    desc_templates = {
        "Food": ["Swiggy Delivery Hyd Canteen", "Zomato Dineout Jubilee Hills", "Campus Cafeteria Coffee", "Instamart Groceries Supermarket", "Starbucks Coffee Cafe", "Pizza Hut Dinner Outing", "Blinkit Grocery Delivery", "Amul Ice Cream Parlour", "Maggi Point Late Night"],
        "Transport": ["Uber Auto Ride Campus", "Ola Cab Ride Metro Station", "Rapido Bike Taxi Ride", "Metro Smartcard Auto Recharge", "Auto Rickshaw local cash", "Fuel Petrol Pump refuel", "Bus Ticket City Transport"],
        "Shopping": ["Amazon Online Shopping Cart", "Myntra Clothing Fashion Haul", "Decathlon Sports Gear Bottle", "Zara Outlet mall shopping", "H&M Graphic Tees and jeans", "Flipkart Electronics Accessory", "Ajio Casual Shoes order"],
        "Education": ["College Bookstore textbook", "Udemy Online Python Course", "Coursera Certificate fee", "Stationery Notebooks & Pens", "Exam Registration Fee S2"],
        "Entertainment": ["PVR Cinemas Movie Ticket", "Netflix Premium monthly renewal", "Spotify Family Music subscription", "Bowling Alley Weekend Outing", "Gaming Zone Arcade pass", "BookMyShow Standup comedy"],
        "Bills": ["Hostel Room AC Surcharge", "Airtel Fiber Broadband Wifi", "Jio Prepaid Mobile Recharge", "Electricity Board Power Bill", "Water utility service charge"],
        "Healthcare": ["Apollo Pharmacy medicine", "Dental Clinic checkup", "GNC Health Supplement Vitamins", "Ophthalmic Eye Checkup & lens", "First Aid Kit Bandages"],
        "Hostel": ["Hostel Mess Food Mess Mes", "Hostel Room rent utility bill"],
        "Travel": ["MakeMyTrip Flight Booking", "IRCTC Train ticket reservation", "RedBus sleeper tickets holiday", "Uber Intercity Outstation"],
        "Miscellaneous": ["Local Kirana Provision store", "Gpay transfer to roommate", "ATM Cash withdrawal self", "Laundry washing service charge", "Photocopy and binding sheets"]
    }
    
    # Standard payments
    payment_sources = ["UPI", "Credit Card", "NetBanking", "Cash"]
    
    # Income streams (seed active incomes)
    for m_str in months_to_seed:
        # Create monthly main income deposit
        main_inc = models.Transaction(
            user_id=current_user.id,
            date=datetime.strptime(f"{m_str}-01 10:00:00", "%Y-%m-%d %H:%M:%S"),
            description="Monthly TA Stipend College" if "stipend" in str(current_user.full_name).lower() else "Monthly Income Pay Deposit",
            amount=payload.monthly_income,
            category="Income",
            type="income",
            source="Bank Transfer",
            is_anomaly=False,
            anomaly_score=0.0
        )
        db.add(main_inc)
        
        # Add a small secondary freelance gig income
        freelance_date = datetime.strptime(f"{m_str}-15 14:30:00", "%Y-%m-%d %H:%M:%S")
        freelance_inc = models.Transaction(
            user_id=current_user.id,
            date=freelance_date,
            description="Freelance Web Design payment client",
            amount=random.choice([3000.0, 5000.0, 8000.0]),
            category="Income",
            type="income",
            source="UPI",
            is_anomaly=False,
            anomaly_score=0.0
        )
        db.add(freelance_inc)
    
    db.commit()
    
    # Seed Variable Expenses matching Category targets
    for cat, monthly_target in payload.category_expenses.items():
        if monthly_target <= 0:
            continue
            
        target_amount_45_days = float(monthly_target) * 1.5
        accumulated = 0.0
        
        # Keep adding transactions until we reach target
        while accumulated < target_amount_45_days:
            # Random amount between 1.5% and 8% of monthly target (so we get a beautiful ledger of multiple purchases)
            min_amt = max(50.0, float(monthly_target) * 0.015)
            max_amt = max(100.0, float(monthly_target) * 0.08)
            amt = round(random.uniform(min_amt, max_amt), 2)
            
            if accumulated + amt > target_amount_45_days * 1.05:
                break
                
            # Random date in last 45 days
            random_days_ago = random.randint(0, 45)
            random_hours = random.randint(8, 22)
            random_minutes = random.randint(0, 59)
            tx_date = datetime.now() - timedelta(days=random_days_ago)
            tx_date = tx_date.replace(hour=random_hours, minute=random_minutes, second=0, microsecond=0)
            
            # Select description
            desc_list = desc_templates.get(cat, desc_templates["Miscellaneous"])
            desc = random.choice(desc_list)
            
            # Select source
            src = random.choice(payment_sources)
            if "UPI" in desc:
                src = "UPI"
            elif "Credit Card" in desc or "Netflix" in desc or "Spotify" in desc:
                src = "Credit Card"
            elif "Rent" in desc or "Mess" in desc:
                src = "NetBanking"
                
            tx = models.Transaction(
                user_id=current_user.id,
                date=tx_date,
                description=desc,
                amount=amt,
                category=cat,
                type="expense",
                source=src,
                is_anomaly=False,
                anomaly_score=0.0
            )
            db.add(tx)
            accumulated += amt
            
    db.commit()
    
    # 5. Seed some highly realistic warning anomalies to test anomalies section!
    anomalies_to_add = [
        {
            "cat": "Shopping",
            "desc": "MIDNIGHT OUTLIER - EXCESSIVE JEWELLER TRADING",
            "amount": max(15000.0, float(payload.monthly_income) * 0.45),
            "reason": "Flagged severe risk outlier transaction. Amount represents an excessive monthly threshold overrun in Shopping.",
            "source": "Credit Card"
        },
        {
            "cat": "Entertainment",
            "desc": "VIP Weekend Luxury Resort Surcharge",
            "amount": max(8500.0, float(payload.monthly_income) * 0.20),
            "reason": "Flagged high-risk outlier transaction. Double the historical category standard.",
            "source": "Credit Card"
        }
    ]
    
    for idx, anom in enumerate(anomalies_to_add):
        random_days_ago = random.choice([2, 5, 8, 12])
        tx_date = datetime.now() - timedelta(days=random_days_ago)
        tx_date = tx_date.replace(hour=random.choice([0, 1, 2, 23]), minute=random.randint(0, 59), second=0, microsecond=0)
        
        tx = models.Transaction(
            user_id=current_user.id,
            date=tx_date,
            description=anom["desc"],
            amount=anom["amount"],
            category=anom["cat"],
            type="expense",
            source=anom["source"],
            is_anomaly=True,
            anomaly_score=random.uniform(75.0, 96.0)
        )
        db.add(tx)
        db.flush()
        
        anomaly_db = models.Anomaly(
            transaction_id=tx.id,
            user_id=current_user.id,
            risk_score=tx.anomaly_score,
            reason=anom["reason"],
            status="open"
        )
        db.add(anomaly_db)
        
    db.commit()
    
    # 6. Recalculate and update `spent_amount` for all budgets based on the seeded transactions!
    budgets = db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()
    
    for b in budgets:
        b.spent_amount = sum(t.amount for t in transactions if t.type == "expense" and t.category == b.category and t.date.strftime("%Y-%m") == b.month)
        db.add(b)
    db.commit()
    
    # 7. Trigger backend ML Retraining in the background so ARIMA forecasting and ML category metrics align instantly!
    try:
        df = pd.DataFrame([{
            "date": t.date,
            "description": t.description,
            "amount": t.amount,
            "category": t.category,
            "type": t.type,
            "source": t.source
        } for t in transactions])
        
        temp_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "datasets", "retrain_temp.csv")
        df.to_csv(temp_path, index=False)
        
        # Train
        ml_service.train_categorization_models(temp_path)
        ml_service.train_anomaly_detector(temp_path)
        
        # Reload models in memory
        ml_service.load_models()
        
        # Remove temp file
        try:
            os.remove(temp_path)
        except:
            pass
    except Exception as e:
        print(f"[!] Error during automatic ML profile retraining: {e}")
        
    # 8. Re-generate AI Recommendations based on new profile details!
    try:
        categories_list = list(payload.category_expenses.keys())
        current_month_tx = [t for t in transactions if t.date.strftime("%Y-%m") == current_month_str and t.type == "expense"]
        month_category_totals = {cat: sum(t.amount for t in current_month_tx if t.category == cat) for cat in categories_list}
        
        anomalies_active = db.query(models.Anomaly).filter(
            models.Anomaly.user_id == current_user.id,
            models.Anomaly.status == "open"
        ).all()
        anomaly_list = [{"amount": a.transaction.amount, "category": a.transaction.category, "reason": a.reason} for a in anomalies_active]
        
        raw_insights = ai_service.generate_savings_insights(
            current_user.monthly_income,
            month_category_totals,
            anomaly_list
        )
        
        # Store in DB
        for txt in raw_insights:
            rec = models.AIRecommendation(user_id=current_user.id, type="saving", content=txt)
            db.add(rec)
        db.commit()
    except Exception as e:
        print(f"[!] Error generating AI profile recommendations: {e}")
        rec1 = models.AIRecommendation(user_id=current_user.id, type="saving", content=f"Your target savings of ₹{payload.savings_goal:,.2f} represents {(payload.savings_goal/payload.monthly_income)*100:.1f}% of your monthly income. Aim to maintain this target by limiting variable costs.")
        rec2 = models.AIRecommendation(user_id=current_user.id, type="saving", content="We flagged high-risk anomalies in your Shopping category. Review those to secure up to ₹10,000 extra in savings.")
        db.add(rec1)
        db.add(rec2)
        db.commit()
        
    return {
        "status": "success",
        "message": "Financial profile updated and dynamic simulation ledger re-seeded successfully."
    }

# ----------------- TRANSACTION ENDPOINTS -----------------

@app.post(f"{settings.API_V1_STR}/predict-category")
def predict_category(payload: dict, current_user: models.User = Depends(auth.get_current_user)):
    desc = payload.get("description", "")
    if not desc:
        raise HTTPException(status_code=400, detail="Description is required")
    prediction = ml_service.predict_category(desc)
    return prediction

@app.post(f"{settings.API_V1_STR}/upload-transactions", status_code=status.HTTP_201_CREATED)
def upload_transactions(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    Parses bank or UPI statement CSV.
    Cleans datasets, categorizes expenses, runs anomaly detection and saves to DB.
    """
    contents = file.file.read()
    df = None
    try:
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV structure: {e}")
        
    required_cols = ["date", "description", "amount"]
    if not all(col in df.columns for col in required_cols):
        # Fallback to column index mapping if headers are named differently
        if len(df.columns) >= 3:
            df.columns = ["date", "description", "amount"] + list(df.columns[3:])
        else:
            raise HTTPException(status_code=400, detail="CSV must contain date, description, and amount fields.")
            
    added_count = 0
    anomalies_count = 0
    
    current_month_str = datetime.now().strftime("%Y-%m")
    
    for _, row in df.iterrows():
        try:
            # Parse Date
            try:
                date_parsed = pd.to_datetime(row["date"])
            except:
                date_parsed = datetime.now()
                
            desc = str(row["description"])
            amount = abs(float(row["amount"]))
            
            # Simple heuristic for income vs expense (if not provided, positive is income or vice-versa)
            tx_type = "expense"
            if "type" in df.columns:
                tx_type = str(row["type"]).lower()
            elif "credit" in desc.lower() or "salary" in desc.lower() or "deposit" in desc.lower() or "refund" in desc.lower() or "cashback" in desc.lower() or "received" in desc.lower() or "pocket money" in desc.lower():
                tx_type = "income"
                
            source = "Manual"
            if "source" in df.columns:
                source = str(row["source"])
            elif "upi" in desc.lower() or "gpay" in desc.lower() or "paytm" in desc.lower():
                source = "UPI"
            elif "card" in desc.lower() or "visa" in desc.lower() or "pos" in desc.lower():
                source = "Credit Card"
            elif "atm" in desc.lower() or "cash" in desc.lower():
                source = "Cash"
                
            # NLP Prediction
            if tx_type == "income":
                category = "Income"
            else:
                pred = ml_service.predict_category(desc)
                category = pred["category"]
                
            # Anomaly Scoring (only on expenses)
            is_anomaly = False
            anomaly_score = 0.0
            anomaly_reason = ""
            if tx_type == "expense":
                anomaly_res = ml_service.detect_anomaly(amount, date_parsed, category)
                is_anomaly = anomaly_res["is_anomaly"]
                anomaly_score = anomaly_res["anomaly_score"]
                anomaly_reason = anomaly_res["reason"]
                
            # Save transaction
            transaction = models.Transaction(
                user_id=current_user.id,
                date=date_parsed,
                description=desc,
                amount=amount,
                category=category,
                type=tx_type,
                source=source,
                is_anomaly=is_anomaly,
                anomaly_score=anomaly_score
            )
            db.add(transaction)
            db.flush() # Populate ID
            
            # If anomalous, create entry in anomalies table
            if is_anomaly:
                anomalies_count += 1
                anomaly_db = models.Anomaly(
                    transaction_id=transaction.id,
                    user_id=current_user.id,
                    risk_score=anomaly_score,
                    reason=anomaly_reason,
                    status="open"
                )
                db.add(anomaly_db)
                
            # Update budget spending in this category for the month
            if tx_type == "expense":
                tx_month_str = date_parsed.strftime("%Y-%m")
                budget = db.query(models.Budget).filter(
                    models.Budget.user_id == current_user.id,
                    models.Budget.category == category,
                    models.Budget.month == tx_month_str
                ).first()
                if budget:
                    budget.spent_amount += amount
                else:
                    # Create budget automatically if missing
                    new_budget = models.Budget(
                        user_id=current_user.id,
                        category=category,
                        limit_amount=5000.0 if category in ["Food", "Hostel", "Education"] else 1500.0,
                        spent_amount=amount,
                        month=tx_month_str
                    )
                    db.add(new_budget)
                    
            added_count += 1
        except Exception as inner_e:
            print(f"[!] Row skipped due to error: {inner_e}")
            continue
            
    db.commit()
    return {
        "status": "success",
        "uploaded_records": added_count,
        "anomalies_detected": anomalies_count
    }

# ----------------- ANALYTICS & DASHBOARD ENDPOINTS -----------------

@app.get(f"{settings.API_V1_STR}/analytics/summary", response_model=schemas.DashboardSummary)
def get_analytics_summary(month: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not month:
        month = datetime.now().strftime("%Y-%m")
        
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(models.Transaction.date.desc()).all()
    
    # Filter by month
    month_tx = [t for t in transactions if t.date.strftime("%Y-%m") == month]
    
    total_income = sum(t.amount for t in month_tx if t.type == "income")
    total_expense = sum(t.amount for t in month_tx if t.type == "expense")
    total_balance = current_user.monthly_income + total_income - total_expense
    
    # Aggregated spending per category
    category_totals = {}
    for t in month_tx:
        if t.type == "expense":
            category_totals[t.category] = category_totals.get(t.category, 0.0) + t.amount
            
    # Budget alerts & Health calculation
    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.month == month
    ).all()
    
    budget_alerts = []
    overruns_count = 0
    for b in budgets:
        # Re-sync spent amount to ensure accuracy
        actual_spend = sum(t.amount for t in month_tx if t.type == "expense" and t.category == b.category)
        b.spent_amount = actual_spend
        db.add(b)
        
        if b.spent_amount > b.limit_amount:
            overruns_count += 1
            budget_alerts.append(f"Budget exceeded in {b.category}! Spent {b.spent_amount:.0f}/{b.limit_amount:.0f} INR.")
        elif b.spent_amount > b.limit_amount * 0.85:
            budget_alerts.append(f"Warning: {b.category} budget is at {((b.spent_amount/b.limit_amount)*100):.0f}% limit.")
    db.commit()
    
    # Calculate health score: start from 100, deduct for budget overruns, excessive spending ratio, and anomalies
    health_score = 100
    if total_income > 0 or current_user.monthly_income > 0:
        inc = current_user.monthly_income if current_user.monthly_income > 0 else total_income
        expense_ratio = total_expense / inc
        if expense_ratio > 0.9:
            health_score -= 25
        elif expense_ratio > 0.7:
            health_score -= 10
            
    health_score -= (overruns_count * 15)
    
    anomalies_active = db.query(models.Anomaly).filter(
        models.Anomaly.user_id == current_user.id,
        models.Anomaly.status == "open"
    ).all()
    health_score -= (len(anomalies_active) * 5)
    health_score = max(10, min(100, health_score))
    
    # Fetch AI Recommendations
    # If none present, automatically generate a few using the AI service and cache them
    db_recs = db.query(models.AIRecommendation).filter(
        models.AIRecommendation.user_id == current_user.id
    ).order_by(models.AIRecommendation.created_at.desc()).limit(3).all()
    
    savings_insights = []
    if db_recs:
        savings_insights = [r.content for r in db_recs]
    else:
        # Build category totals representing full history or current month
        categories_list = ["Food", "Transport", "Shopping", "Education", "Entertainment", "Bills", "Healthcare", "Hostel", "Travel", "Miscellaneous"]
        full_category_totals = {cat: category_totals.get(cat, 0.0) for cat in categories_list}
            
        anomaly_list = [{"amount": a.transaction.amount, "category": a.transaction.category, "reason": a.reason} for a in anomalies_active]
        raw_insights = ai_service.generate_savings_insights(
            current_user.monthly_income if current_user.monthly_income > 0 else 25000.0,
            full_category_totals,
            anomaly_list
        )
        # Store in DB
        for txt in raw_insights:
            rec = models.AIRecommendation(user_id=current_user.id, type="saving", content=txt)
            db.add(rec)
        db.commit()
        savings_insights = raw_insights
        
    # Serialize recent transactions
    recent_transactions = [
        schemas.TransactionResponse.from_orm(t) for t in transactions[:8]
    ]
    
    return {
        "total_balance": total_balance,
        "total_income": total_income,
        "total_expense": total_expense,
        "budget_health_score": int(health_score),
        "recent_transactions": recent_transactions,
        "budget_alerts": budget_alerts,
        "savings_insights": savings_insights
    }

# ----------------- TIME-SERIES FORECAST ENDPOINT -----------------

@app.get(f"{settings.API_V1_STR}/forecast/monthly", response_model=List[schemas.ForecastResponse])
def get_monthly_forecast(category: str = "All", db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    Retrieves time-series forecast projections for the next 3 months.
    Saves generated projections into the database for historic tracking.
    """
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).all()
    
    df_tx = pd.DataFrame([{
        "date": t.date,
        "amount": t.amount,
        "category": t.category,
        "type": t.type
    } for t in transactions])
    
    forecasts = ml_service.generate_spending_forecast(df_tx, category)
    
    response_list = []
    # Save/update forecasts in DB
    for f in forecasts:
        db_f = db.query(models.Forecast).filter(
            models.Forecast.user_id == current_user.id,
            models.Forecast.category == f["category"],
            models.Forecast.forecast_date == f["forecast_date"]
        ).first()
        
        if db_f:
            db_f.expected_amount = f["expected_amount"]
            db_f.lower_bound = f["lower_bound"]
            db_f.upper_bound = f["upper_bound"]
        else:
            db_f = models.Forecast(
                user_id=current_user.id,
                category=f["category"],
                forecast_date=f["forecast_date"],
                expected_amount=f["expected_amount"],
                lower_bound=f["lower_bound"],
                upper_bound=f["upper_bound"]
            )
            db.add(db_f)
        db.commit()
        db.refresh(db_f)
        response_list.append(db_f)
        
    return response_list

# ----------------- ANOMALY ALERT ENDPOINTS -----------------

@app.get(f"{settings.API_V1_STR}/anomalies", response_model=List[schemas.AnomalyResponse])
def get_anomalies(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    anomalies = db.query(models.Anomaly).join(models.Transaction).filter(
        models.Anomaly.user_id == current_user.id
    ).order_by(models.Anomaly.risk_score.desc()).all()
    return anomalies

@app.put(f"{settings.API_V1_STR}/anomalies/{{id}}", response_model=schemas.AnomalyResponse)
def update_anomaly_status(id: int, payload: schemas.AnomalyUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    anomaly = db.query(models.Anomaly).filter(
        models.Anomaly.id == id,
        models.Anomaly.user_id == current_user.id
    ).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
        
    anomaly.status = payload.status
    db.commit()
    db.refresh(anomaly)
    return anomaly

# ----------------- AI CHAT BOT ENDPOINT -----------------

@app.post(f"{settings.API_V1_STR}/ai-advisor/chat", response_model=schemas.ChatResponse)
def chat_with_advisor(payload: schemas.ChatRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # 1. Fetch user expenses
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == "expense"
    ).all()
    
    category_totals = {}
    for t in transactions:
        category_totals[t.category] = category_totals.get(t.category, 0.0) + t.amount
        
    # Fetch historical chat summary (recommendations)
    recs = db.query(models.AIRecommendation).filter(
        models.AIRecommendation.user_id == current_user.id
    ).order_by(models.AIRecommendation.created_at.desc()).limit(5).all()
    
    history = [{"role": "assistant", "content": r.content} for r in recs]
    
    ai_response = ai_service.generate_chat_response(
        payload.message,
        history,
        category_totals,
        current_user.monthly_income
    )
    
    # Save assistant's answer as recommendation
    new_rec = models.AIRecommendation(
        user_id=current_user.id,
        type="budget",
        content=ai_response["response"]
    )
    db.add(new_rec)
    db.commit()
    
    return ai_response

# ----------------- BUDGET ENDPOINTS -----------------

@app.get(f"{settings.API_V1_STR}/budgets", response_model=List[schemas.BudgetResponse])
def get_budgets(month: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not month:
        month = datetime.now().strftime("%Y-%m")
        
    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.month == month
    ).all()
    
    # Recalculate spent amounts dynamically
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == "expense"
    ).all()
    month_tx = [t for t in transactions if t.date.strftime("%Y-%m") == month]
    
    for b in budgets:
        b.spent_amount = sum(t.amount for t in month_tx if t.category == b.category)
        db.add(b)
    db.commit()
    
    return budgets

@app.post(f"{settings.API_V1_STR}/budgets", response_model=schemas.BudgetResponse)
def create_budget(budget_in: schemas.BudgetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.category == budget_in.category,
        models.Budget.month == budget_in.month
    ).first()
    
    if existing:
        existing.limit_amount = budget_in.limit_amount
        db.commit()
        db.refresh(existing)
        return existing
        
    # Calculate initial spent
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.category == budget_in.category,
        models.Transaction.type == "expense"
    ).all()
    spent = sum(t.amount for t in transactions if t.date.strftime("%Y-%m") == budget_in.month)
    
    budget = models.Budget(
        user_id=current_user.id,
        category=budget_in.category,
        limit_amount=budget_in.limit_amount,
        spent_amount=spent,
        month=budget_in.month
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

# ----------------- ADMIN DASHBOARD & RETRAINING ENDPOINTS -----------------

@app.get(f"{settings.API_V1_STR}/admin/metrics", response_model=schemas.AdminMetrics)
def get_admin_metrics(db: Session = Depends(get_db), admin_user: models.User = Depends(auth.get_admin_user)):
    total_users = db.query(models.User).count()
    total_tx = db.query(models.Transaction).count()
    anomalies_count = db.query(models.Transaction).filter(models.Transaction.is_anomaly == True).count()
    
    anomaly_rate = float(anomalies_count / total_tx) if total_tx > 0 else 0.0
    
    # Load ML metrics
    model_accuracy = 0.88  # Default baseline
    metrics_path = os.path.join(settings.DATABASE_URL.replace("sqlite:///./", "").replace("finance.db", ""), "models", "classification_metrics.joblib")
    # Clean check
    try:
        m_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "classification_metrics.joblib")
        if os.path.exists(m_path):
            metrics = joblib.load(m_path)
            model_accuracy = metrics.get("logistic_regression_accuracy", 0.88)
    except:
        pass
        
    # Group categories
    transactions = db.query(models.Transaction).filter(models.Transaction.type == "expense").all()
    cat_counts = {}
    for t in transactions:
        cat_counts[t.category] = cat_counts.get(t.category, 0) + 1
        
    return {
        "total_users": total_users,
        "total_transactions": total_tx,
        "anomaly_rate": float(round(anomaly_rate * 100, 2)),
        "model_accuracy": float(round(model_accuracy * 100, 2)),
        "category_counts": cat_counts
    }

@app.post(f"{settings.API_V1_STR}/admin/retrain")
def retrain_ml_models(db: Session = Depends(get_db), admin_user: models.User = Depends(auth.get_admin_user)):
    """
    Fetches all transactions in DB, exports to a temp CSV, and triggers retraining.
    """
    transactions = db.query(models.Transaction).all()
    if len(transactions) < 50:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient transactions in database ({len(transactions)}/50 required) to trigger retrain."
        )
        
    df = pd.DataFrame([{
        "date": t.date,
        "description": t.description,
        "amount": t.amount,
        "category": t.category,
        "type": t.type,
        "source": t.source
    } for t in transactions])
    
    temp_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "datasets", "retrain_temp.csv")
    df.to_csv(temp_path, index=False)
    
    # Train
    cat_metrics = ml_service.train_categorization_models(temp_path)
    anomaly_metrics = ml_service.train_anomaly_detector(temp_path)
    
    # Reload models in memory
    ml_service.load_models()
    
    # Remove temp file
    try:
        os.remove(temp_path)
    except:
        pass
        
    return {
        "status": "success",
        "retraining_size": len(transactions),
        "categorization_metrics": cat_metrics,
        "anomaly_metrics": anomaly_metrics
    }
