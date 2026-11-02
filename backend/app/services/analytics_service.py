"""Platform analytics using pandas."""
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


def get_platform_stats(db: Session) -> dict:
    from app.models.user import User, UserRole
    from app.models.organization import Organization, OrgStatus
    from app.models.election import Election, Vote, ElectionStatus

    total_users = db.query(User).count()
    total_orgs = db.query(Organization).count()
    total_elections = db.query(Election).count()
    total_votes = db.query(Vote).count()
    active_elections = db.query(Election).filter(Election.status == ElectionStatus.ACTIVE).count()
    pending_orgs = db.query(Organization).filter(Organization.status == OrgStatus.PENDING).count()

    # Votes in last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_votes = db.query(Vote).filter(Vote.created_at >= week_ago).count()
    recent_users = db.query(User).filter(User.created_at >= week_ago).count()

    return {
        "total_users": total_users,
        "total_organizations": total_orgs,
        "total_elections": total_elections,
        "total_votes": total_votes,
        "active_elections": active_elections,
        "pending_organizations": pending_orgs,
        "votes_last_7_days": recent_votes,
        "new_users_last_7_days": recent_users,
    }


def get_vote_trends(db: Session, days: int = 30) -> list:
    from app.models.election import Vote
    from sqlalchemy import func, cast, Date

    start = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(cast(Vote.created_at, Date).label("date"), func.count(Vote.id).label("count"))
        .filter(Vote.created_at >= start)
        .group_by(cast(Vote.created_at, Date))
        .order_by(cast(Vote.created_at, Date))
        .all()
    )
    return [{"date": str(r.date), "votes": r.count} for r in rows]


def get_election_type_distribution(db: Session) -> list:
    from app.models.election import Election
    from sqlalchemy import func

    rows = (
        db.query(Election.type, func.count(Election.id).label("count"))
        .group_by(Election.type)
        .all()
    )
    return [{"type": r.type, "count": r.count} for r in rows]
