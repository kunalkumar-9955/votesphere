from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.election import Election, Candidate, Vote, Result, ElectionStatus
from app.models.audit import AuditLog, ActionType, Notification
from app.schemas.election import ElectionCreate, ElectionUpdate, CandidateCreate, VoteRequest
from app.services.fraud_service import FraudDetector
import secrets
import json


fraud_detector = FraudDetector()


def create_election(db: Session, data: ElectionCreate, user_id: int) -> Election:
    election = Election(**data.model_dump(), created_by=user_id, status=ElectionStatus.DRAFT)
    db.add(election)
    db.commit()
    db.refresh(election)

    log = AuditLog(user_id=user_id, action=ActionType.ELECTION_CREATED,
                   resource_type="election", resource_id=election.id)
    db.add(log)
    db.commit()
    return election


def update_election(db: Session, election_id: int, data: ElectionUpdate, user_id: int) -> Election:
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(election, field, value)

    db.commit()
    db.refresh(election)
    return election


def cast_vote(db: Session, data: VoteRequest, user_id: int, ip: str = None) -> dict:
    election = db.query(Election).filter(Election.id == data.election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    if election.status != ElectionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Election is not active")
    if datetime.utcnow() > election.end_time:
        raise HTTPException(status_code=400, detail="Election has ended")

    # Check duplicate vote
    existing_vote = db.query(Vote).filter(
        Vote.user_id == user_id,
        Vote.election_id == data.election_id
    ).first()
    if existing_vote:
        raise HTTPException(status_code=400, detail="You have already voted in this election")

    # Validate candidate count
    if not election.allow_multiple_choice and len(data.candidate_ids) > 1:
        raise HTTPException(status_code=400, detail="Only one candidate allowed")
    if len(data.candidate_ids) > election.max_choices:
        raise HTTPException(status_code=400, detail=f"Maximum {election.max_choices} choices allowed")

    # Fraud detection
    fraud_score = fraud_detector.score_vote(db, user_id, data.election_id, ip)

    votes_created = []
    for candidate_id in data.candidate_ids:
        candidate = db.query(Candidate).filter(
            Candidate.id == candidate_id,
            Candidate.election_id == data.election_id
        ).first()
        if not candidate:
            raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found")

        receipt_code = secrets.token_hex(32)
        vote = Vote(
            user_id=user_id,
            election_id=data.election_id,
            candidate_id=candidate_id,
            receipt_code=receipt_code,
            ip_address=ip,
            fraud_score=fraud_score,
            verified_biometric=data.biometric_verified,
            is_flagged=fraud_score > 0.7,
        )
        db.add(vote)
        candidate.vote_count += 1
        votes_created.append(receipt_code)

    log = AuditLog(user_id=user_id, action=ActionType.VOTE_CAST,
                   resource_type="election", resource_id=data.election_id, ip_address=ip)
    db.add(log)
    db.commit()

    return {
        "receipt_code": votes_created[0],
        "election_id": data.election_id,
        "voted_at": datetime.utcnow(),
        "message": "Vote cast successfully"
    }


def publish_result(db: Session, election_id: int, user_id: int) -> Result:
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    candidates = db.query(Candidate).filter(Candidate.election_id == election_id).all()
    total_votes = sum(c.vote_count for c in candidates)
    winner = max(candidates, key=lambda c: c.vote_count) if candidates else None

    turnout = (total_votes / election.total_eligible_voters * 100) if election.total_eligible_voters > 0 else 0

    result_data = {c.id: {"name": c.name, "votes": c.vote_count} for c in candidates}

    existing = db.query(Result).filter(Result.election_id == election_id).first()
    if existing:
        existing.winner_id = winner.id if winner else None
        existing.total_votes = total_votes
        existing.turnout_percentage = turnout
        existing.published_at = datetime.utcnow()
        existing.result_data = json.dumps(result_data)
        result = existing
    else:
        result = Result(
            election_id=election_id,
            winner_id=winner.id if winner else None,
            total_votes=total_votes,
            turnout_percentage=turnout,
            published_at=datetime.utcnow(),
            result_data=json.dumps(result_data),
        )
        db.add(result)

    election.status = ElectionStatus.RESULT_PUBLISHED
    log = AuditLog(user_id=user_id, action=ActionType.RESULT_PUBLISHED,
                   resource_type="election", resource_id=election_id)
    db.add(log)
    db.commit()
    db.refresh(result)
    return result


def get_live_turnout(db: Session, election_id: int) -> dict:
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    total_votes = db.query(Vote).filter(Vote.election_id == election_id).count()
    candidates = db.query(Candidate).filter(Candidate.election_id == election_id).all()

    return {
        "election_id": election_id,
        "total_votes": total_votes,
        "total_eligible": election.total_eligible_voters,
        "turnout_percentage": (total_votes / election.total_eligible_voters * 100)
        if election.total_eligible_voters > 0 else 0,
        "candidates": [{"id": c.id, "name": c.name, "votes": c.vote_count} for c in candidates],
    }
