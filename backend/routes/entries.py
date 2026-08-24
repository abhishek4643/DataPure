"""
routes/entries.py — REST endpoints for managing data entries.
"""

from math import ceil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Entry, FlaggedEntry
from schemas import EntryCreate, EntryResponse, ClassificationResult, PaginatedEntries
from deduplication import check_redundancy, get_hash_for_entry

router = APIRouter(prefix="/entries", tags=["Entries"])


# ─────────────────────────────────────────────
# POST /entries — Submit and validate a new entry
# ─────────────────────────────────────────────

@router.post("", response_model=ClassificationResult, status_code=200)
def submit_entry(payload: EntryCreate, db: Session = Depends(get_db)):
    """
    Two-layer redundancy check before inserting:
    1. SHA-256 exact hash match
    2. RapidFuzz similarity score

    Returns classification: UNIQUE | REDUNDANT | FLAGGED
    """
    classification, score, matched, message = check_redundancy(
        db,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        content=payload.content,
    )

    matched_response = None
    if matched:
        matched_response = EntryResponse.model_validate(matched)

    if classification == "UNIQUE":
        # Insert the new record into the database
        new_entry = Entry(
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            content=payload.content,
            content_hash=get_hash_for_entry(
                payload.name, payload.email, payload.phone, payload.content
            ),
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        return ClassificationResult(
            classification="UNIQUE",
            similarity_score=round(score, 2),
            matched_record=None,
            message=message,
            entry=EntryResponse.model_validate(new_entry),
        )

    elif classification == "FLAGGED":
        # Store in flagged_entries for manual review
        flagged = FlaggedEntry(
            entry_data={
                "name": payload.name,
                "email": payload.email,
                "phone": payload.phone,
                "content": payload.content,
            },
            matched_entry_id=matched.id if matched else None,
            similarity_score=round(score, 2),
            status="pending",
        )
        db.add(flagged)
        db.commit()
        db.refresh(flagged)
        return ClassificationResult(
            classification="FLAGGED",
            similarity_score=round(score, 2),
            matched_record=matched_response,
            message=message,
            flagged_id=flagged.id,
        )

    else:  # REDUNDANT
        return ClassificationResult(
            classification="REDUNDANT",
            similarity_score=round(score, 2),
            matched_record=matched_response,
            message=message,
        )


# ─────────────────────────────────────────────
# GET /entries — List all records with search & pagination
# ─────────────────────────────────────────────

@router.get("", response_model=PaginatedEntries)
def list_entries(
    search: Optional[str] = Query(None, description="Search by name, email, or content"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Return paginated list of all unique entries, optionally filtered by search term."""
    query = db.query(Entry)

    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            (Entry.name.ilike(like))
            | (Entry.email.ilike(like))
            | (Entry.content.ilike(like))
        )

    total = query.count()
    items = (
        query.order_by(Entry.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedEntries(
        items=[EntryResponse.model_validate(e) for e in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size) if total else 0,
    )
