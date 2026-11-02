from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.organization import OrgType, OrgStatus


class OrgCreate(BaseModel):
    name: str
    type: OrgType
    description: Optional[str] = None


class OrgUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None


class OrgOut(BaseModel):
    id: int
    name: str
    type: OrgType
    description: Optional[str]
    logo_url: Optional[str]
    invite_code: str
    owner_id: int
    status: OrgStatus
    member_count: Optional[int] = 0
    election_count: Optional[int] = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class JoinOrgRequest(BaseModel):
    invite_code: str


class OrgStatusUpdate(BaseModel):
    status: OrgStatus
    reason: Optional[str] = None
