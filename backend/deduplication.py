"""
deduplication.py — Core two-layer redundancy detection logic.

Layer 1: Exact match via SHA-256 hash of normalized entry string.
Layer 2: Fuzzy similarity via rapidfuzz across all existing records.

Classification:
  - similarity >= REDUNDANT_THRESHOLD (85%)  → REDUNDANT  (reject)
  - FLAGGED_THRESHOLD <= similarity < REDUNDANT_THRESHOLD → FLAGGED (queue for review)
  - similarity < FLAGGED_THRESHOLD (70%)     → UNIQUE     (insert)
"""

import hashlib
import re
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from rapidfuzz import fuzz
from models import Entry
from config import settings


# ─────────────────────────────────────────────
# NORMALIZATION & HASHING
# ─────────────────────────────────────────────

def normalize_text(text: str) -> str:
    """
    Normalize a string for consistent comparison:
    - Lowercase
    - Strip leading/trailing whitespace
    - Collapse multiple spaces to one
    - Remove all non-alphanumeric characters (except spaces)
    """
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", "", text)   # Remove special chars
    text = re.sub(r"\s+", " ", text)           # Collapse whitespace
    return text


def entry_to_string(name: str, email: str, phone: str, content: str) -> str:
    """
    Concatenate all entry fields into a single normalized string
    for hashing and fuzzy comparison.
    """
    parts = [normalize_text(f) for f in [name, email, phone, content]]
    return " | ".join(parts)


def compute_hash(normalized_string: str) -> str:
    """
    Compute SHA-256 hash of the normalized entry string.
    Returns a 64-character hex string.
    """
    return hashlib.sha256(normalized_string.encode("utf-8")).hexdigest()


# ─────────────────────────────────────────────
# TWO-LAYER DETECTION
# ─────────────────────────────────────────────

def check_redundancy(
    db: Session,
    name: str,
    email: str,
    phone: str,
    content: str,
) -> Tuple[str, float, Optional[Entry], str]:
    """
    Perform the two-layer redundancy check against all existing records.

    Returns:
        (classification, similarity_score, matched_entry_or_None, message)
        classification ∈ {"UNIQUE", "REDUNDANT", "FLAGGED"}
    """
    # Step 1: Build the normalized string and compute hash
    normalized = entry_to_string(name, email, phone, content)
    new_hash = compute_hash(normalized)

    # Layer 1 — Exact hash match
    exact_match = db.query(Entry).filter(Entry.content_hash == new_hash).first()
    if exact_match:
        return (
            "REDUNDANT",
            100.0,
            exact_match,
            "Exact duplicate detected via hash match. Entry rejected.",
        )

    # Layer 2 — Fuzzy similarity across all records
    all_entries = db.query(Entry).all()
    best_score = 0.0
    best_match: Optional[Entry] = None

    for entry in all_entries:
        # Rebuild the normalized string for the stored entry
        existing_normalized = entry_to_string(
            entry.name, entry.email, entry.phone, entry.content
        )
        # Use token_set_ratio for order-insensitive comparison
        score = fuzz.token_set_ratio(normalized, existing_normalized)
        if score > best_score:
            best_score = score
            best_match = entry

    # Classification based on thresholds
    if best_score >= settings.FUZZY_REDUNDANT_THRESHOLD:
        return (
            "REDUNDANT",
            best_score,
            best_match,
            f"High similarity ({best_score:.1f}%) detected. Entry rejected as redundant.",
        )
    elif best_score >= settings.FUZZY_FLAGGED_THRESHOLD:
        return (
            "FLAGGED",
            best_score,
            best_match,
            f"Moderate similarity ({best_score:.1f}%) detected. Entry flagged for manual review.",
        )
    else:
        return (
            "UNIQUE",
            best_score,
            None,
            "Entry is unique. Added to the database.",
        )


def get_hash_for_entry(name: str, email: str, phone: str, content: str) -> str:
    """Convenience function: compute hash for a new entry."""
    normalized = entry_to_string(name, email, phone, content)
    return compute_hash(normalized)
