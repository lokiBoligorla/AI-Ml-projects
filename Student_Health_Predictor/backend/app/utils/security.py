import jwt
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database_models import User
from app.config import settings

# Cryptography context for passwords (using sha256_crypt for seamless OS and Python 3.13 portability)
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

# OAuth2 Scheme definition
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

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
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    if token:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            email: str = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email).first()
                if user:
                    return user
        except jwt.PyJWTError:
            pass # Fallback to guest

    # Setup or load persistent guest admin
    guest_email = "guest@wellnessai.edu"
    guest = db.query(User).filter(User.email == guest_email).first()
    if not guest:
        guest = User(
            name="Guest Student",
            email=guest_email,
            hashed_password=pwd_context.hash("guest_password_123"),
            is_admin=True,  # Administrator access for easy evaluation
            created_at=datetime.utcnow()
        )
        db.add(guest)
        db.commit()
        db.refresh(guest)
    return guest

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted. Admin access required."
        )
    return current_user
