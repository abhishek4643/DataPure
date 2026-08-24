"""
routes/flagged.py — Endpoints for managing the flagged (ambiguous) entry review queue.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Entry, FlaggedEntry
from schemas import FlaggedEntryResponse, EntryResponse
from deduplication import get_hash_for_entry

router = APIRouter(prefix="/flagged", tags=["Flagged"])


# ─────────────────────────────────────────────
# GET /flagged — List all pending flagged entries
# ─────────────────────────────────────────────

@router.get("", response_model=List[FlaggedEntryResponse])
def list_flagged(db: Session = Depends(get_db)):
    """Return all flagged entries awaiting review, newest first."""
    entries = (
        db.query(FlaggedEntry)
        .filter(FlaggedEntry.status == "pending")
        .order_by(FlaggedEntry.created_at.desc())
        .all()
    )
    return [FlaggedEntryResponse.model_validate(e) for e in entries]


# ─────────────────────────────────────────────
# POST /flagged/{id}/approve — Approve and insert the flagged entry
# ─────────────────────────────────────────────

@router.post("/{flagged_id}/approve", response_model=EntryResponse)
def approve_flagged(flagged_id: int, db: Session = Depends(get_db)):
    """
    Approve a flagged entry:
    - Insert it as a unique record in the 'entries' table.
    - Mark the flagged entry as 'approved'.
    """
    flagged = db.query(FlaggedEntry).filter(FlaggedEntry.id == flagged_id).first()
    if not flagged:
        raise HTTPException(status_code=404, detail="Flagged entry not found")
    if flagged.status != "pending":
        raise HTTPException(status_code=400, detail=f"Entry already {flagged.status}")

    data = flagged.entry_data
    # Insert into main entries table
    new_entry = Entry(
        name=data["name"],
        email=data["email"],
        phone=data["phone"],
        content=data["content"],
        content_hash=get_hash_for_entry(
            data["name"], data["email"], data["phone"], data["content"]
        ),
    )
    db.add(new_entry)

    flagged.status = "approved"
    db.commit()
    db.refresh(new_entry)
    return EntryResponse.model_validate(new_entry)


# ─────────────────────────────────────────────
# POST /flagged/{id}/reject — Reject and discard the flagged entry
# ─────────────────────────────────────────────

@router.post("/{flagged_id}/reject")
def reject_flagged(flagged_id: int, db: Session = Depends(get_db)):
    """
    Reject a flagged entry:
    - Mark status as 'rejected'.
    - Entry is NOT inserted into the database.
    """
    flagged = db.query(FlaggedEntry).filter(FlaggedEntry.id == flagged_id).first()
    if not flagged:
        raise HTTPException(status_code=404, detail="Flagged entry not found")
    if flagged.status != "pending":
        raise HTTPException(status_code=400, detail=f"Entry already {flagged.status}")

    flagged.status = "rejected"
    db.commit()
    return {"message": "Flagged entry rejected and discarded", "id": flagged_id}
