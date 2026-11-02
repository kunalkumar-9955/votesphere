from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.election import (
    ElectionCreate, ElectionOut, ElectionUpdate,
    CandidateCreate, CandidateOut, VoteRequest, VoteReceiptOut, ResultOut
)
from app.models.election import Election, Candidate, Vote, Result, ElectionStatus
from app.models.user import User
from app.core.deps import get_current_user, require_org_admin
from app.services import election_service
from app.services.report_service import generate_election_report
import json

router = APIRouter(prefix="/elections", tags=["Elections"])


@router.post("", response_model=ElectionOut, status_code=201)
def create_election(
    data: ElectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_org_admin),
):
    return election_service.create_election(db, data, current_user.id)


@router.get("", response_model=List[ElectionOut])
def list_elections(
    org_id: Optional[int] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Election)
    if org_id:
        query = query.filter(Election.organization_id == org_id)
    if status:
        query = query.filter(Election.status == status)
    if type:
        query = query.filter(Election.type == type)
    elections = query.offset(skip).limit(limit).all()
    return [_enrich_election(db, e) for e in elections]


@router.get("/{election_id}", response_model=ElectionOut)
def get_election(election_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    return _enrich_election(db, election)


@router.put("/{election_id}", response_model=ElectionOut)
def update_election(
    election_id: int,
    data: ElectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_org_admin),
):
    return election_service.update_election(db, election_id, data, current_user.id)


@router.delete("/{election_id}", status_code=204)
def delete_election(
    election_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_org_admin),
):
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    if election.status == ElectionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Cannot delete active election")
    db.delete(election)
    db.commit()


@router.post("/{election_id}/publish-result")
def publish_result(
    election_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_org_admin),
):
    result = election_service.publish_result(db, election_id, current_user.id)
    return {"message": "Result published", "election_id": election_id}


@router.get("/{election_id}/turnout")
def live_turnout(election_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return election_service.get_live_turnout(db, election_id)


@router.get("/{election_id}/report")
def download_report(
    election_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_org_admin),
):
    pdf_bytes = generate_election_report(db, election_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=election_{election_id}_report.pdf"},
    )


# Candidates
@router.post("/candidates", response_model=CandidateOut, status_code=201)
def add_candidate(
    data: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_org_admin),
):
    election = db.query(Election).filter(Election.id == data.election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    if election.status not in [ElectionStatus.DRAFT, ElectionStatus.SCHEDULED]:
        raise HTTPException(status_code=400, detail="Cannot add candidates to active/ended election")
    candidate = Candidate(**data.model_dump())
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


@router.get("/{election_id}/candidates", response_model=List[CandidateOut])
def get_candidates(election_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Candidate).filter(Candidate.election_id == election_id).all()


@router.delete("/candidates/{candidate_id}", status_code=204)
def delete_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_org_admin),
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(candidate)
    db.commit()


# Voting
@router.post("/vote", response_model=VoteReceiptOut)
def cast_vote(
    data: VoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return election_service.cast_vote(db, data, current_user.id)


@router.get("/results/{election_id}", response_model=ResultOut)
def get_result(election_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    if election.status != ElectionStatus.RESULT_PUBLISHED:
        raise HTTPException(status_code=403, detail="Results not published yet")

    result = db.query(Result).filter(Result.election_id == election_id).first()
    candidates = db.query(Candidate).filter(Candidate.election_id == election_id).all()
    winner = db.query(Candidate).filter(Candidate.id == result.winner_id).first() if result else None

    return {
        "election_id": election_id,
        "winner_id": result.winner_id if result else None,
        "winner_name": winner.name if winner else None,
        "total_votes": result.total_votes if result else 0,
        "turnout_percentage": result.turnout_percentage if result else 0,
        "candidates": candidates,
        "published_at": result.published_at if result else None,
    }


@router.get("/my-votes/history")
def my_vote_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    votes = db.query(Vote).filter(Vote.user_id == current_user.id).all()
    return [
        {
            "election_id": v.election_id,
            "receipt_code": v.receipt_code,
            "voted_at": v.created_at,
        }
        for v in votes
    ]


def _enrich_election(db: Session, e: Election) -> dict:
    from app.models.election import Vote
    total_votes = db.query(Vote).filter(Vote.election_id == e.id).count()
    turnout = (total_votes / e.total_eligible_voters * 100) if e.total_eligible_voters > 0 else 0
    d = {c.name: getattr(e, c.name) for c in e.__table__.columns}
    d["total_votes"] = total_votes
    d["turnout_percentage"] = round(turnout, 2)
    return d
