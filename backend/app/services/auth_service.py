from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.audit import AuditLog, ActionType
from app.core.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, generate_otp, decode_token
)
from app.core.config import settings
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.email_service import send_otp_email, send_welcome_email
import logging

logger = logging.getLogger(__name__)


def register_user(db: Session, data: RegisterRequest, ip: str = None) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Super admin register se nahi ban sakta — sirf DB/seed se
    requested_role = data.role if hasattr(data, "role") and data.role else "voter"
    if requested_role == "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin cannot be created via registration. Contact platform support.")

    # Sirf voter ya org_admin allowed
    role = UserRole.ORG_ADMIN if requested_role == "org_admin" else UserRole.VOTER

    otp = generate_otp()
    otp_expires = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=role,
        otp_code=otp,
        otp_expires=otp_expires,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log = AuditLog(user_id=user.id, action=ActionType.REGISTER, ip_address=ip)
    db.add(log)
    db.commit()

    # Send real OTP email (falls back to console log if SMTP not configured)
    send_otp_email(data.email, data.name, otp)
    return user


def verify_otp(db: Session, email: str, otp: str) -> bool:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return True
    if not user.otp_code:
        raise HTTPException(status_code=400, detail="No OTP pending. Request a new one.")
    if user.otp_code != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    if user.otp_expires and user.otp_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP has expired. Request a new one.")

    user.is_verified = True
    user.otp_code = None
    user.otp_expires = None

    log = AuditLog(user_id=user.id, action=ActionType.OTP_VERIFIED)
    db.add(log)
    db.commit()

    # Send welcome email
    send_welcome_email(email, user.name)
    return True


def login_user(db: Session, data: LoginRequest, ip: str = None):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account suspended. Contact support.")
    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please check your inbox for the OTP.",
        )

    user.last_login = datetime.utcnow()
    db.commit()

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    log = AuditLog(user_id=user.id, action=ActionType.LOGIN, ip_address=ip)
    db.add(log)
    db.commit()

    return {"access_token": access_token, "refresh_token": refresh_token, "user": user}


def resend_otp(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account already verified")

    # Rate limit: don't allow resend if last OTP was sent < 60 seconds ago
    if user.otp_expires:
        time_since = (user.otp_expires - timedelta(minutes=settings.OTP_EXPIRE_MINUTES))
        if (datetime.utcnow() - time_since).total_seconds() < 60:
            raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting a new OTP")

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    db.commit()

    send_otp_email(email, user.name, otp)
    return True


def refresh_access_token(db: Session, refresh_token: str) -> dict:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    new_access = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": new_access, "token_type": "bearer"}


def request_password_reset(db: Session, email: str):
    """Request password reset - send email with reset token"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal if email exists for security
        raise HTTPException(status_code=400, detail="If an account with this email exists, you will receive a reset link")
    
    # Generate reset token (can be used as OTP)
    reset_token = generate_otp()
    user.otp_code = reset_token
    user.otp_expires = datetime.utcnow() + timedelta(minutes=30)  # 30 min validity for password reset
    db.commit()
    
    # Send reset email
    from app.services.email_service import send_password_reset_email
    send_password_reset_email(email, user.name, reset_token)
    return True


def reset_password(db: Session, email: str, token: str, new_password: str):
    """Reset password with token"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.otp_code:
        raise HTTPException(status_code=400, detail="No password reset pending")
    
    if user.otp_code != token:
        raise HTTPException(status_code=400, detail="Invalid reset token")
    
    if user.otp_expires and user.otp_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired. Request a new one.")
    
    # Update password
    user.password_hash = hash_password(new_password)
    user.otp_code = None
    user.otp_expires = None
    db.commit()
    
    logger.info(f"Password reset successful for user: {email}")
    return True
