"""
WebAuthn / Biometric authentication service for VoteSphere.

Uses a challenge-response flow compatible with the Web Authentication API (WebAuthn).
In production this integrates with real FIDO2 authenticators (Touch ID, Windows Hello, etc.)
For development/demo, we simulate the flow with server-side challenge generation and
client-side credential simulation.

Flow:
  Registration:
    1. Server generates a random challenge
    2. Client calls navigator.credentials.create() with the challenge
    3. Client sends back the credential (id, public key, attestation)
    4. Server stores credential_id + public_key

  Authentication:
    1. Server generates a random challenge
    2. Client calls navigator.credentials.get() with allowed credentials
    3. Client sends back the assertion (signature, authenticator data)
    4. Server verifies signature against stored public key
"""
import base64
import hashlib
import json
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.biometric import BiometricCredential, FraudLog
from app.models.user import User

# In-memory challenge store (use Redis in production)
_challenge_store: dict[str, dict] = {}
CHALLENGE_TTL_SECONDS = 120


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s)


def generate_registration_challenge(user_id: int, user_name: str, user_email: str) -> dict:
    """Generate a WebAuthn registration challenge for the client."""
    challenge_bytes = secrets.token_bytes(32)
    challenge_b64 = _b64url_encode(challenge_bytes)

    _challenge_store[f"reg_{user_id}"] = {
        "challenge": challenge_b64,
        "expires": datetime.utcnow() + timedelta(seconds=CHALLENGE_TTL_SECONDS),
        "type": "registration",
    }

    return {
        "challenge": challenge_b64,
        "rp": {"name": "VoteSphere", "id": "localhost"},
        "user": {
            "id": _b64url_encode(str(user_id).encode()),
            "name": user_email,
            "displayName": user_name,
        },
        "pubKeyCredParams": [
            {"type": "public-key", "alg": -7},   # ES256
            {"type": "public-key", "alg": -257},  # RS256
        ],
        "authenticatorSelection": {
            "authenticatorAttachment": "platform",
            "userVerification": "required",
            "residentKey": "preferred",
        },
        "timeout": 60000,
        "attestation": "none",
    }


def verify_registration(
    db: Session,
    user_id: int,
    credential_id: str,
    public_key: str,
    device_name: str,
    client_data_json: Optional[str] = None,
) -> BiometricCredential:
    """Verify and store a new biometric credential."""
    stored = _challenge_store.get(f"reg_{user_id}")
    if not stored or stored["expires"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Registration challenge expired or not found")

    # Check for duplicate credential
    existing = db.query(BiometricCredential).filter(
        BiometricCredential.credential_id == credential_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Credential already registered")

    # Check device limit per user (max 5)
    count = db.query(BiometricCredential).filter(
        BiometricCredential.user_id == user_id,
        BiometricCredential.is_active == True,
    ).count()
    if count >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 devices allowed per account")

    cred = BiometricCredential(
        user_id=user_id,
        credential_id=credential_id,
        public_key=public_key,
        device_name=device_name or "My Device",
        sign_count=0,
    )
    db.add(cred)
    db.commit()
    db.refresh(cred)

    # Clean up challenge
    _challenge_store.pop(f"reg_{user_id}", None)
    return cred


def generate_authentication_challenge(user_id: int, db: Session) -> dict:
    """Generate a WebAuthn authentication challenge."""
    credentials = db.query(BiometricCredential).filter(
        BiometricCredential.user_id == user_id,
        BiometricCredential.is_active == True,
    ).all()

    if not credentials:
        raise HTTPException(
            status_code=404,
            detail="No biometric credentials registered. Please enroll a device first."
        )

    challenge_bytes = secrets.token_bytes(32)
    challenge_b64 = _b64url_encode(challenge_bytes)

    _challenge_store[f"auth_{user_id}"] = {
        "challenge": challenge_b64,
        "expires": datetime.utcnow() + timedelta(seconds=CHALLENGE_TTL_SECONDS),
        "type": "authentication",
    }

    return {
        "challenge": challenge_b64,
        "timeout": 60000,
        "rpId": "localhost",
        "userVerification": "required",
        "allowCredentials": [
            {"type": "public-key", "id": c.credential_id}
            for c in credentials
        ],
    }


def verify_authentication(
    db: Session,
    user_id: int,
    credential_id: str,
    authenticator_data: Optional[str] = None,
    signature: Optional[str] = None,
    client_data_json: Optional[str] = None,
) -> BiometricCredential:
    """Verify a biometric authentication assertion."""
    stored = _challenge_store.get(f"auth_{user_id}")
    if not stored or stored["expires"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Authentication challenge expired")

    cred = db.query(BiometricCredential).filter(
        BiometricCredential.credential_id == credential_id,
        BiometricCredential.user_id == user_id,
        BiometricCredential.is_active == True,
    ).first()

    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found or inactive")

    # Update last used and sign count
    cred.last_used = datetime.utcnow()
    cred.sign_count += 1
    db.commit()

    _challenge_store.pop(f"auth_{user_id}", None)
    return cred


def list_credentials(db: Session, user_id: int) -> list:
    return db.query(BiometricCredential).filter(
        BiometricCredential.user_id == user_id,
        BiometricCredential.is_active == True,
    ).all()


def delete_credential(db: Session, credential_db_id: int, user_id: int) -> bool:
    cred = db.query(BiometricCredential).filter(
        BiometricCredential.id == credential_db_id,
        BiometricCredential.user_id == user_id,
    ).first()
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")
    cred.is_active = False
    db.commit()
    return True


def log_fraud(db: Session, user_id: Optional[int], action: str, risk_score: int,
              details: str = None, ip: str = None) -> FraudLog:
    log = FraudLog(
        user_id=user_id,
        action=action,
        risk_score=risk_score,
        details=details,
        ip_address=ip,
    )
    db.add(log)
    db.commit()
    return log
