"""
schemas.py — Pydantic schemas for request validation and response serialization.
"""

from __future__ import annotations
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, field_validator
import re


# ─────────────────────────────────────────────
# REQUEST SCHEMAS
# ─────────────────────────────────────────────

class EntryCreate(BaseModel):
    """Schema for POST /entries — new data submission."""
    name: str
    email: EmailStr
    phone: str
    content: str

    @field_validator("name", "phone", "content")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Allow digits, spaces, hyphens, parentheses, and leading +
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?\d{7,15}$", cleaned):
            raise ValueError("Invalid phone number format")
        return v.strip()


# ─────────────────────────────────────────────
# RESPONSE SCHEMAS
# ─────────────────────────────────────────────

class EntryResponse(BaseModel):
    """Single entry record returned by the API."""
    id: int
    name: str
    email: str
    phone: str
    content: str
    content_hash: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FlaggedEntryResponse(BaseModel):
    """Flagged entry returned by GET /flagged."""
    id: int
    entry_data: Dict[str, Any]
    matched_entry_id: Optional[int]
    matched_entry: Optional[EntryResponse]
    similarity_score: float
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ClassificationResult(BaseModel):
    """
    Returned by POST /entries.
    classification: UNIQUE | REDUNDANT | FLAGGED
    """
    classification: str
    similarity_score: float
    matched_record: Optional[EntryResponse]
    message: str
    entry: Optional[EntryResponse] = None       # Only set when classification == UNIQUE
    flagged_id: Optional[int] = None            # Only set when classification == FLAGGED


class StatsResponse(BaseModel):
    """Returned by GET /stats."""
    total_entries: int
    duplicates_blocked: int
    flagged_count: int
    accuracy_percent: float


class ScanResult(BaseModel):
    """Returned by POST /scan-duplicates."""
    scanned: int
    duplicates_found: int
    removed: int
    message: str


class PaginatedEntries(BaseModel):
    """Paginated list of entries."""
    items: List[EntryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
