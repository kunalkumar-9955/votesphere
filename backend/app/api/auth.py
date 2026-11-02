from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import (
    RegisterRequest, LoginRequest, OTPVerifyRequest,
    TokenResponse, UserOut, PasswordChangeRequest, RefreshRequest, ContactRequest
)
from app.services import auth_service
from app.core.deps import get_current_user
from app.core.security import verify_password, hash_password
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=201)
def register(data: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None
    user = auth_service.register_user(db, data, ip)
    return {"message": "Registration successful. Check your email for OTP.", "user_id": user.id}


@router.post("/verify-otp")
def verify_otp(data: OTPVerifyRequest, db: Session = Depends(get_db)):
    auth_service.verify_otp(db, data.email, data.otp)
    return {"message": "Email verified successfully"}


@router.post("/resend-otp")
def resend_otp(email: str, db: Session = Depends(get_db)):
    auth_service.resend_otp(db, email)
    return {"message": "OTP resent"}


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None
    result = auth_service.login_user(db, data, ip)
    return result


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/change-password")
def change_password(
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@router.post("/refresh")
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    return auth_service.refresh_access_token(db, data.refresh_token)


@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    auth_service.request_password_reset(db, email)
    return {"message": "Password reset email sent. Check your inbox for instructions."}


@router.post("/reset-password")
def reset_password(email: str, token: str, new_password: str, db: Session = Depends(get_db)):
    auth_service.reset_password(db, email, token, new_password)
    return {"message": "Password reset successfully. Please login with your new password."}


@router.post("/contact")
def send_contact_message(data: ContactRequest):
    """Send contact inquiry email"""
    from app.services.email_service import send_contact_email
    send_contact_email(data.name, data.email, data.subject, data.message)
    return {"message": "Thank you for contacting us. We'll get back to you soon!"}
