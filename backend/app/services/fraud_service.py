"""
AI-powered fraud detection for VoteSphere.
Multi-factor heuristic scoring. Score: 0.0 (clean) to 1.0 (fraud).
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import numpy as np
import logging

logger = logging.getLogger(__name__)

RISK_LOW = 0.3
RISK_MEDIUM = 0.6
RISK_HIGH = 0.8


def _risk_label(score: float) -> str:
    if score >= RISK_HIGH:
        return "critical"
    if score >= RISK_MEDIUM:
        return "high"
    if score >= RISK_LOW:
        return "medium"
    return "low"


class FraudDetector:
    """Multi-factor fraud scoring engine."""

    def score_vote(self, db: Session, user_id: int, election_id: int, ip: str = None) -> float:
        score = 0.0
        factors = []
        try:
            from app.models.election import Vote

            # Factor 1: Rapid same-IP voting in last 5 minutes
            if ip:
                ip_recent = db.query(Vote).filter(
                    Vote.ip_address == ip,
                    Vote.created_at >= datetime.utcnow() - timedelta(minutes=5),
                ).count()
                if ip_recent >= 5:
                    score += 0.45
                    factors.append("rapid_ip_voting")
                elif ip_recent >= 3:
                    score += 0.25
                    factors.append("elevated_ip_voting")

            # Factor 2: User voting frequency in last hour
            user_hour = db.query(Vote).filter(
                Vote.user_id == user_id,
                Vote.created_at >= datetime.utcnow() - timedelta(hours=1),
            ).count()
            if user_hour >= 8:
                score += 0.30
                factors.append("very_high_vote_frequency")
            elif user_hour >= 4:
                score += 0.15
                factors.append("high_vote_frequency")

            # Factor 3: Unusual voting hours (2 AM - 5 AM UTC)
            hour = datetime.utcnow().hour
            if 2 <= hour <= 5:
                score += 0.10
                factors.append("unusual_hour")

            # Factor 4: Same IP used by many different users in 24h
            if ip:
                distinct_users = db.query(Vote.user_id).filter(
                    Vote.ip_address == ip,
                    Vote.created_at >= datetime.utcnow() - timedelta(hours=24),
                ).distinct().count()
                if distinct_users >= 10:
                    score += 0.20
                    factors.append("shared_ip_many_users")

            # Factor 5: Election already has flagged votes
            flagged_count = db.query(Vote).filter(
                Vote.election_id == election_id,
                Vote.is_flagged == True,
            ).count()
            if flagged_count >= 5:
                score += 0.10
                factors.append("election_under_scrutiny")

            score = round(min(score, 1.0), 3)
            if score >= RISK_MEDIUM:
                logger.warning(
                    f"[FRAUD] user={user_id} election={election_id} "
                    f"score={score} risk={_risk_label(score)} factors={factors}"
                )
        except Exception as exc:
            logger.error(f"Fraud detection error: {exc}")
        return score

    def get_fraud_report(self, db: Session) -> dict:
        """Platform-wide fraud analytics with per-election breakdown."""
        try:
            from app.models.election import Vote

            votes = db.query(Vote).all()
            if not votes:
                return {
                    "total_votes": 0,
                    "total_flagged": 0,
                    "avg_fraud_score": 0.0,
                    "flag_rate": 0.0,
                    "high_risk_elections": [],
                    "risk_distribution": {"low": 0, "medium": 0, "high": 0, "critical": 0},
                    "recent_flagged": [],
                }

            scores = np.array([v.fraud_score for v in votes])
            flagged = [v for v in votes if v.is_flagged]

            risk_dist = {
                "low": int(np.sum(scores < RISK_LOW)),
                "medium": int(np.sum((scores >= RISK_LOW) & (scores < RISK_MEDIUM))),
                "high": int(np.sum((scores >= RISK_MEDIUM) & (scores < RISK_HIGH))),
                "critical": int(np.sum(scores >= RISK_HIGH)),
            }

            election_map: dict = {}
            for v in votes:
                election_map.setdefault(v.election_id, []).append(v.fraud_score)

            high_risk = sorted(
                [
                    {
                        "election_id": eid,
                        "avg_score": round(float(np.mean(s)), 3),
                        "max_score": round(float(np.max(s)), 3),
                        "flagged_count": sum(1 for x in s if x >= RISK_MEDIUM),
                        "risk_level": _risk_label(float(np.mean(s))),
                    }
                    for eid, s in election_map.items()
                    if np.mean(s) >= RISK_LOW
                ],
                key=lambda x: x["avg_score"],
                reverse=True,
            )

            recent_flagged = (
                db.query(Vote)
                .filter(Vote.is_flagged == True)
                .order_by(Vote.created_at.desc())
                .limit(50)
                .all()
            )

            return {
                "total_votes": len(votes),
                "total_flagged": len(flagged),
                "avg_fraud_score": round(float(np.mean(scores)), 3),
                "flag_rate": round(len(flagged) / len(votes) * 100, 2),
                "high_risk_elections": high_risk,
                "risk_distribution": risk_dist,
                "recent_flagged": [
                    {
                        "vote_id": v.id,
                        "user_id": v.user_id,
                        "election_id": v.election_id,
                        "fraud_score": v.fraud_score,
                        "risk_level": _risk_label(v.fraud_score),
                        "ip_address": v.ip_address,
                        "created_at": v.created_at.isoformat() if v.created_at else None,
                    }
                    for v in recent_flagged
                ],
            }
        except Exception as exc:
            logger.error(f"Fraud report error: {exc}")
            return {"error": str(exc)}
