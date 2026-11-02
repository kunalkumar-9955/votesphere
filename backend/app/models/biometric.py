"""
WebAuthn / Biometric credential storage model.
Stores FIDO2 public key credentials per user per device.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class BiometricCredential(Base):
    __tablename__ = "biometric_credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    # WebAuthn credential ID (base64url encoded)
    credential_id = Column(String(512), unique=True, nullable=False, index=True)
    # CBOR-encoded public key (stored as text/base64)
    public_key = Column(Text, nullable=False)
    # Human-readable device name
    device_name = Column(String(200), nullable=False, default="My Device")
    # Sign count for replay attack prevention
    sign_count = Column(Integer, default=0)
    # AAGUID identifies the authenticator model
    aaguid = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    last_used = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="biometric_credentials")


class FraudLog(Base):
    __tablename__ = "fraud_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    risk_score = Column(Integer, default=0)   # 0-100
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="fraud_logs")
