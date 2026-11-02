"""
Biometric / WebAuthn API endpoints for VoteSphere.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.biometric import BiometricCredential, FraudLog
from app.services import biometric_service

router = APIRouter(prefix="/biometric", tags=["Biometric Auth"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class RegistrationVerifyRequest(BaseModel):
    credential_id: str
    public_key: str
    device_name: Optional[str] = "My Device"
    client_data_json: Optional[str] = None
    attestation_object: Optional[str] = None


class AuthChallengeRequest(BaseModel):
    user_id: Optional[int] = None  # if not provided, uses current user


class AuthVerifyRequest(BaseModel):
    credential_id: str
    authenticator_data: Optional[str] = None
    signature: Optional[str] = None
    client_data_json: Optional[str] = None


class CredentialOut(BaseModel):
    id: int
    credential_id: str
    device_name: str
    sign_count: int
    last_used: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Registration ──────────────────────────────────────────────────────────────

@router.get("/register/challenge")
def get_registration_challenge(
    current_user: User = Depends(get_current_user),
):
    """Step 1: Get a WebAuthn registration challenge."""
    return biometric_service.generate_registration_challenge(
        current_user.id, current_user.name, current_user.email
    )


@router.post("/register/verify", response_model=CredentialOut)
def verify_registration(
    data: RegistrationVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Step 2: Verify and store the new biometric credential."""
    cred = biometric_service.verify_registration(
        db=db,
        user_id=current_user.id,
        credential_id=data.credential_id,
        public_key=data.public_key,
        device_name=data.device_name,
        client_data_json=data.client_data_json,
    )
    return cred


# ── Authentication ────────────────────────────────────────────────────────────

@router.get("/authenticate/challenge")
def get_auth_challenge(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Step 1: Get a WebAuthn authentication challenge."""
    return biometric_service.generate_authentication_challenge(current_user.id, db)


@router.post("/authenticate/verify")
def verify_authentication(
    data: AuthVerifyRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Step 2: Verify the biometric assertion and return a biometric token."""
    ip = request.client.host if request.client else None
    cred = biometric_service.verify_authentication(
        db=db,
        user_id=current_user.id,
        credential_id=data.credential_id,
        authenticator_data=data.authenticator_data,
        signature=data.signature,
        client_data_json=data.client_data_json,
    )
    return {
        "verified": True,
        "credential_id": cred.credential_id,
        "device_name": cred.device_name,
        "message": "Biometric authentication successful",
    }


# ── Device Management ─────────────────────────────────────────────────────────

@router.get("/credentials", response_model=List[CredentialOut])
def list_credentials(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all registered biometric devices for the current user."""
    return biometric_service.list_credentials(db, current_user.id)


@router.delete("/credentials/{credential_id}")
def delete_credential(
    credential_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a biometric device."""
    biometric_service.delete_credential(db, credential_id, current_user.id)
    return {"message": "Device removed successfully"}


# ── Fraud Logs ────────────────────────────────────────────────────────────────

@router.get("/fraud-logs")
def get_fraud_logs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get fraud logs (admin: all logs, voter: own logs)."""
    from app.models.user import UserRole
    query = db.query(FraudLog)
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]:
        query = query.filter(FraudLog.user_id == current_user.id)
    logs = query.order_by(FraudLog.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "risk_score": l.risk_score,
            "details": l.details,
            "ip_address": l.ip_address,
            "resolved": l.resolved,
            "created_at": l.created_at,
        }
        for l in logs
    ]
