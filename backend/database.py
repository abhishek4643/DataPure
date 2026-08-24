"""
database.py — SQLAlchemy engine, session, and Base declaration.
Connects to Supabase (PostgreSQL) using the DATABASE_URL from .env.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import settings

# Create the SQLAlchemy engine using the Supabase connection string
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # Verify connections before using them (prevents stale connections)
    pool_size=5,             # Connection pool size
    max_overflow=10,         # Allow up to 10 additional connections beyond pool_size
    echo=False               # Set True for SQL query logging during debug
)

# Session factory — use this to create DB sessions in route handlers
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base for all SQLAlchemy models."""
    pass


def get_db():
    """
    Dependency generator for FastAPI routes.
    Yields a DB session, then closes it after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
