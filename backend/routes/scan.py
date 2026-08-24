"""
routes/scan.py — POST /scan-duplicates endpoint.
Scans existing 'entries' table for internal duplicates and removes them.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Set
from database import get_db
from models import Entry
from schemas import ScanResult
from deduplication import entry_to_string
from rapidfuzz import fuzz

router = APIRouter(prefix="/scan-duplicates", tags=["Scan"])


@router.post("", response_model=ScanResult)
def scan_and_remove_duplicates(db: Session = Depends(get_db)):
    """
    Scans all existing entries for internal redundancy:
    1. Groups entries by their SHA-256 hash (exact duplicates — shouldn't exist due to UNIQUE constraint,
       but we check anyway).
    2. Performs pairwise fuzzy comparison to detect near-duplicates.
    3. Removes the older duplicate (keeping the earliest entry for each cluster).

    Returns a summary of how many duplicates were found and removed.
    """
    all_entries: List[Entry] = db.query(Entry).order_by(Entry.created_at.asc()).all()
    scanned = len(all_entries)

    if scanned < 2:
        return ScanResult(
            scanned=scanned,
            duplicates_found=0,
            removed=0,
            message="Not enough entries to compare. Scan complete.",
        )

    # Track IDs already marked for deletion
    to_delete: Set[int] = set()
    duplicates_found = 0

    for i, entry_a in enumerate(all_entries):
        if entry_a.id in to_delete:
            continue
        norm_a = entry_to_string(entry_a.name, entry_a.email, entry_a.phone, entry_a.content)

        for j in range(i + 1, len(all_entries)):
            entry_b = all_entries[j]
            if entry_b.id in to_delete:
                continue
            norm_b = entry_to_string(entry_b.name, entry_b.email, entry_b.phone, entry_b.content)

            score = fuzz.token_set_ratio(norm_a, norm_b)
            # If similarity >= 85%, treat as duplicate — delete the newer one (entry_b)
            if score >= 85.0:
                to_delete.add(entry_b.id)
                duplicates_found += 1

    # Perform deletion
    removed = 0
    for entry_id in to_delete:
        entry = db.query(Entry).filter(Entry.id == entry_id).first()
        if entry:
            db.delete(entry)
            removed += 1

    db.commit()

    return ScanResult(
        scanned=scanned,
        duplicates_found=duplicates_found,
        removed=removed,
        message=f"Scan complete. Found {duplicates_found} duplicate(s), removed {removed}.",
    )
