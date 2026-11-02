from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.election import ElectionType, ElectionStatus


class ElectionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: ElectionType
    organization_id: int
    start_time: datetime
    end_time: datetime
    is_anonymous: bool = False
    allow_multiple_choice: bool = False
    max_choices: int = 1
    constituency: Optional[str] = None


class ElectionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[ElectionStatus] = None


class ElectionOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    type: ElectionType
    organization_id: int
    status: ElectionStatus
    start_time: datetime
    end_time: datetime
    is_anonymous: bool
    allow_multiple_choice: bool
    max_choices: int
    constituency: Optional[str]
    banner_url: Optional[str]
    total_eligible_voters: int
    total_votes: Optional[int] = 0
    turnout_percentage: Optional[float] = 0.0
    created_at: datetime

    model_config = {"from_attributes": True}


class CandidateCreate(BaseModel):
    election_id: int
    name: str
    bio: Optional[str] = None
    symbol: Optional[str] = None
    image_url: Optional[str] = None
    party: Optional[str] = None
    position: Optional[str] = None
    manifesto: Optional[str] = None


class CandidateOut(BaseModel):
    id: int
    election_id: int
    name: str
    bio: Optional[str]
    symbol: Optional[str]
    image_url: Optional[str]
    party: Optional[str]
    position: Optional[str]
    manifesto: Optional[str]
    vote_count: int

    model_config = {"from_attributes": True}


class VoteRequest(BaseModel):
    election_id: int
    candidate_ids: List[int]
    biometric_credential_id: Optional[str] = None  # credential_id used for biometric auth
    biometric_verified: bool = False


class VoteReceiptOut(BaseModel):
    receipt_code: str
    election_id: int
    voted_at: datetime
    message: str


class ResultOut(BaseModel):
    election_id: int
    winner_id: Optional[int]
    winner_name: Optional[str]
    total_votes: int
    turnout_percentage: float
    candidates: List[CandidateOut]
    published_at: Optional[datetime]

    model_config = {"from_attributes": True}
