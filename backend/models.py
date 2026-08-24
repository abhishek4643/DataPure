"""
models.py — SQLAlchemy ORM models for 'entries' and 'flagged_entries' tables.
These map directly to Supabase/PostgreSQL tables.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class Entry(Base):
    """
    Stores validated, unique data records.
    Each entry has a SHA-256 hash of its normalized content for fast exact-match lookup.
    """
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)             # The message/content field
    content_hash = Column(String(64), unique=True, nullable=False, index=True)  # SHA-256 hex digest
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Reverse relationship: flagged entries that matched this record
    flagged_matches = relationship("FlaggedEntry", back_populates="matched_entry")


class FlaggedEntry(Base):
    """
    Stores entries that fell in the 'fuzzy' zone (70–85% similarity).
    Awaiting manual review: admin can approve (insert) or reject (discard).
    """
    __tablename__ = "flagged_entries"

    id = Column(Integer, primary_key=True, index=True)
    entry_data = Column(JSON, nullable=False)          # The raw submitted entry as a dict
    matched_entry_id = Column(Integer, ForeignKey("entries.id"), nullable=True)
    similarity_score = Column(Float, nullable=False)   # The fuzzy score that triggered flagging
    status = Column(String(20), default="pending", nullable=False)  # pending | approved | rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # The existing record that was similar to this flagged entry
    matched_entry = relationship("Entry", back_populates="flagged_matches")
