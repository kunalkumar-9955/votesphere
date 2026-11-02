from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.organization import OrgCreate, OrgOut, OrgUpdate, JoinOrgRequest, OrgStatusUpdate
from app.models.organization import Organization, OrganizationMember, OrgStatus
from app.models.user import User
from app.core.deps import get_current_user, require_org_admin, require_super_admin
from app.core.security import generate_invite_code
from app.models.audit import AuditLog, ActionType

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("", response_model=OrgOut, status_code=201)
def create_org(
    data: OrgCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org = Organization(
        **data.model_dump(),
        owner_id=current_user.id,
        invite_code=generate_invite_code(),
        status=OrgStatus.PENDING,
    )
    db.add(org)
    db.commit()
    db.refresh(org)

    # Auto-add owner as member
    member = OrganizationMember(organization_id=org.id, user_id=current_user.id, role="admin")
    db.add(member)

    log = AuditLog(user_id=current_user.id, action=ActionType.ORG_CREATED,
                   resource_type="organization", resource_id=org.id)
    db.add(log)
    db.commit()

    # Promote user to org_admin
    from app.models.user import UserRole
    if current_user.role == UserRole.VOTER:
        current_user.role = UserRole.ORG_ADMIN
        db.commit()

    return _enrich_org(db, org)


@router.get("", response_model=List[OrgOut])
def list_orgs(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.user import UserRole
    query = db.query(Organization)
    if current_user.role != UserRole.SUPER_ADMIN:
        # Show only orgs user belongs to
        member_org_ids = [m.organization_id for m in current_user.organizations]
        query = query.filter(Organization.id.in_(member_org_ids))
    if status:
        query = query.filter(Organization.status == status)
    orgs = query.all()
    return [_enrich_org(db, o) for o in orgs]


@router.get("/{org_id}", response_model=OrgOut)
def get_org(org_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return _enrich_org(db, org)


@router.put("/{org_id}", response_model=OrgOut)
def update_org(
    org_id: int,
    data: OrgUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_org_admin),
):
    org = db.query(Organization).filter(Organization.id == org_id, Organization.owner_id == current_user.id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found or access denied")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(org, field, value)
    db.commit()
    db.refresh(org)
    return _enrich_org(db, org)


@router.post("/join")
def join_org(
    data: JoinOrgRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org = db.query(Organization).filter(Organization.invite_code == data.invite_code).first()
    if not org:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    if org.status != OrgStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Organization not approved yet")

    existing = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org.id,
        OrganizationMember.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member")

    member = OrganizationMember(organization_id=org.id, user_id=current_user.id, role="member")
    db.add(member)
    db.commit()
    return {"message": f"Joined {org.name} successfully"}


@router.patch("/{org_id}/status")
def update_org_status(
    org_id: int,
    data: OrgStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    org.status = data.status
    log = AuditLog(user_id=current_user.id, action=ActionType.ORG_APPROVED,
                   resource_type="organization", resource_id=org_id,
                   details=data.reason)
    db.add(log)
    db.commit()
    return {"message": f"Organization status updated to {data.status}"}


def _enrich_org(db: Session, org: Organization) -> dict:
    from app.models.election import Election
    member_count = db.query(OrganizationMember).filter(OrganizationMember.organization_id == org.id).count()
    election_count = db.query(Election).filter(Election.organization_id == org.id).count()
    d = {c.name: getattr(org, c.name) for c in org.__table__.columns}
    d["member_count"] = member_count
    d["election_count"] = election_count
    return d
