"""
routes/stats.py — Endpoint for dashboard statistics.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Entry, FlaggedEntry
from schemas import StatsResponse

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """
    Returns aggregate statistics for the dashboard:
    - total_entries: records in the 'entries' table
    - duplicates_blocked: REDUNDANT rejections = all rejected flagged + implied redundants
      (we approximate this as all 'rejected' flagged entries + a stored counter concept)
    - flagged_count: currently pending flagged entries
    - accuracy_percent: (unique / (unique + rejected)) * 100
    """
    total_entries = db.query(Entry).count()
    flagged_count = db.query(FlaggedEntry).filter(FlaggedEntry.status == "pending").count()

    # Count explicitly rejected flagged entries as "blocked"
    rejected_count = db.query(FlaggedEntry).filter(FlaggedEntry.status == "rejected").count()
    # Total "processed" = entries that actually made it in + approved + rejected + pending
    approved_count = db.query(FlaggedEntry).filter(FlaggedEntry.status == "approved").count()
    total_flagged = db.query(FlaggedEntry).count()

    # Blocked = all flagged entries (they were all prevented from auto-inserting)
    # Rejected ones are confirmed duplicates
    duplicates_blocked = rejected_count + flagged_count  # pending + rejected considered blocked

    # Accuracy: what % of all processed attempts resulted in a clean unique record
    total_processed = total_entries + total_flagged
    if total_processed > 0:
        accuracy_percent = round((total_entries / total_processed) * 100, 1)
    else:
        accuracy_percent = 100.0

    return StatsResponse(
        total_entries=total_entries,
        duplicates_blocked=duplicates_blocked,
        flagged_count=flagged_count,
        accuracy_percent=accuracy_percent,
    )
