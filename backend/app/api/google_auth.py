import os
"""
Google OAuth via Firebase ID Token verification.
Frontend Firebase se Google login karta hai → ID token milta hai →
Backend token verify karta hai → JWT issue karta hai.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User, UserRole
from app.models.audit import AuditLog, ActionType
from app.core.security import create_access_token, create_refresh_token
import urllib.request
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Google Auth"])

FIREBASE_PROJECT_ID = "votingsystem-4d9c8"


class GoogleTokenRequest(BaseModel):
    id_token: str


def verify_firebase_token(id_token: str) -> dict:
    """
    Firebase ID token verify karo Google's public key se.
    Simple HTTP verification — no extra library needed.
    """
    try:
        fb_key = os.getenv("FIREBASE_WEB_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={fb_key}"
        data = json.dumps({"idToken": id_token}).encode()
        req = urllib.request.Request(url, data=data,
                                     headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            users = result.get("users", [])
            if not users:
                raise ValueError("No user found")
            return users[0]
    except Exception as e:
        logger.error(f"Firebase token verify failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google token")


@router.post("/google")
def google_login(data: GoogleTokenRequest, request: Request, db: Session = Depends(get_db)):
    """
    Google Sign-In flow:
    1. Frontend Firebase se Google login karta hai
    2. ID token yahan bhejta hai
    3. Backend verify karta hai
    4. User create/find karta hai
    5. JWT tokens return karta hai
    """
    ip = request.client.host if request.client else None

    # Firebase token verify karo
    firebase_user = verify_firebase_token(data.id_token)

    email = firebase_user.get("email")
    name = firebase_user.get("displayName") or email.split("@")[0]
    photo_url = firebase_user.get("photoUrl")

    if not email:
        raise HTTPException(status_code=400, detail="Email not found in Google account")

    # User dhundo ya banao
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Naya user — Google se auto-register
        import secrets, string
        random_pass = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        from app.core.security import hash_password
        user = User(
            name=name,
            email=email,
            password_hash=hash_password(random_pass),
            role=UserRole.VOTER,
            is_verified=True,   # Google ne already verify kiya
            is_active=True,
            avatar_url=photo_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"New Google user created: {email}")
    else:
        # Existing user — avatar update karo
        if photo_url and not user.avatar_url:
            user.avatar_url = photo_url
        if not user.is_verified:
            user.is_verified = True
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account suspended. Contact support.")
        db.commit()

    # JWT tokens generate karo
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Audit log
    log = AuditLog(user_id=user.id, action=ActionType.LOGIN, ip_address=ip,
                   details="google_oauth")
    db.add(log)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified,
            "avatar_url": user.avatar_url,
        },
    }
