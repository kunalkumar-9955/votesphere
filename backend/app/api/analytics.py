from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import require_super_admin, get_current_user
from app.models.user import User
from app.services.analytics_service import get_platform_stats, get_vote_trends, get_election_type_distribution
from app.services.fraud_service import FraudDetector
from app.models.audit import AuditLog
from app.models.user import UserRole

router = APIRouter(prefix="/analytics", tags=["Analytics"])
fraud_detector = FraudDetector()


@router.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    return get_platform_stats(db)


@router.get("/vote-trends")
def vote_trends(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    return get_vote_trends(db, days)


@router.get("/election-types")
def election_type_dist(db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    return get_election_type_distribution(db)


@router.get("/fraud/reports")
def fraud_reports(db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    return fraud_detector.get_fraud_report(db)


@router.get("/audit-logs")
def audit_logs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "ip_address": l.ip_address,
            "created_at": l.created_at,
        }
        for l in logs
    ]


@router.get("/users")
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    from app.models.user import User as UserModel
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return [
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role,
         "is_active": u.is_active, "is_verified": u.is_verified, "created_at": u.created_at}
        for u in users
    ]


@router.patch("/users/{user_id}/suspend")
def suspend_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    from app.models.user import User as UserModel
    from app.models.audit import ActionType
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    log = AuditLog(user_id=current_user.id, action=ActionType.USER_SUSPENDED,
                   resource_type="user", resource_id=user_id)
    db.add(log)
    db.commit()
    return {"message": f"User {'suspended' if not user.is_active else 'activated'}", "is_active": user.is_active}
