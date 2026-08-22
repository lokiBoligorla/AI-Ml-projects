from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app import models

# Use pbkdf2_sha256 for password hashing (avoiding buggy bcrypt library checks in newer passlib versions)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(db: Session = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme)) -> models.User:
    email = "admin@example.com"
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        # Create a default guest admin user
        user = models.User(
            email=email,
            hashed_password=pwd_context.hash("adminpassword"),
            full_name="Guest User",
            currency="INR",
            monthly_income=50000.0,
            savings_goal=15000.0,
            role="admin"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Initialize default budgets for the new guest user
        default_categories = ["Food", "Transport", "Shopping", "Education", "Entertainment", "Bills", "Hostel", "Healthcare", "Travel", "Miscellaneous"]
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
        db.refresh(user)

        # Seed transaction data from final_transactions.csv if it exists
        try:
            import csv
            import os
            csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "datasets", "final_transactions.csv")
            if os.path.exists(csv_path):
                print(f"[*] Seeding guest user transactions from {csv_path}...")
                with open(csv_path, mode='r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    transactions_to_add = []
                    
                    for row in reader:
                        # Only take transactions generated for user_id = 1 (matching guest configuration)
                        if int(row.get("user_id", 1)) == 1:
                            # Clean timestamp seconds/fraction
                            date_str = row["date"].split(".")[0]
                            tx_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
                            tx = models.Transaction(
                                user_id=user.id,
                                date=tx_date,
                                description=row["description"],
                                amount=float(row["amount"]),
                                category=row["category"],
                                type=row["type"],
                                source=row["source"],
                                is_anomaly=row["is_anomaly"].lower() == "true",
                                anomaly_score=float(row["anomaly_score"])
                            )
                            transactions_to_add.append(tx)
                    
                    if transactions_to_add:
                        db.add_all(transactions_to_add)
                        db.commit()
                        
                        anomalies_to_add = []
                        for tx in transactions_to_add:
                            if tx.is_anomaly:
                                anomaly_db = models.Anomaly(
                                    transaction_id=tx.id,
                                    user_id=user.id,
                                    risk_score=tx.anomaly_score,
                                    reason=f"Flagged high-risk outlier transaction in category {tx.category}.",
                                    status="open"
                                )
                                anomalies_to_add.append(anomaly_db)
                        
                        if anomalies_to_add:
                            db.add_all(anomalies_to_add)
                            db.commit()
                            
                print(f"[+] Successfully seeded {len(transactions_to_add)} transactions and {len(anomalies_to_add)} anomalies.")
        except Exception as e:
            print(f"[!] Error seeding guest transaction data: {e}")
            db.rollback()
            
    return user

def get_admin_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    return current_user
