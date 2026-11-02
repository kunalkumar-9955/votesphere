from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class ElectionType(str, enum.Enum):
    COLLEGE = "college"
    CLUB = "club"
    SOCIETY = "society"
    POLLING = "polling"
    EVENT = "event"
    REAL_SIMULATION = "real_simulation"
    CORPORATE = "corporate"
    SCHOOL = "school"
    CONTEST = "contest"
    NGO = "ngo"


class ElectionStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    ENDED = "ended"
    RESULT_PUBLISHED = "result_published"


class Election(Base):
    __tablename__ = "elections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum(ElectionType), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(Enum(ElectionStatus), default=ElectionStatus.DRAFT)
    is_anonymous = Column(Boolean, default=False)
    allow_multiple_choice = Column(Boolean, default=False)
    max_choices = Column(Integer, default=1)
    constituency = Column(String(200), nullable=True)
    banner_url = Column(String(500), nullable=True)
    total_eligible_voters = Column(Integer, default=0)
    fraud_score = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization", back_populates="elections")
    candidates = relationship("Candidate", back_populates="election")
    votes = relationship("Vote", back_populates="election")
    result = relationship("Result", back_populates="election", uselist=False)


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(Integer, ForeignKey("elections.id"), nullable=False)
    name = Column(String(200), nullable=False)
    bio = Column(Text, nullable=True)
    symbol = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    party = Column(String(200), nullable=True)
    position = Column(String(200), nullable=True)
    manifesto = Column(Text, nullable=True)
    vote_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    election = relationship("Election", back_populates="candidates")
    votes = relationship("Vote", back_populates="candidate")


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    election_id = Column(Integer, ForeignKey("elections.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    receipt_code = Column(String(64), unique=True, nullable=False)
    ip_address = Column(String(45), nullable=True)
    device_fingerprint = Column(String(255), nullable=True)
    verified_biometric = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    fraud_score = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())

    voter = relationship("User", back_populates="votes")
    election = relationship("Election", back_populates="votes")
    candidate = relationship("Candidate", back_populates="votes")


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(Integer, ForeignKey("elections.id"), unique=True, nullable=False)
    winner_id = Column(Integer, ForeignKey("candidates.id"), nullable=True)
    total_votes = Column(Integer, default=0)
    turnout_percentage = Column(Float, default=0.0)
    published_at = Column(DateTime, nullable=True)
    result_data = Column(Text, nullable=True)  # JSON string

    election = relationship("Election", back_populates="result")
    winner = relationship("Candidate")
